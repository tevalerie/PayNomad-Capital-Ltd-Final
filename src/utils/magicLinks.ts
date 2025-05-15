/**
 * MagicLinks.dev API client implementation
 */

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

import * as jose from "jose";

class MagicLinksClient {
  private apiToken: string;
  private audience: string;
  private issuer: string;

  constructor() {
    this.apiToken = import.meta.env.VITE_MAGICLINKS_API_TOKEN || "";
    this.audience = "62164dad-d62a-4e76-bed1-91805b441bcf"; // Your audience value
    this.issuer = "https://magiclinks.dev";
  }

  auth = {
    async sendMagicLink(options: MagicLinkOptions): Promise<MagicLinkResult> {
      try {
        const { email, redirectUrl, metadata } = options;

        if (!email || !redirectUrl) {
          return { error: { message: "Email and redirectUrl are required" } };
        }

        const response = await fetch(
          "https://api.magiclinks.dev/v1/magic-links",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_MAGICLINKS_API_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              redirectUrl,
              metadata,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.error("MagicLinks API error:", errorData);
          return {
            error: {
              message: errorData.message || `API error: ${response.status}`,
            },
          };
        }

        const data = await response.json();
        return { data };
      } catch (err) {
        console.error("Error sending magic link:", err);
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

        // Verify the JWT token
        try {
          const JWKS = jose.createRemoteJWKSet(
            new URL(`${this.issuer}/.well-known/jwks.json`),
          );

          const { payload } = await jose.jwtVerify(token, JWKS, {
            audience: this.audience,
            issuer: this.issuer,
          });

          // Extract the email and metadata from the payload
          const email = payload.email as string;
          const metadata = (payload.metadata as Record<string, any>) || {};

          return {
            data: {
              email,
              metadata,
              token,
            },
          };
        } catch (jwtError) {
          console.error("JWT verification error:", jwtError);
          return { error: { message: "Invalid or expired token" } };
        }
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

export const MagicLinks = MagicLinksClient;
