import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

interface SignupFormProps {
  setVerifyingEmail: (email: string) => void;
}

// Configure your API base URL via Vite environment variables
// Create a .env.local file in your project root:
// VITE_API_BASE_URL=/.netlify/functions  (if no /api redirect)
// OR
// VITE_API_BASE_URL=/api (if using /api/* to /.netlify/functions/* redirect in netlify.toml)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/.netlify/functions";

// Placeholder styles based on your luxury design theme
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
  marginBottom: "1.5rem",
  fontSize: "2rem",
};

const inputGroupStyle: React.CSSProperties = {
  marginBottom: "1.25rem",
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
  border: "1px solid #EFF2F6", // Light border for input fields
  borderRadius: "4px",
  boxSizing: "border-box",
  backgroundColor: "#EFF2F6", // Input field background
  fontSize: "1rem",
};

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#0077BE",
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

const SignupForm: React.FC<SignupFormProps> = ({ setVerifyingEmail }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "", // Optional
    email: "",
    referralCode: "", // Optional
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (!formData.firstName || !formData.email) {
      setError("First Name and Email are required.");
      setIsLoading(false);
      return;
    }
    if (!formData.email.includes("@")) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // The backend expects: firstName, lastName, email, referralCode
      const response = await axios.post(`${API_BASE_URL}/submit-application`, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        referralCode: formData.referralCode,
      });
      setMessage(
        response.data.message ||
          "OTP sent to your email. Please check your inbox.",
      );
      setVerifyingEmail(formData.email); // Store email for OTP page
      navigate("/verify"); // Navigate to OTP verification page
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        "An error occurred during submission. Please try again.";
      setError(errorMessage);
      console.error("Submission error:", err.response || err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={formContainerStyle}>
      <h2 style={headingStyle}>Join PayNomad Capital</h2>
      <p style={{ marginBottom: "2rem", fontSize: "1rem" }}>
        Begin your journey to exclusive financial services.
      </p>
      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label htmlFor="firstName" style={labelStyle}>
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="lastName" style={labelStyle}>
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="email" style={labelStyle}>
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
        <div style={inputGroupStyle}>
          <label htmlFor="referralCode" style={labelStyle}>
            Referral Code (Optional)
          </label>
          <input
            type="text"
            id="referralCode"
            name="referralCode"
            value={formData.referralCode}
            onChange={handleChange}
            style={inputStyle}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{ ...buttonStyle, opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? "Submitting..." : "Get Started"}
        </button>
      </form>
      {message && <p style={{ ...messageStyle, color: "green" }}>{message}</p>}
      {error && <p style={{ ...messageStyle, color: "red" }}>{error}</p>}
    </div>
  );
};

export default SignupForm;
