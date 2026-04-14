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
      data.leaderSemester || "",
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
      data.referralCode || "",
      data.generatedReferralCode || ""
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
      data.leaderSemester || "",
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
      data.referralCode || "",
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
      data.referralCode || ""
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
       data.referralCode || ""
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

export async function appendStallRegistrationToSheet(data: any) {
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

    const members = data.members || [];
    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.fullName || "",
      data.email || "",
      data.phone || "",
      data.college || "",
      data.stallCategory === 'food_beverage' ? "Food & Beverage" : "Products or Games",
      data.isPremium ? "Yes" : "No",
      data.numberOfDays || 2,
      data.selectedDate || "N/A",
      "₹" + (((data.stallCategory === 'products_games' ? 2500 : 4000) + (data.isPremium ? 2000 : 0)) * (data.numberOfDays || 2)).toLocaleString('en-IN'),
      data.stallName || "",
      data.stallDescription || "",
      // Members 1-5
      ...[0, 1, 2, 3, 4].flatMap((i) => [
        members[i]?.name || "",
        members[i]?.email || "",
        members[i]?.phone || "",
      ]),
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Stall Registrations'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

  } catch (error) {
    console.error("Error appending stall registration to Google Sheets:", error);
  }
}

export async function appendAmbassadorToSheet(data: any) {
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
      data.name || "",
      data.email || "",
      data.phone || "",
      data.college || "",
      data.department || "",
      data.year || "",
      data.referralCode || "",
      data.source || "direct"
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Campus Ambassador'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

  } catch (error) {
    console.error("Error appending ambassador to Google Sheets:", error);
  }
}

export async function appendCommunityPartnerToSheet(data: any) {
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
    
    const expectationsList = Array.isArray(data.expectations) ? data.expectations.join(", ") : data.expectations || "";
    const deliverablesList = Array.isArray(data.deliverables) ? data.deliverables.join(", ") : data.deliverables || "";

    const row = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.spocName || "",
      data.email || "",
      data.phone || "",
      data.communityName || "",
      data.description || "",
      data.logoLightUrl || "",
      data.logoDarkUrl || "",
      expectationsList,
      deliverablesList,
      data.instagramUrl || "",
      data.linkedinUrl || ""
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "'Community Partner'!A1",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [row],
      },
    });

  } catch (error) {
    console.error("Error appending community partner to Google Sheets:", error);
  }
}
