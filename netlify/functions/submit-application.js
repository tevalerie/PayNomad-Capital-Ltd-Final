// netlify/functions/submit-application.js
const { getDocInstance } = require("./helpers/googleSheetClient");
const axios = require("axios");

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || "15", 10);

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

async function logToAudit(doc, email, action, details) {
  try {
    if (!doc) return;
    const auditSheet = doc.sheetsByTitle["AuditLog"];
    if (!auditSheet) return;

    await auditSheet.addRow({
      Timestamp: new Date().toISOString(),
      Email: email || "unknown_email",
      Action: action,
      "Action Details":
        typeof details === "string" ? details : JSON.stringify(details),
    });
  } catch (error) {
    console.error(`Failed to log to audit: ${error.message}`);
  }
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  let emailForAudit = "unknown_email_at_submission_start";
  let doc = null;

  try {
    // Parse and validate input data
    const data = JSON.parse(event.body);
    const { firstName, lastName, email, referralCode } = data;
    emailForAudit = email || "unknown_email_after_parse";

    // Validate required fields
    if (!firstName || !email) {
      // Try to get document for audit logging
      try {
        doc = await getDocInstance(process.env.GOOGLE_SHEET_ID, "main");
        await logToAudit(doc, emailForAudit, "error_submit_validation_fail", {
          message: "Missing firstName or email in submission.",
          receivedData: data,
        });
      } catch (auditErr) {
        console.error("Failed to log validation fail to audit:", auditErr);
      }
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "First Name and Email are required." }),
      };
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      try {
        doc =
          doc || (await getDocInstance(process.env.GOOGLE_SHEET_ID, "main"));
        await logToAudit(doc, emailForAudit, "error_submit_validation_fail", {
          message: "Invalid email format.",
          receivedData: { email },
        });
      } catch (auditErr) {
        console.error(
          "Failed to log email validation fail to audit:",
          auditErr,
        );
      }
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Please provide a valid email address.",
        }),
      };
    }

    // Get Google Sheet document
    doc = doc || (await getDocInstance(process.env.GOOGLE_SHEET_ID, "main"));
    const mainSheet = doc.sheetsByTitle["ApplicationsData"];
    const auditSheet = doc.sheetsByTitle["AuditLog"];
    const otpSheet = doc.sheetsByTitle["OtpStore"];

    // Validate all required sheets exist
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

    // Check for existing application
    const existingAppRows = await mainSheet.getRows();
    const existingApplication = existingAppRows.find(
      (row) => row.get("Email") === email,
    );

    let submissionDetailsForAudit = {
      submittedFirstName: firstName,
      submittedLastName: lastName || "",
      submittedReferralCode: referralCode || "",
    };

    // Handle existing application logic
    if (existingApplication) {
      const status = existingApplication.get("VerifiedStatus");
      submissionDetailsForAudit.existingAppStatus = status;

      if (status === "Verified") {
        await logToAudit(doc, email, "duplicate_signup_already_verified", {
          message: "User attempted signup with an already verified email.",
          ...submissionDetailsForAudit,
        });
        return {
          statusCode: 409, // Conflict
          body: JSON.stringify({
            message:
              "This email address is already verified. You can proceed to the e-banking portal.",
          }),
        };
      } else if (status === "Pending") {
        // Update existing pending application
        existingApplication.set("First Name", firstName);
        existingApplication.set("Last Name", lastName || "");
        existingApplication.set("Referral Code", referralCode || "");
        existingApplication.set("Timestamp", new Date().toISOString());
        await existingApplication.save();

        await logToAudit(doc, email, "duplicate_signup_pending_resending_otp", {
          message:
            "User re-submitted with a pending application. Updating details and resending OTP.",
          ...submissionDetailsForAudit,
        });
      }
    } else {
      // Create new application
      await mainSheet.addRow({
        Timestamp: new Date().toISOString(),
        "First Name": firstName,
        "Last Name": lastName || "",
        Email: email,
        "Referral Code": referralCode || "",
        VerifiedStatus: "Pending",
      });
      await logToAudit(
        doc,
        email,
        "signup_attempt_new",
        submissionDetailsForAudit,
      );
    }

    // Generate OTP and calculate expiry
    const otp = generateOtp();
    const now = Date.now();
    const expiresAtTimestamp = now + OTP_EXPIRY_MINUTES * 60 * 1000;
    const expiryTimeForEmail = new Date(expiresAtTimestamp).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/New_York",
      },
    );

    // Clean up expired OTPs and store new OTP
    const otpStoreRows = await otpSheet.getRows();
    for (let i = otpStoreRows.length - 1; i >= 0; i--) {
      const row = otpStoreRows[i];
      if (
        row.get("Email") === email ||
        new Date(parseInt(row.get("ExpiresAt"))) < new Date()
      ) {
        await row.delete();
      }
    }
    await otpSheet.addRow({
      Email: email,
      OTP: otp,
      ExpiresAt: expiresAtTimestamp.toString(),
    });

    // Log OTP generation
    await logToAudit(doc, email, "otp_generated", {
      message: "OTP generated and stored",
      expiresAt: expiryTimeForEmail,
    });

    // Send email with OTP
    if (
      !process.env.EMAILJS_SERVICE_ID ||
      !process.env.EMAILJS_OTP_TEMPLATE_ID ||
      !process.env.EMAILJS_USER_ID ||
      !process.env.EMAILJS_PRIVATE_KEY
    ) {
      throw new Error(
        "Server configuration error: Missing EmailJS configuration.",
      );
    }

    const emailJsPayload = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_OTP_TEMPLATE_ID,
      user_id: process.env.EMAILJS_USER_ID,
      accessToken: process.env.EMAILJS_PRIVATE_KEY,
      template_params: {
        first_name: firstName,
        passcode: otp,
        time: expiryTimeForEmail,
        email: email,
      },
    };

    try {
      const emailJsResponse = await axios.post(
        "https://api.emailjs.com/api/v1.0/email/send",
        emailJsPayload,
        {
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!(emailJsResponse.status === 200 && emailJsResponse.data === "OK")) {
        console.error("EmailJS call non-OK response:", {
          status: emailJsResponse.status,
          data: emailJsResponse.data,
        });
        await logToAudit(doc, email, "error_emailjs_send_otp", {
          message: "Failed to send OTP email via EmailJS.",
          responseStatus: emailJsResponse.status,
          responseData: emailJsResponse.data,
        });
        throw new Error(
          `Failed to send OTP email. EmailJS Response (Status ${emailJsResponse.status}): ${typeof emailJsResponse.data === "string" ? emailJsResponse.data.substring(0, 100) : JSON.stringify(emailJsResponse.data).substring(0, 100)}`,
        );
      }

      // Log successful email sending
      await logToAudit(doc, email, "email_otp_sent", {
        message: "OTP email sent successfully",
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      await logToAudit(doc, email, "error_emailjs_exception", {
        message: "Exception when sending OTP email",
        error: emailError.message,
      });
      throw new Error(
        `Failed to send verification email: ${emailError.message}`,
      );
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Application processed. Please check your email for the OTP.",
        expiresAt: expiryTimeForEmail,
      }),
    };
  } catch (error) {
    console.error(
      "Error in submit-application:",
      error.message,
      error.stack && error.stack.substring(0, 300),
    );

    try {
      // Try to log the error to audit log
      if (!doc) {
        doc = await getDocInstance(process.env.GOOGLE_SHEET_ID, "main").catch(
          () => null,
        );
      }

      if (doc) {
        await logToAudit(
          doc,
          emailForAudit,
          "error_submit_application_critical",
          {
            error: error.message,
            stackSample: error.stack && error.stack.substring(0, 500),
          },
        );
      }
    } catch (auditError) {
      console.error(
        "Failed to write to audit log during critical error handling:",
        auditError.message,
      );
    }

    // Determine user-facing error message
    const userMessage =
      error.message.startsWith("Server configuration error:") ||
      error.message.startsWith("Failed to send OTP email.") ||
      error.message.startsWith("Failed to send verification email:")
        ? error.message // Provide more specific internal errors if safe
        : "An internal error occurred. Our team has been notified. Please try again later.";

    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: userMessage }),
    };
  }
};
