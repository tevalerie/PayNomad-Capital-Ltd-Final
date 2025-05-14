const axios = require('axios');

exports.handler = async (event, context) => {
  try {
    // Extract email from the request body
    const { email } = JSON.parse(event.body);
    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email is required." }),
      };
    }

    // Call an email validation API (e.g., ZeroBounce)
    const apiKey = process.env.ZEROBOUNCE_API_KEY; // Stored in Netlify environment variables
    const url = `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`;
    const response = await axios.get(url);

    // Return response based on validation result
    if (response.data.status === 'valid') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Email is valid!" }),
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid email address." }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error verifying email.", error: error.message }),
    };
  }
};
