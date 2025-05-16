import React, { useEffect, useState } from "react";

const Verify: React.FC = () => {
  const [message, setMessage] = useState(
    "Verifying your email, please wait...",
  );
  const [verified, setVerified] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          setMessage(
            "Error: Missing verification token. Please check your email link.",
          );
          return;
        }

        // Call Netlify function to verify the token
        const response = await fetch("/.netlify/functions/verify-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const result = await response.json();

        setDebugInfo({
          token,
          result,
          timestamp: new Date().toISOString(),
        });

        if (!response.ok) {
          throw new Error(result.error || "Verification failed");
        }

        // If verification successful
        setVerified(true);
        setMessage(
          "Email verified successfully! Processing your registration...",
        );

        // Redirect to main application
        setTimeout(() => {
          const redirectUrl = `https://ebank.paynomadcapital.com/signup?verified=true&email=${encodeURIComponent(result.email || "")}`;
          window.location.href = redirectUrl;
        }, 2000);
      } catch (error: any) {
        console.error("Verification error:", error);
        setMessage(
          `Error: ${error.message}. Please try again or contact support.`,
        );
      }
    };

    verifyEmail();

    // Set a timeout in case verification takes too long
    const timer = setTimeout(() => {
      if (!verified) {
        setMessage(
          "Could not verify email. The link may be invalid, expired, or there was an issue processing it. Please try requesting a new link from the registration page.",
        );
      }
    }, 10000); // 10 seconds

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="verify-container"
      style={{
        maxWidth: "480px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          color: "#2c3e50",
          textAlign: "center",
          marginBottom: "24px",
        }}
      >
        Email Verification
      </h2>
      <p
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >
        {message}
      </p>

      {debugInfo && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f0f0f0",
            borderRadius: "5px",
          }}
        >
          <h3>Debug Information</h3>
          <p>
            <strong>Token:</strong> {debugInfo.token}
          </p>
          <p>
            <strong>Timestamp:</strong> {debugInfo.timestamp}
          </p>
          <p>
            <strong>Result:</strong>
          </p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
            {JSON.stringify(debugInfo.result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default Verify;
