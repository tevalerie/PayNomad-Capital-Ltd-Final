exports.handler = async (event, context) => {
  // Set CORS headers for preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
      body: "",
    };
  }

  try {
    const { email, otp } = JSON.parse(event.body);

    if (!email || !otp) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and OTP are required." }),
      };
    }

    // For demo purposes, we'll accept any 6-digit OTP
    // In production, you would verify against a stored OTP in a database
    if (otp.length === 6 && /^\d{6}$/.test(otp)) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "Email verified successfully.",
          email: email,
          verified: true,
        }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid verification code." }),
      };
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error verifying code.",
        error: error.message,
      }),
    };
  }
};
