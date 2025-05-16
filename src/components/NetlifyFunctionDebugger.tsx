import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

const NetlifyFunctionDebugger = () => {
  const [endpoint, setEndpoint] = useState(
    "/.netlify/functions/submit-application",
  );
  const [method, setMethod] = useState("POST");
  const [requestBody, setRequestBody] = useState(
    JSON.stringify(
      {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        referralCode: "TEST123",
      },
      null,
      2,
    ),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [rawResponse, setRawResponse] = useState<string>("");

  const testFunction = async () => {
    setIsLoading(true);
    setResponse(null);
    setError("");
    setRawResponse("");

    try {
      // Parse the request body if it's a POST request
      const body = method === "POST" ? JSON.parse(requestBody) : undefined;

      // Make the request
      const fetchResponse = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        ...(method === "POST" && { body: JSON.stringify(body) }),
      });

      // Get the raw text first
      const rawText = await fetchResponse.text();
      setRawResponse(rawText);

      // Try to parse as JSON
      let jsonData;
      try {
        jsonData = JSON.parse(rawText);
        setResponse({
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: Object.fromEntries(fetchResponse.headers.entries()),
          data: jsonData,
        });
      } catch (jsonError) {
        setError(`Response is not valid JSON: ${jsonError.message}`);
        setResponse({
          status: fetchResponse.status,
          statusText: fetchResponse.statusText,
          headers: Object.fromEntries(fetchResponse.headers.entries()),
          data: null,
        });
      }
    } catch (err) {
      console.error("Error testing function:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf4eb] p-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Netlify Function Debugger</CardTitle>
          <CardDescription>
            Test Netlify functions and debug JSON parsing issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="endpoint">Function Endpoint</Label>
            <Input
              id="endpoint"
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder="/.netlify/functions/function-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">HTTP Method</Label>
            <select
              id="method"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          {method !== "GET" && (
            <div className="space-y-2">
              <Label htmlFor="requestBody">Request Body (JSON)</Label>
              <textarea
                id="requestBody"
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-40 p-2 font-mono text-sm border rounded"
                placeholder='{"key": "value"}'
              />
            </div>
          )}

          <Button
            onClick={testFunction}
            disabled={isLoading}
            className="w-full bg-[#0077be] hover:bg-[#0066a6]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Function"
            )}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium">Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {rawResponse && (
            <div className="space-y-2">
              <h3 className="font-medium">Raw Response</h3>
              <pre className="p-4 bg-gray-100 rounded overflow-auto max-h-40 text-xs">
                {rawResponse}
              </pre>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-100 rounded">
                <h3 className="font-medium mb-2">Response Details</h3>
                <p>
                  <strong>Status:</strong> {response.status}{" "}
                  {response.statusText}
                </p>
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Headers:</h4>
                  <pre className="text-xs mt-1 overflow-auto max-h-20">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </div>
              </div>

              {response.data && (
                <div className="p-4 bg-gray-100 rounded">
                  <h3 className="font-medium mb-2">Response Data</h3>
                  <pre className="text-xs overflow-auto max-h-60">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NetlifyFunctionDebugger;
