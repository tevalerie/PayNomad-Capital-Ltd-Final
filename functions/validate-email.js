const axios = require("axios");

// Basic email format validation
function isValidEmailFormat(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

exports.handler = async (event, context) => {
  // Set CORS headers for all responses
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers,
      body: "",
    };
  }

  try {
    // Extract email from the request body
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email is required." }),
      };
    }

    // Validate email format before making API call
    if (!isValidEmailFormat(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid email format." }),
      };
    }

    // Call an email validation API (e.g., ZeroBounce)
    const apiKey = process.env.ZEROBOUNCE_API_KEY; // Stored in Netlify environment variables

    if (!apiKey) {
      console.error("ZEROBOUNCE_API_KEY environment variable is not set");
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: "Email validation service is not properly configured.",
        }),
      };
    }

    const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const response = await axios.get(url);

    // Return response based on validation result with more detailed information
    if (response.data.status === "valid") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: "Email is valid!",
          valid: true,
          details: response.data,
        }),
      };
    } else {
      // Return specific reason if available
      const reason =
        response.data.sub_status || response.data.status || "Unknown reason";
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: `Invalid email address: ${reason}`,
          valid: false,
          details: response.data,
        }),
      };
    }
  } catch (error) {
    console.error("Email validation error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Error verifying email.",
        error: error.message,
        valid: false,
      }),
    };
  }
};
