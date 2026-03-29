import { createOutsideRegistration, checkDuplicateRegistration } from "@/lib/outside-registrations-store";
import { NextResponse } from "next/server";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rollNumber = String(searchParams.get("rollNumber") || "").trim();
    const personalEmail = String(searchParams.get("personalEmail") || "").trim().toLowerCase();
    const collegeEmail = String(searchParams.get("collegeEmail") || "").trim().toLowerCase();

    if (!rollNumber && !personalEmail && !collegeEmail) {
      return NextResponse.json({ duplicate: false });
    }

    const isDuplicate = await checkDuplicateRegistration(rollNumber, personalEmail, collegeEmail);

    if (isDuplicate) {
      return NextResponse.json({
        duplicate: true,
        error: "You have already submitted the form. Check your registered email for updates.",
      });
    }

    return NextResponse.json({ duplicate: false });
  } catch (error) {
    console.error("Failed to check outside registration duplicate", error);
    return NextResponse.json({ error: "Could not validate registration" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = String(body.fullName || "").trim();
    const instituteName = String(body.instituteName || "").trim();
    const rollNumber = String(body.rollNumber || "").trim();
    const personalEmail = String(body.personalEmail || "").trim().toLowerCase();
    const collegeEmail = String(body.collegeEmail || "").trim().toLowerCase();
    const campusAmbassador = String(body.campusAmbassador || "No").toLowerCase() === "yes";

    if (!fullName || !instituteName || !rollNumber || !personalEmail || !collegeEmail) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!isValidEmail(personalEmail) || !isValidEmail(collegeEmail)) {
      return NextResponse.json({ error: "Please provide valid email addresses" }, { status: 400 });
    }

    const isDuplicate = await checkDuplicateRegistration(
      rollNumber,
      personalEmail,
      collegeEmail
    );

    if (isDuplicate) {
      return NextResponse.json(
        { error: "You have already submitted the form. Check your registered email for updates." },
        { status: 409 }
      );
    }

    const record = await createOutsideRegistration({
      fullName,
      instituteName,
      rollNumber,
      personalEmail,
      collegeEmail,
      campusAmbassador,
    });

    return NextResponse.json({ success: true, id: record.id });
  } catch (error) {
    console.error("Failed to submit outside registration", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
