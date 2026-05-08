import prisma from '@/lib/db';

export type CusocContributorApplication = {
  id: number;
  createdAt: string;

  // Basic Information
  fullName: string;
  rollNumber: string;
  cuEmail: string;
  personalEmail: string;
  contactNumber: string;
  department: string;
  year: string;

  // Background & Skills
  technicalSkills: string; // comma-separated
  skillLevel: string;
  yearsOfExperience: string;
  githubProfile?: string;

  // Experience
  previousProjects: string;
  openSourceExperience: boolean;
  openSourceLink?: string;

  // Goals & Interests
  learningGoals: string;
  areasOfInterest: string; // comma-separated
  whyJoinCusoc: string;

  // Commitment
  hoursPerWeek: string;
  weeklyCommitment: string;
  preferredMode: string;

  // Additional
  mentorshipPreference?: string;
  additionalNotes?: string;

  // Declaration
  declarationAccepted: boolean;

  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type ContributorApplicationRow = {
  id: number;
  created_at: Date | string;
  full_name: string;
  roll_number: string;
  cu_email: string;
  personal_email: string;
  contact_number: string;
  department: string;
  year: string;
  technical_skills: string;
  skill_level: string;
  years_of_experience: string;
  github_profile?: string;
  previous_projects: string;
  open_source_experience: boolean;
  open_source_link?: string;
  learning_goals: string;
  areas_of_interest: string;
  why_join_cusoc: string;
  hours_per_week: string;
  weekly_commitment: string;
  preferred_mode: string;
  mentorship_preference?: string;
  additional_notes?: string;
  declaration_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type CreateContributorApplicationInput = Omit<CusocContributorApplication, 'id' | 'createdAt'>;

let tableReady = false;

async function ensureContributorApplicationTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cusoc_contributor_applications (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      full_name TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      cu_email TEXT NOT NULL UNIQUE,
      personal_email TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      department TEXT NOT NULL,
      year TEXT NOT NULL,
      technical_skills TEXT NOT NULL,
      skill_level TEXT NOT NULL,
      years_of_experience TEXT NOT NULL,
      github_profile TEXT,
      previous_projects TEXT NOT NULL,
      open_source_experience BOOLEAN NOT NULL DEFAULT FALSE,
      open_source_link TEXT,
      learning_goals TEXT NOT NULL,
      areas_of_interest TEXT NOT NULL,
      why_join_cusoc TEXT NOT NULL,
      hours_per_week TEXT NOT NULL,
      weekly_commitment TEXT NOT NULL,
      preferred_mode TEXT NOT NULL,
      mentorship_preference TEXT,
      additional_notes TEXT,
      declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-review'))
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_contributor_status ON cusoc_contributor_applications (status);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_contributor_year ON cusoc_contributor_applications (year);`
  );

  tableReady = true;
}

function rowToContributorApplication(row: ContributorApplicationRow): CusocContributorApplication {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    fullName: row.full_name,
    rollNumber: row.roll_number,
    cuEmail: row.cu_email,
    personalEmail: row.personal_email,
    contactNumber: row.contact_number,
    department: row.department,
    year: row.year,
    technicalSkills: row.technical_skills,
    skillLevel: row.skill_level,
    yearsOfExperience: row.years_of_experience,
    githubProfile: row.github_profile,
    previousProjects: row.previous_projects,
    openSourceExperience: row.open_source_experience,
    openSourceLink: row.open_source_link,
    learningGoals: row.learning_goals,
    areasOfInterest: row.areas_of_interest,
    whyJoinCusoc: row.why_join_cusoc,
    hoursPerWeek: row.hours_per_week,
    weeklyCommitment: row.weekly_commitment,
    preferredMode: row.preferred_mode,
    mentorshipPreference: row.mentorship_preference,
    additionalNotes: row.additional_notes,
    declarationAccepted: row.declaration_accepted,
    status: row.status,
  };
}

export async function createContributorApplication(
  input: CreateContributorApplicationInput
): Promise<CusocContributorApplication> {
  await ensureContributorApplicationTable();

  const rows = await prisma.$queryRawUnsafe<ContributorApplicationRow[]>(
    `INSERT INTO cusoc_contributor_applications (
      full_name, roll_number, cu_email, personal_email, contact_number, department, year,
      technical_skills, skill_level, years_of_experience, github_profile, previous_projects,
      open_source_experience, open_source_link, learning_goals, areas_of_interest, why_join_cusoc,
      hours_per_week, weekly_commitment, preferred_mode, mentorship_preference, additional_notes,
      declaration_accepted
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
    )
    RETURNING *;`,
    input.fullName,
    input.rollNumber,
    input.cuEmail,
    input.personalEmail,
    input.contactNumber,
    input.department,
    input.year,
    input.technicalSkills,
    input.skillLevel,
    input.yearsOfExperience,
    input.githubProfile || null,
    input.previousProjects,
    input.openSourceExperience,
    input.openSourceLink || null,
    input.learningGoals,
    input.areasOfInterest,
    input.whyJoinCusoc,
    input.hoursPerWeek,
    input.weeklyCommitment,
    input.preferredMode,
    input.mentorshipPreference || null,
    input.additionalNotes || null,
    input.declarationAccepted
  );

  return rowToContributorApplication(rows[0]);
}

export async function listContributorApplications(): Promise<CusocContributorApplication[]> {
  await ensureContributorApplicationTable();

  const rows = await prisma.$queryRawUnsafe<ContributorApplicationRow[]>(
    `SELECT * FROM cusoc_contributor_applications ORDER BY created_at DESC;`
  );

  return rows.map(rowToContributorApplication);
}

export async function getContributorApplicationCount(): Promise<number> {
  await ensureContributorApplicationTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM cusoc_contributor_applications;`
  );

  return Number(rows[0]?.count ?? 0);
}
