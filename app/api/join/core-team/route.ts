import { NextResponse } from 'next/server';
import {
  createCoreTeamApplication,
  hasCoreTeamDuplicate,
  hasCoreTeamMembershipDuplicate,
} from '@/lib/core-team-applications-store';

const MEMBERSHIP_ID_REGEX = /^[A-Za-z0-9-]{5,24}$/;
const DEPARTMENTS = new Set([
  'CSE',
  'AIML',
  'ECE',
  'ME',
  'CE',
  'Biotechnology',
  'Management',
  'Commerce',
  'Law',
  'Pharmacy',
  'Other',
]);

function normalizeUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidMembershipId(value: string): boolean {
  return MEMBERSHIP_ID_REGEX.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isValidResumeReference(value: string): boolean {
  if (!value) return false;
  if (value.startsWith('/uploads/resumes/')) return true;
  return isValidUrl(value);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const membershipId = String(searchParams.get('membershipId') || '').trim();

    if (!membershipId) {
      return NextResponse.json({ valid: false, available: false, error: 'Membership ID is required' }, { status: 400 });
    }

    if (!isValidMembershipId(membershipId)) {
      return NextResponse.json({
        valid: false,
        available: false,
        error: 'Membership ID must be 5-24 characters and contain only letters, numbers, or hyphen',
      });
    }

    const duplicate = await hasCoreTeamMembershipDuplicate(membershipId);
    return NextResponse.json({ valid: true, available: !duplicate, error: duplicate ? 'This Membership ID has already applied' : null });
  } catch (error) {
    console.error('Failed to verify membership ID', error);
    return NextResponse.json({ valid: false, available: false, error: 'Verification failed' }, { status: 500 });
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
    const linkedinUrl = normalizeUrl(String(body.linkedinUrl || ''));
    const portfolioUrl = normalizeUrl(String(body.portfolioUrl || ''));
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
      !linkedinUrl ||
      !portfolioUrl ||
      !whyJoin
    ) {
      return NextResponse.json({ error: 'Please fill all required fields' }, { status: 400 });
    }

    if (!isValidMembershipId(membershipId)) {
      return NextResponse.json(
        { error: 'Membership ID must be 5-24 characters and contain only letters, numbers, or hyphen' },
        { status: 400 }
      );
    }

    if (!DEPARTMENTS.has(department)) {
      return NextResponse.json({ error: 'Please select a valid department' }, { status: 400 });
    }

    if (!isValidResumeReference(resumeLink)) {
      return NextResponse.json({ error: 'Resume is required. Upload your file and try again.' }, { status: 400 });
    }

    if (!isValidUrl(linkedinUrl)) {
      return NextResponse.json({ error: 'LinkedIn URL must be valid' }, { status: 400 });
    }

    if (!isValidUrl(portfolioUrl)) {
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
      linkedinUrl,
      portfolioUrl,
      whyJoin,
    });

    return NextResponse.json({ success: true, id: record.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to submit core team application', error);
    return NextResponse.json({ error: 'Submission failed' }, { status: 500 });
  }
}
