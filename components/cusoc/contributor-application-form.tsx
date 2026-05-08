'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles, UploadCloud, X } from 'lucide-react';

const inputCls =
  'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';
const labelCls = 'mb-1.5 block text-sm font-medium text-foreground/90';

export default function ContributorApplicationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // SECTION 1 — Basic Information
    fullName: '',
    email: '',
    contactNumber: '',
    institution: '',
    degreeProgram: '',
    yearOfStudy: '',
    linkedinProfile: '',
    githubProfile: '',
    resumeFile: null as File | null,

    // SECTION 2 — Technical Background
    areasOfInterest: [] as string[],
    technicalSkills: '',
    comfortableWith: [] as string[],
    technicalConfidence: 3,

    // SECTION 3 — Technical Projects & Experience
    bestProject: '',
    projectLinks: '',
    openSourceContributions: '',
    teamExperience: '',

    // SECTION 4 — Statement of Purpose
    whyJoinCusoc: '',
    learningExpectations: '',
    whySelectPilot: '',

    // SECTION 5 — Learning Potential & Commitment
    recentlyLearned: '',
    participationExperience: [] as string[],
    weeklyAvailability: '',

    // SECTION 6 — Project Preferences
    preferredDomains: [] as string[],
    preferredRoles: [] as string[],
    preferredMode: '',

    // SECTION 7 — Declaration
    declarationAccepted: false,
  });

  const areasOfInterestOptions = [
    'Artificial Intelligence / Machine Learning',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Cybersecurity',
    'Cloud / DevOps',
    'UI/UX',
    'Open Source',
    'Research',
    'IoT / Embedded Systems',
    'Blockchain',
    'Automation',
    'Other',
  ];

  const comfortableWithOptions = [
    'Git/GitHub',
    'REST APIs',
    'Linux',
    'Docker',
    'Research Writing',
    'Team Collaboration',
    'Agile/Scrum',
    'Testing & Debugging',
  ];

  const participationOptions = [
    'Hackathons',
    'Open Source Programs',
    'Research Projects',
    'Freelancing',
    'Internships',
    'Technical Clubs',
    'Competitive Programming',
    'Community Events',
    'None',
  ];

  const preferredDomainsOptions = [
    'AI/ML',
    'Research',
    'Web Development',
    'Mobile Apps',
    'Cybersecurity',
    'Open Source',
    'Institutional Tools',
    'Data Science',
    'Automation',
    'IoT',
  ];

  const preferredRolesOptions = [
    'Developer',
    'Research Contributor',
    'UI/UX Designer',
    'Technical Writer',
    'Data Analyst',
    'QA/Testing',
  ];

  const handleCheckboxGroup = (name: keyof typeof formData, value: string) => {
    setFormData((prev) => {
      const current = prev[name] as string[];
      if (current.includes(value)) {
        return { ...prev, [name]: current.filter((item) => item !== value) };
      } else {
        return { ...prev, [name]: [...current, value] };
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Resume file must be 5 MB or less');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Only PDF format is recommended/allowed for resume');
        return;
      }
      setError(null);
      setFormData({ ...formData, resumeFile: file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.resumeFile) {
      setError('Please upload your resume in PDF format.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Upload Resume
      const uploadData = new FormData();
      uploadData.append('resume', formData.resumeFile);

      const uploadRes = await fetch('/api/upload/resume', {
        method: 'POST',
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || 'Failed to upload resume');
      }
      
      const resumeUrl = uploadJson.url;

      // 2. Submit Application
      const submitData = {
        fullName: formData.fullName,
        email: formData.email,
        contactNumber: formData.contactNumber,
        institution: formData.institution,
        degreeProgram: formData.degreeProgram,
        yearOfStudy: formData.yearOfStudy,
        linkedinProfile: formData.linkedinProfile,
        githubProfile: formData.githubProfile,
        resumeUrl: resumeUrl,

        areasOfInterest: formData.areasOfInterest.join(', '),
        technicalSkills: formData.technicalSkills,
        comfortableWith: formData.comfortableWith.join(', '),
        technicalConfidence: formData.technicalConfidence,

        bestProject: formData.bestProject,
        projectLinks: formData.projectLinks,
        openSourceContributions: formData.openSourceContributions,
        teamExperience: formData.teamExperience,

        whyJoinCusoc: formData.whyJoinCusoc,
        learningExpectations: formData.learningExpectations,
        whySelectPilot: formData.whySelectPilot,

        recentlyLearned: formData.recentlyLearned,
        participationExperience: formData.participationExperience.join(', '),
        weeklyAvailability: formData.weeklyAvailability,

        preferredDomains: formData.preferredDomains.join(', '),
        preferredRoles: formData.preferredRoles.join(', '),
        preferredMode: formData.preferredMode,

        declarationAccepted: formData.declarationAccepted,
      };

      const res = await fetch('/api/cusoc/contributor-application', {
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
      <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl shadow-2xl">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
        </div>
        <h3 className="mb-3 text-3xl font-bold text-foreground">Application Received!</h3>
        <p className="text-lg text-foreground/70">
          Thank you for applying to the CUSoC Pilot Program. Our team will review your application and get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-black/40 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
      <div className="mb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-widest text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]">
          <Sparkles className="h-4 w-4" />
          Pilot Program Form
        </p>
        <p className="text-sm text-foreground/60 mt-2">Expected time: 10–15 minutes maximum</p>
      </div>

      {error && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-5 shadow-lg">
          <AlertCircle className="h-6 w-6 text-red-400 shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* SECTION 1 — Basic Information */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 1 — Basic Information</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>1. Full Name</label>
              <input
                type="text"
                className={inputCls}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>2. Email Address</label>
                <input
                  type="email"
                  className={inputCls}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>3. Contact Number</label>
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
              <label className={labelCls}>4. University / Institution Name</label>
              <input
                type="text"
                className={inputCls}
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>5. Degree Program (e.g. B.Tech CSE, MCA)</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.degreeProgram}
                  onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>6. Current Year of Study</label>
                <select
                  className={inputCls}
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  required
                >
                  <option value="" disabled>Select Year</option>
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>Final Year</option>
                  <option>Postgraduate</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>7. LinkedIn Profile</label>
                <input
                  type="url"
                  className={inputCls}
                  value={formData.linkedinProfile}
                  onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>8. GitHub Profile</label>
                <input
                  type="url"
                  className={inputCls}
                  value={formData.githubProfile}
                  onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>9. Resume/CV Upload (PDF only, Max size 5 MB)</label>
              <div className="relative mt-2">
                <input
                  type="file"
                  id="resume-upload"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="peer sr-only"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/30 bg-black/30 px-6 py-8 text-sm text-foreground/70 transition-all hover:border-primary/50 hover:bg-black/50 peer-focus:border-primary"
                >
                  {formData.resumeFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-primary font-medium">
                        <CheckCircle2 className="h-5 w-5" />
                        {formData.resumeFile.name}
                      </div>
                      <span className="text-xs opacity-70">
                        {(formData.resumeFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="h-8 w-8 text-primary/70 mb-1" />
                      <span className="font-medium">Click to upload or drag and drop</span>
                      <span className="text-xs opacity-70">PDF (MAX. 5MB)</span>
                    </div>
                  )}
                </label>
                {formData.resumeFile && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, resumeFile: null })}
                    className="absolute right-2 top-2 rounded-full bg-red-500/20 p-1.5 text-red-400 hover:bg-red-500/40 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2 — Technical Background */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 2 — Technical Background</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>10. Primary Areas of Interest</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {areasOfInterestOptions.map((area) => (
                  <label key={area} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.areasOfInterest.includes(area)}
                        onChange={() => handleCheckboxGroup('areasOfInterest', area)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>11. Technical Skills (Programming Languages, Frameworks, Tools, Databases)</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.technicalSkills}
                onChange={(e) => setFormData({ ...formData, technicalSkills: e.target.value })}
                placeholder="e.g. Python, React, PostgreSQL, AWS..."
                required
              />
            </div>

            <div>
              <label className={labelCls}>12. Comfortable With</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                {comfortableWithOptions.map((item) => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.comfortableWith.includes(item)}
                        onChange={() => handleCheckboxGroup('comfortableWith', item)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>13. Rate Your Technical Confidence (1 = Beginner, 5 = Advanced)</label>
              <div className="flex items-center gap-6 mt-4 ml-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating} className="flex flex-col items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="technicalConfidence"
                      checked={formData.technicalConfidence === rating}
                      onChange={() => setFormData({ ...formData, technicalConfidence: rating })}
                      className="peer sr-only"
                    />
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary/30 bg-black/30 text-foreground/60 transition-all peer-checked:border-primary peer-checked:bg-primary peer-checked:text-black font-semibold peer-hover:border-primary/60">
                      {rating}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 — Technical Projects & Experience */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 3 — Technical Projects & Experience</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>14. Describe Your Best Technical Project</label>
              <p className="text-xs text-foreground/50 mb-2">Explain the problem, technologies used, your contribution, and key outcomes.</p>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.bestProject}
                onChange={(e) => setFormData({ ...formData, bestProject: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>15. Project Links (GitHub repos, deployed apps, etc.)</label>
              <textarea
                className={inputCls}
                rows={2}
                value={formData.projectLinks}
                onChange={(e) => setFormData({ ...formData, projectLinks: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>16. Open Source Contributions (Optional)</label>
              <p className="text-xs text-foreground/50 mb-2">Mention contributions, pull requests, issues, hackathons, or community participation.</p>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.openSourceContributions}
                onChange={(e) => setFormData({ ...formData, openSourceContributions: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>17. Have You Worked in Teams Before?</label>
              <div className="flex items-center gap-6 mt-3">
                {['Yes', 'No'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="teamExperience"
                      checked={formData.teamExperience === option}
                      onChange={() => setFormData({ ...formData, teamExperience: option })}
                      className="peer sr-only"
                      required
                    />
                    <div className="h-5 w-5 rounded-full border border-primary/40 bg-black/30 transition-all peer-checked:border-[6px] peer-checked:border-primary"></div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4 — Statement of Purpose */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 4 — Statement of Purpose</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>18. Why do you want to join CUSoC?</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.whyJoinCusoc}
                onChange={(e) => setFormData({ ...formData, whyJoinCusoc: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>19. What do you expect to learn during this 8-week program?</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.learningExpectations}
                onChange={(e) => setFormData({ ...formData, learningExpectations: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>20. Why should you be selected for the pilot cohort?</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.whySelectPilot}
                onChange={(e) => setFormData({ ...formData, whySelectPilot: e.target.value })}
                required
              />
            </div>
          </div>
        </section>

        {/* SECTION 5 — Learning Potential & Commitment */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 5 — Learning Potential & Commitment</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>21. Describe a technology or skill you learned on your own recently.</label>
              <textarea
                className={inputCls}
                rows={3}
                value={formData.recentlyLearned}
                onChange={(e) => setFormData({ ...formData, recentlyLearned: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>22. Have you participated in any of the following?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {participationOptions.map((item) => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.participationExperience.includes(item)}
                        onChange={() => handleCheckboxGroup('participationExperience', item)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>23. Weekly Availability During Program</label>
              <div className="flex items-center gap-6 mt-3">
                {['18–25 Hours', '25+ Hours'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="weeklyAvailability"
                      checked={formData.weeklyAvailability === option}
                      onChange={() => setFormData({ ...formData, weeklyAvailability: option })}
                      className="peer sr-only"
                      required
                    />
                    <div className="h-5 w-5 rounded-full border border-primary/40 bg-black/30 transition-all peer-checked:border-[6px] peer-checked:border-primary"></div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Project Preferences */}
        <section className="space-y-6">
          <div className="border-b border-border pb-2">
            <h3 className="text-xl font-bold text-foreground">SECTION 6 — Project Preferences</h3>
          </div>
          <div className="space-y-5">
            <div>
              <label className={labelCls}>26. Preferred Project Domains</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {preferredDomainsOptions.map((item) => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.preferredDomains.includes(item)}
                        onChange={() => handleCheckboxGroup('preferredDomains', item)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>27. Preferred Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {preferredRolesOptions.map((item) => (
                  <label key={item} className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={formData.preferredRoles.includes(item)}
                        onChange={() => handleCheckboxGroup('preferredRoles', item)}
                        className="peer sr-only"
                      />
                      <div className="h-5 w-5 rounded border border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                      <CheckCircle2 className="absolute h-3.5 w-3.5 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>28. Preferred Collaboration Mode</label>
              <div className="flex items-center gap-6 mt-3">
                {['Online', 'Offline', 'Hybrid'].map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="radio"
                      name="preferredMode"
                      checked={formData.preferredMode === option}
                      onChange={() => setFormData({ ...formData, preferredMode: option })}
                      className="peer sr-only"
                      required
                    />
                    <div className="h-5 w-5 rounded-full border border-primary/40 bg-black/30 transition-all peer-checked:border-[6px] peer-checked:border-primary"></div>
                    <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7 — Final Declaration */}
        <section className="space-y-6 pt-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <label className="flex items-start gap-4 cursor-pointer">
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={formData.declarationAccepted}
                  onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                  className="peer sr-only"
                  required
                />
                <div className="h-6 w-6 rounded border-2 border-primary/40 bg-black/30 transition-all peer-checked:bg-primary peer-checked:border-primary"></div>
                <CheckCircle2 className="absolute h-4 w-4 text-black opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium leading-relaxed text-foreground/90">
                29. I confirm that the information provided is accurate and that I am committed to actively participating in the 8-week CUSoC pilot program, attending reviews, and collaborating ethically with mentors and contributors.
              </span>
            </label>
          </div>
        </section>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-xl bg-primary px-8 py-4 text-lg font-bold text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </button>
      </form>
    </div>
  );
}
