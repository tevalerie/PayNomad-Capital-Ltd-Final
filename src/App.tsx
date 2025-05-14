import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route, useNavigate } from "react-router-dom";
import Home from "./components/home";
import RegistrationPage from "./components/RegistrationPage";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import TestConnection from "./components/TestConnection";
import NetworkStatus from "./components/NetworkStatus";
import routes from "tempo-routes";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-700 mb-4">
          We've encountered an unexpected error. Our team has been notified.
        </p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
          {error.message}
        </pre>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-[#0077be] hover:bg-[#0066a6] text-white py-2 px-4 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleError = (event) => {
      event.preventDefault();
      setHasError(true);
      setError(event.error || new Error("Unknown error occurred"));
      console.error("Global error caught:", event.error);
      // Log to monitoring service if available
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", (event) => {
      handleError({ preventDefault: () => {}, error: event.reason });
    });

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleError);
    };
  }, []);

  const resetErrorBoundary = () => {
    setHasError(false);
    setError(null);
    navigate(0); // Refresh the current route
  };

  if (hasError) {
    return (
      <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
    );
  }

  return children;
}

function App() {
  // For the tempo routes
  {
    import.meta.env.VITE_TEMPO && useRoutes(routes);
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/register-simple" element={<Register />} />
      <Route path="/verify" element={<VerifyEmail />} />

      {/* Add this before any catchall route */}
      {import.meta.env.VITE_TEMPO && <Route path="/tempobook/*" />}
    </Routes>
  );
}

export default App;
