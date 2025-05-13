import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

const EdgeFunctionTest: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const testEdgeFunction = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Test with a simple ping function
      const { data, error } = await supabase.functions.invoke(
        "signup-send-magic-link",
        {
          body: { test: true },
        },
      );

      if (error) {
        throw error;
      }

      setResult(data);
    } catch (err: any) {
      console.error("Edge Function Test Error:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edge Function Test</h2>
      <p className="mb-4 text-gray-600">
        This component tests connectivity to Supabase Edge Functions.
      </p>

      <Button
        onClick={testEdgeFunction}
        disabled={loading}
        className="bg-[#0077BE] hover:bg-[#2C3E50] mb-4"
      >
        {loading ? "Testing..." : "Test Edge Function"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <h3 className="font-bold text-red-700 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-bold text-green-700 mb-2">Success</h3>
          <pre className="bg-gray-100 p-2 rounded overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-bold mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Check that Supabase Edge Functions are deployed</li>
          <li>Verify environment variables are set in Netlify</li>
          <li>Ensure CORS headers are properly configured</li>
          <li>Check browser console for detailed error messages</li>
        </ul>
      </div>
    </Card>
  );
};

export default EdgeFunctionTest;
