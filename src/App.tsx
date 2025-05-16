import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import RegistrationPage from "./components/RegistrationPage";
import VerifyEmail from "./components/VerifyEmail";
import TestConnection from "./components/TestConnection";
import NetworkStatus from "./components/NetworkStatus";
import SimpleEmailVerification from "./components/SimpleEmailVerification";
import EmailValidator from "./components/EmailValidator";
import NetlifyFunctionsTester from "./components/NetlifyFunctionsTester";
import NetlifyFunctionDebugger from "./components/NetlifyFunctionDebugger";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/test-connection" element={<TestConnection />} />
        <Route path="/network-status" element={<NetworkStatus />} />
        <Route
          path="/simple-email-verification"
          element={<SimpleEmailVerification />}
        />
        <Route path="/email-validator" element={<EmailValidator />} />
        <Route path="/test-functions" element={<NetlifyFunctionsTester />} />
        <Route path="/debug-functions" element={<NetlifyFunctionDebugger />} />

        {/* Add this before any catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
