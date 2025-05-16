/**
 * Utility functions for error handling throughout the application
 */

import { supabase } from "../supabaseClient";

/**
 * Logs errors to console and potentially to a monitoring service
 * @param error The error object
 * @param context Additional context about where the error occurred
 * @param metadata Additional metadata about the error
 */
export const logError = async (
  error: unknown,
  context: string,
  metadata?: Record<string, any>,
): Promise<void> => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`Error in ${context}:`, errorMessage);

  if (errorStack) {
    console.error("Stack trace:", errorStack);
  }

  // Log to Supabase if available
  try {
    if (supabase) {
      const { error: logError } = await supabase.from("userData").insert({
        email: metadata?.email || "system",
        action: "error_log",
        action_details: {
          context,
          error: errorMessage,
          stack: errorStack,
          timestamp: new Date().toISOString(),
          browser:
            typeof navigator !== "undefined" ? navigator.userAgent : "server",
          ...(metadata || {}),
        },
        created_at: new Date().toISOString(),
      });

      if (logError) {
        console.error("Error logging to Supabase:", logError);
      }
    }
  } catch (loggingError) {
    console.error("Error during error logging:", loggingError);
  }

  // Here you would add code to send to your error monitoring service
  // Example: sendToErrorMonitoring(error, context);
};

/**
 * Implements a retry mechanism for async functions
 * @param fn The async function to retry
 * @param maxRetries Maximum number of retry attempts
 * @param delayMs Base delay in milliseconds (will be multiplied by attempt number for backoff)
 * @returns The result of the function if successful
 */
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delayMs = 1000,
): Promise<T> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = delayMs * (attempt + 1);
        console.log(`Attempt ${attempt + 1} failed. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Creates a safe version of a function that catches errors
 * @param fn The function to make safe
 * @param fallbackValue Optional fallback value to return if the function fails
 * @returns A new function that won't throw errors
 */
export function createSafeFunction<T, Args extends any[]>(
  fn: (...args: Args) => T,
  fallbackValue?: T,
): (...args: Args) => T | undefined {
  return (...args: Args) => {
    try {
      return fn(...args);
    } catch (error) {
      logError(
        error,
        `Safe function wrapper for ${fn.name || "anonymous function"}`,
      );
      return fallbackValue;
    }
  };
}

/**
 * Checks if the network is online
 * @returns Boolean indicating if the network is available
 */
export const isOnline = (): boolean => {
  return typeof navigator !== "undefined" && navigator.onLine;
};

/**
 * Monitors network status and executes callbacks when status changes
 * @param onOffline Function to call when going offline
 * @param onOnline Function to call when coming back online
 * @returns Cleanup function to remove event listeners
 */
export const monitorNetworkStatus = (
  onOffline: () => void,
  onOnline: () => void,
): (() => void) => {
  window.addEventListener("offline", onOffline);
  window.addEventListener("online", onOnline);

  return () => {
    window.removeEventListener("offline", onOffline);
    window.removeEventListener("online", onOnline);
  };
};
