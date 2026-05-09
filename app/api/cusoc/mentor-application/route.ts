import { NextRequest, NextResponse } from 'next/server';
import { createMentorApplication } from '@/lib/cusoc-mentor-application-store';
import { appendCusocDataToSheet } from '@/lib/google-sheets';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.mentorType || !['industry', 'faculty', 'student'].includes(data.mentorType)) {
      return NextResponse.json({ error: 'Invalid mentor type' }, { status: 400 });
    }

    if (!data.fullName || !data.email || !data.contactNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await createMentorApplication(data);

    // Append to Google Sheets
    const sheetHeaders = [
      "Date", "Mentor Type", "Full Name", "Email", "Contact Number", 
      "LinkedIn Profile", "Company Name", "Designation", "Years of Experience", 
      "Industries Focus", "Department Name", "Employee ID", "Official Email", 
      "Research Areas", "Roll Number", "CU Email", "Year", "Skill Areas", 
      "Areas of Expertise", "Mentorship Goals", "Available Hours", 
      "Preferred Mode", "Mentorship Style", "Previous Experience", 
      "Max Mentees", "Can Provide Feedback", "Can Guide Projects", 
      "Can Review Code"
    ];

    const sheetRow = [
      new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      data.mentorType,
      data.fullName,
      data.email,
      data.contactNumber,
      data.linkedinProfile,
      data.companyName,
      data.designation,
      data.yearsOfExperience,
      data.industriesFocus,
      data.departmentName,
      data.employeeId,
      data.officialEmail,
      data.researchAreas,
      data.rollNumber,
      data.cuEmail,
      data.year,
      data.skillAreas,
      data.areasOfExpertise,
      data.mentorshipGoals,
      data.availableHours,
      data.preferredMode,
      data.mentorshipStyle,
      data.previousExperience,
      data.maxMentees,
      data.canProvideFeedback ? "Yes" : "No",
      data.canGuideProjects ? "Yes" : "No",
      data.canReviewCode ? "Yes" : "No"
    ];

    appendCusocDataToSheet("Mentor Applications", sheetHeaders, sheetRow).catch(e => console.error("Failed to append to Google Sheets:", e));

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mentor application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
