import { NextRequest, NextResponse } from 'next/server';
import { createProjectProposal } from '@/lib/cusoc-project-proposal-store';
import { appendCusocDataToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.projectType || !['institutional', 'industry'].includes(data.projectType)) {
      return NextResponse.json({ error: 'Invalid project type' }, { status: 400 });
    }

    if (!data.facultyName || !data.officialEmail || !data.projectTitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const proposal = await createProjectProposal(data);

    // Append to Google Sheets
    const sheetHeaders = [
      "Date", "Project Type", "Faculty Name", "Designation", "Department", 
      "Employee ID", "Official Email", "Contact Number", "LinkedIn Profile", 
      "Project Title", "Project Domains", "Project Type Category", 
      "Difficulty Level", "Project Abstract", "Problem Statement", 
      "Proposed Solution", "Expected Deliverables", "Current Project Status", 
      "Required Skills", "Preferred Technologies", "Preferred Contributor Level", 
      "Preferred Roles", "Weekly Mentor Availability", "Preferred Collaboration Mode", 
      "Resources Available", "GitHub Repo Links", "Expected Outcomes", 
      "Learning Outcomes", "Success Evaluation", "Sensitive Data", "Proposal Document"
    ];

    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.projectType,
      data.facultyName,
      data.designation,
      data.department,
      data.employeeId,
      data.officialEmail,
      data.contactNumber,
      data.linkedinProfile,
      data.projectTitle,
      data.projectDomains,
      data.projectTypeCategory,
      data.difficultyLevel,
      data.projectAbstract,
      data.problemStatement,
      data.proposedSolution,
      data.expectedDeliverables,
      data.currentProjectStatus,
      data.requiredSkills,
      data.preferredTechnologies,
      data.preferredContributorLevel,
      data.preferredRoles,
      data.weeklyMentorAvailability,
      data.preferredCollaborationMode,
      data.resourcesAvailable,
      data.githubRepoLinks,
      data.expectedOutcomes,
      data.learningOutcomes,
      data.successEvaluation,
      data.sensitiveData,
      data.proposalDocument
    ];

    appendCusocDataToSheet("Project Proposals", sheetHeaders, sheetRow).catch(e => console.error("Failed to append to Google Sheets:", e));

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit proposal' },
      { status: 500 }
    );
  }
}
