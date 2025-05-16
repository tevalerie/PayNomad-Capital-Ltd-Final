import React from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import SignupPage from "./pages/SignupPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import ErrorBoundary from "./components/ErrorBoundary";
import routes from "tempo-routes";

function App() {
  console.log("App rendering, Home component available:", !!Home);

  return (
    <ErrorBoundary>
      {import.meta.env.VITE_TEMPO && routes}
      <Routes>
        <Route
          path="/"
          element={
            <div className="bg-white min-h-screen">
              <Home />
            </div>
          }
        />
        <Route path="/newsignup" element={<SignupPage />} />
        <Route path="/OTPVerification" element={<OtpVerificationPage />} />

        {/* Add this before any catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
