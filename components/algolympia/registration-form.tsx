'use client';

import { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  Users,
  User,
  Code2,
  Trophy,
  Sparkles,
  GraduationCap,
  Building2,
  Zap,
  Crown,
  ShieldCheck,
  Mail,
} from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */

type ParticipantType = 'cu' | 'non-cu' | null;

interface MemberData {
  name: string;
  email: string;
  uid: string;
  phone: string;
  college: string;
  leetcode: string;
  codeforces: string;
  codechef: string;
  github: string;
}

const emptyMember: MemberData = {
  name: '',
  email: '',
  uid: '',
  phone: '',
  college: '',
  leetcode: '',
  codeforces: '',
  codechef: '',
  github: '',
};

/* ─── Step definitions ───────────────────────────────────── */

const formSteps = [
  { label: 'Team Info', icon: Users },
  { label: 'Team Leader', icon: Crown },
  { label: 'Verify Email', icon: ShieldCheck },
  { label: 'Member 2', icon: User },
  { label: 'Member 3', icon: User },
  { label: 'Review', icon: Trophy },
];

/* ─── Styling helpers ────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

/* ─── Component ──────────────────────────────────────────── */

export default function AlgolympiaRegistrationForm() {
  const [participantType, setParticipantType] = useState<ParticipantType>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamName, setTeamName] = useState('');
  const [leader, setLeader] = useState<MemberData>({ ...emptyMember });
  const [member2, setMember2] = useState<MemberData>({ ...emptyMember });
  const [member3, setMember3] = useState<MemberData>({ ...emptyMember });
  const [isCuPaymentInfo, setIsCuPaymentInfo] = useState(false);
  const [hasFacultyMentor, setHasFacultyMentor] = useState(false);
  const [facultyMentorName, setFacultyMentorName] = useState('');
  const [facultyMentorEid, setFacultyMentorEid] = useState('');

  /* ── OTP state ─────────────────────────────────────────── */
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const isCU = participantType === 'cu';
  const steps = formSteps;
  const totalSteps = steps.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  // Reset OTP when leader email changes
  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage(null);
    setOtpError(null);
    setOtpCooldown(0);
  }, [leader.email]);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setTimeout(() => setOtpCooldown((p) => p - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCooldown]);

  /* ── OTP actions ───────────────────────────────────────── */

  const sendOtp = async () => {
    const email = leader.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setOtpError('Enter a valid email for team leader first');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const res = await fetch('/api/algolympia/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email, fullName: leader.name.trim() }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'Failed to send OTP');

      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      setOtpMessage(payload?.message || `OTP sent to ${email}`);
      setOtpCooldown(Number(payload?.cooldownSeconds || 60));
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const email = leader.email.trim().toLowerCase();
    const otpValue = otp.trim();
    if (!email || !otpValue) {
      setOtpError('Enter email and OTP');
      return;
    }
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const res = await fetch('/api/algolympia/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email, otp: otpValue }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || 'OTP verification failed');

      setOtpVerified(true);
      setOtpMessage('OTP verified successfully ✓');
    } catch (err) {
      setOtpVerified(false);
      setOtpError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Validation ────────────────────────────────────────── */

  const validateMemberBasics = (member: MemberData, label: string, isLeader = false): string | null => {
    if (!member.name.trim() || member.name.trim().length < 2) return `${label}: Name is required`;
    if (!member.email.trim() || !member.email.includes('@')) return `${label}: Valid email is required`;
    if (isCU && (!member.uid.trim() || !/^[A-Za-z0-9-]{6,20}$/.test(member.uid.trim()))) {
      return `${label}: Valid CU UID is required`;
    }
    if (isLeader && (!member.college?.trim() || member.college.trim().length < 2)) {
      return `${label}: College/Institute name is required`;
    }
    if (!member.phone?.trim() || !/^[0-9]{10,15}$/.test(member.phone)) {
      return `${label}: Valid phone number required`;
    }
    return null;
  };

  // Step mapping: 0=Team, 1=Leader, 2=VerifyEmail, 3=Member2, 4=Member3, 5=Review
  const sm = { team: 0, leader: 1, otp: 2, member2: 3, member3: 4, review: 5 };

  const validate = (): string | null => {
    if (step === sm.team) {
      if (!teamName.trim() || teamName.trim().length < 2) return 'Team name is required (min 2 chars)';
    } else if (step === sm.leader) {
      return validateMemberBasics(leader, 'Team Leader', true);
    } else if (step === sm.otp) {
      if (!otpVerified) return 'Please verify OTP before continuing';
    } else if (step === sm.member2) {
      return validateMemberBasics(member2, 'Member 2');
    } else if (step === sm.member3) {
      return validateMemberBasics(member3, 'Member 3');
    }
    return null;
  };

  const next = () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ── Submit ────────────────────────────────────────────── */

  const submit = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const body = isCU
        ? {
            isCU: true,
            teamName: teamName.trim(),
            facultyMentorName: hasFacultyMentor ? facultyMentorName.trim() : undefined,
            facultyMentorEid: hasFacultyMentor ? facultyMentorEid.trim() : undefined,
            leader: {
              name: leader.name.trim(),
              email: leader.email.trim(),
              uid: leader.uid.trim().toUpperCase(),
              college: leader.college.trim(),
              phone: leader.phone.trim(),
              leetcode: leader.leetcode.trim(),
              codeforces: leader.codeforces.trim(),
              codechef: leader.codechef.trim(),
              github: leader.github.trim(),
            },
            member2: {
              name: member2.name.trim(),
              email: member2.email.trim(),
              uid: member2.uid.trim().toUpperCase(),
              phone: member2.phone.trim(),
              leetcode: member2.leetcode.trim(),
              codeforces: member2.codeforces.trim(),
              codechef: member2.codechef.trim(),
              github: member2.github.trim(),
            },
            member3: {
              name: member3.name.trim(),
              email: member3.email.trim(),
              uid: member3.uid.trim().toUpperCase(),
              phone: member3.phone.trim(),
              leetcode: member3.leetcode.trim(),
              codeforces: member3.codeforces.trim(),
              codechef: member3.codechef.trim(),
              github: member3.github.trim(),
            },
          }
        : {
            isCU: false,
            teamName: teamName.trim(),
            leader: {
              name: leader.name.trim(),
              email: leader.email.trim(),
              college: leader.college.trim(),
              phone: leader.phone.trim(),
              leetcode: leader.leetcode.trim(),
              codeforces: leader.codeforces.trim(),
              codechef: leader.codechef.trim(),
              github: leader.github.trim(),
            },
            member2: {
              name: member2.name.trim(),
              email: member2.email.trim(),
              phone: member2.phone.trim(),
              leetcode: member2.leetcode.trim(),
              codeforces: member2.codeforces.trim(),
              codechef: member2.codechef.trim(),
              github: member2.github.trim(),
            },
            member3: {
              name: member3.name.trim(),
              email: member3.email.trim(),
              phone: member3.phone.trim(),
              leetcode: member3.leetcode.trim(),
              codeforces: member3.codeforces.trim(),
              codechef: member3.codechef.trim(),
              github: member3.github.trim(),
            },
          };

      const res = await fetch('/api/algolympia/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (!res.ok) {
        if (json.issues && json.issues.length > 0) {
          const detail = json.issues[0];
          const path = detail.path ? detail.path.join('.') : '';
          throw new Error(`${path ? path + ': ' : ''}${detail.message}`);
        }
        throw new Error(json.error || 'Registration failed');
      }

      setIsCuPaymentInfo(isCU);
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════ */
  /*  RENDER                                                */
  /* ═══════════════════════════════════════════════════════ */

  /* ── Success ───────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          Registration Successful!
        </h3>
        <p className="mx-auto mb-6 max-w-lg text-foreground/70">
          Your team <span className="font-semibold text-primary">{teamName}</span> has been
          registered for AlgOlympia.
        </p>

        {isCuPaymentInfo ? (
          <div className="mx-auto max-w-md rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="mb-2 text-sm font-semibold text-primary">💳 Registration Fee: ₹300 (₹100 per member)</p>
            <p className="text-sm text-foreground/65">
              ₹100 will be reflected on each member's <span className="font-semibold text-foreground">CUIMS</span>.
              Once registered, payment is <span className="font-semibold text-destructive">mandatory</span>.
            </p>
          </div>
        ) : (
          <div className="mx-auto max-w-md rounded-xl border border-primary/20 bg-primary/5 p-5">
            <p className="mb-2 text-sm font-semibold text-primary">💳 Payment: ₹300</p>
            <p className="text-sm text-foreground/65">
              Payment details will be sent to your registered email. Please check your inbox.
            </p>
          </div>
        )}

        <p className="mt-6 text-xs text-foreground/40">
          A confirmation email has been sent to the team leader.
        </p>
      </div>
    );
  }

  /* ── Participant type selector ─────────────────────────── */
  if (!participantType) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-6 backdrop-blur-xl sm:p-8 shadow-[0_0_90px_rgba(255,210,50,0.06)]">
        <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative mb-8 text-center flex flex-col items-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Registration
          </p>
          {/* <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Are you from Chandigarh University?
          </h2> */}
          <p className="mt-2 text-sm text-foreground/55">
            Select your participant category to proceed with registration.
          </p>
        </div>

        <div className="relative grid gap-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setParticipantType('cu')}
            className="group relative rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/[0.06]"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">CU Participant</h3>
                <p className="text-xs text-primary/60">Chandigarh University</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/55">
              <li>• Team of 3 members</li>
              <li>• ₹300 fee (₹100/member)</li>
              <li>• ₹100 on each member's CUIMS</li>
            </ul>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary group-hover:text-accent">
              Register as CU <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </button>

          <button
            type="button"
            onClick={() => setParticipantType('non-cu')}
            className="group relative rounded-2xl border border-accent/20 bg-accent/[0.03] p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-accent/40 hover:bg-accent/[0.06]"
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-lg">
                <Building2 className="h-5 w-5 text-accent" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-foreground">Non-CU Participant</h3>
                <p className="text-xs text-accent/60">Other University</p>
              </div>
            </div>
            <ul className="space-y-1.5 text-sm text-foreground/55">
              <li>• Team of 3 members</li>
              <li>• ₹300 registration fee</li>
              <li>• Payment details on email</li>
            </ul>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-accent group-hover:text-primary">
              Register as Non-CU <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ── Member form fields helper ─────────────────────────── */
  const renderMemberFields = (
    data: MemberData | (MemberData & { phone: string }),
    setData: (val: any) => void,
    label: string,
    isLeader = false,
  ) => (
    <div className="space-y-5">
      <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
          {isLeader ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
          {label}
        </div>
        <p className="text-xs text-foreground/45">
          {isLeader ? 'Enter team leader details and coding profiles.' : 'Enter member details and coding profiles.'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className={labelCls}>Full Name *</label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="Enter full name"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Email *</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            placeholder="name@email.com"
            className={inputCls}
          />
        </div>
        {isCU && (
          <div>
            <label className={labelCls}>CU UID *</label>
            <input
              type="text"
              value={data.uid}
              onChange={(e) => setData({ ...data, uid: e.target.value.toUpperCase() })}
              placeholder="e.g. 24BCS12345"
              className={inputCls}
            />
          </div>
        )}
        {isLeader && (
          <div>
            <label className={labelCls}>College / Institute Name *</label>
            <input
              type="text"
              value={data.college}
              onChange={(e) => setData({ ...data, college: e.target.value })}
              placeholder={isCU ? "e.g. UIE, UIC, etc." : "Enter college/institute name"}
              className={inputCls}
            />
          </div>
        )}
        <div>
          <label className={labelCls}>Phone Number *</label>
          <input
            type="tel"
            value={(data as any).phone || ''}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            placeholder="Enter 10-digit number"
            className={inputCls}
          />
        </div>
      </div>

      {/* Coding profiles — all optional */}
      <div className="mt-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground/80">
          <Code2 className="h-4 w-4 text-primary" />
          Coding Profiles <span className="text-xs text-foreground/40">(optional)</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>LeetCode Username</label>
            <input
              type="text"
              value={data.leetcode}
              onChange={(e) => setData({ ...data, leetcode: e.target.value })}
              placeholder="leetcode.com/u/username"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Codeforces Handle</label>
            <input
              type="text"
              value={data.codeforces}
              onChange={(e) => setData({ ...data, codeforces: e.target.value })}
              placeholder="codeforces.com/profile/handle"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>CodeChef Username</label>
            <input
              type="text"
              value={data.codechef}
              onChange={(e) => setData({ ...data, codechef: e.target.value })}
              placeholder="codechef.com/users/username"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>GitHub Profile</label>
            <input
              type="text"
              value={data.github}
              onChange={(e) => setData({ ...data, github: e.target.value })}
              placeholder="github.com/username"
              className={inputCls}
            />
          </div>
        </div>
      </div>
    </div>
  );

  /* ── OTP step ──────────────────────────────────────────── */
  const renderOtpStep = () => {
    const targetEmail = leader.email.trim() || '';

    return (
      <div className="space-y-5">
        <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
            <ShieldCheck className="h-4 w-4" />
            Email Verification
          </div>
          <p className="text-xs text-foreground/45">
            An OTP will be sent to the team leader&apos;s email ({targetEmail || '—'}) to verify identity.
          </p>
        </div>

        {/* Status */}
        {otpVerified ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-sm text-emerald-400">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">OTP Verified</p>
              <p className="text-xs text-emerald-400/70">Identity confirmed for {targetEmail}</p>
            </div>
          </div>
        ) : (
          <>
            {/* Send OTP */}
            <div className="rounded-xl border border-border bg-black/20 p-5">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground/80">
                <Mail className="h-4 w-4 text-primary" />
                OTP will be sent to: <span className="text-primary font-mono">{targetEmail || '—'}</span>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || !leader.email.trim()}
                  className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {otpLoading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    'Send OTP'
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                      className={`${inputCls} max-w-[200px] font-mono text-center text-lg tracking-[0.3em]`}
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otpLoading || otp.length < 6}
                      className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                      {otpLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Verify'
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading || otpCooldown > 0}
                    className="text-xs text-foreground/50 hover:text-foreground/70 transition-colors underline underline-offset-2 disabled:opacity-40 disabled:no-underline"
                  >
                    {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                  </button>
                </div>
              )}
            </div>

            {/* OTP messages */}
            {otpMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {otpMessage}
              </div>
            )}
            {otpError && (
              <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {otpError}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  /* ── Review section ────────────────────────────────────── */

  const renderReviewMember = (data: MemberData | (MemberData & { phone: string }), label: string, isLeader = false) => (
    <div className="rounded-xl border border-primary/10 bg-black/20 p-4">
      <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
        {isLeader ? <Crown className="h-4 w-4" /> : <User className="h-4 w-4" />}
        {label}
      </h4>
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div><span className="text-foreground/45">Name:</span> <span className="text-foreground">{data.name}</span></div>
        <div><span className="text-foreground/45">Email:</span> <span className="text-foreground">{data.email}</span></div>
        {isCU && <div><span className="text-foreground/45">UID:</span> <span className="text-foreground">{data.uid}</span></div>}
        {isLeader && <div><span className="text-foreground/45">College:</span> <span className="text-foreground">{data.college}</span></div>}
        <div><span className="text-foreground/45">Phone:</span> <span className="text-foreground">{(data as any).phone}</span></div>
        {data.leetcode && <div><span className="text-foreground/45">LeetCode:</span> <span className="text-foreground">{data.leetcode}</span></div>}
        {data.codeforces && <div><span className="text-foreground/45">Codeforces:</span> <span className="text-foreground">{data.codeforces}</span></div>}
        {data.codechef && <div><span className="text-foreground/45">CodeChef:</span> <span className="text-foreground">{data.codechef}</span></div>}
        {data.github && <div><span className="text-foreground/45">GitHub:</span> <span className="text-foreground">{data.github}</span></div>}
      </div>
    </div>
  );

  /* ── Step content ──────────────────────────────────────── */

  const renderStep = () => {
    if (step === sm.team) {
      return (
        <div className="space-y-5">
          <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Users className="h-4 w-4" />
              Team Information
            </div>
            <p className="text-xs text-foreground/45">
              Your team consists of 3 members including the team leader.
              {isCU
                ? ' Registration fee is ₹300 (₹100 per member), which will reflect on each member\'s CUIMS.'
                : ' Registration fee is ₹300. Payment details will be sent via email.'}
            </p>
          </div>

          <div>
            <label className={labelCls}>Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter your team name"
              className={inputCls}
            />
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold text-primary">Registration Fee: ₹300 (₹100 × 3 members)</h4>
            </div>
            {isCU ? (
              <div className="space-y-1 text-xs text-foreground/60">
                <p>• ₹100 will be reflected on each member's <span className="text-foreground font-medium">CUIMS</span></p>
                <p>• Once registered, payment is <span className="text-destructive font-medium">mandatory</span></p>
                <p>• All 3 team members must be from Chandigarh University</p>
              </div>
            ) : (
              <div className="space-y-1 text-xs text-foreground/60">
                <p>• Payment details will be sent to your <span className="text-foreground font-medium">registered email</span></p>
                <p>• Team of 3 members from any college</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setParticipantType(null)}
            className="text-xs text-foreground/40 hover:text-foreground/60 transition-colors underline underline-offset-2"
          >
            ← Change participant type
          </button>
        </div>
      );
    }

    if (step === sm.leader) {
      return renderMemberFields(leader, setLeader, 'Team Leader (Captain)', true);
    }

    if (step === sm.otp) {
      return renderOtpStep();
    }

    if (step === sm.member2) {
      return renderMemberFields(member2, setMember2, 'Member 2');
    }

    if (step === sm.member3) {
      return renderMemberFields(member3, setMember3, 'Member 3');
    }

    if (step === sm.review) {
      return (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-400 mb-1">
              <Trophy className="h-4 w-4" />
              Review Your Registration
            </div>
            <p className="text-xs text-foreground/45">
              Please review all details before submitting. Once submitted, registration cannot be modified.
            </p>
          </div>

          <div className="rounded-xl border border-primary/15 bg-black/20 p-4">
            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-foreground/45">Team Name:</span> <span className="font-semibold text-primary">{teamName}</span></div>
              <div><span className="text-foreground/45">Category:</span> <span className="font-semibold text-foreground">{isCU ? 'CU Participant' : 'Non-CU Participant'}</span></div>
              <div><span className="text-foreground/45">Fee:</span> <span className="font-semibold text-primary">₹300</span></div>
              <div><span className="text-foreground/45">Payment:</span> <span className="font-semibold text-foreground">{isCU ? 'CUIMS' : 'Via Email'}</span></div>
            </div>
          </div>

          {renderReviewMember(leader, 'Team Leader', true)}
          {renderReviewMember(member2, 'Member 2')}
          {renderReviewMember(member3, 'Member 3')}

          {isCU && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hasFacultyMentor}
                  onChange={(e) => setHasFacultyMentor(e.target.checked)}
                  className="h-4 w-4 rounded border-primary/50 text-primary accent-primary"
                />
                <span className="text-sm font-medium text-foreground">Add a Faculty Mentor (Optional)</span>
              </label>
              
              {hasFacultyMentor && (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className={labelCls}>Faculty Mentor Name</label>
                    <input
                      type="text"
                      value={facultyMentorName}
                      onChange={(e) => setFacultyMentorName(e.target.value)}
                      placeholder="Enter mentor's name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Employee Code (EID)</label>
                    <input
                      type="text"
                      value={facultyMentorEid}
                      onChange={(e) => setFacultyMentorEid(e.target.value)}
                      placeholder="Enter employee code"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {isCU && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-foreground/70">
              <p className="font-medium text-destructive mb-1">⚠ Important</p>
              <p>By submitting, you agree that ₹100 per member via CUIMS is <strong>mandatory</strong> once registered.</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  const isLast = step === totalSteps - 1;

  /* ── Wizard ────────────────────────────────────────────── */

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-5 backdrop-blur-xl sm:p-7 shadow-[0_0_80px_rgba(255,210,50,0.06)]">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between text-xs text-foreground/50">
          <span className="font-mono uppercase tracking-[0.16em]">
            Step {step + 1} of {totalSteps}
          </span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="mb-6 flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = i === step;
          const isCompleted = i < step;

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i < step) {
                  setError(null);
                  setStep(i);
                }
              }}
              className={`flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-xl px-1.5 py-2 text-center transition-all ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : isCompleted
                    ? 'text-primary/60 cursor-pointer hover:bg-primary/5'
                    : 'text-foreground/30 cursor-default'
              }`}
              disabled={i > step}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-[0_0_16px_rgba(255,210,50,0.3)]'
                    : isCompleted
                      ? 'bg-primary/20 text-primary'
                      : 'bg-border/50 text-foreground/30'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="hidden text-[10px] font-medium uppercase tracking-wider sm:block">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Step content */}
      <div className="mb-6 min-h-[280px]">{renderStep()}</div>

      {/* Error */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={back}
          disabled={step === 0}
          className="inline-flex items-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:bg-border/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={submit}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Submit Registration
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={next}
            className="inline-flex items-center gap-1 rounded-xl border border-primary bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
