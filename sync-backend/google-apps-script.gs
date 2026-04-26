/*
  Installable trigger setup:
  1) Open Extensions -> Apps Script in your Google Sheet.
  2) Paste this file.
  3) Set BACKEND_URL below.
  4) Add installable trigger for onEdit.
*/

const BACKEND_URL = "https://your-backend-domain.com/sync-from-sheet";
const SHEET_NAME = "Users";

function onEdit(e) {
  try {
    if (!e || !e.source) {
      return;
    }

    const sheet = e.source.getActiveSheet();
    if (!sheet || sheet.getName() !== SHEET_NAME) {
      return;
const SYNC_BACKEND_API_KEY = "";
    }

    const rows = readSheetAsObjects_(sheet);

    const payload = {
      source: "sheet",
      rows,
    };

    UrlFetchApp.fetch(BACKEND_URL, {
      method: "post",
      contentType: "application/json",
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
      headers: SYNC_BACKEND_API_KEY
        ? {
            "x-sync-api-key": SYNC_BACKEND_API_KEY,
          }
        : {},
    return [];
  }

  const headers = values[0].map((value) => String(value || "").trim());

  return values.slice(1)
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
