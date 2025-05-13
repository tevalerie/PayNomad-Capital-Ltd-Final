import { Routes, Route, Navigate } from "react-router-dom";
import { useRoutes } from "react-router-dom";
import routes from "tempo-routes";
import Home from "./components/home";
import RegistrationPage from "./components/RegistrationPage";
import VerifyEmail from "./components/VerifyEmail";
import registrationStore from "./lib/registrationStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (!registrationStore.isRegistered()) {
    return <Navigate to="/register" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <>
      {/* Tempo routes */}
      {import.meta.env.VITE_TEMPO && useRoutes(routes)}

      <Routes>
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/verify" element={<VerifyEmail />} />
        <Route path="/" element={<Home />} />
        {/* Add this before the catchall route */}
        {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
