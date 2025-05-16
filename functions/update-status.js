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
    const { email, status, verifiedAt } = JSON.parse(event.body);

    if (!email || !status) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Email and status are required." }),
      };
    }

    // In a real application, you would update the user's status in your database
    // For this demo, we'll just return success

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "User status updated successfully.",
        email: email,
        status: status,
        updatedAt: verifiedAt || new Date().toISOString(),
      }),
    };
  } catch (error) {
    console.error("Error updating status:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error updating status.",
        error: error.message,
      }),
    };
  }
};
