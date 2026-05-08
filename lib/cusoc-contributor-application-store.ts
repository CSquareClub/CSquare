import prisma from '@/lib/db';

export type CusocPilotContributorApplication = {
  id: number;
  createdAt: string;

  // SECTION 1 — Basic Information
  fullName: string;
  email: string;
  contactNumber: string;
  institution: string;
  degreeProgram: string;
  yearOfStudy: string;
  linkedinProfile: string;
  githubProfile: string;
  resumeUrl: string;

  // SECTION 2 — Technical Background
  areasOfInterest: string; // comma-separated
  technicalSkills: string;
  comfortableWith: string; // comma-separated
  technicalConfidence: number;

  // SECTION 3 — Technical Projects & Experience
  bestProject: string;
  projectLinks: string;
  openSourceContributions: string;
  teamExperience: string; // Yes / No

  // SECTION 4 — Statement of Purpose
  whyJoinCusoc: string;
  learningExpectations: string;
  whySelectPilot: string;

  // SECTION 5 — Learning Potential & Commitment
  recentlyLearned: string;
  participationExperience: string; // comma-separated
  weeklyAvailability: string;

  // SECTION 6 — Project Preferences
  preferredDomains: string; // comma-separated
  preferredRoles: string; // comma-separated
  preferredMode: string;

  // SECTION 7 — Declaration
  declarationAccepted: boolean;

  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type PilotContributorApplicationRow = {
  id: number;
  created_at: Date | string;
  full_name: string;
  email: string;
  contact_number: string;
  institution: string;
  degree_program: string;
  year_of_study: string;
  linkedin_profile: string;
  github_profile: string;
  resume_url: string;

  areas_of_interest: string;
  technical_skills: string;
  comfortable_with: string;
  technical_confidence: number;

  best_project: string;
  project_links: string;
  open_source_contributions: string;
  team_experience: string;

  why_join_cusoc: string;
  learning_expectations: string;
  why_select_pilot: string;

  recently_learned: string;
  participation_experience: string;
  weekly_availability: string;

  preferred_domains: string;
  preferred_roles: string;
  preferred_mode: string;

  declaration_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type CreatePilotApplicationInput = Omit<CusocPilotContributorApplication, 'id' | 'createdAt' | 'status'>;

let tableReady = false;

async function ensurePilotApplicationTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cusoc_pilot_contributor_applications (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      contact_number TEXT NOT NULL,
      institution TEXT NOT NULL,
      degree_program TEXT NOT NULL,
      year_of_study TEXT NOT NULL,
      linkedin_profile TEXT NOT NULL,
      github_profile TEXT NOT NULL,
      resume_url TEXT NOT NULL,

      areas_of_interest TEXT NOT NULL,
      technical_skills TEXT NOT NULL,
      comfortable_with TEXT NOT NULL,
      technical_confidence INTEGER NOT NULL,

      best_project TEXT NOT NULL,
      project_links TEXT NOT NULL,
      open_source_contributions TEXT,
      team_experience TEXT NOT NULL,

      why_join_cusoc TEXT NOT NULL,
      learning_expectations TEXT NOT NULL,
      why_select_pilot TEXT NOT NULL,

      recently_learned TEXT NOT NULL,
      participation_experience TEXT NOT NULL,
      weekly_availability TEXT NOT NULL,

      preferred_domains TEXT NOT NULL,
      preferred_roles TEXT NOT NULL,
      preferred_mode TEXT NOT NULL,

      declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-review'))
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_pilot_contributor_status ON cusoc_pilot_contributor_applications (status);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_pilot_contributor_year ON cusoc_pilot_contributor_applications (year_of_study);`
  );

  tableReady = true;
}

function rowToApplication(row: PilotContributorApplicationRow): CusocPilotContributorApplication {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    fullName: row.full_name,
    email: row.email,
    contactNumber: row.contact_number,
    institution: row.institution,
    degreeProgram: row.degree_program,
    yearOfStudy: row.year_of_study,
    linkedinProfile: row.linkedin_profile,
    githubProfile: row.github_profile,
    resumeUrl: row.resume_url,

    areasOfInterest: row.areas_of_interest,
    technicalSkills: row.technical_skills,
    comfortableWith: row.comfortable_with,
    technicalConfidence: row.technical_confidence,

    bestProject: row.best_project,
    projectLinks: row.project_links,
    openSourceContributions: row.open_source_contributions || '',
    teamExperience: row.team_experience,

    whyJoinCusoc: row.why_join_cusoc,
    learningExpectations: row.learning_expectations,
    whySelectPilot: row.why_select_pilot,

    recentlyLearned: row.recently_learned,
    participationExperience: row.participation_experience,
    weeklyAvailability: row.weekly_availability,

    preferredDomains: row.preferred_domains,
    preferredRoles: row.preferred_roles,
    preferredMode: row.preferred_mode,

    declarationAccepted: row.declaration_accepted,
    status: row.status,
  };
}

export async function createContributorApplication(
  input: CreatePilotApplicationInput
): Promise<CusocPilotContributorApplication> {
  await ensurePilotApplicationTable();

  const rows = await prisma.$queryRawUnsafe<PilotContributorApplicationRow[]>(
    `INSERT INTO cusoc_pilot_contributor_applications (
      full_name, email, contact_number, institution, degree_program, year_of_study, linkedin_profile, github_profile, resume_url,
      areas_of_interest, technical_skills, comfortable_with, technical_confidence,
      best_project, project_links, open_source_contributions, team_experience,
      why_join_cusoc, learning_expectations, why_select_pilot,
      recently_learned, participation_experience, weekly_availability,
      preferred_domains, preferred_roles, preferred_mode,
      declaration_accepted
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
    )
    RETURNING *;`,
    input.fullName,
    input.email,
    input.contactNumber,
    input.institution,
    input.degreeProgram,
    input.yearOfStudy,
    input.linkedinProfile,
    input.githubProfile,
    input.resumeUrl,

    input.areasOfInterest,
    input.technicalSkills,
    input.comfortableWith,
    input.technicalConfidence,

    input.bestProject,
    input.projectLinks,
    input.openSourceContributions || null,
    input.teamExperience,

    input.whyJoinCusoc,
    input.learningExpectations,
    input.whySelectPilot,

    input.recentlyLearned,
    input.participationExperience,
    input.weeklyAvailability,

    input.preferredDomains,
    input.preferredRoles,
    input.preferredMode,

    input.declarationAccepted
  );

  return rowToApplication(rows[0]);
}

export async function listContributorApplications(): Promise<CusocPilotContributorApplication[]> {
  await ensurePilotApplicationTable();

  const rows = await prisma.$queryRawUnsafe<PilotContributorApplicationRow[]>(
    `SELECT * FROM cusoc_pilot_contributor_applications ORDER BY created_at DESC;`
  );

  return rows.map(rowToApplication);
}

export async function getContributorApplicationCount(): Promise<number> {
  await ensurePilotApplicationTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM cusoc_pilot_contributor_applications;`
  );

  return Number(rows[0]?.count ?? 0);
}

