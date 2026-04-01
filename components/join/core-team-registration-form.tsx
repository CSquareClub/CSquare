'use client';

import { useEffect, useState } from 'react';

const CU_JOIN_URL = 'https://cuintranet.in/join-now';

type Step =
  | 'choose-student'
  | 'outside-campus-form'
  | 'membership-check'
  | 'register-membership'
  | 'core-team-form'
  | 'success';

type CoreTeamFormState = {
  membershipId: string;
  fullName: string;
  uid: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  rolesInterested: string;
  resumeLink: string;
  linkedinUrl: string;
  portfolioUrl: string;
  whyJoin: string;
};

type OutsideFormState = {
  fullName: string;
  instituteName: string;
  rollNumber: string;
  personalEmail: string;
  collegeEmail: string;
  campusAmbassador: 'Yes' | 'No';
};

const initialCoreForm: CoreTeamFormState = {
  membershipId: '',
  fullName: '',
  uid: '',
  department: '',
  course: '',
  year: '',
  semester: '',
  rolesInterested: '',
  resumeLink: '',
  linkedinUrl: '',
  portfolioUrl: '',
  whyJoin: '',
};

const initialOutsideForm: OutsideFormState = {
  fullName: '',
  instituteName: '',
  rollNumber: '',
  personalEmail: '',
  collegeEmail: '',
  campusAmbassador: 'No',
};

export default function CoreTeamRegistrationForm() {
  const [step, setStep] = useState<Step>('choose-student');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [coreForm, setCoreForm] = useState<CoreTeamFormState>(initialCoreForm);
  const [outsideForm, setOutsideForm] = useState<OutsideFormState>(initialOutsideForm);

  useEffect(() => {
    if (step !== 'outside-campus-form') return;

    const rollNumber = outsideForm.rollNumber.trim();
    const personalEmail = outsideForm.personalEmail.trim().toLowerCase();
    const collegeEmail = outsideForm.collegeEmail.trim().toLowerCase();

    if (!rollNumber && !personalEmail && !collegeEmail) {
      setDuplicateError(null);
      setCheckingDuplicate(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);

        const query = new URLSearchParams({
          rollNumber,
          personalEmail,
          collegeEmail,
        });

        const response = await fetch(`/api/join/outside?${query.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!response.ok) {
          setDuplicateError(null);
          return;
        }

        const payload = await response.json();
        if (payload?.duplicate) {
          setDuplicateError(
            payload?.error || 'You have already submitted the form. Check your registered email for updates.'
          );
        } else {
          setDuplicateError(null);
        }
      } catch {
        if (!controller.signal.aborted) {
          setDuplicateError(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCheckingDuplicate(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [step, outsideForm.rollNumber, outsideForm.personalEmail, outsideForm.collegeEmail]);

  async function submitCoreTeamForm(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/join/core-team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(coreForm),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to submit application');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitOutsideCampusForm(e: React.FormEvent) {
    e.preventDefault();
    if (duplicateError) {
      setError(duplicateError);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/join/outside', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...outsideForm }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || 'Failed to submit outside campus form');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setStep('choose-student');
    setSubmitting(false);
    setError(null);
    setDuplicateError(null);
    setCheckingDuplicate(false);
    setCoreForm(initialCoreForm);
    setOutsideForm(initialOutsideForm);
  }

  return (
    <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-black/45 p-6 shadow-[0_0_90px_rgba(220,38,38,0.14)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-red-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />

      <div className="relative mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">C Square Core Team</p>
        <h2 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Registration Form</h2>
      </div>

      {error ? <p className="mb-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-500">{error}</p> : null}

      {step === 'choose-student' ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground/65">Are you a student of Chandigarh University?</p>
          <button
            type="button"
            onClick={() => setStep('membership-check')}
            className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <p className="font-semibold text-foreground">Yes, I am a CU student</p>
            <p className="mt-1 text-xs text-foreground/60">Continue to membership verification.</p>
          </button>
          <button
            type="button"
            onClick={() => setStep('outside-campus-form')}
            className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <p className="font-semibold text-foreground">No, I am from another campus</p>
            <p className="mt-1 text-xs text-foreground/60">Fill the same outside registration form used for joining the club.</p>
          </button>
        </div>
      ) : null}

      {step === 'membership-check' ? (
        <div className="space-y-3">
          <p className="text-sm text-foreground/65">Do you have a C Square Membership ID?</p>
          <button
            type="button"
            onClick={() => setStep('core-team-form')}
            className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <p className="font-semibold text-foreground">Yes, I have Membership ID</p>
            <p className="mt-1 text-xs text-foreground/60">Proceed to core team application form.</p>
          </button>
          <button
            type="button"
            onClick={() => setStep('register-membership')}
            className="w-full rounded-xl border border-border bg-card px-4 py-4 text-left transition-colors hover:border-primary/40 hover:bg-primary/10"
          >
            <p className="font-semibold text-foreground">No, I do not have Membership ID</p>
            <p className="mt-1 text-xs text-foreground/60">Register first on CU Intranet.</p>
          </button>
        </div>
      ) : null}

      {step === 'register-membership' ? (
        <div className="space-y-4 rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-foreground/75">
            Please register on CU Intranet first to get your C Square Membership ID. Once you have it, return here and complete the Core Team form.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={CU_JOIN_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Register on CU Intranet
            </a>
            <button
              type="button"
              onClick={() => setStep('membership-check')}
              className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
            >
              I have Membership ID now
            </button>
          </div>
        </div>
      ) : null}

      {step === 'outside-campus-form' ? (
        <form className="space-y-3" onSubmit={submitOutsideCampusForm}>
          <p className="text-sm text-foreground/65">Fill your details for external registration.</p>
          <input
            required
            placeholder="Full Name"
            value={outsideForm.fullName}
            onChange={(e) => setOutsideForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Institute Name"
            value={outsideForm.instituteName}
            onChange={(e) => setOutsideForm((prev) => ({ ...prev, instituteName: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Roll Number"
            value={outsideForm.rollNumber}
            onChange={(e) => setOutsideForm((prev) => ({ ...prev, rollNumber: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Personal Email"
            value={outsideForm.personalEmail}
            onChange={(e) => setOutsideForm((prev) => ({ ...prev, personalEmail: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            type="email"
            placeholder="College Email ID"
            value={outsideForm.collegeEmail}
            onChange={(e) => setOutsideForm((prev) => ({ ...prev, collegeEmail: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />

          <div className="rounded-lg border border-border bg-card p-3">
            <p className="mb-2 text-sm font-medium text-foreground">Campus Ambassador</p>
            <label className="mr-4 inline-flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="radio"
                name="outsideCampusAmbassador"
                checked={outsideForm.campusAmbassador === 'Yes'}
                onChange={() => setOutsideForm((prev) => ({ ...prev, campusAmbassador: 'Yes' }))}
              />
              Yes
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-foreground/80">
              <input
                type="radio"
                name="outsideCampusAmbassador"
                checked={outsideForm.campusAmbassador === 'No'}
                onChange={() => setOutsideForm((prev) => ({ ...prev, campusAmbassador: 'No' }))}
              />
              No
            </label>
          </div>

          {checkingDuplicate && !duplicateError ? <p className="text-xs text-foreground/60">Checking your registration...</p> : null}
          {duplicateError ? <p className="text-sm text-red-500">{duplicateError}</p> : null}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Other Campus Form'}
          </button>
        </form>
      ) : null}

      {step === 'core-team-form' ? (
        <form className="space-y-3" onSubmit={submitCoreTeamForm}>
          <p className="text-sm text-foreground/65">Core Team Form (CU Students with Membership ID)</p>
          <input
            required
            placeholder="C Square Membership ID"
            value={coreForm.membershipId}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, membershipId: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Full Name"
            value={coreForm.fullName}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="UID"
            value={coreForm.uid}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, uid: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Department"
            value={coreForm.department}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, department: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            placeholder="Course"
            value={coreForm.course}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, course: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              required
              value={coreForm.year}
              onChange={(e) => setCoreForm((prev) => ({ ...prev, year: e.target.value }))}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
            >
              <option value="">Select Year</option>
              <option value="1st">1st</option>
              <option value="2nd">2nd</option>
              <option value="3rd">3rd</option>
              <option value="4th">4th</option>
            </select>
            <select
              required
              value={coreForm.semester}
              onChange={(e) => setCoreForm((prev) => ({ ...prev, semester: e.target.value }))}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
            >
              <option value="">Select Semester</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
            </select>
          </div>

          <input
            required
            placeholder="Roles Interested (e.g., Tech Lead, Content, Design)"
            value={coreForm.rolesInterested}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, rolesInterested: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            required
            type="url"
            placeholder="Resume Link (viewer access)"
            value={coreForm.resumeLink}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, resumeLink: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            type="url"
            placeholder="LinkedIn URL"
            value={coreForm.linkedinUrl}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, linkedinUrl: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <input
            type="url"
            placeholder="Portfolio URL (if available)"
            value={coreForm.portfolioUrl}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, portfolioUrl: e.target.value }))}
            className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />
          <textarea
            required
            rows={4}
            placeholder="Why do you want to join the core team?"
            value={coreForm.whyJoin}
            onChange={(e) => setCoreForm((prev) => ({ ...prev, whyJoin: e.target.value }))}
            className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2.5 text-sm"
          />

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {submitting ? 'Submitting...' : 'Submit Core Team Application'}
          </button>
        </form>
      ) : null}

      {step === 'success' ? (
        <div className="space-y-3 rounded-xl border border-green-400/30 bg-green-500/10 p-4">
          <h4 className="text-lg font-semibold text-foreground">Submitted Successfully</h4>
          <p className="text-sm text-foreground/75">Thank you. Your response has been recorded.</p>
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground"
          >
            Submit Another Response
          </button>
        </div>
      ) : null}
    </div>
  );
}
