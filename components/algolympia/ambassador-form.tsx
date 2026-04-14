'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  GraduationCap,
  Sparkles,
  Zap,
  Mail,
  Smartphone,
  BookOpen,
  Calendar,
  Copy,
} from 'lucide-react';

/* ─── Styling Helpers ────────────────────────────────────── */

const inputCls =
  'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';

const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

/* ─── Component ──────────────────────────────────────────── */

export default function AmbassadorForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    department: '',
    year: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const validate = (): string | null => {
    if (!formData.name.trim() || formData.name.trim().length < 2) return 'Name is required (min 2 chars)';
    if (!formData.email.trim() || !formData.email.includes('@')) return 'Valid email is required';
    if (!formData.phone.trim() || !/^[0-9]{10,15}$/.test(formData.phone)) return 'Valid phone number is required';
    if (!formData.college.trim() || formData.college.trim().length < 2) return 'College/Institute name is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/algolympia/campus-ambassador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const json = await res.json();
      
      if (!res.ok) {
        if (json.issues && json.issues.length > 0) {
          const detail = json.issues[0];
          const path = detail.path ? detail.path.join('.') : '';
          throw new Error(`${path ? path + ': ' : ''}${detail.message}`);
        }
        if (res.status === 409 && json.referralCode) {
           setError(null);
           setReferralCode(json.referralCode);
           setSubmitted(true);
           return;
        }
        throw new Error(json.error || 'Registration failed');
      }

      setReferralCode(json.referralCode);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.08)]">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          Welcome, Ambassador!
        </h3>
        <p className="mx-auto mb-6 max-w-lg text-foreground/70">
          You are now an official Campus Ambassador for AlgOlympia.
        </p>

        <div className="mx-auto max-w-md rounded-xl border border-primary/20 bg-primary/5 p-6 shadow-interno">
          <h4 className="flex items-center justify-center gap-2 mb-2 text-sm font-semibold text-primary uppercase tracking-widest">
            <Zap className="h-4 w-4" /> Your Referral Code
          </h4>
          <p className="text-sm text-foreground/60 mb-5">
            Share this code with teams registering from your college. It helps us track your impact!
          </p>
          
          <div className="flex items-center justify-between gap-4 bg-black/40 rounded-xl p-4 border border-primary/30">
            <code className="text-2xl font-mono font-bold text-primary tracking-widest">
              {referralCode}
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                alert("Referral code copied!");
              }}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/20 hover:bg-primary text-primary hover:text-black transition-all"
              title="Copy code"
            >
              <Copy className="h-5 w-5" />
            </button>
          </div>
        </div>

        <p className="mt-8 text-sm text-foreground/50">
          An email has been sent to <span className="font-semibold text-foreground/80">{formData.email}</span> with your welcome package and code!
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-black/40 p-6 sm:p-8 backdrop-blur-xl shadow-[0_0_80px_rgba(255,210,50,0.06)]">
      <div className="pointer-events-none absolute -left-20 top-0 h-44 w-44 rounded-full bg-primary/10 blur-[80px]" />
      
      <div className="relative mb-8 text-center flex flex-col items-center">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Join The Squad
        </p>
        <p className="mt-2 text-sm text-foreground/55 max-w-md mx-auto">
          Become the face of AlgOlympia at your campus. Promote the event, bring teams together, and earn special rewards.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2">
            <User className="h-4 w-4" /> Personal Information
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={inputCls}
                />
                <User className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Email Address *</label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  className={inputCls}
                />
                <Mail className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Phone Number *</label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter 10-digit number"
                  className={inputCls}
                />
                <Smartphone className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
          </div>
        </div>

        {/* College Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider mb-2 border-b border-primary/10 pb-2 pt-4">
            <GraduationCap className="h-4 w-4" /> Academic Details
          </div>
          
          <div>
            <label className={labelCls}>College / Institute Name *</label>
            <div className="relative">
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. Chandigarh University"
                className={inputCls}
              />
              <GraduationCap className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Department <span className="text-foreground/40 font-normal">(Optional)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className={inputCls}
                />
                <BookOpen className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Year of Study <span className="text-foreground/40 font-normal">(Optional)</span></label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="e.g. 2nd Year, 2026"
                  className={inputCls}
                />
                <Calendar className="absolute right-4 top-3.5 h-5 w-5 text-foreground/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4 border-t border-primary/10">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 rounded-xl border border-primary bg-primary px-6 py-4 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,210,50,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Become an Ambassador
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
