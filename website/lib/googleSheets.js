import { google } from "googleapis";

const referralSheetId = process.env.REFERRAL_GOOGLE_SHEET_ID;
const chatLogSheetId = process.env.CHAT_LOG_GOOGLE_SHEET_ID;
const chatLogSheetTitle = "ChatLogs";

const getAuth = () => {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  return new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
};

export const appendReferralRow = async ({
  referralCode,
  timestamp,
  planName,
  countryCodes,
  data,
  price,
  qty,
  currency,
  email,
}) => {
  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [[referralCode, timestamp, planName, countryCodes, data, price, qty, currency, email]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: referralSheetId,
    range: "Referrals!A1",
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
};

export const appendChatLogRow = async ({
  timestamp,
  conversationId,
  pagePath,
  userMessage,
  assistantReply,
}) => {
  if (!chatLogSheetId) {
    console.error("CHAT_LOG_GOOGLE_SHEET_ID is not configured; chat log not recorded");
    return;
  }

  const auth = await getAuth();
  const sheets = google.sheets({ version: "v4", auth });

  const values = [[timestamp, conversationId, pagePath, userMessage, assistantReply]];

  await sheets.spreadsheets.values.append({
    spreadsheetId: chatLogSheetId,
    range: `'${chatLogSheetTitle}'!A1`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
};
