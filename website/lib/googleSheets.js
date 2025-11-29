import { google } from "googleapis";

const sheetId = process.env.REFERRAL_GOOGLE_SHEET_ID

const getAuth = () => {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
    return new google.auth.GoogleAuth({
        credentials: creds,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
}

export const appendReferralRow = async ({
    referralCode,
    timestamp,
    planName,
    countryCodes,
    data,
    price,
    qty,
    currency,
    email
}) => {
    const auth = await getAuth();
    const sheets = google.sheets({ version: 'v4', auth });

    const values = [
        [
            referralCode,
            timestamp,
            planName,
            countryCodes,
            data,
            price,
            qty,
            currency,
            email
        ],
    ];

    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Referrals!A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: { values },
    });
}