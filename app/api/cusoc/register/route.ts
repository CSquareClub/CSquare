import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { z } from "zod";

// ── 2026 schema ─────────────────────────────────────────────
const schema2026 = z.object({
  track: z.literal("2026"),
  fullName: z.string().min(2),
  rollNumber: z.string().min(2),
  cuEmail: z.string().email().regex(/@cuchd\.in$/i, "Must be a @cuchd.in email"),
  phone: z.string().regex(/^[0-9]{10,15}$/),
  department: z.string().min(2),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),

  languages: z.string().min(1),
  dsaLevel: z.enum(["beginner", "intermediate", "advanced"]),
  devExperience: z.enum(["none", "basic", "intermediate", "advanced"]),

  primaryTrack: z.enum(["web", "app", "backend", "opensource", "dsa_cp"]),

  githubProfile: z.string().url(),
  projectCount: z.enum(["0", "1-2", "3+"]),
  bestProjectLink: z.string().url(),
  openSourceContrib: z.enum(["yes", "no"]),
  openSourceLink: z.string().url().optional().or(z.literal("")),

  targetOrgs: z.string().min(2),
  exploredRepo: z.enum(["yes", "no"]),
  orgRepoLink: z.string().url().optional().or(z.literal("")),

  primaryGoal: z.string().min(2),
  whyCusoc: z.string().min(10),

  hoursPerWeek: z.enum(["<5", "5-10", "10+"]),
  readyWeeklyTasks: z.enum(["yes", "no"]),
  readyDeadlines: z.enum(["yes", "no"]),

  proposalOrgName: z.string().min(2),
  proposalProjectTitle: z.string().min(2),
  proposalProblemStatement: z.string().min(10),
  proposalSolution: z.string().min(10),
  proposalTechStack: z.string().min(2),
  proposalTimeline: z.string().min(2),

  screeningAnswer: z.string().min(10),
});

// ── 2027 schema ─────────────────────────────────────────────
const schema2027 = z.object({
  track: z.literal("2027"),
  fullName: z.string().min(2),
  rollNumber: z.string().min(2),
  cuEmail: z.string().email().regex(/@cumail\.in$/i, "Must be a @cumail.in email"),
  phone: z.string().regex(/^[0-9]{10,15}$/),
  department: z.string().min(2),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),

  skillLevel: z.enum(["beginner", "basic", "intermediate"]),
  languages: z.string().min(1),

  interestArea: z.enum(["web", "app", "backend", "opensource", "dsa"]),

  goalLearnCoding: z.boolean(),
  goalBuildProjects: z.boolean(),
  goalTargetGsoc: z.boolean(),
  whyJoin: z.string().min(10),

  knowsOpenSource: z.boolean(),
  knowsGsoc: z.boolean(),

  hoursPerWeek: z.string().min(1),

  motivation: z.string().min(10),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const track = body?.track;

    if (track === "2026") {
      const data = schema2026.parse(body);
    
      
      const { track: _, ...fields } = data;

      // Check duplicate
      const existing = await prisma.cusocRegistration2026.findUnique({
        where: { cuEmail: fields.cuEmail },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This CU email is already registered for CUSoC 2026." },
          { status: 409 }
        );
      }

      await prisma.cusocRegistration2026.create({ data: fields });
      return NextResponse.json({ success: true });
    }

    if (track === "2027") {
      const data = schema2027.parse(body);
      const { track: _, ...fields } = data;

      const existing = await prisma.cusocRegistration2027.findUnique({
        where: { cuEmail: fields.cuEmail },
      });
      if (existing) {
        return NextResponse.json(
          { error: "This CU email is already registered for CUSoC 2027-28." },
          { status: 409 }
        );
      }

      await prisma.cusocRegistration2027.create({ data: fields });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid track" }, { status: 400 });
  } catch (err) {
    console.log(err);
    
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", issues: err.errors },
        { status: 422 }
      );
    }
    console.error("CUSoC registration error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
