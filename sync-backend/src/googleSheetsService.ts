import { google, sheets_v4 } from "googleapis";
import { getGoogleServiceAccountConfig } from "../../lib/google-service-account";

type RowObject = Record<string, unknown>;

export class GoogleSheetsService {
  private readonly spreadsheetId: string;
  private readonly sheetName: string;
  private readonly sheetsClient: sheets_v4.Sheets;

  constructor() {
    this.spreadsheetId = this.requireEnv("GOOGLE_SYNC_SPREADSHEET_ID");
    this.sheetName = process.env.GOOGLE_SYNC_SHEET_NAME || "Users";

    const serviceAccount = getGoogleServiceAccountConfig();

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: serviceAccount.clientEmail,
        private_key: serviceAccount.privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheetsClient = google.sheets({ version: "v4", auth });
  }

  getSheetName(): string {
    return this.sheetName;
  }

  async readRowsAsObjects(): Promise<RowObject[]> {
    const range = `${this.sheetName}!A:ZZ`;
    const response = await this.sheetsClient.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range,
    });

    const values = response.data.values || [];

    if (values.length === 0) {
      return [];
    }

    const headers = (values[0] || []).map((cell) => String(cell || "").trim());

    return values
      .slice(1)
      .filter((row) => row.some((cell) => String(cell || "").trim().length > 0))
      .map((row) => {
        const obj: RowObject = {};

        headers.forEach((header, index) => {
          if (!header) {
            return;
          }
          obj[header] = row[index] ?? "";
        });

        return obj;
      });
  }

  async writeRowsFromObjects(rows: RowObject[]): Promise<void> {
    const headers = this.computeHeaders(rows);

    const values: string[][] = [];
    values.push(headers);

    for (const row of rows) {
      values.push(
        headers.map((header) => this.toCellValue(row[header]))
      );
    }

    await this.sheetsClient.spreadsheets.values.clear({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A:ZZ`,
    });

    await this.sheetsClient.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `${this.sheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
  }

  private computeHeaders(rows: RowObject[]): string[] {
    const preferred = ["id", "name", "email", "updatedAt"];
    const dynamic = new Set<string>();

    for (const row of rows) {
      Object.keys(row).forEach((key) => dynamic.add(key));
    }

    const ordered = preferred.filter((key) => dynamic.has(key));
    const rest = [...dynamic].filter((key) => !preferred.includes(key)).sort();

    return [...ordered, ...rest];
  }

  private toCellValue(value: unknown): string {
    if (typeof value === "undefined" || value === null) {
      return "";
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  }

  private requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
      throw new Error(`${name} is required for Google Sheets sync backend.`);
    }
    return value;
  }
}
