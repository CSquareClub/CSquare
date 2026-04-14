import { google } from "googleapis";

export async function appendRegistrationToSheet(data: any) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      console.warn("Google Sheets credentials are not configured.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1O3e33Q1SKPDB39uQK3UkmjrLXwzR36yeIbwqiHsKraM";
    
    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.isCU ? "CU" : data.isProfessional ? "Professional/Faculty" : "Non-CU",
      data.teamName || "",
      data.leaderName || "",
      data.leaderEmail || "",
      data.leaderPhone || "",
      data.leaderUID || "",
      data.leaderCollege || "",
      data.leaderLeetcode || "",
      data.leaderCodeforces || "",
      data.leaderCodechef || "",
      data.leaderGithub || "",
      data.member2Name || "",
      data.member2Email || "",
      data.member2UID || "",
      data.member2Phone || "",
      data.member2Leetcode || "",
      data.member2Codeforces || "",
      data.member2Codechef || "",
      data.member2Github || "",
      data.member3Name || "",
      data.member3Email || "",
      data.member3UID || "",
      data.member3Phone || "",
      data.member3Leetcode || "",
      data.member3Codeforces || "",
      data.member3Codechef || "",
      data.member3Github || "",
      data.facultyMentorName || "",
      data.facultyMentorEid || ""
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

  } catch (error) {
    console.error("Error appending to Google Sheets:", error);
  }
}

export async function appendMultipleRegistrationsToSheet(rows: any[]) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      console.warn("Google Sheets credentials are not configured.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1O3e33Q1SKPDB39uQK3UkmjrLXwzR36yeIbwqiHsKraM";

    const sheetRows = rows.map((data) => [
      data.createdAt ? new Date(data.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "",
      data.isCU ? "CU" : data.isProfessional ? "Professional/Faculty" : "Non-CU",
      data.teamName || "",
      data.leaderName || "",
      data.leaderEmail || "",
      data.leaderPhone || "",
      data.leaderUID || "",
      data.leaderCollege || "",
      data.leaderLeetcode || "",
      data.leaderCodeforces || "",
      data.leaderCodechef || "",
      data.leaderGithub || "",
      data.member2Name || "",
      data.member2Email || "",
      data.member2UID || "",
      data.member2Phone || "",
      data.member2Leetcode || "",
      data.member2Codeforces || "",
      data.member2Codechef || "",
      data.member2Github || "",
      data.member3Name || "",
      data.member3Email || "",
      data.member3UID || "",
      data.member3Phone || "",
      data.member3Leetcode || "",
      data.member3Codeforces || "",
      data.member3Codechef || "",
      data.member3Github || "",
      data.facultyMentorName || "",
      data.facultyMentorEid || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: sheetRows,
      },
    });

  } catch (error) {
    console.error("Error appending bulk registrations to Google Sheets:", error);
  }
}

export async function appendPaymentConfirmationToSheet(data: any) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      console.warn("Google Sheets credentials are not configured.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1O3e33Q1SKPDB39uQK3UkmjrLXwzR36yeIbwqiHsKraM";
    
    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.isCU ? "CU" : data.isProfessional ? "Professional/Faculty" : "Non-CU",
      data.teamName || "",
      data.leaderName || "",
      data.leaderEmail || "",
      data.leaderPhone || "",
      data.leaderUID || "",
      data.leaderCollege || "",
      data.leaderLeetcode || "",
      data.leaderCodeforces || "",
      data.leaderCodechef || "",
      data.leaderGithub || "",
      data.member2Name || "",
      data.member2Email || "",
      data.member2UID || "",
      data.member2Phone || "",
      data.member2Leetcode || "",
      data.member2Codeforces || "",
      data.member2Codechef || "",
      data.member2Github || "",
      data.member3Name || "",
      data.member3Email || "",
      data.member3UID || "",
      data.member3Phone || "",
      data.member3Leetcode || "",
      data.member3Codeforces || "",
      data.member3Codechef || "",
      data.member3Github || "",
      data.facultyMentorName || "",
      data.facultyMentorEid || "",
      data.transactionId || "",
      data.paymentScreenshotUrl || "",
      data.paymentStatus || "",
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Payment Confirmation'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

  } catch (error) {
    console.error("Error appending payment confirmation to Google Sheets:", error);
  }
}

export async function appendMultiplePaymentConfirmationsToSheet(rows: any[]) {
  try {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    if (!clientEmail || !privateKey) {
      console.warn("Google Sheets credentials are not configured.");
      return;
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const spreadsheetId = "1O3e33Q1SKPDB39uQK3UkmjrLXwzR36yeIbwqiHsKraM";

    const sheetRows = rows.map((data) => [
      data.createdAt ? new Date(data.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : "",
      data.isCU ? "CU" : data.isProfessional ? "Professional/Faculty" : "Non-CU",
      data.teamName || "",
      data.leaderName || "",
      data.leaderEmail || "",
      data.leaderPhone || "",
      data.leaderUID || "",
      data.leaderCollege || "",
      data.leaderLeetcode || "",
      data.leaderCodeforces || "",
      data.leaderCodechef || "",
      data.leaderGithub || "",
      data.member2Name || "",
      data.member2Email || "",
      data.member2UID || "",
      data.member2Phone || "",
      data.member2Leetcode || "",
      data.member2Codeforces || "",
      data.member2Codechef || "",
      data.member2Github || "",
      data.member3Name || "",
      data.member3Email || "",
      data.member3UID || "",
      data.member3Phone || "",
      data.member3Leetcode || "",
      data.member3Codeforces || "",
      data.member3Codechef || "",
      data.member3Github || "",
      data.facultyMentorName || "",
      data.facultyMentorEid || "",
      data.transactionId || "",
      data.paymentScreenshotUrl || "",
      data.paymentStatus || "",
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Payment Confirmation'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: sheetRows,
      },
    });

  } catch (error) {
    console.error("Error appending bulk payment confirmations to Google Sheets:", error);
  }
}
