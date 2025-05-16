// netlify/functions/verify-otp.js
const { getDocInstance } = require("./helpers/googleSheetClient");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  let emailForAudit = "unknown_email_at_verification_start";

  try {
    const { email, otp: submittedOtp } = JSON.parse(event.body);
    emailForAudit = email || "unknown_email_after_parse_verify";

    if (!email || !submittedOtp) {
      try {
        const docForEarlyAudit = await getDocInstance(
          process.env.GOOGLE_SHEET_ID,
          "main",
        ).catch(() => null);
        if (docForEarlyAudit) {
          const auditSheetForEarly = docForEarlyAudit.sheetsByTitle["AuditLog"];
          if (auditSheetForEarly) {
            await auditSheetForEarly.addRow({
              Timestamp: new Date().toISOString(),
              Email: emailForAudit,
              Action: "error_verify_validation_fail",
              "Action Details": JSON.stringify({
                message: "Missing email or OTP in verification request.",
                receivedData: { email, submittedOtp },
              }),
            });
          }
        }
      } catch (auditErr) {
        console.error(
          "Failed to log verify validation fail to audit:",
          auditErr,
        );
      }
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and OTP are required." }),
      };
    }

    const doc = await getDocInstance(process.env.GOOGLE_SHEET_ID, "main");
    const mainSheet = doc.sheetsByTitle["ApplicationsData"];
    const auditSheet = doc.sheetsByTitle["AuditLog"];
    const otpSheet = doc.sheetsByTitle["OtpStore"];

    if (!mainSheet || !auditSheet || !otpSheet) {
      const missingTabs = [
        !mainSheet && "ApplicationsData",
        !auditSheet && "AuditLog",
        !otpSheet && "OtpStore",
      ]
        .filter(Boolean)
        .join(", ");
      console.error(
        `One or more required Google Sheet tabs missing: ${missingTabs}`,
      );
      throw new Error(
        `Server configuration error: Sheet tabs (${missingTabs}) not found.`,
      );
    }

    const otpRows = await otpSheet.getRows();
    let foundOtpEntry = null;
    let rowIndexToDelete = -1;

    for (let i = otpRows.length - 1; i >= 0; i--) {
      const row = otpRows[i];
      if (row.get("Email") === email) {
        foundOtpEntry = {
          otp: row.get("OTP"),
          expiresAt: parseInt(row.get("ExpiresAt"), 10),
        };
        rowIndexToDelete = i;
        break; // Found the latest OTP for this email
      }
    }

    let verificationErrorAction = null;
    let verificationErrorMessage = "";

    if (!foundOtpEntry) {
      verificationErrorAction = "error_verify_otp_not_found";
      verificationErrorMessage =
        "OTP not found. It may have expired or already been used. Please request a new one if needed.";
    } else if (foundOtpEntry.otp !== submittedOtp) {
      verificationErrorAction = "error_verify_otp_invalid";
      verificationErrorMessage =
        "Invalid OTP. Please check the code and try again.";
    } else if (Date.now() > foundOtpEntry.expiresAt) {
      verificationErrorAction = "error_verify_otp_expired";
      verificationErrorMessage = "OTP has expired. Please request a new one.";
      // Clean up expired OTP from OtpStore
      if (rowIndexToDelete !== -1) await otpRows[rowIndexToDelete].delete();
    }

    if (verificationErrorAction) {
      await auditSheet.addRow({
        Timestamp: new Date().toISOString(),
        Email: email,
        Action: verificationErrorAction,
        "Action Details": JSON.stringify({
          submittedOtp,
          message: verificationErrorMessage,
        }),
      });
      return {
        statusCode: 400,
        body: JSON.stringify({ message: verificationErrorMessage }),
      };
    }

    // OTP is valid, clear it from OtpStore
    if (rowIndexToDelete !== -1) {
      await otpRows[rowIndexToDelete].delete();
    }

    // Update VerifiedStatus in ApplicationsData
    const mainRows = await mainSheet.getRows();
    // Find the most recent PENDING application for this email to update
    let userRowToUpdate = null;
    for (let i = mainRows.length - 1; i >= 0; i--) {
      if (
        mainRows[i].get("Email") === email &&
        mainRows[i].get("VerifiedStatus") === "Pending"
      ) {
        userRowToUpdate = mainRows[i];
        break;
      }
    }

    if (userRowToUpdate) {
      userRowToUpdate.set("VerifiedStatus", "Verified");
      // Optionally, add a 'VerifiedTimestamp'
      userRowToUpdate.set("VerifiedTimestamp", new Date().toISOString());
      await userRowToUpdate.save();
    } else {
      // This case means either user was already verified, or no pending application found.
      // The OTP validation would have likely caught issues if the OTP was from a stale attempt.
      // Log this potentially unusual state.
      await auditSheet.addRow({
        Timestamp: new Date().toISOString(),
        Email: email,
        Action: "info_verify_otp_no_pending_app_found",
        "Action Details": JSON.stringify({
          message:
            "OTP was valid, but no PENDING application found to update to Verified. User might be already verified or data is inconsistent.",
        }),
      });
    }

    await auditSheet.addRow({
      Timestamp: new Date().toISOString(),
      Email: email,
      Action: "email_verified_successfully",
      "Action Details": JSON.stringify({ timestamp: new Date().toISOString() }),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "OTP verified successfully.",
        redirectUrl:
          process.env.EBANKING_SIGNUP_URL ||
          "https://ebank.paynomadcapital.com/signup",
      }),
    };
  } catch (error) {
    console.error(
      "Error in verify-otp:",
      error.message,
      error.stack && error.stack.substring(0, 300),
    );
    try {
      const docForErrorLog = await getDocInstance(
        process.env.GOOGLE_SHEET_ID,
        "main",
      ).catch(() => null);
      if (docForErrorLog) {
        const auditSheetForError = docForErrorLog.sheetsByTitle["AuditLog"];
        if (auditSheetForError) {
          await auditSheetForError.addRow({
            Timestamp: new Date().toISOString(),
            Email: emailForAudit,
            Action: "error_verify_otp_critical",
            "Action Details": JSON.stringify({
              error: error.message,
              stackSample: error.stack && error.stack.substring(0, 500),
            }),
          });
        }
      }
    } catch (auditError) {
      console.error(
        "Failed to write to audit log during critical error handling (verify-otp):",
        auditError.message,
      );
    }

    const userMessage = error.message.startsWith("Server configuration error:")
      ? error.message
      : "An internal error occurred during OTP verification. Please try again.";

    return {
      statusCode: 500,
      body: JSON.stringify({ message: userMessage }),
    };
  }
};
