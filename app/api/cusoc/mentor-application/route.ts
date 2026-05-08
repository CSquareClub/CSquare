import { NextRequest, NextResponse } from 'next/server';
import { createMentorApplication } from '@/lib/cusoc-mentor-application-store';

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

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    console.error('Error creating mentor application:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit application' },
      { status: 500 }
    );
  }
}
