import React, { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const TestConnection = () => {
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    // Retry mechanism for edge function calls
    const maxRetries = 3;
    let retryCount = 0;

    const invokeWithRetry = async () => {
      try {
        console.log(
          `Testing connection to Edge Function (attempt ${retryCount + 1})...`,
        );
        console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);

        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-test-connection",
          {},
        );

        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }

        console.log("Connection test result:", data);
        setResult(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(`Connection test attempt ${retryCount + 1} failed:`, err);

        if (retryCount < maxRetries) {
          retryCount++;
          const delay = 1000 * retryCount; // Exponential backoff
          console.log(`Retrying connection in ${delay}ms...`);
          setTimeout(invokeWithRetry, delay);
        } else {
          setError(
            `Error after ${maxRetries + 1} attempts: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } finally {
        if (retryCount >= maxRetries || retryCount === 0) {
          setIsLoading(false);
        }
      }
    };

    // Start the connection test with retry mechanism
    invokeWithRetry();
  };

  const testOriginalFunction = async () => {
    setIsLoading(true);
    setResult("");
    setError("");

    // Retry mechanism for edge function calls
    const maxRetries = 3;
    let retryCount = 0;

    const invokeWithRetry = async () => {
      try {
        console.log(
          `Testing original signup function (attempt ${retryCount + 1})...`,
        );

        const { data, error } = await supabase.functions.invoke(
          "supabase-functions-signup-send-magic-link",
          {
            body: {
              first_name: "Test",
              last_name: "User",
              email: "test@example.com",
              referral_code: "TEST123",
            },
          },
        );

        if (error) {
          throw new Error(error.message || JSON.stringify(error));
        }

        console.log("Original function test result:", data);
        setResult(JSON.stringify(data, null, 2));
      } catch (err) {
        console.error(
          `Original function test attempt ${retryCount + 1} failed:`,
          err,
        );

        if (retryCount < maxRetries) {
          retryCount++;
          const delay = 1000 * retryCount; // Exponential backoff
          console.log(`Retrying original function test in ${delay}ms...`);
          setTimeout(invokeWithRetry, delay);
        } else {
          setError(
            `Error after ${maxRetries + 1} attempts: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
      } finally {
        if (retryCount >= maxRetries || retryCount === 0) {
          setIsLoading(false);
        }
      }
    };

    // Start the original function test with retry mechanism
    invokeWithRetry();
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Edge Function Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={testConnection}
                disabled={isLoading}
                className="bg-[#0077be] hover:bg-[#0066a6]"
              >
                {isLoading ? "Testing..." : "Test Simple Connection"}
              </Button>
              <Button
                onClick={testOriginalFunction}
                disabled={isLoading}
                className="bg-[#2c3e50] hover:bg-[#1a2530]"
              >
                {isLoading ? "Testing..." : "Test Signup Function"}
              </Button>
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-2">Environment Variables:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p>
                  VITE_SUPABASE_URL:{" "}
                  {import.meta.env.VITE_SUPABASE_URL ? "✓ Set" : "✗ Not set"}
                </p>
                <p>
                  VITE_SUPABASE_ANON_KEY:{" "}
                  {import.meta.env.VITE_SUPABASE_ANON_KEY
                    ? "✓ Set"
                    : "✗ Not set"}
                </p>
              </div>
            </div>

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

export default TestConnection;
