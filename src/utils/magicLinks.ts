/**
 * MagicLinks feature has been removed
 * This file is kept as a placeholder to prevent import errors
 */

class MagicLinksClient {
  constructor() {
    console.warn("MagicLinks feature has been removed");
  }

  auth = {
    getAudience: () => {
      console.warn("MagicLinks feature has been removed");
      return "";
    },
    getIssuer: () => {
      console.warn("MagicLinks feature has been removed");
      return "";
    },
    async sendMagicLink() {
      console.warn("MagicLinks feature has been removed");
      return { error: { message: "Feature unavailable" } };
    },
    async verifyMagicLink() {
      console.warn("MagicLinks feature has been removed");
      return { error: { message: "Feature unavailable" } };
    },
  };
}

export const MagicLinks = MagicLinksClient;
