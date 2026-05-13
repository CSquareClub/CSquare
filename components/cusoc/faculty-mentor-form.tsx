'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const inputCls = 'w-full rounded-xl border border-primary/20 bg-input dark:bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';
const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

export default function FacultyMentorApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    linkedinProfile: '',
    departmentName: '',
    employeeId: '',
    officialEmail: '',
    researchAreas: [] as string[],
    areasOfExpertise: [] as string[],
    mentorshipGoals: '',
    availableHours: '3–5 Hours',
    preferredMode: 'Hybrid',
    mentorshipStyle: '',
    previousExperience: '',
    maxMentees: '',
    canProvideFeedback: true,
    canGuideProjects: true,
    canReviewCode: true,
    declarationAccepted: false,
  });

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);

  const researchAreas = [
    'Artificial Intelligence',
    'Machine Learning',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Cloud Computing',
    'Cybersecurity',
    'IoT',
    'Blockchain',
    'Software Engineering',
    'Other',
  ];

  const expertise = [
    'Research Guidance',
    'Project Development',
    'Code Review',
    'System Design',
    'Architecture',
    'Algorithm Design',
    'Problem Solving',
    'Technical Writing',
    'Presentation Skills',
    'Career Guidance',
    'Other',
  ];

  // Reset OTP when official email changes
  useEffect(() => {
    setOtp('');
    setOtpSent(false);
    setOtpVerified(false);
    setOtpMessage(null);
    setOtpError(null);
    setOtpCooldown(0);
  }, [formData.officialEmail]);

  // OTP cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setTimeout(() => setOtpCooldown((p) => p - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpCooldown]);

  const handleCheckboxGroup = (name: string, value: string) => {
    setFormData((prev) => {
      const current = prev[name as keyof typeof formData] as string[];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [name]: [...current, value] };
      }
    });
  };

  // OTP actions
  const sendOtp = async () => {
    const email = formData.officialEmail.trim().toLowerCase();
    if (!email || !email.includes('@cumail.in')) {
      setOtpError('Official email must be a @cumail.in address');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpMessage(null);

    try {
      const res = await fetch('/api/cusoc/mentor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-otp', email, fullName: formData.fullName.trim() }),
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
    const email = formData.officialEmail.trim().toLowerCase();
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
      const res = await fetch('/api/cusoc/mentor-application', {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Check OTP verification for faculty mentors
    if (!otpVerified) {
      setError('Please verify your official email with OTP before submitting');
      setIsLoading(false);
      return;
    }

    try {
      const submitData = {
        mentorType: 'faculty',
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        linkedinProfile: formData.linkedinProfile,
        departmentName: formData.departmentName,
        employeeId: formData.employeeId,
        officialEmail: formData.officialEmail,
        researchAreas: formData.researchAreas.join(', '),
        areasOfExpertise: formData.areasOfExpertise.join(', '),
        mentorshipGoals: formData.mentorshipGoals,
        availableHours: formData.availableHours,
        preferredMode: formData.preferredMode,
        mentorshipStyle: formData.mentorshipStyle,
        previousExperience: formData.previousExperience,
        maxMentees: formData.maxMentees,
        canProvideFeedback: formData.canProvideFeedback,
        canGuideProjects: formData.canGuideProjects,
        canReviewCode: formData.canReviewCode,
        declarationAccepted: formData.declarationAccepted,
      };

      const res = await fetch('/api/cusoc/mentor-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Submission failed');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-primary/20 bg-primary/5 dark:bg-black/30 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold text-foreground">Application Submitted!</h3>
        <p className="text-foreground/70">Your mentor application has been received. We'll review it and get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-black/5 dark:bg-black/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Faculty Mentor Application
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} onInvalid={(e) => {
        e.preventDefault();
        toast.error('Please fill in all required fields correctly.');
        const form = e.currentTarget;
        const firstInvalid = form.querySelector(':invalid') as HTMLElement;
        if (firstInvalid) {
          firstInvalid.focus();
        }
      }} className="space-y-8">
        {/* Basic Information */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input
                type="text"
                className={inputCls}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Contact Number</label>
                <input
                  type="tel"
                  className={inputCls}
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>LinkedIn Profile (Optional)</label>
              <input
                type="url"
                className={inputCls}
                value={formData.linkedinProfile}
                onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Academic Background */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Academic Background</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Department</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Employee ID</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Official Email</label>
              <input
                type="email"
                className={inputCls}
                value={formData.officialEmail}
                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                placeholder="name@cumail.in"
                required
              />
            </div>

            {/* OTP Verification - Always visible for faculty mentors */}
            <div className="space-y-3 p-4 rounded-xl border border-primary/20 bg-primary/5 dark:bg-black/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Email Verification Required</span>
                {otpVerified && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              </div>
              <p className="text-xs text-foreground/70">
                Please verify your official @cumail.in email address to proceed with the application.
              </p>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={otpLoading || otpCooldown > 0 || !formData.officialEmail?.includes('@cumail.in')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                  {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Send OTP to Email'}
                </button>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground">Enter 6-digit OTP sent to {formData.officialEmail}</label>
                    <input
                      type="text"
                      className={inputCls}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otpLoading || otpVerified}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {otpLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                      Verify OTP
                    </button>
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={otpLoading || otpCooldown > 0}
                      className="px-4 py-2 rounded-lg border border-primary/20 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {otpCooldown > 0 ? `Resend in ${otpCooldown}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}

              {otpMessage && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">{otpMessage}</p>
              )}
              {otpError && (
                <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>Research Areas / Specializations</label>
              <div className="grid grid-cols-2 gap-3">
                {researchAreas.map((area) => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.researchAreas.includes(area)}
                      onChange={() => handleCheckboxGroup('researchAreas', area)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{area}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Expertise & Skills */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Expertise & Skills</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Areas of Expertise</label>
              <div className="grid grid-cols-2 gap-3">
                {expertise.map((area) => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.areasOfExpertise.includes(area)}
                      onChange={() => handleCheckboxGroup('areasOfExpertise', area)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Mentorship Goals</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.mentorshipGoals}
                onChange={(e) => setFormData({ ...formData, mentorshipGoals: e.target.value })}
                placeholder="What do you want to achieve as a faculty mentor? How can you help students grow?"
                required
              />
            </div>

            <div>
              <label className={labelCls}>Mentorship Approach (Optional)</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.mentorshipStyle}
                onChange={(e) => setFormData({ ...formData, mentorshipStyle: e.target.value })}
                placeholder="Describe your mentoring approach and philosophy"
              />
            </div>

            <div>
              <label className={labelCls}>Previous Mentoring Experience (Optional)</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                placeholder="Describe your experience mentoring students or junior faculty"
              />
            </div>
          </div>
        </div>

        {/* Availability & Preferences */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Availability & Preferences</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Available Hours per Week</label>
                <select
                  className={inputCls}
                  value={formData.availableHours}
                  onChange={(e) => setFormData({ ...formData, availableHours: e.target.value })}
                >
                  <option>1–2 Hours</option>
                  <option>3–5 Hours</option>
                  <option>5+ Hours</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Preferred Collaboration Mode</label>
                <select
                  className={inputCls}
                  value={formData.preferredMode}
                  onChange={(e) => setFormData({ ...formData, preferredMode: e.target.value })}
                >
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Maximum Number of Mentees</label>
              <input
                type="number"
                className={inputCls}
                value={formData.maxMentees}
                onChange={(e) => setFormData({ ...formData, maxMentees: e.target.value })}
                min="1"
              />
            </div>
          </div>
        </div>

        {/* Support Capabilities */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">What Can You Provide?</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.canProvideFeedback}
                onChange={(e) => setFormData({ ...formData, canProvideFeedback: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground/80">Provide regular feedback on mentees' work</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.canGuideProjects}
                onChange={(e) => setFormData({ ...formData, canGuideProjects: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground/80">Guide on research and project planning</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.canReviewCode}
                onChange={(e) => setFormData({ ...formData, canReviewCode: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground/80">Review code and technical implementations</span>
            </label>
          </div>
        </div>

        {/* Declaration */}
        <div>
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.declarationAccepted}
              onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
              className="mt-1 h-4 w-4"
              required
            />
            <span className="text-sm text-foreground/80">
              I commit to being an active mentor throughout the CUSoC program and will maintain academic integrity and ethical standards.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-white dark:text-black transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
}
