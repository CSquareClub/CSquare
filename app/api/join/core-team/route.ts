import { NextResponse } from 'next/server';
import { createCoreTeamApplication, hasCoreTeamDuplicate } from '@/lib/core-team-applications-store';

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const membershipId = String(body.membershipId || '').trim();
    const fullName = String(body.fullName || '').trim();
    const uid = String(body.uid || '').trim();
    const department = String(body.department || '').trim();
    const course = String(body.course || '').trim();
    const year = String(body.year || '').trim();
    const semester = String(body.semester || '').trim();
    const rolesInterested = String(body.rolesInterested || '').trim();
    const resumeLink = String(body.resumeLink || '').trim();
    const linkedinUrl = String(body.linkedinUrl || '').trim();
    const portfolioUrl = String(body.portfolioUrl || '').trim();
    const whyJoin = String(body.whyJoin || '').trim();

    if (
      !membershipId ||
      !fullName ||
      !uid ||
      !department ||
      !course ||
      !year ||
      !semester ||
      !rolesInterested ||
      !resumeLink ||
      !whyJoin
    ) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 });
    }

    if (!isValidUrl(resumeLink)) {
      return NextResponse.json({ error: 'Resume link must be a valid URL' }, { status: 400 });
    }

    if (linkedinUrl && !isValidUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL must be valid' }, { status: 400 });
    }

    if (portfolioUrl && !isValidUrl(portfolioUrl)) {
      return NextResponse.json({ error: 'Portfolio URL must be valid' }, { status: 400 });
    }

    const isDuplicate = await hasCoreTeamDuplicate(membershipId, uid);
    if (isDuplicate) {
      return NextResponse.json(
        { error: 'Application already exists with this Membership ID or UID' },
        { status: 409 }
      );
    }

    const record = await createCoreTeamApplication({
      membershipId,
      fullName,
      uid,
      department,
      course,
      year,
      semester,
      rolesInterested,
      resumeLink,
      linkedinUrl: linkedinUrl || null,
      portfolioUrl: portfolioUrl || null,
      whyJoin,
    });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit core team application', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
