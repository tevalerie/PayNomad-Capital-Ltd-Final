/**
 * A simple custom implementation to replace @magiclinks/client
 * This provides the basic functionality needed without external dependencies
 */

import { supabase } from "../supabaseClient";
import { v4 as uuidv4 } from "uuid";

interface MagicLinkOptions {
  email: string;
  redirectUrl: string;
  metadata?: Record<string, any>;
}

interface VerifyOptions {
  token: string;
}

interface MagicLinkResult {
  data?: any;
  error?: {
    message: string;
  };
}

class CustomMagicLinks {
  auth = {
    async sendMagicLink(options: MagicLinkOptions): Promise<MagicLinkResult> {
      try {
        const { email, redirectUrl, metadata } = options;

        // Generate a unique token
        const token = uuidv4();

        // Store the token and metadata in the database
        const { error } = await supabase.from("magic_links").insert({
          email,
          token,
          metadata,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours expiry
        });

        if (error) {
          console.error("Error storing magic link:", error);
          return {
            error: { message: `Failed to create magic link: ${error.message}` },
          };
        }

        // Send the email using Supabase Auth (we'll use this as our email sender)
        const { error: emailError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${redirectUrl}?token=${token}`,
            data: {
              customToken: token,
              ...metadata,
            },
          },
        });

        if (emailError) {
          console.error("Error sending magic link email:", emailError);
          return {
            error: { message: `Failed to send email: ${emailError.message}` },
          };
        }

        return { data: { success: true } };
      } catch (err) {
        console.error("Unexpected error in sendMagicLink:", err);
        return {
          error: {
            message:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          },
        };
      }
    },

    async verifyMagicLink(options: VerifyOptions): Promise<MagicLinkResult> {
      try {
        const { token } = options;

        if (!token) {
          return { error: { message: "No token provided" } };
        }

        // Find the token in the database
        const { data, error } = await supabase
          .from("magic_links")
          .select("*")
          .eq("token", token)
          .single();

        if (error || !data) {
          console.error("Error verifying magic link:", error);
          return { error: { message: "Invalid or expired token" } };
        }

        // Check if token is expired
        if (new Date(data.expires_at) < new Date()) {
          return { error: { message: "Token has expired" } };
        }

        // Mark the token as used
        await supabase
          .from("magic_links")
          .update({ used_at: new Date().toISOString() })
          .eq("token", token);

        return {
          data: {
            email: data.email,
            metadata: data.metadata,
            token: token,
          },
        };
      } catch (err) {
        console.error("Unexpected error in verifyMagicLink:", err);
        return {
          error: {
            message:
              err instanceof Error
                ? err.message
                : "An unexpected error occurred",
          },
        };
      }
    },
  };
}

export const MagicLinks = CustomMagicLinks;
