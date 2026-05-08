// 'use client';

// import { useState } from 'react';
// import { CheckCircle2, AlertCircle, Loader2, Sparkles, Star } from 'lucide-react';

// const inputCls = 'w-full rounded-xl border border-primary/20 bg-black/30 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors';
// const labelCls = 'mb-1.5 block text-sm font-medium text-foreground';

// export default function ContributorApplicationForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [submitted, setSubmitted] = useState(false);

//   const [formData, setFormData] = useState({
//     // SECTION 1 — Basic Information
//     fullName: '',
//     email: '',
//     contactNumber: '',
//     institution: '',
//     degreeProgram: '',
//     yearOfStudy: '2nd Year',
//     linkedinProfile: '',
//     githubProfile: '',
//     resumeFile: null as File | null,

//     // SECTION 2 — Technical Background
//     areasOfInterest: [] as string[],
//     technicalSkills: '',
//     comfortableWith: [] as string[],
//     technicalConfidence: 3,

//     // SECTION 3 — Technical Projects & Experience
//     bestProject: '',
//     projectLinks: '',
//     openSourceContributions: '',
//     teamExperience: 'Yes',

//     // SECTION 4 — Statement of Purpose
//     whyJoinCusoc: '',
//     learningExpectations: '',
//     whySelectPilot: '',

//     // SECTION 5 — Learning Potential & Commitment
//     recentlyLearned: '',
//     participationExperience: [] as string[],
//     weeklyAvailability: '25+ Hours',

//     // SECTION 6 — Project Preferences
//     preferredDomains: [] as string[],
//     preferredRoles: [] as string[],
//     preferredMode: 'Hybrid',

//     // SECTION 7 — Declaration
//     declarationAccepted: false,
//   });

//   const areasOfInterest = [
//     'Artificial Intelligence / Machine Learning',
//     'Data Science',
//     'Web Development',
//     'Mobile Development',
//     'Cybersecurity',
//     'Cloud / DevOps',
//     'UI/UX',
//     'Open Source',
//     'Research',
//     'IoT / Embedded Systems',
//     'Blockchain',
//     'Automation',
//     'Other',
//   ];

//   const comfortableWithOptions = [
//     'Git/GitHub',
//     'REST APIs',
//     'Linux',
//     'Docker',
//     'Research Writing',
//     'Team Collaboration',
//     'Agile/Scrum',
//     'Testing & Debugging',
//   ];

//   const participationOptions = [
//     'Hackathons',
//     'Open Source Programs',
//     'Research Projects',
//     'Freelancing',
//     'Internships',
//     'Technical Clubs',
//     'Competitive Programming',
//     'Community Events',
//     'None',
//   ];

//   const projectDomains = [
//     'AI/ML',
//     'Research',
//     'Web Development',
//     'Mobile Apps',
//     'Cybersecurity',
//     'Open Source',
//     'Institutional Tools',
//     'Data Science',
//     'Automation',
//     'IoT',
//   ];

//   const preferredRoles = [
//     'Developer',
//     'Research Contributor',
//     'UI/UX Designer',
//     'Technical Writer',
//     'Data Analyst',
//     'QA/Testing',
//   ];

//   const handleCheckboxGroup = (name: string, value: string) => {
//     setFormData((prev) => {
//       const current = prev[name as keyof typeof formData] as string[];
//       if (current.includes(value)) {
//         return { ...prev, [name]: current.filter((item) => item !== value) };
//       } else {
//         return { ...prev, [name]: [...current, value] };
//       }
//     });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setIsLoading(true);

//     try {
//       const submitData = {
//         fullName: formData.fullName,
//         rollNumber: formData.rollNumber,
//         cuEmail: formData.cuEmail,
//         personalEmail: formData.personalEmail,
//         contactNumber: formData.contactNumber,
//         department: formData.department,
//         year: formData.year,
//         technicalSkills: formData.technicalSkills.join(', '),
//         skillLevel: formData.skillLevel,
//         yearsOfExperience: formData.yearsOfExperience,
//         githubProfile: formData.githubProfile,
//         previousProjects: formData.previousProjects,
//         openSourceExperience: formData.openSourceExperience,
//         openSourceLink: formData.openSourceLink,
//         learningGoals: formData.learningGoals,
//         areasOfInterest: formData.areasOfInterest.join(', '),
//         whyJoinCusoc: formData.whyJoinCusoc,
//         hoursPerWeek: formData.hoursPerWeek,
//         weeklyCommitment: formData.weeklyCommitment,
//         preferredMode: formData.preferredMode,
//         mentorshipPreference: formData.mentorshipPreference,
//         additionalNotes: formData.additionalNotes,
//         declarationAccepted: formData.declarationAccepted,
//       };

//       const res = await fetch('/api/cusoc/contributor-application', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(submitData),
//       });

//       const json = await res.json();

//       if (!res.ok) {
//         throw new Error(json.error || 'Submission failed');
//       }

//       setSubmitted(true);
//     } catch (err: any) {
//       setError(err.message || 'Something went wrong. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (submitted) {
//     return (
//       <div className="rounded-2xl border border-primary/20 bg-black/30 p-10 text-center backdrop-blur-xl">
//         <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/10">
//           <CheckCircle2 className="h-8 w-8 text-emerald-400" />
//         </div>
//         <h3 className="mb-2 text-3xl font-bold text-foreground">Application Submitted!</h3>
//         <p className="text-foreground/70">Your contributor application has been received. We'll review it and get back to you soon.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="rounded-2xl border border-primary/15 bg-black/40 p-8 backdrop-blur-xl">
//       <div className="mb-8">
//         <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-primary">
//           <Sparkles className="h-3.5 w-3.5" />
//           Contributor Application
//         </p>
//       </div>

//       {error && (
//         <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
//           <AlertCircle className="h-5 w-5 text-red-400" />
//           <p className="text-sm text-red-200">{error}</p>
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Basic Information */}
//         <div>
//           <h3 className="mb-4 text-lg font-bold text-primary">Basic Information</h3>
//           <div className="space-y-4">
//             <div>
//               <label className={labelCls}>Full Name</label>
//               <input
//                 type="text"
//                 className={inputCls}
//                 value={formData.fullName}
//                 onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>Roll Number</label>
//                 <input
//                   type="text"
//                   className={inputCls}
//                   value={formData.rollNumber}
//                   onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={labelCls}>Current Year</label>
//                 <select
//                   className={inputCls}
//                   value={formData.year}
//                   onChange={(e) => setFormData({ ...formData, year: e.target.value })}
//                 >
//                   <option>1st Year</option>
//                   <option>2nd Year</option>
//                   <option>3rd Year</option>
//                   <option>Final Year</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className={labelCls}>CU Email</label>
//               <input
//                 type="email"
//                 className={inputCls}
//                 value={formData.cuEmail}
//                 onChange={(e) => setFormData({ ...formData, cuEmail: e.target.value })}
//                 placeholder="name@cumail.in"
//                 required
//               />
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>Personal Email</label>
//                 <input
//                   type="email"
//                   className={inputCls}
//                   value={formData.personalEmail}
//                   onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
//                   required
//                 />
//               </div>
//               <div>
//                 <label className={labelCls}>Contact Number</label>
//                 <input
//                   type="tel"
//                   className={inputCls}
//                   value={formData.contactNumber}
//                   onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={labelCls}>Department</label>
//               <input
//                 type="text"
//                 className={inputCls}
//                 value={formData.department}
//                 onChange={(e) => setFormData({ ...formData, department: e.target.value })}
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         {/* Technical Background */}
//         <div>
//           <h3 className="mb-4 text-lg font-bold text-primary">Technical Background</h3>
//           <div className="space-y-4">
//             <div>
//               <label className={labelCls}>Technical Skills</label>
//               <div className="grid grid-cols-2 gap-3">
//                 {skills.map((skill) => (
//                   <label key={skill} className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.technicalSkills.includes(skill)}
//                       onChange={() => handleCheckboxGroup('technicalSkills', skill)}
//                       className="h-4 w-4"
//                     />
//                     <span className="text-sm text-foreground/80">{skill}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>Skill Level</label>
//                 <select
//                   className={inputCls}
//                   value={formData.skillLevel}
//                   onChange={(e) => setFormData({ ...formData, skillLevel: e.target.value })}
//                 >
//                   <option>Beginner</option>
//                   <option>Intermediate</option>
//                   <option>Advanced</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={labelCls}>Years of Experience</label>
//                 <input
//                   type="text"
//                   className={inputCls}
//                   value={formData.yearsOfExperience}
//                   onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
//                   placeholder="e.g., 2 years"
//                   required
//                 />
//               </div>
//             </div>

//             <div>
//               <label className={labelCls}>GitHub Profile (Optional)</label>
//               <input
//                 type="url"
//                 className={inputCls}
//                 value={formData.githubProfile}
//                 onChange={(e) => setFormData({ ...formData, githubProfile: e.target.value })}
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Previous Projects</label>
//               <textarea
//                 className={inputCls}
//                 rows={3}
//                 value={formData.previousProjects}
//                 onChange={(e) => setFormData({ ...formData, previousProjects: e.target.value })}
//                 placeholder="List any notable projects you've worked on"
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         {/* Open Source Experience */}
//         <div>
//           <h3 className="mb-4 text-lg font-bold text-primary">Open Source Experience</h3>
//           <div className="space-y-4">
//             <label className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={formData.openSourceExperience}
//                 onChange={(e) => setFormData({ ...formData, openSourceExperience: e.target.checked })}
//                 className="h-4 w-4"
//               />
//               <span className="text-sm text-foreground/80">I have contributed to open-source projects</span>
//             </label>

//             {formData.openSourceExperience && (
//               <div>
//                 <label className={labelCls}>Open Source Contribution Links (Optional)</label>
//                 <input
//                   type="url"
//                   className={inputCls}
//                   value={formData.openSourceLink}
//                   onChange={(e) => setFormData({ ...formData, openSourceLink: e.target.value })}
//                   placeholder="GitHub repositories, PRs, or contributions"
//                 />
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Goals & Interests */}
//         <div>
//           <h3 className="mb-4 text-lg font-bold text-primary">Goals & Interests</h3>
//           <div className="space-y-4">
//             <div>
//               <label className={labelCls}>Learning Goals</label>
//               <textarea
//                 className={inputCls}
//                 rows={4}
//                 value={formData.learningGoals}
//                 onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
//                 placeholder="What do you want to learn from CUSoC? What skills do you want to develop?"
//                 required
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Areas of Interest</label>
//               <div className="grid grid-cols-2 gap-3">
//                 {interests.map((interest) => (
//                   <label key={interest} className="flex items-center gap-2">
//                     <input
//                       type="checkbox"
//                       checked={formData.areasOfInterest.includes(interest)}
//                       onChange={() => handleCheckboxGroup('areasOfInterest', interest)}
//                       className="h-4 w-4"
//                     />
//                     <span className="text-sm text-foreground/80">{interest}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className={labelCls}>Why Join CUSoC?</label>
//               <textarea
//                 className={inputCls}
//                 rows={4}
//                 value={formData.whyJoinCusoc}
//                 onChange={(e) => setFormData({ ...formData, whyJoinCusoc: e.target.value })}
//                 placeholder="What motivates you to join the CUSoC program?"
//                 required
//               />
//             </div>
//           </div>
//         </div>

//         {/* Commitment */}
//         <div>
//           <h3 className="mb-4 text-lg font-bold text-primary">Commitment & Preferences</h3>
//           <div className="space-y-4">
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>Hours per Week</label>
//                 <select
//                   className={inputCls}
//                   value={formData.hoursPerWeek}
//                   onChange={(e) => setFormData({ ...formData, hoursPerWeek: e.target.value })}
//                 >
//                   <option>&lt;5</option>
//                   <option>5-10</option>
//                   <option>10+</option>
//                 </select>
//               </div>
//               <div>
//                 <label className={labelCls}>Preferred Collaboration Mode</label>
//                 <select
//                   className={inputCls}
//                   value={formData.preferredMode}
//                   onChange={(e) => setFormData({ ...formData, preferredMode: e.target.value })}
//                 >
//                   <option>Online</option>
//                   <option>Offline</option>
//                   <option>Hybrid</option>
//                 </select>
//               </div>
//             </div>

//             <div>
//               <label className={labelCls}>Weekly Commitment Details</label>
//               <textarea
//                 className={inputCls}
//                 rows={3}
//                 value={formData.weeklyCommitment}
//                 onChange={(e) => setFormData({ ...formData, weeklyCommitment: e.target.value })}
//                 placeholder="Explain your weekly schedule and commitment level"
//                 required
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Mentorship Preference (Optional)</label>
//               <textarea
//                 className={inputCls}
//                 rows={3}
//                 value={formData.mentorshipPreference}
//                 onChange={(e) => setFormData({ ...formData, mentorshipPreference: e.target.value })}
//                 placeholder="Any specific preferences for your mentor or mentorship style?"
//               />
//             </div>

//             <div>
//               <label className={labelCls}>Additional Notes (Optional)</label>
//               <textarea
//                 className={inputCls}
//                 rows={3}
//                 value={formData.additionalNotes}
//                 onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
//                 placeholder="Anything else you'd like us to know?"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Declaration */}
//         <div>
//           <label className="flex items-start gap-3">
//             <input
//               type="checkbox"
//               checked={formData.declarationAccepted}
//               onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
//               className="mt-1 h-4 w-4"
//               required
//             />
//             <span className="text-sm text-foreground/80">
//               I commit to active participation in the CUSoC program, maintain ethical standards, and contribute meaningfully to my assigned project for the full 8-week duration.
//             </span>
//           </label>
//         </div>

//         <button
//           type="submit"
//           disabled={isLoading}
//           className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90 disabled:opacity-50"
//         >
//           {isLoading ? (
//             <>
//               <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
//               Submitting...
//             </>
//           ) : (
//             'Submit Application'
//           )}
//         </button>
//       </form>
//     </div>
//   );
// }
