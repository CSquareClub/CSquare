'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Users,
  Store,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  ShoppingBag,
  Coffee,
  ChevronLeft,
  Crown,
} from 'lucide-react';
import { getStallBasePrice, getStallTotalPrice, type StallCategory } from '@/lib/algolympia-stall-pricing';

/* ─── Types ──────────────────────────────────────────────── */

interface StallMember {
  name: string;
  email: string;
  phone: string;
}

const emptyMember: StallMember = { name: '', email: '', phone: '' };

/* ─── Styling helpers ────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

/* ─── Component ──────────────────────────────────────────── */

export default function StallRegistrationForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [stallName, setStallName] = useState('');
  const [stallDescription, setStallDescription] = useState('');
  const [members, setMembers] = useState<StallMember[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /* ── Category State ───────────────────────────────────── */
  const [category, setCategory] = useState<StallCategory | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isCuStudent, setIsCuStudent] = useState<boolean | null>(null);
  const [uid, setUid] = useState('');
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [numberOfDays, setNumberOfDays] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState<string>('');

  /* ── OTP State ───────────────────────────────────────── */
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  /* ── OTP Handlers ─────────────────────────────────────── */
  const handleSendOtp = async () => {
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email before sending OTP');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/algolympia/stalls/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email, fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message || 'Error sending OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setError(null);
    setOtpLoading(true);
    try {
      const res = await fetch('/api/algolympia/stalls/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify-otp', email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setOtpVerified(true);
    } catch (e: any) {
      setError(e.message || 'Error verifying OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  /* ── Member management ────────────────────────────────── */

  const addMember = () => {
    if (members.length >= 5) return;
    setMembers([...members, { ...emptyMember }]);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, field: keyof StallMember, value: string) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  /* ── Validation ───────────────────────────────────────── */

  const validate = (): string | null => {
    if (!category) return 'Please select a stall category';
    if (isCuStudent === null) return 'Please tell us whether you are a CU student';
    if (!fullName.trim() || fullName.trim().length < 2) return 'Full name is required (min 2 chars)';
    if (!email.trim() || !email.includes('@')) return 'Valid email is required';
    if (!otpVerified) return 'Please verify your email using OTP before proceeding.';
    if (numberOfDays === 1 && !selectedDate) return 'Please select a date for your 1-day stall';
    if (!phone.trim() || !/^[0-9]{10,15}$/.test(phone.trim())) return 'Valid phone number is required';
    if (isCuStudent && (!uid.trim() || !/^[A-Za-z0-9-]{6,20}$/.test(uid.trim()))) return 'Valid CU UID is required';
    if (isCuStudent && !idCardFile) return 'Please upload your CU ID card photo';
    if (!stallName.trim() || stallName.trim().length < 2) return 'Stall name is required (min 2 chars)';
    if (!stallDescription.trim() || stallDescription.trim().length < 10) return 'Stall description is required (min 10 chars)';

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim() || m.name.trim().length < 2) return `Member ${i + 1}: Name is required`;
      if (!m.email.trim() || !m.email.includes('@')) return `Member ${i + 1}: Valid email is required`;
      if (!m.phone.trim() || !/^[0-9]{10,15}$/.test(m.phone.trim())) return `Member ${i + 1}: Valid phone required`;
    }

    return null;
  };

  const uploadIdCard = async (): Promise<string> => {
    if (!idCardFile) throw new Error('Please upload your CU ID card photo');

    const formData = new FormData();
    formData.append('idCard', idCardFile);

    const res = await fetch('/api/upload/stall-id-card', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload ID card');
    }

    return data.url;
  };

  /* ── Submit ───────────────────────────────────────────── */

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const selectedCategory = category;
      if (!selectedCategory || isCuStudent === null) {
        throw new Error('Please complete the stall category details');
      }

      const cuStudentSelected = isCuStudent === true;
      const idCardUrl = cuStudentSelected ? await uploadIdCard() : '';
      const body = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        college: college.trim(),
        stallCategory: selectedCategory,
        isPremium,
        isCuStudent: cuStudentSelected,
        uid: cuStudentSelected ? uid.trim().toUpperCase() : '',
        idCardUrl,
        numberOfDays,
        selectedDate: numberOfDays === 1 ? selectedDate : "",
        stallName: stallName.trim(),
        stallDescription: stallDescription.trim(),
        members: members
          .filter((m) => m.name.trim())
          .map((m) => ({
            name: m.name.trim(),
            email: m.email.trim().toLowerCase(),
            phone: m.phone.trim(),
          })),
      };

      const res = await fetch('/api/algolympia/stalls', {
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

      setSubmitted(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBasePrice = category ? getStallBasePrice(category, isCuStudent === true) : 0;
  const selectedTotalPrice = category
    ? getStallTotalPrice({
        category,
        isCuStudent: isCuStudent === true,
        isPremium,
        numberOfDays,
      })
    : 0;

  /* ═══════════════════════════════════════════════════════ */
  /*  RENDER                                                */
  /* ═══════════════════════════════════════════════════════ */

  /* ── Success ──────────────────────────────────────────── */
  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          Stall Registered!
        </h3>
        <p className="mx-auto mb-6 max-w-lg text-foreground/70">
          Your stall <span className="font-semibold text-primary">{stallName}</span> has been
          successfully registered for AlgOlympia.
        </p>
        <p className="text-sm text-foreground/50">
          We&apos;ll reach out to you at <span className="font-medium text-foreground/70">{email}</span> with further details.
        </p>
      </div>
    );
  }

  /* ── Category Picker ──────────────────────────────────── */
  if (!category) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-5 backdrop-blur-xl sm:p-7 shadow-[0_0_80px_rgba(255,210,50,0.06)]">
        <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-accent/8 blur-3xl" />

        <div className="text-center flex flex-col items-center mb-8">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Select Category
          </p>
          <h2 className="mt-2 text-2xl font-bold text-foreground">Choose your stall type</h2>
          <p className="mt-2 text-sm text-foreground/55 max-w-md">
            Showcase your products, host games, or serve delicious food at our fest!
          </p>
        </div>

        <div className="mb-8 rounded-2xl border border-primary/15 bg-primary/[0.03] p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-primary">Are you a Chandigarh University student?</p>
            <p className="mt-1 text-xs text-foreground/55">
              CU students will be asked for a UID and an ID card photo before submitting the stall registration.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsCuStudent(true)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isCuStudent === true
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-primary/20 bg-black/20 text-foreground/70 hover:border-primary/40'
              }`}
            >
              <div className="font-semibold">Yes, I&apos;m a CU student</div>
              <div className="mt-1 text-xs text-foreground/55">UID and ID card photo will be required.</div>
            </button>
            <button
              type="button"
              onClick={() => setIsCuStudent(false)}
              className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                isCuStudent === false
                  ? 'border-primary bg-primary/15 text-foreground'
                  : 'border-primary/20 bg-black/20 text-foreground/70 hover:border-primary/40'
              }`}
            >
              <div className="font-semibold">No, I&apos;m not a CU student</div>
              <div className="mt-1 text-xs text-foreground/55">Regular stall pricing will apply.</div>
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 mb-8">
          {/* Products & Games */}
          <button
            type="button"
            onClick={() => setCategory('products_games')}
            disabled={isCuStudent === null}
            className="group relative flex flex-col rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/[0.06] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </span>
              <span className="text-xl font-bold font-mono text-primary">
                ₹{getStallBasePrice('products_games', isCuStudent === true).toLocaleString('en-IN')}/day
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Products or Games</h3>
              <p className="mt-1 text-xs text-foreground/60 leading-relaxed">
                Set up a stall for selling physical products, merchandise, or hosting engaging games.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-foreground/55">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Prime location setup
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Basic table and chairs provided
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Power outlet access
              </li>
            </ul>
          </button>

          {/* Food & Beverage */}
          <button
            type="button"
            onClick={() => setCategory('food_beverage')}
            disabled={isCuStudent === null}
            className="group relative flex flex-col rounded-2xl border border-primary/20 bg-primary/[0.03] p-6 text-left transition-all duration-300 hover:scale-[1.02] hover:border-primary/40 hover:bg-primary/[0.06] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Coffee className="h-5 w-5 text-primary" />
              </span>
              <span className="text-xl font-bold font-mono text-primary">
                ₹{getStallBasePrice('food_beverage', isCuStudent === true).toLocaleString('en-IN')}/day
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Food & Beverage (FNF)</h3>
              <p className="mt-1 text-xs text-foreground/60 leading-relaxed">
                Set up a stall focused on food, beverages, snacks, and culinary experiences.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-sm text-foreground/55">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dedicated food stall area
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Dustbin & hygiene provisions
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" /> High-capacity power outlet access
              </li>
            </ul>
          </button>
        </div>

        {/* Premium Upgrade Selection (before form) */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 transition-colors hover:bg-accent/10">
          <label className="flex items-start gap-4 cursor-pointer">
            {/* <div className="flex h-5 items-center mt-0.5">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="h-5 w-5 rounded border-accent/40 bg-black/50 text-accent focus:ring-accent focus:ring-offset-background"
              />
            </div> */}
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="font-bold text-accent">Premium Upgrade Available (+₹2,000/day)</span>
              </div>
              <p className="mt-1 text-sm text-foreground/60">
                Upgrade any stall type to Premium for a larger space in a high-footfall area! Highly recommended for maximum visibility.
              </p>
            </div>
          </label>
        </div>
      </div>
    );
  }

  /* ── Form ─────────────────────────────────────────────── */
  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-5 backdrop-blur-xl sm:p-7 shadow-[0_0_80px_rgba(255,210,50,0.06)]">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-accent/8 blur-3xl" />

      <div className="relative space-y-8">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
          <button
            onClick={() => setCategory(null)}
            className="group flex items-center gap-2 text-sm text-foreground/50 transition-colors hover:text-foreground"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:bg-white/10">
              <ChevronLeft className="h-4 w-4" />
            </span>
            Back
          </button>
          <div className="flex items-center gap-3 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm">
            <span className="text-primary font-medium">Selected:</span>
            <span className="text-foreground/80 font-semibold">
              {category === 'products_games' ? 'Products & Games' : 'Food & Beverage'}
            </span>
            <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-foreground/65">
              {isCuStudent ? 'CU Student' : 'Non-CU'}
            </span>
            {isPremium && (
              <span className="flex items-center gap-1 text-xs font-bold text-accent bg-accent/10 px-2 py-0.5 rounded-full ml-1">
                <Crown className="h-3 w-3" /> PREMIUM
              </span>
            )}
            <span className="font-mono text-primary/70">
              ₹{selectedTotalPrice.toLocaleString('en-IN')} for {numberOfDays} day{numberOfDays > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Booking Duration */}
        <div>
          <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Store className="h-4 w-4" />
              Booking Duration
            </div>
            <p className="text-xs text-foreground/45">
              Select how many days you would like to book your stall.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Number of Days *</label>
              <select
                value={numberOfDays}
                onChange={(e) => {
                  setNumberOfDays(Number(e.target.value));
                  if (Number(e.target.value) === 2) setSelectedDate('');
                }}
                className={inputCls}
              >
                <option value={1} className="bg-black/80">1 Day</option>
                <option value={2} className="bg-black/80">2 Days</option>
              </select>
            </div>
            {numberOfDays === 1 && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className={labelCls}>Select Date *</label>
                <select
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className={inputCls}
                >
                  <option value="" disabled className="text-gray-500 bg-black/80">Choose Date</option>
                  <option value="20 April 2026" className="bg-black/80">20 April 2026</option>
                  <option value="21 April 2026" className="bg-black/80">21 April 2026</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Personal Details */}
        <div>
          <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <User className="h-4 w-4" />
              Personal Details
            </div>
            <p className="text-xs text-foreground/45">
              Your contact information as the stall organizer.
            </p>
          </div>

          <div className="mb-4 rounded-xl border border-primary/15 bg-primary/[0.03] px-4 py-3 text-sm text-foreground/70">
            <span className="font-medium text-primary">{isCuStudent ? 'CU student pricing' : 'Non-CU pricing'}:</span>{' '}
            Base stall fee is <span className="font-mono text-foreground">₹{selectedBasePrice.toLocaleString('en-IN')}/day</span> for this category.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  disabled={otpVerified || otpSent}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={inputCls}
                />
                {!otpVerified && !otpSent && (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !email}
                    className="shrink-0 rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                  </button>
                )}
              </div>
              
              {otpSent && !otpVerified && (
                <div className="mt-3 flex gap-2 animate-in fade-in slide-in-from-top-2">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    className={`${inputCls} font-mono tracking-widest text-center`}
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={otpLoading || otp.length < 6}
                    className="shrink-0 rounded-xl border border-primary bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                  >
                    {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                  </button>
                </div>
              )}

              {otpVerified && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Email verified successfully
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>College / Institution Area <span className="text-foreground/40">(Optional)</span></label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                placeholder="e.g. UIE, Chandigarh University"
                className={inputCls}
              />
            </div>
          </div>

          {isCuStudent && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className={labelCls}>CU UID *</label>
                <input
                  type="text"
                  value={uid}
                  onChange={(e) => setUid(e.target.value.toUpperCase())}
                  placeholder="Enter your CU UID"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>CU ID Card Photo *</label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(e) => setIdCardFile(e.target.files?.[0] || null)}
                  className={`${inputCls} file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground`}
                />
                <p className="mt-2 text-xs text-foreground/45">
                  Upload a clear JPG, PNG, or WEBP image up to 5 MB.
                </p>
                {idCardFile && (
                  <p className="mt-2 text-xs text-foreground/55">
                    Selected file: <span className="text-foreground/75">{idCardFile.name}</span>
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stall Details */}
        <div>
          <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Store className="h-4 w-4" />
              Stall Information
            </div>
            <p className="text-xs text-foreground/45">
              Tell us about your stall — what you&apos;ll be showcasing or selling.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className={labelCls}>Stall Name (Display Name) *</label>
              <input
                type="text"
                value={stallName}
                onChange={(e) => setStallName(e.target.value)}
                placeholder="What should we call your stall?"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Stall Description & Requirements *</label>
              <textarea
                value={stallDescription}
                onChange={(e) => setStallDescription(e.target.value)}
                placeholder="Describe what your stall will feature, any special requirements (power outlets, space, tables, etc.)"
                rows={4}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Premium Upgrade Selection (inside form) */}
        <div className="rounded-xl border border-accent/20 bg-accent/5 p-5 transition-colors hover:bg-accent/10">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="flex h-5 items-center mt-0.5">
              <input
                type="checkbox"
                checked={isPremium}
                onChange={(e) => setIsPremium(e.target.checked)}
                className="h-5 w-5 rounded border-accent/40 bg-black/50 text-accent focus:ring-accent focus:ring-offset-background"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="font-bold text-accent">Premium Upgrade Available (+₹2,000/day)</span>
              </div>
              <p className="mt-1 text-sm text-foreground/60">
                Upgrade any stall type to Premium for a larger space in a high-footfall area! Highly recommended for maximum visibility.
              </p>
            </div>
          </label>
        </div>

        {/* Group Members */}
        <div>
          <div className="rounded-xl border border-primary/10 bg-primary/[0.03] p-4 mb-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary mb-1">
              <Users className="h-4 w-4" />
              Add Group Members <span className="text-foreground/40 font-normal">(Optional)</span>
            </div>
            <p className="text-xs text-foreground/45">
              You can add up to 5 additional members to manage the stall with you.
            </p>
          </div>

          {members.length > 0 && (
            <div className="space-y-4 mb-4">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                      <User className="h-4 w-4 text-primary" />
                      Member {index + 1}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div>
                      <label className={labelCls}>Full Name *</label>
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => updateMember(index, 'name', e.target.value)}
                        placeholder="Member Name"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Email *</label>
                      <input
                        type="email"
                        value={member.email}
                        onChange={(e) => updateMember(index, 'email', e.target.value)}
                        placeholder="email@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Phone *</label>
                      <input
                        type="tel"
                        value={member.phone}
                        onChange={(e) => updateMember(index, 'phone', e.target.value)}
                        placeholder="Phone number"
                        className={inputCls}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {members.length < 5 && (
            <button
              type="button"
              onClick={addMember}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-primary/30 bg-primary/[0.03] px-4 py-2.5 text-sm font-medium text-primary transition-all hover:border-primary/50 hover:bg-primary/[0.06]"
            >
              <Plus className="h-4 w-4" />
              Add Member {members.length > 0 ? `(${members.length}/5)` : ''}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-primary bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Register Stall
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
