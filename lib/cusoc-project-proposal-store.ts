import prisma from '@/lib/db';

export type CusocProjectProposal = {
  id: number;
  createdAt: string;
  projectType: 'institutional' | 'industry';

  // SECTION 1 – Faculty Information
  facultyName: string;
  designation: string;
  department: string;
  employeeId: string;
  officialEmail: string;
  contactNumber: string;
  linkedinProfile?: string;

  // SECTION 2 – Project Overview
  projectTitle: string;
  projectDomains: string; // comma-separated
  projectTypeCategory: string;
  difficultyLevel: string;
  projectAbstract: string;

  // SECTION 3 – Problem Statement & Scope
  problemStatement: string;
  proposedSolution: string;
  expectedDeliverables: string;
  currentProjectStatus: string;

  // SECTION 4 – Technical Requirements
  requiredSkills: string; // comma-separated
  preferredTechnologies: string;
  preferredContributorLevel: string; // comma-separated
  preferredRoles: string; // comma-separated

  // SECTION 5 – Mentorship & Support
  weeklyMentorAvailability: string;
  preferredCollaborationMode: string;
  resourcesAvailable: string; // comma-separated
  githubRepoLinks?: string;

  // SECTION 6 – Outcomes & Impact
  expectedOutcomes: string; // comma-separated
  learningOutcomes: string;
  successEvaluation: string;

  // SECTION 7 – Compliance
  sensitiveData: 'Yes' | 'No';
  proposalDocument?: string;
  declarationAccepted: boolean;

  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type ProjectProposalRow = {
  id: number;
  created_at: Date | string;
  project_type: 'institutional' | 'industry';
  faculty_name: string;
  designation: string;
  department: string;
  employee_id: string;
  official_email: string;
  contact_number: string;
  linkedin_profile?: string;
  project_title: string;
  project_domains: string;
  project_type_category: string;
  difficulty_level: string;
  project_abstract: string;
  problem_statement: string;
  proposed_solution: string;
  expected_deliverables: string;
  current_project_status: string;
  required_skills: string;
  preferred_technologies: string;
  preferred_contributor_level: string;
  preferred_roles: string;
  weekly_mentor_availability: string;
  preferred_collaboration_mode: string;
  resources_available: string;
  github_repo_links?: string;
  expected_outcomes: string;
  learning_outcomes: string;
  success_evaluation: string;
  sensitive_data: 'Yes' | 'No';
  proposal_document?: string;
  declaration_accepted: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'in-review';
};

type CreateProjectProposalInput = Omit<CusocProjectProposal, 'id' | 'createdAt'>;

let tableReady = false;

async function ensureProjectProposalTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cusoc_project_proposals (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      project_type TEXT NOT NULL CHECK (project_type IN ('institutional', 'industry')),
      faculty_name TEXT NOT NULL,
      designation TEXT NOT NULL,
      department TEXT NOT NULL,
      employee_id TEXT NOT NULL,
      official_email TEXT NOT NULL,
      contact_number TEXT NOT NULL,
      linkedin_profile TEXT,
      project_title TEXT NOT NULL,
      project_domains TEXT NOT NULL,
      project_type_category TEXT NOT NULL,
      difficulty_level TEXT NOT NULL,
      project_abstract TEXT NOT NULL,
      problem_statement TEXT NOT NULL,
      proposed_solution TEXT NOT NULL,
      expected_deliverables TEXT NOT NULL,
      current_project_status TEXT NOT NULL,
      required_skills TEXT NOT NULL,
      preferred_technologies TEXT NOT NULL,
      preferred_contributor_level TEXT NOT NULL,
      preferred_roles TEXT NOT NULL,
      weekly_mentor_availability TEXT NOT NULL,
      preferred_collaboration_mode TEXT NOT NULL,
      resources_available TEXT NOT NULL,
      github_repo_links TEXT,
      expected_outcomes TEXT NOT NULL,
      learning_outcomes TEXT NOT NULL,
      success_evaluation TEXT NOT NULL,
      sensitive_data TEXT NOT NULL CHECK (sensitive_data IN ('Yes', 'No')),
      proposal_document TEXT,
      declaration_accepted BOOLEAN NOT NULL DEFAULT FALSE,
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in-review'))
    );
  `);

  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_project_proposal_type ON cusoc_project_proposals (project_type);`
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX IF NOT EXISTS idx_project_proposal_status ON cusoc_project_proposals (status);`
  );

  tableReady = true;
}

function rowToProjectProposal(row: ProjectProposalRow): CusocProjectProposal {
  const createdAt = row.created_at instanceof Date ? row.created_at : new Date(row.created_at);

  return {
    id: row.id,
    createdAt: createdAt.toISOString(),
    projectType: row.project_type,
    facultyName: row.faculty_name,
    designation: row.designation,
    department: row.department,
    employeeId: row.employee_id,
    officialEmail: row.official_email,
    contactNumber: row.contact_number,
    linkedinProfile: row.linkedin_profile,
    projectTitle: row.project_title,
    projectDomains: row.project_domains,
    projectTypeCategory: row.project_type_category,
    difficultyLevel: row.difficulty_level,
    projectAbstract: row.project_abstract,
    problemStatement: row.problem_statement,
    proposedSolution: row.proposed_solution,
    expectedDeliverables: row.expected_deliverables,
    currentProjectStatus: row.current_project_status,
    requiredSkills: row.required_skills,
    preferredTechnologies: row.preferred_technologies,
    preferredContributorLevel: row.preferred_contributor_level,
    preferredRoles: row.preferred_roles,
    weeklyMentorAvailability: row.weekly_mentor_availability,
    preferredCollaborationMode: row.preferred_collaboration_mode,
    resourcesAvailable: row.resources_available,
    githubRepoLinks: row.github_repo_links,
    expectedOutcomes: row.expected_outcomes,
    learningOutcomes: row.learning_outcomes,
    successEvaluation: row.success_evaluation,
    sensitiveData: row.sensitive_data,
    proposalDocument: row.proposal_document,
    declarationAccepted: row.declaration_accepted,
    status: row.status,
  };
}

export async function createProjectProposal(input: CreateProjectProposalInput): Promise<CusocProjectProposal> {
  await ensureProjectProposalTable();

  const rows = await prisma.$queryRawUnsafe<ProjectProposalRow[]>(
    `INSERT INTO cusoc_project_proposals (
      project_type, faculty_name, designation, department, employee_id, official_email, contact_number,
      linkedin_profile, project_title, project_domains, project_type_category, difficulty_level, project_abstract,
      problem_statement, proposed_solution, expected_deliverables, current_project_status, required_skills,
      preferred_technologies, preferred_contributor_level, preferred_roles, weekly_mentor_availability,
      preferred_collaboration_mode, resources_available, github_repo_links, expected_outcomes, learning_outcomes,
      success_evaluation, sensitive_data, proposal_document, declaration_accepted
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23,
      $24, $25, $26, $27, $28, $29, $30, $31
    )
    RETURNING id, created_at, project_type, faculty_name, designation, department, employee_id, official_email,
      contact_number, linkedin_profile, project_title, project_domains, project_type_category, difficulty_level,
      project_abstract, problem_statement, proposed_solution, expected_deliverables, current_project_status,
      required_skills, preferred_technologies, preferred_contributor_level, preferred_roles,
      weekly_mentor_availability, preferred_collaboration_mode, resources_available, github_repo_links,
      expected_outcomes, learning_outcomes, success_evaluation, sensitive_data, proposal_document,
      declaration_accepted, status;`,
    input.projectType,
    input.facultyName,
    input.designation,
    input.department,
    input.employeeId,
    input.officialEmail,
    input.contactNumber,
    input.linkedinProfile || null,
    input.projectTitle,
    input.projectDomains,
    input.projectTypeCategory,
    input.difficultyLevel,
    input.projectAbstract,
    input.problemStatement,
    input.proposedSolution,
    input.expectedDeliverables,
    input.currentProjectStatus,
    input.requiredSkills,
    input.preferredTechnologies,
    input.preferredContributorLevel,
    input.preferredRoles,
    input.weeklyMentorAvailability,
    input.preferredCollaborationMode,
    input.resourcesAvailable,
    input.githubRepoLinks || null,
    input.expectedOutcomes,
    input.learningOutcomes,
    input.successEvaluation,
    input.sensitiveData,
    input.proposalDocument || null,
    input.declarationAccepted
  );

  return rowToProjectProposal(rows[0]);
}

export async function listProjectProposals(type?: 'institutional' | 'industry'): Promise<CusocProjectProposal[]> {
  await ensureProjectProposalTable();

  const query = type
    ? `SELECT * FROM cusoc_project_proposals WHERE project_type = $1 ORDER BY created_at DESC;`
    : `SELECT * FROM cusoc_project_proposals ORDER BY created_at DESC;`;

  const rows = await prisma.$queryRawUnsafe<ProjectProposalRow[]>(query, ...(type ? [type] : []));

  return rows.map(rowToProjectProposal);
}

export async function getProjectProposalCount(): Promise<number> {
  await ensureProjectProposalTable();

  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
    `SELECT COUNT(*)::bigint AS count FROM cusoc_project_proposals;`
  );

  return Number(rows[0]?.count ?? 0);
}
