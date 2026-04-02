'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
  GraduationCap,
  Code2,
  Globe,
  Briefcase,
  Building2,
  Target,
  FileText,
  Brain,
  Loader2,
  BookOpen,
  Compass,
  Heart,
  Lightbulb,
  Eye,
  Timer,
  Flame,
} from 'lucide-react';

/* ─── TYPES ──────────────────────────────────────────────── */

type Track = '2026' | '2027' | null;

const CUSOC_2026_CLOSED_MESSAGE =
  'CUSoC 2026 (GSoC) registrations are closed. Please register for the CUSoC 2027-28 cohort program.';
const OTP_REGEX = /^\d{6}$/;

function deriveCollegeEmail(uid: string): string {
  const trimmed = String(uid || '').trim().toLowerCase();
  if (!trimmed) return '';
  if (/@cuchd\.in$/i.test(trimmed)) return trimmed;
  return `${trimmed}@cuchd.in`;
}

/* ─── STEP DEFINITIONS ───────────────────────────────────── */

const steps2026 = [
  { label: 'Basic Details', icon: GraduationCap },
  { label: 'Technical Background', icon: Code2 },
  { label: 'Domain', icon: Globe },
  { label: 'Experience', icon: Briefcase },
  { label: 'Target Org', icon: Building2 },
  { label: 'Goals', icon: Target },
  { label: 'Commitment', icon: Flame },
  { label: 'Mini Proposal', icon: FileText },
  { label: 'Screening', icon: Brain },
];

const steps2027 = [
  { label: 'Basic Details', icon: GraduationCap },
  { label: 'Skill Level', icon: BookOpen },
  { label: 'Interest', icon: Compass },
  { label: 'Goals', icon: Target },
  { label: 'Awareness', icon: Eye },
  { label: 'Availability', icon: Timer },
  { label: 'Motivation', icon: Heart },
];

/* ─── OPTION DATA ────────────────────────────────────────── */

const departments = ['CSE', 'AI', 'IT', 'ECE', 'ME', 'EE', 'CE', 'Other'];
const years = ['1st', '2nd', '3rd', '4th'];
const languageOptions = ['C++', 'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Other'];
const domainOptions = [
  { value: 'web', label: 'Web Development', emoji: '🌐' },
  { value: 'app', label: 'App Development', emoji: '📱' },
  { value: 'backend', label: 'Backend', emoji: '⚙️' },
  { value: 'opensource', label: 'Open Source', emoji: '🌍' },
  { value: 'dsa_cp', label: 'DSA / CP', emoji: '🧠' },
];
const orgOptions = [
  'Apache Software Foundation',
  'Mozilla Foundation',
  'GirlScript Foundation',
  'Other',
];
const goalOptions = [
  'Crack Google Summer of Code',
  'Contribute to open source',
  'Build strong projects',
  'Internship preparation',
];

/* ─── FORM CONTEXT & FIELD COMPONENTS ────────────────────── */

const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';
const getCardCls = (dk: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${dk ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`;

interface FormCtx { dk: boolean; f: Record<string, any>; set: (k: string, v: any) => void }
const FormContext = createContext<FormCtx>({} as FormCtx);

function Input({ id, label, placeholder, type = 'text' }: { id: string; label: string; placeholder: string; type?: string }) {
  const { dk, f, set } = useContext(FormContext);
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <input id={id} type={type} value={f[id] || ''} onChange={(e) => set(id, e.target.value)} placeholder={placeholder} className={getCardCls(dk)} />
    </div>
  );
}

function Select({ id, label, options }: { id: string; label: string; options: { value: string; label: string }[] }) {
  const { dk, f, set } = useContext(FormContext);
  return (
    <div className="relative">
      <label htmlFor={id} className={labelCls}>{label}</label>
      <select
        id={id}
        value={f[id] || ''}
        onChange={(e) => set(id, e.target.value)}
        className={`${getCardCls(dk)} appearance-none pr-10`}
      >
        <option value="" disabled>Select</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-[42px] h-4 w-4 text-foreground/60" />
    </div>
  );
}

function Radio({ id, label, options }: { id: string; label: string; options: { value: string; label: string }[] }) {
  const { dk, f, set } = useContext(FormContext);
  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="flex flex-wrap gap-2 mt-1">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => set(id, o.value)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${f[id] === o.value
              ? (dk ? 'border-red-400/40 bg-red-500/15 text-red-300' : 'border-red-400 bg-red-50 text-red-700')
              : (dk ? 'border-white/10 bg-black/25 text-foreground/60 hover:border-red-400/25' : 'border-[#fecaca] bg-white text-foreground/70 hover:border-red-300')
            }`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Textarea({ id, label, placeholder, rows = 4 }: { id: string; label: string; placeholder: string; rows?: number }) {
  const { dk, f, set } = useContext(FormContext);
  return (
    <div>
      <label htmlFor={id} className={labelCls}>{label}</label>
      <textarea id={id} rows={rows} value={f[id] || ''} onChange={(e) => set(id, e.target.value)} placeholder={placeholder} className={`${getCardCls(dk)} resize-none`} />
    </div>
  );
}

function Toggle({ id, label }: { id: string; label: string }) {
  const { dk, f, set } = useContext(FormContext);
  return (
    <label className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors ${f[id]
      ? (dk ? 'border-red-400/30 bg-red-500/10 text-foreground' : 'border-red-400 bg-red-50 text-foreground')
      : (dk ? 'border-white/10 bg-black/25 text-foreground/60' : 'border-[#fecaca] bg-white text-foreground/70')
    }`}>
      <input type="checkbox" checked={!!f[id]} onChange={(e) => set(id, e.target.checked)} className="h-4 w-4 rounded border-red-400/50 accent-red-500" />
      <span>{label}</span>
    </label>
  );
}

/* ─── COMPONENT ──────────────────────────────────────────── */

export default function CusocForm() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const dk = mounted ? resolvedTheme !== 'light' : true; // default to dark visually before hydrate, or compute actual

  useEffect(() => setMounted(true), []);

  const [track, setTrack] = useState<Track>(null);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const initialFormState: Record<string, any> = {
    languages: [] as string[],
    domainOrder: [] as string[],
    interestArea: [] as string[],
    goals: [] as string[],
    goalLearnCoding: false,
    goalBuildProjects: false,
    goalTargetGsoc: false,
    knowsOpenSource: false,
    knowsGsoc: false,
  };

  // Form state (flat object – keeps it simple)
  const [f, setF] = useState<Record<string, any>>(initialFormState);

  // LocalStorage generic auto-save
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cusoc_form_2026');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.f) {
           // Prevent map crashes if a legacy string was saved before we migrated these to string[]
           if (data.f.domainOrder && !Array.isArray(data.f.domainOrder)) data.f.domainOrder = [];
           if (data.f.interestArea && !Array.isArray(data.f.interestArea)) data.f.interestArea = [];
           if (data.f.goals && !Array.isArray(data.f.goals)) data.f.goals = [];
           setF(data.f);
        }
        if (data.step !== undefined) setStep(data.step);
        if (data.track === '2027') setTrack('2027');
      }
    } catch(e) {}
  }, []);

  useEffect(() => {
    if (track) {
      localStorage.setItem('cusoc_form_2026', JSON.stringify({ f, step, track }));
    }
  }, [f, step, track]);

  useEffect(() => {
    if (!track || step !== 0) {
      setCheckingDuplicate(false);
      return;
    }

    if (track === '2026') {
      setDuplicateError(CUSOC_2026_CLOSED_MESSAGE);
      setCheckingDuplicate(false);
      return;
    }

    const cuEmail = deriveCollegeEmail(String(f.rollNumber || '').trim());
    if (!/@cuchd\.in$/i.test(cuEmail)) {
      setDuplicateError(null);
      setCheckingDuplicate(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setCheckingDuplicate(true);
        const query = new URLSearchParams({ track, cuEmail });
        const response = await fetch(`/api/cusoc/register?${query.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        if (!response.ok) {
          setDuplicateError(null);
          return;
        }

        const payload = await response.json();
        if (payload?.duplicate) {
          setDuplicateError(payload?.error || 'This CU email is already registered.');
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
  }, [track, step, f.rollNumber]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCooldown]);

  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage(null);
    setOtpError(null);
    setOtpCooldown(0);
  }, [f.rollNumber]);

  const set = (key: string, value: any) => {
    const nextValue = key === 'rollNumber' ? String(value || '').toUpperCase() : value;
    setF((prev) => ({
      ...prev,
      [key]: nextValue,
      ...(key === 'rollNumber' ? { cuEmail: deriveCollegeEmail(nextValue) } : {}),
    }));
  };

  useEffect(() => {
    const derived = deriveCollegeEmail(String(f.rollNumber || ''));
    if (derived && f.cuEmail !== derived) {
      setF((prev) => ({ ...prev, cuEmail: derived }));
    }
  }, [f.rollNumber, f.cuEmail]);
  const toggleArr = (key: string, val: string) => {
    const arr: string[] = f[key] || [];
    set(key, arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val]);
  };

  const steps = track === '2026' ? steps2026 : steps2027;
  const totalSteps = steps.length;
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const sectionCls = `rounded-3xl p-5 ${dk ? 'border border-white/10 bg-black/25' : 'border border-[#fecaca] bg-[#fff1f2]'}`;

  /* ── Per-step validation ───────────────────────────────── */

  const validate = (): string | null => {
    const normalizeUrl = (str: string) => {
      const trimmed = String(str || '').trim();
      if (!trimmed) return '';
      return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    };

    const isValidUrl = (str: string) => {
      try { new URL(normalizeUrl(str)); return true; } catch { return false; }
    };

    const isValidRoll = (value: string) => /^[A-Za-z0-9-]{6,20}$/.test(String(value || '').trim());

    if (track === '2026') {
      switch (step) {
        case 0:
          if (!f.fullName?.trim()) return 'Full Name is required';
          if (!isValidRoll(f.rollNumber)) return 'Valid CU Roll Number is required (letters/numbers, 6-20 chars)';
          if (!/@cuchd\.in$/i.test(deriveCollegeEmail(String(f.rollNumber || '')))) return 'Valid @cuchd.in email is required';
          if (!f.personalEmail?.trim() || !f.personalEmail.includes('@')) return 'Valid personal email is required';
          if (!f.phone?.trim() || !/^[0-9]{10,15}$/.test(f.phone)) return 'Valid phone number is required';
          if (!f.department) return 'Please select department';
          if (f.department === 'Other' && !f.departmentOther?.trim()) return 'Please specify your department';
          if (!f.year) return 'Please select year';
          break;
        case 1:
          if (!f.languages?.length) return 'Select at least one language';
          if (f.languages.includes('Other') && !f.languagesOther?.trim()) return 'Please specify other languages';
          if (!f.dsaLevel) return 'Select DSA level';
          if (!f.devExperience) return 'Select development experience';
          if (f.devExperience === 'Other' && !f.devExperienceOther?.trim()) return 'Please specify dev experience';
          break;
        case 2:
          if (!f.domainOrder?.length || f.domainOrder.length !== 5) return 'Please select all domains in order of your preference (1 to 5)';
          break;
        case 3:
          if (!f.githubProfile?.trim() || !isValidUrl(f.githubProfile)) return 'Valid GitHub profile link is required';
          if (!f.projectCount) return 'Select project count';
          if (!f.bestProjectLink?.trim() || !isValidUrl(f.bestProjectLink)) return 'Valid best project link is required';
          if (!f.openSourceContrib) return 'Open source contribution status is required';
          if (f.openSourceContrib === 'yes' && (!f.openSourceLink?.trim() || !isValidUrl(f.openSourceLink))) return 'Valid open source link is required';
          break;
        case 4:
          if (!f.targetOrgs?.trim()) return 'Target organization is required';
          if (!f.exploredRepo) return 'Explored repo question is required';
          break;
        case 5:
          if (!f.goals?.length) return 'Select at least one goal';
          if (!f.whyCusoc?.trim() || f.whyCusoc.length < 10) return 'Why CUSoC is required (min 10 chars)';
          break;
        case 6:
          if (!f.hoursPerWeek) return 'Select hours per week';
          if (!f.readyWeeklyTasks) return 'Weekly tasks readiness is required';
          if (!f.readyDeadlines) return 'Deadlines readiness is required';
          break;
        case 7:
          if (!f.proposalFileUrl?.trim() || !isValidUrl(f.proposalFileUrl)) return 'Valid Google Drive link to PDF proposal is required';
          break;
        case 8:
          if (!f.screeningAnswer?.trim() || f.screeningAnswer.length < 10) return 'Please answer "Why should we select you?" (min 10 chars)';
          break;
      }
    } else {
      switch (step) {
        case 0:
          if (!f.fullName?.trim()) return 'Full Name is required';
          if (!isValidRoll(f.rollNumber)) return 'Valid CU Roll Number is required (letters/numbers, 6-20 chars)';
          if (!/@cuchd\.in$/i.test(deriveCollegeEmail(String(f.rollNumber || '')))) return 'Valid @cuchd.in email is required';
          if (!f.personalEmail?.trim() || !f.personalEmail.includes('@')) return 'Valid personal email is required';
          if (!f.phone?.trim() || !/^[0-9]{10,15}$/.test(f.phone)) return 'Valid phone number is required';
          if (!f.department) return 'Please select department';
          if (f.department === 'Other' && !f.departmentOther?.trim()) return 'Please specify your department';
          if (!f.year) return 'Please select year';
          break;
        case 1:
          if (!f.skillLevel) return 'Select skill level';
          if (!f.languages?.length) return 'Select at least one language';
          if (f.languages.includes('Other') && !f.languagesOther?.trim()) return 'Please specify other languages';
          break;
        case 2:
          if (!f.interestArea?.length || f.interestArea.length !== 5) return 'Please select all interest areas in order of your preference (1 to 5)';
          break;
        case 3:
          if (!f.whyJoin?.trim() || f.whyJoin.length < 10) return 'Why do you want to join? (min 10 chars)';
          break;
        case 4: break; // booleans are optional
        case 5:
          if (!f.hoursPerWeek) return 'Select availability';
          break;
        case 6:
          if (!f.motivation?.trim() || f.motivation.length < 10) return 'Motivation answer is required (min 10 chars)';
          break;
      }
    }
    return null;
  };

  const next = () => {
    if (step === 0 && duplicateError) {
      setError(duplicateError);
      return;
    }

    if (track === '2027' && step === 0 && !otpVerified) {
      setError('Please verify OTP sent to your CUCHD email before continuing');
      return;
    }

    const err = validate();
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  };

  const back = () => { setError(null); setStep((s) => Math.max(s - 1, 0)); };

  /* ── Submit ────────────────────────────────────────────── */

  const submit = async () => {
    if (duplicateError) {
      setError(duplicateError);
      return;
    }

    const err = validate();
    if (err) { setError(err); return; }
    if (track === '2027' && !otpVerified) {
      setError('Please verify OTP sent to your CUCHD email before submitting');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const body: Record<string, any> = { track, ...f };
      body.rollNumber = String(body.rollNumber || '').trim().toUpperCase();
      body.cuEmail = deriveCollegeEmail(body.rollNumber);

      const normalizeUrl = (value: string) => {
        const trimmed = String(value || '').trim();
        if (!trimmed) return '';
        return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
      };

      // Override "Other" selections with user's custom input
      if (body.department === 'Other' && body.departmentOther) body.department = body.departmentOther;

      if (body.devExperience === 'Other' && body.devExperienceOther) body.devExperience = body.devExperienceOther;

      // Handle arrays
      if (Array.isArray(body.languages)) {
        // If 'Other' is checked, add the custom language
        let langs = body.languages.filter((l: string) => l !== 'Other');
        if (body.languages.includes('Other') && body.languagesOther) langs.push(body.languagesOther);
        body.languages = langs.join(', ');
      }
      if (Array.isArray(body.domainOrder)) body.domainOrder = body.domainOrder.join(', ');
      if (Array.isArray(body.goals)) body.goals = body.goals.join(', ');
      if (Array.isArray(body.interestArea)) body.interestArea = body.interestArea.join(', ');

      body.githubProfile = normalizeUrl(body.githubProfile);
      body.bestProjectLink = normalizeUrl(body.bestProjectLink);
      body.openSourceLink = normalizeUrl(body.openSourceLink);
      body.orgRepoLink = normalizeUrl(body.orgRepoLink);
      body.proposalFileUrl = normalizeUrl(body.proposalFileUrl);

      const res = await fetch('/api/cusoc/register', {
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
      localStorage.removeItem('cusoc_form_2026');
      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const clearFormAndCache = () => {
    setF(initialFormState);
    setStep(0);
    setError(null);
    setDuplicateError(null);
    setCheckingDuplicate(false);
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage(null);
    setOtpError(null);
    setOtpCooldown(0);
    localStorage.removeItem('cusoc_form_2026');
  };

  const sendOtp = async () => {
    const uid = String(f.rollNumber || '').trim().toUpperCase();
    if (!uid) {
      setOtpError('Enter UID first to receive OTP');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const response = await fetch('/api/cusoc/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          uid,
          fullName: String(f.fullName || '').trim(),
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'Failed to send OTP');
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtp('');
      setOtpMessage(payload?.message || 'OTP sent to your CUCHD email');
      setOtpCooldown(Number(payload?.cooldownSeconds || 60));
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const uid = String(f.rollNumber || '').trim().toUpperCase();
    const otpValue = otp.trim();

    if (!uid || !otpValue) {
      setOtpError('Enter UID and OTP to verify');
      return;
    }

    if (!OTP_REGEX.test(otpValue)) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const response = await fetch('/api/cusoc/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          uid,
          otp: otpValue,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || 'OTP verification failed');
      }

      setOtpVerified(true);
      setOtpMessage('OTP verified successfully');
    } catch (err) {
      setOtpVerified(false);
      setOtpError(err instanceof Error ? err.message : 'OTP verification failed');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ═══════════════════════════════════════════════════════ */
  /*  RENDER                                                */
  /* ═══════════════════════════════════════════════════════ */

  /* ── Success ───────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className={`rounded-[34px] p-10 text-center backdrop-blur-xl ${dk ? 'border border-red-400/20 bg-white/[0.04] shadow-[0_0_80px_rgba(220,38,38,0.12)]' : 'border border-[#fecaca] bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]'}`}>
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Registration submitted!</h3>
        <p className="mx-auto max-w-lg text-foreground/70">
          {track === '2026'
            ? 'Your CUSoC 2026 application is recorded. The team will review your mini proposal and get back to you.'
            : 'Your CUSoC 2027-28 preparation batch registration is recorded. We will connect with you soon!'}
        </p>
      </div>
    );
  }

  /* ── Track selector ────────────────────────────────────── */
  if (!track) {
    return (
      <div className={`relative overflow-hidden rounded-[34px] p-6 backdrop-blur-xl sm:p-8 ${dk ? 'border border-white/12 bg-black/45 shadow-[0_0_90px_rgba(220,38,38,0.14)]' : 'border border-[#fecaca] bg-white/95 shadow-[0_20px_65px_rgba(15,23,42,0.08)]'}`}>
        <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-red-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />

        <div className="relative mb-8 text-center flex flex-col items-center">
          <Image src="/cusoc.png" alt="CUSoC Logo" width={180} height={60} className="mb-4 object-contain" priority />
          <p className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] ${dk ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-red-300 bg-red-50 text-red-700'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Choose Your Track
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Select Your CUSoC Batch
          </h2>
          <p className="mt-2 text-sm text-foreground/65">Pick the track that matches your current level and goals.</p>
          <p className={`mt-3 rounded-xl border px-3 py-2 text-xs font-medium ${dk ? 'border-amber-400/30 bg-amber-500/10 text-amber-200' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
            CUSoC 2026 registration is closed. Please choose the CUSoC 2027-28 cohort program.
          </p>
        </div>

        <div className="relative grid gap-5 sm:grid-cols-2">
          {/* 2026 Card */}
          <button
            type="button"
            disabled
            className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 opacity-60 cursor-not-allowed ${dk ? 'border-emerald-400/20 bg-emerald-400/[0.03]' : 'border-emerald-300 bg-emerald-50'}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-lg">🟢</span>
              <div>
                <h3 className="text-lg font-bold text-foreground">CUSoC 2026</h3>
                <p className={`text-xs ${dk ? 'text-emerald-300/60' : 'text-emerald-700'}`}>Current Batch (Closed)</p>
              </div>
            </div>
            <ul className={`space-y-1.5 text-sm ${dk ? 'text-foreground/60' : 'text-foreground/70'}`}>
              <li>• Screening question / SOP</li>
              <li>• For GSoC-ready students</li>
            </ul>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-rose-500">
              Registrations Closed
            </div>
          </button>

          {/* 2027 Card */}
          <button
            type="button"
            onClick={() => { setTrack('2027'); setStep(0); }}
            className={`group relative rounded-2xl border p-6 text-left transition-all duration-300 hover:scale-[1.02] ${dk ? 'border-amber-400/20 bg-amber-400/[0.03] hover:border-amber-400/40 hover:bg-amber-400/[0.06]' : 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100/70'}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-lg">🟡</span>
              <div>
                <h3 className="text-lg font-bold text-foreground">CUSoC 2027-28</h3>
                <p className={`text-xs ${dk ? 'text-amber-300/60' : 'text-amber-700'}`}>Preparation Batch</p>
              </div>
            </div>
            <ul className={`space-y-1.5 text-sm ${dk ? 'text-foreground/60' : 'text-foreground/70'}`}>
              <li>• Beginner-friendly</li>
              <li>• Learn &amp; build foundations</li>
            </ul>
            <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-500 group-hover:text-amber-400">
              Start Application <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  /* ── Wizard ────────────────────────────────────────────── */

  const isLast = step === totalSteps - 1;



  /* ── Step content ──────────────────────────────────────── */

  const renderStep = () => {
    if (track === '2026') {
      switch (step) {
        /* ── S1: Basic Details ────────────────────────────── */
        case 0:
          return (
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="fullName" label="Full Name *" placeholder="Enter your full name" />
              <Input id="rollNumber" label="UID *" placeholder="e.g. 24BCS12345" />
              <div>
                <label htmlFor="cuEmailAuto2026" className={labelCls}>CU Email ID (Auto-filled from UID)</label>
                <input
                  id="cuEmailAuto2026"
                  type="email"
                  value={deriveCollegeEmail(String(f.rollNumber || ''))}
                  readOnly
                  placeholder="uid@cuchd.in"
                  className={`${getCardCls(dk)} cursor-not-allowed opacity-80`}
                />
              </div>
              <Input id="personalEmail" label="Personal Email ID *" placeholder="name@gmail.com" type="email" />
              <Input id="phone" label="Phone Number *" placeholder="Enter 10-15 digit number" type="tel" />
              <div>
                <Select id="department" label="Department *" options={departments.map((d) => ({ value: d, label: d }))} />
                {f.department === 'Other' && (
                  <div className="mt-3">
                    <input className={getCardCls(dk)} placeholder="Please specify your department" value={f.departmentOther || ''} onChange={(e) => set('departmentOther', e.target.value)} />
                  </div>
                )}
              </div>
              <Select id="year" label="Year *" options={years.map((y) => ({ value: y, label: `${y} Year` }))} />
            </div>
          );

        /* ── S2: Technical Background ────────────────────── */
        case 1:
          return (
            <div className="space-y-5">
              <div>
                <p className={labelCls}>Programming Languages</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {languageOptions.map((lang) => (
                    <button key={lang} type="button" onClick={() => toggleArr('languages', lang)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${(f.languages as string[])?.includes(lang)
                        ? (dk ? 'border-red-400/40 bg-red-500/15 text-red-300' : 'border-red-400 bg-red-50 text-red-700')
                        : (dk ? 'border-white/10 bg-black/25 text-foreground/60 hover:border-red-400/25' : 'border-[#fecaca] bg-white text-foreground/70 hover:border-red-300')
                      }`}>
                      {lang}
                    </button>
                  ))}
                </div>
                {(f.languages as string[])?.includes('Other') && (
                  <div className="mt-3">
                    <input className={getCardCls(dk)} placeholder="Mention other languages" value={f.languagesOther || ''} onChange={(e) => set('languagesOther', e.target.value)} />
                  </div>
                )}
              </div>
              <Radio id="dsaLevel" label="DSA Level" options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
              ]} />
              <Radio id="devExperience" label="Development Experience" options={[
                { value: 'none', label: 'None' },
                { value: 'basic', label: 'Basic' },
                { value: 'intermediate', label: 'Intermediate' },
                { value: 'advanced', label: 'Advanced' },
                { value: 'Other', label: 'Other' },
              ]} />
              {f.devExperience === 'Other' && (
                <div className="-mt-2">
                  <input className={getCardCls(dk)} placeholder="Describe your experience" value={f.devExperienceOther || ''} onChange={(e) => set('devExperienceOther', e.target.value)} />
                </div>
              )}
            </div>
          );

        /* ── S3: Domain ──────────────────────────────────── */
        case 2:
          return (
            <div>
              <p className={labelCls}>Rank your interest areas (Click in order 1 to 5)</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                {domainOptions.map((d) => {
                  const arr = (f.domainOrder || []) as string[];
                  const idx = arr.indexOf(d.value);
                  const selected = idx !== -1;
                  return (
                    <button key={d.value} type="button" onClick={() => {
                      if (selected) {
                        set('domainOrder', arr.filter(v => v !== d.value));
                      } else {
                        if (arr.length < 5) set('domainOrder', [...arr, d.value]);
                      }
                    }}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${selected
                        ? (dk ? 'border-red-400/40 bg-red-500/10 ring-1 ring-red-400/20' : 'border-red-400 bg-red-50 ring-1 ring-red-200')
                        : (dk ? 'border-white/10 bg-black/25 hover:border-red-400/25' : 'border-[#fecaca] bg-white hover:border-red-300')
                      }`}>
                      {selected && (
                        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                          {idx + 1}
                        </div>
                      )}
                      <span className="text-2xl">{d.emoji}</span>
                      <p className="mt-2 text-sm font-semibold text-foreground">{d.label}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium items-center">
                <span className="text-foreground/50 shrink-0">Order:</span>
                {(f.domainOrder || []).map((val: string, i: number) => (
                  <span key={val} className={`shrink-0 rounded px-2 py-0.5 ${dk ? 'bg-white/10' : 'bg-black/10'}`}>
                    {i+1}. {domainOptions.find(o => o.value === val)?.label}
                  </span>
                ))}
              </div>
            </div>
          );

        /* ── S4: Experience ──────────────────────────────── */
        case 3:
          return (
            <div className="space-y-4">
              <Input id="githubProfile" label="GitHub Profile Link" placeholder="https://github.com/username" type="url" />
              <Radio id="projectCount" label="Number of Projects" options={[
                { value: '0', label: '0' }, { value: '1-2', label: '1–2' }, { value: '3+', label: '3+' },
              ]} />
              <Input id="bestProjectLink" label="Best Project Link" placeholder="https://github.com/username/project" type="url" />
              <Radio id="openSourceContrib" label="Any Open Source Contributions?" options={[
                { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
              ]} />
              {f.openSourceContrib === 'yes' && (
                <Input id="openSourceLink" label="Open Source Contribution Link" placeholder="https://github.com/..." type="url" />
              )}
            </div>
          );

        /* ── S5: Target Org ──────────────────────────────── */
        case 4:
          return (
            <div className="space-y-4">
              <div>
                <label className={labelCls} htmlFor="targetOrgs">
                  Which organization(s) are you targeting? <br/>
                  <a href="https://summerofcode.withgoogle.com/programs/2026/organizations" target="_blank" rel="noopener noreferrer" className="inline-flex text-[11px] uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors mt-1 font-bold">
                    View GSoC 2026 Directory »
                  </a>
                </label>
                <input id="targetOrgs" type="text" className={getCardCls(dk)} placeholder="e.g. PostgreSQL, Python Software Foundation" value={f.targetOrgs || ''} onChange={(e) => set('targetOrgs', e.target.value)} />
              </div>
              <Radio id="exploredRepo" label="Have you explored their repository?" options={[
                { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
              ]} />
            </div>
          );

        /* ── S6: Goals ───────────────────────────────────── */
        case 5:
          return (
            <div className="space-y-5">
              <div>
                <p className={labelCls}>What are your goals? (Select all that apply)</p>
                <div className="grid gap-2 sm:grid-cols-2 mt-1">
                  {goalOptions.map((g) => {
                    const selected = (f.goals || []).includes(g);
                    return (
                      <button key={g} type="button" onClick={() => toggleArr('goals', g)}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium text-left transition-all flex items-center justify-between ${selected
                          ? (dk ? 'border-red-400/40 bg-red-500/15 text-red-300' : 'border-red-400 bg-red-50 text-red-700')
                          : (dk ? 'border-white/10 bg-black/25 text-foreground/60 hover:border-red-400/25' : 'border-[#fecaca] bg-white text-foreground/70 hover:border-red-300')
                        }`}>
                        {g}
                        {selected && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Textarea id="whyCusoc" label="Why do you want to join CUSoC?" placeholder="Describe your motivation, how CUSoC will help you, and what you hope to achieve..." />
            </div>
          );

        /* ── S7: Commitment ──────────────────────────────── */
        case 6:
          return (
            <div className="space-y-5">
              <Radio id="hoursPerWeek" label="Hours per week" options={[
                { value: '<5', label: '<5 hrs' }, { value: '5-10', label: '5–10 hrs' }, { value: '10+', label: '10+ hrs' },
              ]} />
              <Radio id="readyWeeklyTasks" label="Are you ready for weekly tasks?" options={[
                { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
              ]} />
              <Radio id="readyDeadlines" label="Are you ready for deadlines?" options={[
                { value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' },
              ]} />
            </div>
          );

        /* ── S8: Mini Proposal ───────────────────────────── */
        case 7:
          return (
            <div className="space-y-4">
              <div className={`rounded-xl p-4 mb-2 ${dk ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
                <p className={`text-sm mb-3 ${dk ? 'text-amber-300' : 'text-amber-800'}`}>
                  Draft your proposal using the official template, save it as a PDF, upload it to Google Drive, and make sure to turn on <b>"Anyone with the link can view"</b>. Then paste the link below.
                </p>
                <div className="flex items-center gap-2">
                  <a href="https://docs.google.com/document/d/1RtyVv2A8kqxBlkIV0u5WPada2JBOy7VX/edit?usp=sharing&ouid=114220336905495226052&rtpof=true&sd=true" target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${dk ? 'bg-amber-400/20 text-amber-200 hover:bg-amber-400/30' : 'bg-amber-200 text-amber-800 hover:bg-amber-300'}`}>
                    <FileText className="h-3.5 w-3.5" /> View Proposal Template
                  </a>
                </div>
              </div>
              <Input id="proposalFileUrl" label="Google Drive Link for PDF Proposal" placeholder="https://drive.google.com/file/d/..." type="url" />
            </div>
          );

        /* ── S9: Screening ───────────────────────────────── */
        case 8:
          return (
            <div className="space-y-5">
              <Textarea
                id="screeningAnswer"
                label='Why should we select you?'
                placeholder='Tell us what makes you stand out — your skills, experience, commitment, and what you will bring to CUSoC...'
                rows={6}
              />
            </div>
          );
      }
    }

    /* ── 2027 STEPS ──────────────────────────────────────── */
    if (track === '2027') {
      switch (step) {
        case 0:
          return (
            <div className="grid gap-4 md:grid-cols-2">
              <Input id="fullName" label="Full Name" placeholder="Your full name" />
              <Input id="rollNumber" label="UID" placeholder="22BCS12345" />
              <div>
                <label htmlFor="cuEmailAuto" className={labelCls}>CU Email ID (Auto-filled from UID)</label>
                <input
                  id="cuEmailAuto"
                  type="email"
                  value={deriveCollegeEmail(String(f.rollNumber || ''))}
                  readOnly
                  placeholder="uid@cuchd.in"
                  className={`${getCardCls(dk)} cursor-not-allowed opacity-80`}
                />
              </div>
              <Input id="personalEmail" label="Personal Email ID (for GSoC)" placeholder="name@gmail.com" type="email" />
              <Input id="phone" label="Phone Number" placeholder="9876543210" type="tel" />
              <div>
                <Select id="department" label="Department" options={departments.map((d) => ({ value: d, label: d }))} />
                {f.department === 'Other' && (
                  <div className="mt-3">
                    <input className={getCardCls(dk)} placeholder="Please specify your department" value={f.departmentOther || ''} onChange={(e) => set('departmentOther', e.target.value)} />
                  </div>
                )}
              </div>
              <Select id="year" label="Year" options={years.map((y) => ({ value: y, label: `${y} Year` }))} />

              <div className={`md:col-span-2 rounded-xl border p-4 ${dk ? 'border-white/10 bg-black/25' : 'border-[#fecaca] bg-white'}`}>
                <p className="mb-2 text-sm font-medium text-foreground">OTP Verification (Required)</p>
                <p className="mb-3 text-xs text-foreground/65">
                  OTP will be sent to <strong>{deriveCollegeEmail(String(f.rollNumber || '')) || 'your UID-based CUCHD email'}</strong>
                </p>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={otpLoading || otpCooldown > 0 || !String(f.rollNumber || '').trim()}
                    className="inline-flex items-center justify-center rounded-lg border border-primary bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                  >
                    {otpLoading ? 'Sending...' : otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className={getCardCls(dk)}
                  />

                  <button
                    type="button"
                    onClick={verifyOtp}
                    disabled={otpLoading || otp.length !== 6}
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-60"
                  >
                    {otpLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </div>

                {otpMessage ? <p className="mt-2 text-xs text-emerald-400">{otpMessage}</p> : null}
                {otpError ? <p className="mt-2 text-xs text-red-400">{otpError}</p> : null}
                {otpVerified ? <p className="mt-2 text-xs text-emerald-400">OTP verified. You can continue.</p> : null}
              </div>
            </div>
          );

        case 1:
          return (
            <div className="space-y-5">
              <Radio id="skillLevel" label="Skill Level" options={[
                { value: 'beginner', label: 'Beginner' },
                { value: 'basic', label: 'Basic' },
                { value: 'intermediate', label: 'Intermediate' },
              ]} />
              <div>
                <p className={labelCls}>Languages Known</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {languageOptions.map((lang) => (
                    <button key={lang} type="button" onClick={() => toggleArr('languages', lang)}
                      className={`rounded-xl border px-4 py-2 text-sm font-medium transition-all ${(f.languages as string[])?.includes(lang)
                        ? (dk ? 'border-red-400/40 bg-red-500/15 text-red-300' : 'border-red-400 bg-red-50 text-red-700')
                        : (dk ? 'border-white/10 bg-black/25 text-foreground/60 hover:border-red-400/25' : 'border-[#fecaca] bg-white text-foreground/70 hover:border-red-300')
                      }`}>
                      {lang}
                    </button>
                  ))}
                </div>
                {(f.languages as string[])?.includes('Other') && (
                  <div className="mt-3">
                    <input className={getCardCls(dk)} placeholder="Mention other languages" value={f.languagesOther || ''} onChange={(e) => set('languagesOther', e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          );

        case 2:
          return (
            <div>
              <p className={labelCls}>Rank your interest areas (Click in order 1 to 5)</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mt-2">
                {domainOptions.filter((d) => d.value !== 'dsa_cp').concat([{ value: 'dsa', label: 'DSA', emoji: '🧠' }]).map((d) => {
                  const arr = (f.interestArea || []) as string[];
                  const idx = arr.indexOf(d.value);
                  const selected = idx !== -1;
                  return (
                    <button key={d.value} type="button" onClick={() => {
                      if (selected) {
                        set('interestArea', arr.filter(v => v !== d.value));
                      } else {
                        if (arr.length < 5) set('interestArea', [...arr, d.value]);
                      }
                    }}
                      className={`relative rounded-2xl border p-4 text-left transition-all duration-200 ${selected
                        ? (dk ? 'border-red-400/40 bg-red-500/10 ring-1 ring-red-400/20' : 'border-red-400 bg-red-50 ring-1 ring-red-200')
                        : (dk ? 'border-white/10 bg-black/25 hover:border-red-400/25' : 'border-[#fecaca] bg-white hover:border-red-300')
                      }`}>
                      {selected && (
                        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-md">
                          {idx + 1}
                        </div>
                      )}
                      <span className="text-2xl">{d.emoji}</span>
                      <p className="mt-2 text-sm font-semibold text-foreground">{d.label}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-sm font-medium items-center">
                <span className="text-foreground/50 shrink-0">Order:</span>
                {(Array.isArray(f.interestArea) ? f.interestArea : []).map((val: string, i: number) => {
                  const option = domainOptions.filter(d => d.value !== 'dsa_cp').concat([{ value: 'dsa', label: 'DSA', emoji: '🧠' }]).find(o => o.value === val);
                  return (
                    <span key={val} className={`shrink-0 rounded px-2 py-0.5 ${dk ? 'bg-white/10' : 'bg-black/10'}`}>
                      {i+1}. {option?.label}
                    </span>
                  );
                })}
              </div>
            </div>
          );

        case 3:
          return (
            <div className="space-y-4">
              <p className={labelCls}>What are your goals?</p>
              <div className="space-y-2">
                <Toggle id="goalLearnCoding" label="Learn coding" />
                <Toggle id="goalBuildProjects" label="Build projects" />
                <Toggle id="goalTargetGsoc" label="Target future programs like GSoC" />
              </div>
              <Textarea id="whyJoin" label="Why do you want to join?" placeholder="Tell us briefly what excites you about CUSoC..." />
            </div>
          );

        case 4:
          return (
            <div className="space-y-4">
              <p className={`${labelCls} text-base`}>Do you know about…</p>
              <div className="space-y-2">
                <Toggle id="knowsOpenSource" label="Open Source" />
                <Toggle id="knowsGsoc" label="Google Summer of Code (GSoC)" />
              </div>
            </div>
          );

        case 5:
          return (
            <div>
              <Radio id="hoursPerWeek" label="How many hours per week can you commit?" options={[
                { value: '5-10', label: '5–10 hrs/week' },
                { value: '<5', label: 'Less than 5 hrs' },
                { value: '10+', label: 'More than 10 hrs' },
              ]} />
            </div>
          );

        case 6:
          return (
            <div>
              <Textarea id="motivation" label="What motivates you to join CUSoC?" placeholder="Share your thoughts – no strict filtering here, just be genuine!" rows={5} />
            </div>
          );
      }
    }
  };

  const StepIcon = steps[step].icon;

  return (
    <FormContext.Provider value={{dk, f, set}}>
    <div className={`relative overflow-hidden rounded-[34px] p-6 backdrop-blur-xl sm:p-8 ${dk ? 'border border-white/12 bg-black/45 shadow-[0_0_90px_rgba(220,38,38,0.14)]' : 'border border-[#fecaca] bg-white/95 shadow-[0_20px_65px_rgba(15,23,42,0.08)]'}`}>
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-red-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />

      {/* Header */}
      <div className="relative mb-6 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs text-foreground/60">* All fields are compulsory unless explicitly marked optional.</p>
          <div className="flex items-center gap-2 mb-2">
            <button type="button" onClick={() => { setTrack(null); setStep(0); setError(null); }}
              className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${dk ? 'border-white/10 bg-white/[0.03] text-foreground/50 hover:text-foreground' : 'border-[#fecaca] bg-white text-foreground/60 hover:text-foreground'}`}>
              ← Change Track
            </button>
            <button
              type="button"
              onClick={clearFormAndCache}
              className={`rounded-lg border px-2 py-1 text-xs font-medium transition-colors ${dk ? 'border-white/10 bg-white/[0.03] text-foreground/50 hover:text-foreground' : 'border-[#fecaca] bg-white text-foreground/60 hover:text-foreground'}`}
            >
              Clear Form
            </button>
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${track === '2026' ? (dk ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-100 text-emerald-700') : (dk ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-100 text-amber-700')}`}>
              {track === '2026' ? '2026 Batch' : '2027-28 Batch'}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Step {step + 1}: {steps[step].label}
          </h2>
        </div>

        <div className={`w-full rounded-2xl p-4 sm:w-56 ${dk ? 'border border-white/10 bg-white/[0.03]' : 'border border-[#fecaca] bg-[#fff1f2]'}`}>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/60">
            <span>{step + 1} / {totalSteps}</span>
            <span>{progress}%</span>
          </div>
          <div className={`h-2 overflow-hidden rounded-full ${dk ? 'bg-white/10' : 'bg-[#fee2e2]'}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Step indicator pills */}
      <div className="relative mb-6 flex gap-1.5 overflow-x-auto pb-2">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={i} type="button" onClick={() => { if (i < step) { setError(null); setStep(i); } }}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium transition-all ${
                i === step
                  ? (dk ? 'bg-red-500/15 text-red-300 border border-red-400/30' : 'bg-red-50 text-red-700 border border-red-300')
                  : i < step
                    ? (dk ? 'bg-emerald-500/10 text-emerald-400/70 border border-emerald-400/20 cursor-pointer hover:bg-emerald-500/15' : 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-pointer hover:bg-emerald-100')
                    : (dk ? 'bg-white/[0.03] text-foreground/30 border border-white/5' : 'bg-gray-50 text-foreground/40 border border-gray-200')
              }`}>
              {i < step ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className={`mb-5 flex gap-3 rounded-2xl border p-4 animate-fade-in-up ${dk ? 'border-red-500/30 bg-red-500/10' : 'border-red-300/50 bg-red-50'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className={`text-sm ${dk ? 'text-red-100' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      {checkingDuplicate && step === 0 && !duplicateError && (
        <p className="mb-4 text-xs text-foreground/60">Checking registration status...</p>
      )}

      {duplicateError && step === 0 && (
        <div className={`mb-5 flex gap-3 rounded-2xl border p-4 animate-fade-in-up ${dk ? 'border-red-500/30 bg-red-500/10' : 'border-red-300/50 bg-red-50'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className={`text-sm ${dk ? 'text-red-100' : 'text-red-700'}`}>{duplicateError}</p>
        </div>
      )}

      {/* Content */}
      <section className={sectionCls}>
        <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/65">
          <StepIcon className="h-4 w-4 text-red-400" />
          {steps[step].label}
        </div>
        {renderStep()}
      </section>

      {/* Navigation */}
      <div className="relative mt-6 flex items-center justify-between">
        {step === 0 ? <div /> : (
          <button type="button" onClick={back}
            className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-medium transition-all ${dk ? 'border-white/10 bg-white/[0.03] text-foreground/60 hover:text-foreground hover:bg-white/[0.05]' : 'border-[#fecaca] bg-white text-foreground/60 hover:text-foreground'}`}>
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
        )}

        {isLast ? (
          <button type="button" onClick={submit} disabled={isLoading || Boolean(duplicateError)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-7 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(220,38,38,0.35)] disabled:cursor-not-allowed disabled:opacity-60">
            {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</> : <>Submit Registration <Flame className="h-4 w-4" /></>}
          </button>
        ) : (
          <button type="button" onClick={next} disabled={step === 0 && Boolean(duplicateError)}
            className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-6 py-2.5 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_25px_rgba(220,38,38,0.3)]">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
    </FormContext.Provider>
  );
}
