import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import axios from "axios";

const ApiTester = () => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Automatically test the endpoint when component mounts
    testSubmitApplication();
  }, []);

  const testSubmitApplication = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    try {
      console.log("Testing submit-application endpoint...");

      const payload = {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        referralCode: "TEST123",
      };

      // First try with the /api prefix (in case of Netlify redirects)
      try {
        const response = await axios.post("/api/submit-application", payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        setResult(JSON.stringify(response.data, null, 2));
        console.log("API test successful:", response.data);
        setIsLoading(false);
        return;
      } catch (apiError) {
        console.log(
          "Error with /api prefix, trying direct Netlify function path...",
        );
        // If the /api prefix fails, try the direct Netlify function path
      }

      // Try with direct Netlify function path
      const response = await axios.post(
        "/.netlify/functions/submit-application",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      setResult(JSON.stringify(response.data, null, 2));
      console.log("API test successful:", response.data);
    } catch (err: any) {
      console.error("API test error:", err);
      setError(
        `Error: ${err.response?.data?.message || err.message || "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>API Endpoint Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded">
              <h3 className="font-medium mb-2">Test Payload:</h3>
              <pre className="text-sm">
                {JSON.stringify(
                  {
                    firstName: "Test",
                    lastName: "User",
                    email: "test@example.com",
                    referralCode: "TEST123",
                  },
                  null,
                  2,
                )}
              </pre>
            </div>

            <Button
              onClick={testSubmitApplication}
              disabled={isLoading}
              className="bg-[#0077be] hover:bg-[#0066a6]"
            >
              {isLoading ? "Testing..." : "Test Submit Application Endpoint"}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
                <h3 className="font-medium mb-2">Error:</h3>
                <pre className="whitespace-pre-wrap text-sm">{error}</pre>
              </div>
            )}

            {result && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded">
                <h3 className="font-medium mb-2">Result:</h3>
                <pre className="whitespace-pre-wrap text-sm">{result}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTester;
