import { authOptions } from "@/lib/authOptions";
import {
  deleteCoreTeamApplications,
  getCoreTeamApplicationCount,
  listCoreTeamApplications,
} from "@/lib/core-team-applications-store";
import { getGoogleServiceAccountConfig } from "@/lib/google-service-account";
import {
  deleteOutsideRegistrations,
  getOutsideRegistrationCounts,
  listCampusAmbassadors,
  listOutsideRegistrations,
} from "@/lib/outside-registrations-store";
import { getServerSession } from "next-auth";
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";

type View = "all" | "ambassadors" | "core-team";

const outsideExportColumns: Array<{ key: string; header: string }> = [
  { key: "fullName", header: "Full Name" },
  { key: "instituteName", header: "Institute Name" },
  { key: "rollNumber", header: "Roll Number" },
  { key: "personalEmail", header: "Personal Email" },
  { key: "collegeEmail", header: "College Email" },
  { key: "campusAmbassador", header: "Campus Ambassador" },
  { key: "createdAt", header: "Submitted At" },
];

const coreTeamExportColumns: Array<{ key: string; header: string }> = [
  { key: "membershipId", header: "Membership ID" },
  { key: "fullName", header: "Full Name" },
  { key: "uid", header: "UID" },
  { key: "department", header: "Department" },
  { key: "course", header: "Course" },
  { key: "year", header: "Year" },
  { key: "semester", header: "Semester" },
  { key: "rolesInterested", header: "Roles Interested" },
  { key: "resumeLink", header: "Resume Link" },
  { key: "linkedinUrl", header: "LinkedIn" },
  { key: "portfolioUrl", header: "Portfolio" },
  { key: "whyJoin", header: "Why Join" },
  { key: "createdAt", header: "Submitted At" },
];

const defaultSpreadsheetId = "1S6OQd0lXUxpPQc7DQrP6mx2Ic-W3YI14aNhlYw-c15c";

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;
  return String(err);
}

function asSheetValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string" || typeof value === "number") return value;
  return String(value);
}

function resolveSpreadsheetId(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("GOOGLE_SPREADSHEET_ID_OUTSIDE is empty");
  }

  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return trimmed;
}

async function ensureSheetExists(
  spreadsheetId: string,
  title: string,
  sheetsClient: ReturnType<typeof google.sheets>
) {
  const meta = await sheetsClient.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });

  const hasSheet = meta.data.sheets?.some((sheet) => sheet.properties?.title === title);
  if (!hasSheet) {
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
}

async function writeSheet(
  spreadsheetId: string,
  title: string,
  rows: Array<Record<string, unknown>>,
  columns: Array<{ key: string; header: string }>,
  sheetsClient: ReturnType<typeof google.sheets>
) {
  const headerRow = columns.map((col) => col.header);
  const valueRows = rows.map((row) => columns.map((col) => asSheetValue(row[col.key])));

  await ensureSheetExists(spreadsheetId, title, sheetsClient);

  await sheetsClient.spreadsheets.values.clear({
    spreadsheetId,
    range: `'${title}'!A:ZZ`,
  });

  await sheetsClient.spreadsheets.values.update({
    spreadsheetId,
    range: `'${title}'!A1`,
    valueInputOption: "RAW",
    requestBody: {
      values: [headerRow, ...valueRows],
    },
  });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const view = (req.nextUrl.searchParams.get("view") || "all") as View;

  try {
    if (view === "all") {
      const [data, counts] = await Promise.all([
        listOutsideRegistrations(),
        getOutsideRegistrationCounts(),
      ]);
      const coreTeamCount = await getCoreTeamApplicationCount();
      return NextResponse.json({ data, counts: { ...counts, coreTeam: coreTeamCount } });
    }

    if (view === "ambassadors") {
      const [data, counts] = await Promise.all([
        listCampusAmbassadors(),
        getOutsideRegistrationCounts(),
      ]);
      const coreTeamCount = await getCoreTeamApplicationCount();
      return NextResponse.json({ data, counts: { ...counts, coreTeam: coreTeamCount } });
    }

    if (view === "core-team") {
      const [data, outsideCounts, coreTeamCount] = await Promise.all([
        listCoreTeamApplications(),
        getOutsideRegistrationCounts(),
        getCoreTeamApplicationCount(),
      ]);

      return NextResponse.json({
        data,
        counts: {
          ...outsideCounts,
          coreTeam: coreTeamCount,
        },
      });
    }

    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (error) {
    console.error("Failed to fetch campus ambassador data", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const spreadsheetInput =
    process.env.GOOGLE_SPREADSHEET_ID_OUTSIDE ||
    process.env.GOOGLE_SPREADSHEET_ID ||
    defaultSpreadsheetId;

  if (!spreadsheetInput) {
    return NextResponse.json(
      { error: "Missing GOOGLE_SPREADSHEET_ID_OUTSIDE or GOOGLE_SPREADSHEET_ID" },
      { status: 500 }
    );
  }

  try {
    const [allRows, ambassadorRows, coreTeamRows] = await Promise.all([
      listOutsideRegistrations(),
      listCampusAmbassadors(),
      listCoreTeamApplications(),
    ]);

    const spreadsheetId = resolveSpreadsheetId(spreadsheetInput);

    const config = getGoogleServiceAccountConfig();
    const auth = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.authorize();

    const sheetsClient = google.sheets({ version: "v4", auth });

    await writeSheet(
      spreadsheetId,
      "Outside Registrations",
      allRows as Array<Record<string, unknown>>,
      outsideExportColumns,
      sheetsClient
    );
    await writeSheet(
      spreadsheetId,
      "Campus Ambassadors",
      ambassadorRows as Array<Record<string, unknown>>,
      outsideExportColumns,
      sheetsClient
    );
    await writeSheet(
      spreadsheetId,
      "Core Team Applications",
      coreTeamRows as Array<Record<string, unknown>>,
      coreTeamExportColumns,
      sheetsClient
    );

    return NextResponse.json({
      success: true,
      allRows: allRows.length,
      ambassadorRows: ambassadorRows.length,
      coreTeamRows: coreTeamRows.length,
    });
  } catch (error) {
    const message = getErrorMessage(error);
    console.error("Failed to sync outside registrations", error);
    return NextResponse.json(
      { error: `Failed to sync data to Google Sheets: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const view = (req.nextUrl.searchParams.get("view") || "all") as View;
    const body = await req.json();
    const ids = Array.isArray(body?.ids)
      ? body.ids.map((id: unknown) => Number(id)).filter((id: number) => Number.isInteger(id) && id > 0)
      : [];

    if (!ids.length) {
      return NextResponse.json({ error: "No valid ids provided" }, { status: 400 });
    }

    const deletedCount =
      view === "core-team"
        ? await deleteCoreTeamApplications(ids)
        : await deleteOutsideRegistrations(ids);
    return NextResponse.json({ success: true, deletedCount });
  } catch (error) {
    console.error("Failed to delete outside registrations", error);
    return NextResponse.json({ error: "Failed to delete records" }, { status: 500 });
  }
}
