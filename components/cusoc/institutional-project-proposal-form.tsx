'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';

const inputCls = 'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';
const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

export default function InstitutionalProjectProposalForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    // Section 1
    facultyName: '',
    designation: 'Assistant Professor',
    department: '',
    employeeId: '',
    officialEmail: '',
    contactNumber: '',
    linkedinProfile: '',

    // Section 2
    projectTitle: '',
    projectDomains: [] as string[],
    projectTypeCategory: '',
    difficultyLevel: 'Beginner Friendly',
    projectAbstract: '',

    // Section 3
    problemStatement: '',
    proposedSolution: '',
    expectedDeliverables: '',
    currentProjectStatus: 'Idea Stage',

    // Section 4
    requiredSkills: [] as string[],
    preferredTechnologies: '',
    preferredContributorLevel: [] as string[],
    preferredRoles: [] as string[],

    // Section 5
    weeklyMentorAvailability: '3–5 Hours',
    preferredCollaborationMode: 'Hybrid',
    resourcesAvailable: [] as string[],
    githubRepoLinks: '',

    // Section 6
    expectedOutcomes: [] as string[],
    learningOutcomes: '',
    successEvaluation: '',

    // Section 7
    sensitiveData: 'No' as 'Yes' | 'No',
    proposalDocument: '',
    declarationAccepted: false,
  });

  const domains = [
    'Artificial Intelligence / Machine Learning',
    'Data Science',
    'Web Development',
    'Mobile Development',
    'Cybersecurity',
    'Cloud / DevOps',
    'IoT / Embedded Systems',
    'Open Source',
    'Research Software',
    'Automation',
    'Institutional Infrastructure',
    'Blockchain',
    'UI/UX',
    'Other',
  ];

  const skills = [
    'Python',
    'JavaScript',
    'React',
    'Node.js',
    'AI/ML',
    'Data Analysis',
    'UI/UX',
    'Cloud',
    'DevOps',
    'Research Writing',
    'API Development',
    'Git/GitHub',
    'Other',
  ];

  const roles = ['Developer', 'Researcher', 'UI/UX Designer', 'Data Analyst', 'Technical Writer', 'QA/Testing'];

  const resources = ['Datasets', 'APIs', 'Lab Access', 'GPU Resources', 'Hardware', 'Research Papers', 'Existing Codebase'];

  const outcomes = [
    'Working Prototype',
    'Research Outcome',
    'Open Source Repository',
    'Institutional Tool',
    'Research Publication',
    'Dataset Creation',
    'Automation System',
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
        projectType: 'institutional',
        facultyName: formData.facultyName,
        designation: formData.designation,
        department: formData.department,
        employeeId: formData.employeeId,
        officialEmail: formData.officialEmail,
        contactNumber: formData.contactNumber,
        linkedinProfile: formData.linkedinProfile,
        projectTitle: formData.projectTitle,
        projectDomains: formData.projectDomains.join(', '),
        projectTypeCategory: formData.projectTypeCategory,
        difficultyLevel: formData.difficultyLevel,
        projectAbstract: formData.projectAbstract,
        problemStatement: formData.problemStatement,
        proposedSolution: formData.proposedSolution,
        expectedDeliverables: formData.expectedDeliverables,
        currentProjectStatus: formData.currentProjectStatus,
        requiredSkills: formData.requiredSkills.join(', '),
        preferredTechnologies: formData.preferredTechnologies,
        preferredContributorLevel: formData.preferredContributorLevel.join(', '),
        preferredRoles: formData.preferredRoles.join(', '),
        weeklyMentorAvailability: formData.weeklyMentorAvailability,
        preferredCollaborationMode: formData.preferredCollaborationMode,
        resourcesAvailable: formData.resourcesAvailable.join(', '),
        githubRepoLinks: formData.githubRepoLinks,
        expectedOutcomes: formData.expectedOutcomes.join(', '),
        learningOutcomes: formData.learningOutcomes,
        successEvaluation: formData.successEvaluation,
        sensitiveData: formData.sensitiveData,
        proposalDocument: formData.proposalDocument,
        declarationAccepted: formData.declarationAccepted,
      };

      const res = await fetch('/api/cusoc/project-proposal', {
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
        <h3 className="mb-2 text-3xl font-bold text-foreground">Proposal Submitted!</h3>
        <p className="text-foreground/70">Your project proposal has been received. We'll review it and get back to you soon.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-primary/15 bg-black/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Institutional Project Proposal
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <p className="text-sm text-red-200">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 1 — Faculty Information</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Faculty Name</label>
              <input
                type="text"
                className={inputCls}
                value={formData.facultyName}
                onChange={(e) => setFormData({ ...formData, facultyName: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Designation</label>
              <select
                className={inputCls}
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              >
                <option>Assistant Professor</option>
                <option>Associate Professor</option>
                <option>Professor</option>
                <option>Research Scholar</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Department</label>
                <input
                  type="text"
                  className={inputCls}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  required
                />
              </div>
            </div>

            <div>
              <label className={labelCls}>Official University Email</label>
              <input
                type="email"
                className={inputCls}
                value={formData.officialEmail}
                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                placeholder="name@cumail.in"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <label className={labelCls}>LinkedIn / Faculty Profile (Optional)</label>
                <input
                  type="url"
                  className={inputCls}
                  value={formData.linkedinProfile}
                  onChange={(e) => setFormData({ ...formData, linkedinProfile: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 2 — Project Overview</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Project Title</label>
              <input
                type="text"
                className={inputCls}
                value={formData.projectTitle}
                onChange={(e) => setFormData({ ...formData, projectTitle: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Project Domain (Multiple Choice)</label>
              <div className="grid grid-cols-2 gap-3">
                {domains.map((domain) => (
                  <label key={domain} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.projectDomains.includes(domain)}
                      onChange={() => handleCheckboxGroup('projectDomains', domain)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{domain}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Project Type</label>
                <select
                  className={inputCls}
                  value={formData.projectTypeCategory}
                  onChange={(e) => setFormData({ ...formData, projectTypeCategory: e.target.value })}
                  required
                >
                  <option value="">Select Type</option>
                  <option>Research-Oriented</option>
                  <option>Product Development</option>
                  <option>Prototype Development</option>
                  <option>Institutional Utility</option>
                  <option>Open-Source Initiative</option>
                  <option>Experimental System</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Difficulty Level</label>
                <select
                  className={inputCls}
                  value={formData.difficultyLevel}
                  onChange={(e) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                >
                  <option>Beginner Friendly</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Project Abstract</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.projectAbstract}
                onChange={(e) => setFormData({ ...formData, projectAbstract: e.target.value })}
                placeholder="Briefly describe the project, objectives, and expected outcomes."
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 3 — Problem Statement & Scope</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Problem Statement</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.problemStatement}
                onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
                placeholder="Describe the problem or institutional/research challenge this project addresses."
                required
              />
            </div>

            <div>
              <label className={labelCls}>Proposed Solution</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.proposedSolution}
                onChange={(e) => setFormData({ ...formData, proposedSolution: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Expected Deliverables After 8 Weeks</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.expectedDeliverables}
                onChange={(e) => setFormData({ ...formData, expectedDeliverables: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>Current Project Status</label>
              <select
                className={inputCls}
                value={formData.currentProjectStatus}
                onChange={(e) => setFormData({ ...formData, currentProjectStatus: e.target.value })}
              >
                <option>Idea Stage</option>
                <option>Research Stage</option>
                <option>Existing Prototype</option>
                <option>Ongoing Development</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 4 — Technical Requirements</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Required Skills</label>
              <div className="grid grid-cols-2 gap-3">
                {skills.map((skill) => (
                  <label key={skill} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.requiredSkills.includes(skill)}
                      onChange={() => handleCheckboxGroup('requiredSkills', skill)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{skill}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Preferred Technologies / Tools</label>
              <input
                type="text"
                className={inputCls}
                value={formData.preferredTechnologies}
                onChange={(e) => setFormData({ ...formData, preferredTechnologies: e.target.value })}
              />
            </div>

            <div>
              <label className={labelCls}>Preferred Contributor Level</label>
              <div className="grid grid-cols-2 gap-3">
                {['1st Year', '2nd Year', '3rd Year', 'Final Year'].map((year) => (
                  <label key={year} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferredContributorLevel.includes(year)}
                      onChange={() => handleCheckboxGroup('preferredContributorLevel', year)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{year}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Preferred Roles</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((role) => (
                  <label key={role} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.preferredRoles.includes(role)}
                      onChange={() => handleCheckboxGroup('preferredRoles', role)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{role}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 5 — Mentorship & Support</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Weekly Mentor Availability</label>
                <select
                  className={inputCls}
                  value={formData.weeklyMentorAvailability}
                  onChange={(e) => setFormData({ ...formData, weeklyMentorAvailability: e.target.value })}
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
                  value={formData.preferredCollaborationMode}
                  onChange={(e) => setFormData({ ...formData, preferredCollaborationMode: e.target.value })}
                >
                  <option>Online</option>
                  <option>Offline</option>
                  <option>Hybrid</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Resources Available</label>
              <div className="grid grid-cols-2 gap-3">
                {resources.map((resource) => (
                  <label key={resource} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.resourcesAvailable.includes(resource)}
                      onChange={() => handleCheckboxGroup('resourcesAvailable', resource)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{resource}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>GitHub Repository / Documentation Links (Optional)</label>
              <input
                type="url"
                className={inputCls}
                value={formData.githubRepoLinks}
                onChange={(e) => setFormData({ ...formData, githubRepoLinks: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 6 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 6 — Outcomes & Impact</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Expected Outcomes</label>
              <div className="grid grid-cols-2 gap-3">
                {outcomes.map((outcome) => (
                  <label key={outcome} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.expectedOutcomes.includes(outcome)}
                      onChange={() => handleCheckboxGroup('expectedOutcomes', outcome)}
                      className="h-4 w-4"
                    />
                    <span className="text-sm text-foreground/80">{outcome}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className={labelCls}>Learning Outcomes for Contributors</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.learningOutcomes}
                onChange={(e) => setFormData({ ...formData, learningOutcomes: e.target.value })}
                required
              />
            </div>

            <div>
              <label className={labelCls}>How will project success be evaluated?</label>
              <textarea
                className={inputCls}
                rows={4}
                value={formData.successEvaluation}
                onChange={(e) => setFormData({ ...formData, successEvaluation: e.target.value })}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 7 */}
        <div>
          <h3 className="mb-4 text-lg font-bold text-primary">SECTION 7 — Compliance & Declaration</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Does the project involve sensitive/confidential data?</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sensitiveData"
                    value="Yes"
                    checked={formData.sensitiveData === 'Yes'}
                    onChange={(e) => setFormData({ ...formData, sensitiveData: e.target.value as 'Yes' | 'No' })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-foreground/80">Yes</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="sensitiveData"
                    value="No"
                    checked={formData.sensitiveData === 'No'}
                    onChange={(e) => setFormData({ ...formData, sensitiveData: e.target.value as 'Yes' | 'No' })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm text-foreground/80">No</span>
                </label>
              </div>
            </div>

            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={formData.declarationAccepted}
                onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                className="mt-1 h-4 w-4"
                required
              />
              <span className="text-sm text-foreground/80">
                I confirm that the submitted project aligns with academic and ethical standards and is feasible within the 8-week CUSoC program duration.
              </span>
            </label>
          </div>
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
            'Submit Proposal'
          )}
        </button>
      </form>
    </div>
  );
}
