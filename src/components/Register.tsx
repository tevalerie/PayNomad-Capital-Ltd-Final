import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./Register.css";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    referral_code: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const intent = searchParams.get("intent") || "signup";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateReferralCode = (code: string): boolean => {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{4,12}$/;
    return regex.test(code);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { first_name, last_name, email, referral_code } = formData;

    if (!first_name || !last_name || !email || !referral_code) {
      setMessage("All fields are required");
      setLoading(false);
      return;
    }
    if (!validateReferralCode(referral_code)) {
      setMessage(
        "Referral code must be 4-12 alphanumeric characters with at least one letter",
      );
      setLoading(false);
      return;
    }

    try {
      console.log("Submitting registration data:", {
        first_name,
        last_name,
        email,
        referral_code,
        intent,
      });

      // Make sure we're using the correct domain for the redirect
      const baseUrl = window.location.origin;
      const redirectTo = `${baseUrl}/verify`; // Use dynamic origin for local development

      // Create metadata payload with timestamp to ensure it's unique
      const metadataPayload = {
        first_name,
        last_name,
        referral_code,
        intent,
        timestamp: new Date().toISOString(),
      };

      // Call Netlify function to submit application
      const response = await fetch("/.netlify/functions/submit-application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          referral_code,
          intent,
          redirectTo,
          metadata: metadataPayload,
        }),
      });

      const result = await response.json();

      // Store debug information
      setDebugInfo({
        email,
        redirectTo,
        metadataPayload,
        response: result,
      });

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      setMessage("Magic link sent! Please check your email.");
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        referral_code: "",
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-heading">Join PayNomad Capital</h2>
      <div className="register-form">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          required
        />
        <input
          type="text"
          name="referral_code"
          placeholder="Referral Code"
          value={formData.referral_code}
          onChange={handleChange}
          className="form-input"
          required
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="submit-button"
        >
          {loading ? "Sending..." : "Send Magic Link"}
        </button>
        {message && <p className="message">{message}</p>}

        {debugInfo && (
          <div
            className="debug-info"
            style={{
              marginTop: "20px",
              padding: "10px",
              backgroundColor: "#f0f0f0",
              borderRadius: "5px",
            }}
          >
            <h3>Debug Information</h3>
            <p>
              <strong>Email:</strong> {debugInfo.email}
            </p>
            <p>
              <strong>Redirect URL:</strong> {debugInfo.redirectTo}
            </p>
            <p>
              <strong>Metadata Payload:</strong>
            </p>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(debugInfo.metadataPayload, null, 2)}
            </pre>
            <p>
              <strong>Response:</strong>
            </p>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(debugInfo.response, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
