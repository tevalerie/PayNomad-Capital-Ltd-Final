import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Home from "./components/home";
import SignupForm from "./components/SignupForm";
import OtpVerificationPage from "./components/OtpVerificationPage";
import TestConnection from "./components/TestConnection";
import NetworkStatus from "./components/NetworkStatus";
import SimpleEmailVerification from "./components/SimpleEmailVerification";
import EmailValidator from "./components/EmailValidator";
import NetlifyFunctionsTester from "./components/NetlifyFunctionsTester";
import NetlifyFunctionDebugger from "./components/NetlifyFunctionDebugger";

// Helper component to ensure email is present for OTP verification page
interface RequireEmailForOtpProps {
  children: JSX.Element;
  verifyingEmail: string | null;
  redirectTo?: string;
}

const RequireEmailForOtp: React.FC<RequireEmailForOtpProps> = ({
  children,
  verifyingEmail,
  redirectTo = "/register",
}) => {
  const location = useLocation();

  if (!verifyingEmail) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return children;
};

function App() {
  // Initialize verifyingEmail from sessionStorage or null
  const [verifyingEmail, setVerifyingEmailState] = React.useState<
    string | null
  >(() => {
    return sessionStorage.getItem("verifyingEmail");
  });

  const handleSetVerifyingEmail = React.useCallback((email: string) => {
    sessionStorage.setItem("verifyingEmail", email);
    setVerifyingEmailState(email);
  }, []);

  const clearVerifyingEmail = React.useCallback(() => {
    sessionStorage.removeItem("verifyingEmail");
    setVerifyingEmailState(null);
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/register"
          element={<SignupForm setVerifyingEmail={handleSetVerifyingEmail} />}
        />
        <Route
          path="/verify"
          element={
            <RequireEmailForOtp verifyingEmail={verifyingEmail}>
              <OtpVerificationPage
                email={verifyingEmail || ""}
                onVerificationSuccess={clearVerifyingEmail}
              />
            </RequireEmailForOtp>
          }
        />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route path="/network-status" element={<NetworkStatus />} />
        <Route
          path="/simple-email-verification"
          element={<SimpleEmailVerification />}
        />
        <Route path="/email-validator" element={<EmailValidator />} />
        <Route path="/test-functions" element={<NetlifyFunctionsTester />} />
        <Route path="/debug-functions" element={<NetlifyFunctionDebugger />} />
        <Route path="/api-tester" element={<ApiTester />} />

        {/* Add this before any catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
