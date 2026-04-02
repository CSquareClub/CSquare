'use client';

import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, CheckCircle2, CircleGauge, Sparkles, Target } from 'lucide-react';
import { useTheme } from 'next-themes';

const supportOptions = [
  'Project ideas shortlist',
  'Mentor guidance',
  'Weekly accountability',
  'Resume + profile review',
  'Open-source onboarding',
  'Interview preparation',
] as const;

const registrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Please enter your full name'),
  uid: z
    .string()
    .trim()
    .min(4, 'UID is required')
    .regex(/^[a-zA-Z0-9-]+$/, 'UID should contain only letters, numbers, or hyphens'),
  department: z.string().trim().min(2, 'Department is required'),
  yearOfStudy: z.enum(['1st', '2nd', '3rd', '4th'], {
    errorMap: () => ({ message: 'Please select your year of study' }),
  }),
  gsocEmail: z.string().trim().email('Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9]{10,15}$/, 'Enter a valid phone number'),
  codingLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select your coding level' }),
  }),
  primaryStack: z.string().trim().min(2, 'Tell us your main tech stack'),
  supportNeeded: z.array(z.string()).min(1, 'Select at least one support area'),
  expectations: z.string().trim().min(20, 'Please share expectations in at least 20 characters'),
  commitment: z.boolean().refine((value) => value, {
    message: 'You must confirm your commitment',
  }),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const countFilled = (data: Partial<RegistrationFormData>) => {
  const checks = [
    Boolean(data.fullName?.trim()),
    Boolean(data.uid?.trim()),
    Boolean(data.department?.trim()),
    Boolean(data.yearOfStudy),
    Boolean(data.gsocEmail?.trim()),
    Boolean(data.phone?.trim()),
    Boolean(data.codingLevel),
    Boolean(data.primaryStack?.trim()),
    Boolean(data.supportNeeded && data.supportNeeded.length > 0),
    Boolean(data.expectations?.trim()),
    Boolean(data.commitment),
  ];

  return checks.filter(Boolean).length;
};

export default function JoinForm() {
  const { resolvedTheme } = useTheme();
  const [mountedTheme, setMountedTheme] = useState(false);
  const isDarkTheme = mountedTheme ? resolvedTheme !== 'light' : true;

  useEffect(() => {
    setMountedTheme(true);
  }, []);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      supportNeeded: [],
      commitment: false,
    },
  });

  const watchedValues = watch();
  const progress = useMemo(() => {
    const filled = countFilled(watchedValues);
    return Math.round((filled / 11) * 100);
  }, [watchedValues]);

  const onSubmit = async (data: RegistrationFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log('CUSoC registration submitted:', data);
      setSubmitted(true);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className={`rounded-[34px] p-10 text-center backdrop-blur-xl ${
          isDarkTheme
            ? 'border border-red-400/20 bg-white/[0.04] shadow-[0_0_80px_rgba(220,38,38,0.12)]'
            : 'border border-[#fecaca] bg-white/95 shadow-[0_18px_50px_rgba(15,23,42,0.08)]'
        }`}
      >
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold tracking-tight text-foreground">Registration submitted</h3>
        <p className="mx-auto max-w-lg text-foreground/70">
          Your response is recorded. CUSoC team will review your details and connect with the right mentoring support.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`relative overflow-hidden rounded-[34px] p-6 backdrop-blur-xl sm:p-8 ${
        isDarkTheme
          ? 'border border-white/12 bg-black/45 shadow-[0_0_90px_rgba(220,38,38,0.14)]'
          : 'border border-[#fecaca] bg-white/95 shadow-[0_20px_65px_rgba(15,23,42,0.08)]'
      }`}
    >
      <div className="pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full bg-red-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-rose-400/10 blur-3xl" />

      {error && (
        <div className={`mb-6 flex gap-3 rounded-2xl border p-4 ${isDarkTheme ? 'border-red-500/30 bg-red-500/10' : 'border-red-300/50 bg-red-50'}`}>
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className={`text-sm ${isDarkTheme ? 'text-red-100' : 'text-red-700'}`}>{error}</p>
        </div>
      )}

      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] ${isDarkTheme ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-red-300 bg-red-50 text-red-700'}`}>
            <Sparkles className="h-3.5 w-3.5" />
            CUSoC Registration
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Single Registration Form</h2>
          <p className="mt-1 text-sm text-foreground/65">Fill details once and get matched with the right mentoring support.</p>
        </div>

        <div className={`w-full rounded-2xl p-4 sm:w-64 ${isDarkTheme ? 'border border-white/10 bg-white/[0.03]' : 'border border-[#fecaca] bg-[#fff1f2]'}`}>
          <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-foreground/60">
            <span>Completion</span>
            <span>{progress}%</span>
          </div>
          <div className={`h-2 overflow-hidden rounded-full ${isDarkTheme ? 'bg-white/10' : 'bg-[#fee2e2]'}`}>
            <div className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <section className={`rounded-3xl p-5 ${isDarkTheme ? 'border border-white/10 bg-black/25' : 'border border-[#fecaca] bg-[#fff1f2]'}`}>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/65">
            <Target className="h-4 w-4 text-red-400" />
            Basic Details
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
              <input
                id="fullName"
                type="text"
                {...register('fullName')}
                placeholder="Enter your full name"
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.fullName && <p className="mt-1.5 text-sm text-red-400">{errors.fullName.message}</p>}
            </div>

            <div>
              <label htmlFor="uid" className="mb-1.5 block text-sm font-medium text-foreground">UID</label>
              <input
                id="uid"
                type="text"
                {...register('uid')}
                placeholder="22BCS12345"
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.uid && <p className="mt-1.5 text-sm text-red-400">{errors.uid.message}</p>}
            </div>

            <div>
              <label htmlFor="department" className="mb-1.5 block text-sm font-medium text-foreground">Department</label>
              <input
                id="department"
                type="text"
                {...register('department')}
                placeholder="Computer Science and Engineering"
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.department && <p className="mt-1.5 text-sm text-red-400">{errors.department.message}</p>}
            </div>

            <div>
              <label htmlFor="yearOfStudy" className="mb-1.5 block text-sm font-medium text-foreground">Year of Study</label>
              <select
                id="yearOfStudy"
                {...register('yearOfStudy')}
                defaultValue=""
                className={`w-full rounded-xl border px-4 py-3 text-foreground focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              >
                <option value="" disabled>Select year</option>
                <option value="1st">1st Year</option>
                <option value="2nd">2nd Year</option>
                <option value="3rd">3rd Year</option>
                <option value="4th">4th Year</option>
              </select>
              {errors.yearOfStudy && <p className="mt-1.5 text-sm text-red-400">{errors.yearOfStudy.message}</p>}
            </div>

            <div>
              <label htmlFor="gsocEmail" className="mb-1.5 block text-sm font-medium text-foreground">GSoC Email</label>
              <input
                id="gsocEmail"
                type="email"
                {...register('gsocEmail')}
                placeholder="name@example.com"
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.gsocEmail && <p className="mt-1.5 text-sm text-red-400">{errors.gsocEmail.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">Phone Number</label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="9876543210"
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.phone && <p className="mt-1.5 text-sm text-red-400">{errors.phone.message}</p>}
            </div>
          </div>
        </section>

        <section className={`rounded-3xl p-5 ${isDarkTheme ? 'border border-white/10 bg-black/25' : 'border border-[#fecaca] bg-[#fff1f2]'}`}>
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-foreground/65">
            <CircleGauge className="h-4 w-4 text-red-400" />
            Preparation Profile
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="codingLevel" className="mb-1.5 block text-sm font-medium text-foreground">Coding Level</label>
              <select
                id="codingLevel"
                {...register('codingLevel')}
                defaultValue=""
                className={`w-full rounded-xl border px-4 py-3 text-foreground focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              >
                <option value="" disabled>Select level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {errors.codingLevel && <p className="mt-1.5 text-sm text-red-400">{errors.codingLevel.message}</p>}
            </div>

            <div>
              <label htmlFor="primaryStack" className="mb-1.5 block text-sm font-medium text-foreground">Primary Tech Stack</label>
              <input
                id="primaryStack"
                type="text"
                {...register('primaryStack')}
                placeholder="React, Node.js, Python, C++, etc."
                className={`w-full rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
              />
              {errors.primaryStack && <p className="mt-1.5 text-sm text-red-400">{errors.primaryStack.message}</p>}
            </div>
          </div>

          <div className="mt-5">
            <label className="mb-2.5 block text-sm font-medium text-foreground">What support do you need?</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {supportOptions.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    isDarkTheme
                      ? 'border-white/10 bg-black/25 hover:border-red-400/35 hover:bg-white/[0.03]'
                      : 'border-[#fecaca] bg-white hover:border-red-400/45 hover:bg-[#fff1f2]'
                  }`}
                >
                  <input
                    type="checkbox"
                    value={option}
                    {...register('supportNeeded')}
                    className="h-4 w-4 rounded border-red-400/50 accent-red-500"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {errors.supportNeeded && <p className="mt-1.5 text-sm text-red-400">{errors.supportNeeded.message}</p>}
          </div>

          <div className="mt-5">
            <label htmlFor="expectations" className="mb-1.5 block text-sm font-medium text-foreground">What do you want from us?</label>
            <textarea
              id="expectations"
              rows={5}
              {...register('expectations')}
              placeholder="Write your expectations clearly: mentorship type, timeline, project support, and outcome you want from CUSoC."
              className={`w-full resize-none rounded-xl border px-4 py-3 text-foreground placeholder:text-foreground/35 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-400/20 ${isDarkTheme ? 'border-white/10 bg-black/30' : 'border-[#fecaca] bg-white'}`}
            />
            {errors.expectations && <p className="mt-1.5 text-sm text-red-400">{errors.expectations.message}</p>}
          </div>
        </section>
      </div>

      <div className={`mt-6 rounded-2xl border p-4 ${isDarkTheme ? 'border-white/10 bg-white/[0.02]' : 'border-[#fecaca] bg-[#fff1f2]'}`}>
        <label className="flex items-start gap-3 text-sm text-foreground/80">
          <input type="checkbox" {...register('commitment')} className="mt-0.5 h-4 w-4 rounded border-red-400/50 accent-red-500" />
          <span>I confirm these details are correct and I am committed to regular participation in the CUSoC mentoring process.</span>
        </label>
        {errors.commitment && <p className="mt-2 text-sm text-red-400">{errors.commitment.message}</p>}
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground/60">Keep your email and phone active for mentoring updates.</p>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-red-500 to-red-700 px-7 py-3 font-semibold text-white transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_35px_rgba(220,38,38,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Submitting...' : 'Submit Registration'}
        </button>
      </div>
    </form>
  );
}
