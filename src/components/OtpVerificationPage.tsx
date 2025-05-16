import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface OtpVerificationPageProps {
  email: string; // Email is passed as a prop, guarded by App.tsx
  onVerificationSuccess: () => void; // Callback to clear session storage
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/.netlify/functions";

// Placeholder styles (similar to SignupForm for consistency)
const formContainerStyle: React.CSSProperties = {
  backgroundColor: "#FFFFFF",
  padding: "2rem 3rem",
  borderRadius: "8px",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  maxWidth: "500px",
  width: "100%",
  textAlign: "center",
  fontFamily: "'Proxima Nova', sans-serif",
  color: "#2C3E50",
};

const headingStyle: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  color: "#2C3E50",
  marginBottom: "1rem",
  fontSize: "1.8rem",
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: "1.5rem",
  textAlign: "left",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "0.5rem",
  fontWeight: "bold",
  fontSize: "0.9rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: "1px solid #EFF2F6",
  borderRadius: "4px",
  boxSizing: "border-box",
  backgroundColor: "#EFF2F6",
  fontSize: "1.2rem",
  textAlign: "center",
  letterSpacing: "0.5rem", // For OTP visibility
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#0077BE", // Or a success green like #28a745
  color: "#FFFFFF",
  padding: "0.75rem 1.5rem",
  border: "none",
  borderRadius: "6px",
  fontWeight: "bold",
  fontSize: "1rem",
  cursor: "pointer",
  width: "100%",
  marginTop: "0.5rem",
  transition: "background-color 0.3s ease",
};

const messageStyle: React.CSSProperties = {
  marginTop: "1rem",
  fontSize: "0.9rem",
};

const OtpVerificationPage: React.FC<OtpVerificationPageProps> = ({
  email,
  onVerificationSuccess,
}) => {
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // For fallback navigation if needed

  useEffect(() => {
    // Fallback: if email prop is somehow null/undefined despite the guard, navigate away.
    if (!email) {
      console.warn("OtpVerificationPage: Email prop is missing. Redirecting.");
      navigate("/register", { replace: true });
    }
  }, [email, navigate]);

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Allow only digits
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (otp.length !== 6) {
      setError("OTP must be 6 digits.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/verify-otp`, {
        email,
        otp,
      });
      setMessage(response.data.message || "OTP verified successfully!");
      onVerificationSuccess(); // Clear email from session storage

      if (response.data.redirectUrl) {
        // Small delay for user to read success message, then redirect
        setTimeout(() => {
          window.location.href = response.data.redirectUrl;
        }, 1500); // 1.5 seconds delay
      } else {
        setError("Verification successful, but no redirect URL provided.");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred during OTP verification.";
      setError(errorMessage);
      console.error("OTP verification error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!email) {
    // This should ideally not be reached due to the guard in App.tsx
    return <p>Loading or redirecting...</p>;
  }

  return (
    <div style={formContainerStyle}>
      <h2 style={headingStyle}>Verify Your Email</h2>
      <p style={{ marginBottom: "0.5rem" }}>An OTP has been sent to:</p>
      <p
        style={{
          fontWeight: "bold",
          marginBottom: "1.5rem",
          fontSize: "1.1rem",
        }}
      >
        {email}
      </p>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="otp" style={labelStyle}>
            Enter 6-Digit OTP
          </label>
          <input
            type="text" // Using text to allow custom input handling and styling
            inputMode="numeric" // Hint for numeric keyboard on mobile
            id="otp"
            name="otp"
            value={otp}
            onChange={handleOtpChange}
            maxLength={6}
            required
            autoComplete="one-time-code"
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? "Verifying..." : "Verify OTP"}
        </button>
      </form>
      {message && <p style={{ ...messageStyle, color: "green" }}>{message}</p>}
      {error && <p style={{ ...messageStyle, color: "red" }}>{error}</p>}
    </div>
  );
};

export default OtpVerificationPage;
