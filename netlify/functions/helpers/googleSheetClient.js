const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");

// Memoization for the doc instance within a single function invocation's lifecycle.
// Netlify Functions can reuse execution environments for subsequent warm invocations.
let docInstance;
let lastSheetId;
let lastAuthTimestamp; // To potentially re-auth if JWT expires (though JWTs are typically long-lived)

const REAUTH_THRESHOLD_MS = 60 * 50 * 1000; // Re-authenticate if JWT is older than 50 minutes (JWTs last 1hr)

async function getDocInstance(
  sheetId,
  type /* 'main' or 'otp', currently unused but good for future extension */,
) {
  const now = Date.now();
  if (
    docInstance &&
    lastSheetId === sheetId &&
    lastAuthTimestamp &&
    now - lastAuthTimestamp < REAUTH_THRESHOLD_MS
  ) {
    // console.log('Using memoized GoogleSheet doc instance');
    return docInstance;
  }

  // console.log('Initializing new GoogleSheet doc instance');
  if (
    !process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    !process.env.GOOGLE_PRIVATE_KEY
  ) {
    throw new Error(
      "Missing Google Service Account credentials in environment variables.",
    );
  }
  if (!sheetId) {
    throw new Error("Google Sheet ID is required to initialize the document.");
  }

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle escaped newlines
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

  try {
    await doc.loadInfo(); // Loads document properties and worksheets
    // console.log(`Successfully loaded Google Sheet: ${doc.title}`);
  } catch (error) {
    console.error("Failed to load Google Sheet info:", error);
    throw new Error(
      `Could not load Google Sheet (ID: ${sheetId}). Check sharing permissions and API key. Original error: ${error.message}`,
    );
  }

  docInstance = doc;
  lastSheetId = sheetId;
  lastAuthTimestamp = now;

  return docInstance;
}

module.exports = { getDocInstance };
