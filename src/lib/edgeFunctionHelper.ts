import { supabase } from "./supabaseClient";

/**
 * Helper function to invoke Supabase Edge Functions with proper error handling
 * @param functionName Name of the Edge Function to invoke
 * @param payload Request payload
 * @returns Response data or throws an error
 */
export async function invokeEdgeFunction<T = any, E = any>(
  functionName: string,
  payload?: any,
): Promise<T> {
  // Add a retry mechanism for edge function calls
  const maxRetries = 3;
  let retries = 0;
  let lastError: any = null;
  while (retries <= maxRetries) {
    try {
      console.log(
        `Invoking Edge Function: ${functionName} (attempt ${retries + 1}/${maxRetries + 1})`,
        payload,
      );

      // Add a timestamp to help avoid caching issues
      const requestPayload = {
        ...payload,
        _timestamp: Date.now(),
      };

      console.log(`Full function name: ${functionName}`);

      const { data, error } = await supabase.functions.invoke<T>(functionName, {
        body: requestPayload,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (error) {
        console.error(`Edge Function Error (${functionName}):`, error);
        throw error;
      }

      console.log(`Edge Function Response (${functionName}):`, data);
      return data as T;
    } catch (err: any) {
      lastError = err;
      retries++;

      if (retries <= maxRetries) {
        // Exponential backoff: 1s, 2s, 4s...
        const delay = Math.pow(2, retries - 1) * 1000;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        break;
      }
    }
  }

  // If we've exhausted all retries
  console.error(
    `Failed to invoke Edge Function (${functionName}) after ${maxRetries + 1} attempts:`,
    lastError,
  );

  // Enhance error message for better debugging
  const errorMessage = lastError?.message || "Unknown error occurred";
  const enhancedError = new Error(
    `Edge Function Error (${functionName}): ${errorMessage}. ` +
      "Please check network connectivity and CORS configuration.",
  );

  throw enhancedError;
}
