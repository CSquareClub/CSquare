import prisma from '@/lib/db';

export type CusocMentorApplication = {
  id: number;
  createdAt: string;
  mentorType: 'industry' | 'faculty' | 'student';

  // Common Fields
  fullName: string;
  email: string;
  contactNumber: string;
  linkedinProfile?: string;

  // For Industry Mentors
  companyName?: string;
  designation?: string;
  yearsOfExperience?: string;
  industriesFocus?: string; // comma-separated

  // For Faculty Mentors
  departmentName?: string;
  employeeId?: string;
  officialEmail?: string;
  researchAreas?: string; // comma-separated

  // For Student Mentors
  rollNumber?: string;
  cuEmail?: string;
  year?: string;
  skillAreas?: string; // comma-separated

  // All Mentors
  areasOfExpertise: string; // comma-separated
  mentorshipGoals: string;
  availableHours: string;
  preferredMode: string;
  mentorshipStyle?: string;
  previousExperience?: string;
  maxMentees?: string;

  // Support & Resources
  canProvideFeedback: boolean;
  canGuideProjects: boolean;
  canReviewCode: boolean;

  // Declaration
  declarationAccepted: boolean;

  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type MentorApplicationRow = {
  id: number;
  created_at: Date | string;
  mentor_type: 'industry' | 'faculty' | 'student';
  full_name: string;
  email: string;
  contact_number: string;
  linkedin_profile?: string;
  company_name?: string;
  designation?: string;
  years_of_experience?: string;
  industries_focus?: string;
  department_name?: string;
  employee_id?: string;
  official_email?: string;
  research_areas?: string;
  roll_number?: string;
  cu_email?: string;
  year?: string;
  skill_areas?: string;
  areas_of_expertise: string;
  mentorship_goals: string;
  available_hours: string;
  preferred_mode: string;
  mentorship_style?: string;
  previous_experience?: string;
  max_mentees?: string;
  can_provide_feedback: boolean;
  can_guide_projects: boolean;
  can_review_code: boolean;
  declaration_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type CreateMentorApplicationInput = Omit<CusocMentorApplication, 'id' | 'createdAt'>;

let tableReady = false;

async function ensureMentorApplicationTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cusoc_mentor_applications (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      mentor_type TEXT NOT NULL CHECK (mentor_type IN ('industry', 'faculty', 'student')),
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      linkedin_profile TEXT,
      company_name TEXT,
      designation TEXT,
      years_of_experience TEXT,
      industries_focus TEXT,
      department_name TEXT,
      employee_id TEXT,
      official_email TEXT,
      research_areas TEXT,
      roll_number TEXT,
      cu_email TEXT,
      year TEXT,
      skill_areas TEXT,
      areas_of_expertise TEXT NOT NULL,
      mentorship_goals TEXT NOT NULL,
      available_hours TEXT NOT NULL,
      preferred_mode TEXT NOT NULL,
      mentorship_style TEXT,
      previous_experience TEXT,
      max_mentees TEXT,
      can_provide_feedback BOOLEAN NOT NULL DEFAULT TRUE,
      can_guide_projects BOOLEAN NOT NULL DEFAULT TRUE,
      can_review_code BOOLEAN NOT NULL DEFAULT TRUE,
      declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-review'))
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_mentor_type ON cusoc_mentor_applications (mentor_type);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_mentor_status ON cusoc_mentor_applications (status);`
  );

  tableReady = true;
}

function rowToMentorApplication(row: MentorApplicationRow): CusocMentorApplication {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    mentorType: row.mentor_type,
    fullName: row.full_name,
    email: row.email,
    contactNumber: row.contact_number,
    linkedinProfile: row.linkedin_profile,
    companyName: row.company_name,
    designation: row.designation,
    yearsOfExperience: row.years_of_experience,
    industriesFocus: row.industries_focus,
    departmentName: row.department_name,
    employeeId: row.employee_id,
    officialEmail: row.official_email,
    researchAreas: row.research_areas,
    rollNumber: row.roll_number,
    cuEmail: row.cu_email,
    year: row.year,
    skillAreas: row.skill_areas,
    areasOfExpertise: row.areas_of_expertise,
    mentorshipGoals: row.mentorship_goals,
    availableHours: row.available_hours,
    preferredMode: row.preferred_mode,
    mentorshipStyle: row.mentorship_style,
    previousExperience: row.previous_experience,
    maxMentees: row.max_mentees,
    canProvideFeedback: row.can_provide_feedback,
    canGuideProjects: row.can_guide_projects,
    canReviewCode: row.can_review_code,
    declarationAccepted: row.declaration_accepted,
    status: row.status,
  };
}

export async function createMentorApplication(input: CreateMentorApplicationInput): Promise<CusocMentorApplication> {
  await ensureMentorApplicationTable();

  const rows = await prisma.$queryRawUnsafe<MentorApplicationRow[]>(
    `INSERT INTO cusoc_mentor_applications (
      mentor_type, full_name, email, contact_number, linkedin_profile, company_name, designation,
      years_of_experience, industries_focus, department_name, employee_id, official_email, research_areas,
      roll_number, cu_email, year, skill_areas, areas_of_expertise, mentorship_goals, available_hours,
      preferred_mode, mentorship_style, previous_experience, max_mentees, can_provide_feedback,
      can_guide_projects, can_review_code, declaration_accepted
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
      $24, $25, $26, $27, $28
    )
    RETURNING *;`,
    input.mentorType,
    input.fullName,
    input.email,
    input.contactNumber,
    input.linkedinProfile || null,
    input.companyName || null,
    input.designation || null,
    input.yearsOfExperience || null,
    input.industriesFocus || null,
    input.departmentName || null,
    input.employeeId || null,
    input.officialEmail || null,
    input.researchAreas || null,
    input.rollNumber || null,
    input.cuEmail || null,
    input.year || null,
    input.skillAreas || null,
    input.areasOfExpertise,
    input.mentorshipGoals,
    input.availableHours,
    input.preferredMode,
    input.mentorshipStyle || null,
    input.previousExperience || null,
    input.maxMentees || null,
    input.canProvideFeedback,
    input.canGuideProjects,
    input.canReviewCode,
    input.declarationAccepted
  );

  return rowToMentorApplication(rows[0]);
}

export async function listMentorApplications(type?: 'industry' | 'faculty' | 'student'): Promise<CusocMentorApplication[]> {
  await ensureMentorApplicationTable();

  const query = type
    ? `SELECT * FROM cusoc_mentor_applications WHERE mentor_type = $1 ORDER BY created_at DESC;`
    : `SELECT * FROM cusoc_mentor_applications ORDER BY created_at DESC;`;

  const rows = await prisma.$queryRawUnsafe<MentorApplicationRow[]>(query, ...(type ? [type] : []));

  return rows.map(rowToMentorApplication);
}

export async function getMentorApplicationCount(): Promise<number> {
  await ensureMentorApplicationTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM cusoc_mentor_applications;`
  );

  return Number(rows[0]?.count ?? 0);
}
