import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { google } from "googleapis";
import { getGoogleServiceAccountConfig } from "@/lib/google-service-account";

type Track = "2026" | "2027";

const preferenceLabelMap: Record<string, string> = {
  web: "Web Development",
  app: "App Development",
  backend: "Backend",
  opensource: "Open Source",
  dsa_cp: "DSA / CP",
  dsa: "DSA",
};

const fallbackSpreadsheetIds: Record<Track, string> = {
  "2026": "1Z-s5HxgSVzfXf4m9mV5WW8B-fTH1Fs7KYg0JvjConp4",
  "2027": "1zvqnoc2JzUREzbuKtzgPKBiNXMpepqbzTxqjqa82vy0",
};

const exportColumns: Record<
  Track,
  Array<{ key: string; header: string }>
> = {
  "2026": [
    { key: "fullName", header: "Full Name" },
    { key: "rollNumber", header: "Roll Number" },
    { key: "cuEmail", header: "CU Email" },
    { key: "personalEmail", header: "Personal Email" },
    { key: "phone", header: "Phone" },
    { key: "department", header: "Department" },
    { key: "year", header: "Year" },
    { key: "languages", header: "Languages" },
    { key: "dsaLevel", header: "DSA Level" },
    { key: "devExperience", header: "Dev Experience" },
    { key: "domainOrder", header: "Domain Order" },
    { key: "githubProfile", header: "GitHub Profile" },
    { key: "projectCount", header: "Project Count" },
    { key: "bestProjectLink", header: "Best Project Link" },
    { key: "openSourceContrib", header: "Open Source Contribution" },
    { key: "openSourceLink", header: "Open Source Link" },
    { key: "targetOrgs", header: "Target Organizations" },
    { key: "exploredRepo", header: "Explored Repo" },
    { key: "orgRepoLink", header: "Organization Repo Link" },
    { key: "goals", header: "Goals" },
    { key: "whyCusoc", header: "Why CUSoC" },
    { key: "hoursPerWeek", header: "Hours Per Week" },
    { key: "readyWeeklyTasks", header: "Ready Weekly Tasks" },
    { key: "readyDeadlines", header: "Ready Deadlines" },
    { key: "proposalFileUrl", header: "Proposal File URL" },
    { key: "screeningAnswer", header: "Screening Answer" },
    { key: "createdAt", header: "Registered At" },
  ],
  "2027": [
    { key: "fullName", header: "Full Name" },
    { key: "rollNumber", header: "Roll Number" },
    { key: "cuEmail", header: "CU Email" },
    { key: "personalEmail", header: "Personal Email" },
    { key: "phone", header: "Phone" },
    { key: "department", header: "Department" },
    { key: "year", header: "Year" },
    { key: "skillLevel", header: "Skill Level" },
    { key: "languages", header: "Languages" },
    { key: "interestArea", header: "Interest Area" },
    { key: "goalLearnCoding", header: "Goal Learn Coding" },
    { key: "goalBuildProjects", header: "Goal Build Projects" },
    { key: "goalTargetGsoc", header: "Goal Target GSoC" },
    { key: "whyJoin", header: "Why Join" },
    { key: "knowsOpenSource", header: "Knows Open Source" },
    { key: "knowsGsoc", header: "Knows GSoC" },
    { key: "hoursPerWeek", header: "Hours Per Week" },
    { key: "motivation", header: "Motivation" },
    { key: "createdAt", header: "Registered At" },
  ],
};

function asSheetValue(value: unknown): string | number | boolean {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }
  return String(value);
}

function resolveSpreadsheetId(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) {
    throw new Error("GOOGLE_SPREADSHEET_ID is empty");
  }

  // Accept full Google Sheets URL and extract ID.
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match?.[1]) {
    return match[1];
  }

  return trimmed;
}

function getSpreadsheetInputForTrack(track: Track): string | undefined {
  if (track === "2026") {
    return (
      process.env.GOOGLE_SPREADSHEET_ID_2026 ||
      process.env.GOOGLE_SPREADSHEET_ID ||
      fallbackSpreadsheetIds["2026"]
    );
  }

  return (
    process.env.GOOGLE_SPREADSHEET_ID_2027 ||
    process.env.GOOGLE_SPREADSHEET_ID ||
    fallbackSpreadsheetIds["2027"]
  );
}

function getErrorMessage(err: unknown): string {
  if (!err) return "Unknown error";
  if (err instanceof Error) return err.message;

  if (typeof err === "object") {
    const maybeMessage = (err as { message?: unknown }).message;
    if (typeof maybeMessage === "string") return maybeMessage;
  }

  return String(err);
}

function normalizePreferenceString(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const tokens = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!tokens.length) return value;

  return tokens
    .map((token) => preferenceLabelMap[token] ?? token)
    .join(", ");
}

function normalizeCusocRow<T extends Record<string, unknown>>(row: T): T {
  return {
    ...row,
    domainOrder: normalizePreferenceString(row.domainOrder),
    interestArea: normalizePreferenceString(row.interestArea),
  } as T;
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

  const hasSheet = meta.data.sheets?.some(
    (sheet) => sheet.properties?.title === title
  );

  if (!hasSheet) {
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{ addSheet: { properties: { title } } }],
      },
    });
  }
}

export async function GET(req: Request) {

  const session = await getServerSession(authOptions);

  if(!session || !session.user){
    return NextResponse.json( { error: "Unauthorised" },
      { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track");
  

  try {
    if (track === "2026") {
      const data = await prisma.cusocRegistration2026.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(data.map((row) => normalizeCusocRow(row as Record<string, unknown>)));
    }

    if (track === "2027") {
      const data = await prisma.cusocRegistration2027.findMany({
        orderBy: { createdAt: "desc" },
      });
      return NextResponse.json(data.map((row) => normalizeCusocRow(row as Record<string, unknown>)));
    }

    // Return both counts for overview
    const [count2026, count2027] = await Promise.all([
      prisma.cusocRegistration2026.count(),
      prisma.cusocRegistration2027.count(),
    ]);

    return NextResponse.json({ count2026, count2027 });
  } catch (err) {
    console.error("Error fetching CUSoC registrations:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track") as Track | null;

  if (track !== "2026" && track !== "2027") {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  const spreadsheetInput = getSpreadsheetInputForTrack(track);
  if (!spreadsheetInput) {
    return NextResponse.json(
      {
        error:
          "Missing spreadsheet configuration for selected track.",
      },
      { status: 500 }
    );
  }

  try {
    const spreadsheetId = resolveSpreadsheetId(spreadsheetInput);
    const registrations =
      track === "2026"
        ? await prisma.cusocRegistration2026.findMany({ orderBy: { createdAt: "desc" } })
        : await prisma.cusocRegistration2027.findMany({ orderBy: { createdAt: "desc" } });
    const normalizedRegistrations = registrations.map((row) =>
      normalizeCusocRow(row as Record<string, unknown>)
    );

    const sheetTitle = track === "2026" ? "CUSoC 2026" : "CUSoC 2027-28";
    const columns = exportColumns[track];
    const headerRow = columns.map((col) => col.header);
    const valueRows = normalizedRegistrations.map((row) =>
      columns.map((col) => asSheetValue((row as Record<string, unknown>)[col.key]))
    );

    const config = getGoogleServiceAccountConfig();
    const auth = new google.auth.JWT({
      email: config.clientEmail,
      key: config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await auth.authorize();

    const sheetsClient = google.sheets({ version: "v4", auth });

    await ensureSheetExists(spreadsheetId, sheetTitle, sheetsClient);

    await sheetsClient.spreadsheets.values.clear({
      spreadsheetId,
      range: `'${sheetTitle}'!A:ZZ`,
    });

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId,
      range: `'${sheetTitle}'!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [headerRow, ...valueRows],
      },
    });

    return NextResponse.json({
      success: true,
      rowCount: normalizedRegistrations.length,
      sheetTitle,
    });
  } catch (err) {
    const message = getErrorMessage(err);
    console.error("Error exporting CUSoC registrations to Google Sheets:", err);
    return NextResponse.json(
      { error: `Failed to export registrations to Google Sheets: ${message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const track = searchParams.get("track") as Track | null;

  if (track !== "2026" && track !== "2027") {
    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const id = Number(body?.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid registration id" }, { status: 400 });
    }

    if (track === "2026") {
      await prisma.cusocRegistration2026.delete({ where: { id } });
    } else {
      await prisma.cusocRegistration2027.delete({ where: { id } });
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = getErrorMessage(err);

    if (message.toLowerCase().includes("record to delete does not exist")) {
      return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    }

    console.error("Error deleting CUSoC registration:", err);
    return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
  }
}
