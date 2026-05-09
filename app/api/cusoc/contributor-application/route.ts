import { NextRequest, NextResponse } from 'next/server';
import { createContributorApplication } from '@/lib/cusoc-contributor-application-store';
import { appendCusocDataToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.fullName || !data.email || !data.contactNumber || !data.resumeUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await createContributorApplication(data);

    // Append to Google Sheets
    const sheetHeaders = [
      "Date", "Full Name", "Email", "Contact Number", "Institution", 
      "Degree Program", "Year of Study", "LinkedIn", "GitHub", "Resume URL", 
      "Areas of Interest", "Technical Skills", "Comfortable With", 
      "Technical Confidence", "Best Project", "Project Links", 
      "Open Source Contributions", "Team Experience", "Why Join CUSoC", 
      "Learning Expectations", "Why Select Pilot", "Recently Learned", 
      "Participation Experience", "Weekly Availability", "Preferred Domains", 
      "Preferred Roles", "Preferred Mode"
    ];

    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.fullName,
      data.email,
      data.contactNumber,
      data.institution,
      data.degreeProgram,
      data.yearOfStudy,
      data.linkedinProfile,
      data.githubProfile,
      data.resumeUrl,
      data.areasOfInterest,
      data.technicalSkills,
      data.comfortableWith,
      data.technicalConfidence,
      data.bestProject,
      data.projectLinks,
      data.openSourceContributions,
      data.teamExperience,
      data.whyJoinCusoc,
      data.learningExpectations,
      data.whySelectPilot,
      data.recentlyLearned,
      data.participationExperience,
      data.weeklyAvailability,
      data.preferredDomains,
      data.preferredRoles,
      data.preferredMode
    ];

    appendCusocDataToSheet("Contributor Applications", sheetHeaders, sheetRow).catch(e => console.error("Failed to append to Google Sheets:", e));

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error creating contributor application:', error);
    
    // Handle unique constraint errors
    if (error.message?.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'This email has already been submitted' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}

