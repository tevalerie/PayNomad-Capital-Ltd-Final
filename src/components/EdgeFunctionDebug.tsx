import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const EdgeFunctionDebug: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [functionName, setFunctionName] = useState("signup-send-magic-link");
  const [payload, setPayload] = useState(
    JSON.stringify(
      {
        first_name: "Test",
        last_name: "User",
        email: "test@example.com",
        referral_code: "TEST123",
      },
      null,
      2,
    ),
  );

  const testEdgeFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Parse the payload
      const parsedPayload = JSON.parse(payload);

      console.log(`Testing edge function: ${functionName}`);
      console.log("With payload:", parsedPayload);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: parsedPayload,
      });

      if (error) {
        throw error;
      }

      setResult(data);
    } catch (err: any) {
      console.error("Edge Function Debug Error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const listFunctions = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // This is just a test to see what functions are available
      // Note: This is not a real API endpoint, just for demonstration
      const { data, error } = await supabase.functions.invoke(
        "signup-send-magic-link",
        {
          body: { test: true },
        },
      );

      if (error) {
        throw error;
      }

      setResult({ message: "Test connection successful", data });
    } catch (err: any) {
      console.error("Connection test error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edge Function Debug Tool</h2>
      <p className="mb-4 text-gray-600">
        Use this tool to test Supabase Edge Functions directly.
      </p>

      <div className="space-y-4 mb-4">
        <div>
          <Label htmlFor="functionName">Function Name</Label>
          <Input
            id="functionName"
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="payload">Payload (JSON)</Label>
          <textarea
            id="payload"
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            className="w-full h-40 p-2 border rounded-md font-mono text-sm mt-1"
          />
        </div>
      </div>

      <div className="flex space-x-4 mb-6">
        <Button
          onClick={testEdgeFunction}
          disabled={loading}
          className="bg-[#0077BE] hover:bg-[#2C3E50]"
        >
          {loading ? "Testing..." : "Test Function"}
        </Button>

        <Button onClick={listFunctions} disabled={loading} variant="outline">
          Test Connection
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <h3 className="font-bold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-700 mb-2">Response</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Make sure the function name includes the full path (e.g.,
            "supabase-functions-signup-send-magic-link")
          </li>
          <li>Check that your payload is valid JSON</li>
          <li>
            Verify that the Supabase project has the edge functions deployed
          </li>
          <li>Check browser console for detailed error messages</li>
        </ul>
      </div>
    </Card>
  );
};

export default EdgeFunctionDebug;
