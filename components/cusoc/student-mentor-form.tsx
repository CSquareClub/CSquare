'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const inputCls = 'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';
const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

export default function StudentMentorApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    contactNumber: '',
    linkedinProfile: '',
    rollNumber: '',
    cuEmail: '',
    year: '3rd Year',
    skillAreas: [] as string[],
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

  const skillAreas = [
    'Web Development',
    'Mobile Development',
    'Backend Development',
    'Frontend Development',
    'Full-Stack Development',
    'Data Science',
    'Machine Learning',
    'DevOps',
    'Cloud Computing',
    'Open Source',
    'Competitive Programming',
    'UI/UX Design',
    'Other',
  ];

  const expertise = [
    'Coding',
    'Problem Solving',
    'Web Development',
    'Mobile Development',
    'Data Structures',
    'Algorithms',
    'System Design',
    'Project Development',
    'Code Review',
    'Technical Writing',
    'Other',
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const submitData = {
        mentorType: 'student',
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        linkedinProfile: formData.linkedinProfile,
        rollNumber: formData.rollNumber,
        cuEmail: formData.cuEmail,
        year: formData.year,
        skillAreas: formData.skillAreas.join(', '),
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
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <h3 className="mb-2 text-3xl font-bold text-foreground">Application Submitted!</h3>
        <p className="text-foreground/70">Your mentor application has been received. We'll review it and get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-black/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Student Mentor Application
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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

        {/* Academic Information */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Academic Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Roll Number</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>CU Email</label>
                <input
                  type="email"
                  className={inputCls}
                  value={formData.cuEmail}
                  onChange={(e) => setFormData({ ...formData, cuEmail: e.target.value })}
                  placeholder="name@cumail.in"
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Current Year</label>
              <select
                className={inputCls}
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>Final Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills & Expertise */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">Skills & Expertise</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Skill Areas</label>
              <div className="grid grid-cols-2 gap-3">
                {skillAreas.map((area) => (
                  <label key={area} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.skillAreas.includes(area)}
                      onChange={() => handleCheckboxGroup('skillAreas', area)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{area}</span>
                  </label>
                ))}
              </div>
            </div>

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
                placeholder="What do you want to achieve as a peer mentor? How can you help fellow students?"
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
                placeholder="Describe your mentoring style and approach"
              />
            </div>

            <div>
              <label className={labelCls}>Previous Mentoring Experience (Optional)</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.previousExperience}
                onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                placeholder="Have you helped peers or juniors? Describe your experience."
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
              <span className="text-sm text-foreground/80">Provide feedback and guidance on work</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.canGuideProjects}
                onChange={(e) => setFormData({ ...formData, canGuideProjects: e.target.checked })}
                className="h-4 w-4"
              />
              <span className="text-sm text-foreground/80">Guide on project selection and planning</span>
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
              I commit to being a supportive and ethical peer mentor throughout the CUSoC program and will help my mentees learn and grow.
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50"
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
