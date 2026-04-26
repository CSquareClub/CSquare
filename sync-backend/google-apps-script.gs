/*
  Installable trigger setup:
  1) Open Extensions -> Apps Script in your Google Sheet.
  2) Paste this file.
  3) Set BACKEND_URL and SYNC_API_KEY below.
  4) Add installable trigger for onEdit.
*/

const BACKEND_URL = "https://your-backend-domain.com/sync-from-sheet";
const SHEET_NAME = "Users";
const SYNC_API_KEY = "replace-with-your-secret-key";

function onEdit(e) {
  try {
    if (!e || !e.source) {
      return;
    }

    const sheet = e.source.getActiveSheet();
    if (!sheet || sheet.getName() !== SHEET_NAME) {
      return;
    }

    const rows = readSheetAsObjects_(sheet);

    const payload = {
      source: "sheet",
      apiKey: SYNC_API_KEY,
      rows: rows,
    };

    UrlFetchApp.fetch(BACKEND_URL, {
      method: "post",
      contentType: "application/json",
      headers: {
        "x-sync-api-key": SYNC_API_KEY,
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });
  } catch (error) {
    console.error("onEdit sync failed", error);
  }
}

function readSheetAsObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (!values || values.length === 0) {
    return [];
  }

  const headers = values[0].map((value) => String(value || "").trim());

  return values
    .slice(1)
    .filter((row) => row.some((cell) => String(cell || "").trim() !== ""))
    .map((row) => {
      const obj = {};

      headers.forEach((header, index) => {
        if (!header) {
          return;
        }

        const value = row[index];

        if (value instanceof Date) {
          obj[header] = value.toISOString();
        } else {
          obj[header] = value;
        }
      });

      return obj;
    });
}
