import { NextRequest, NextResponse } from 'next/server';
import { createContributorApplication } from '@/lib/cusoc-contributor-application-store';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validation
    if (!data.fullName || !data.email || !data.contactNumber || !data.resumeUrl) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const application = await createContributorApplication(data);

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

