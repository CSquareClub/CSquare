import { NextRequest, NextResponse } from 'next/server';
import { createProjectProposal } from '@/lib/cusoc-project-proposal-store';

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

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    console.error('Error creating project proposal:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit proposal' },
      { status: 500 }
    );
  }
}
