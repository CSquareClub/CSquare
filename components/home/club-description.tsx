const initiatives = [
  {
    title: "Learning Initiatives",
    items: [
      "Conducted DSA sessions for beginners and intermediate learners",
      "Organized workshops on C++, Python, and Java",
      "Held doubt-solving sessions and peer learning groups",
    ],
  },
  {
    title: "Competitive Programming",
    items: [
      "Organized coding contests and weekly challenges",
      "Encouraged participation on CodeChef, LeetCode, and HackerRank",
      "Improved problem-solving speed and logic building",
    ],
  },
  {
    title: "Project Building",
    items: [
      "Guided students in building real-world projects",
      "Conducted hands-on development sessions for web apps and tools",
      "Promoted teamwork through collaborative projects",
    ],
  },
  {
    title: "Events and Activities",
    items: [
      "Hosted hackathons and coding competitions",
      "Organized tech talks and guest lectures",
      "Conducted induction and orientation sessions for new members",
    ],
  },
];

const impacts = [
  "Strengthened core programming skills",
  "Built confidence for technical interviews and placements",
  "Created a culture of consistent practice and peer learning",
  "Enabled growth from learning to competing to building",
];

export default function ClubDescription() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 rounded-2xl border border-border bg-card/60 p-8 md:p-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Our Vision</p>
          <p className="text-lg text-foreground/75 leading-relaxed">
            To create a community of skilled developers who can solve real-world problems,
            excel in competitive programming, and build impactful technology.
          </p>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-bold tracking-tight md:text-3xl">What We Have Done</h3>
          <p className="mt-2 text-sm text-foreground/60">Programs and initiatives that define C Square Club.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {initiatives.map((section) => (
            <article key={section.title} className="rounded-2xl border border-border bg-card/65 p-6">
              <h4 className="mb-4 text-lg font-semibold text-foreground/90">{section.title}</h4>
              <ul className="space-y-2 text-sm text-foreground/65">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card/65 p-6">
            <h4 className="mb-4 text-lg font-semibold text-foreground/90">Impact</h4>
            <ul className="space-y-2 text-sm text-foreground/65">
              {impacts.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-border bg-card/65 p-6">
            <h4 className="mb-3 text-lg font-semibold text-foreground/90">Our Community</h4>
            <p className="text-sm leading-relaxed text-foreground/65">
              C Square Club is a builder-first coding community where students ship projects,
              review code, and grow through collaborative engineering.
            </p>
            <p className="mt-4 rounded-lg border border-border bg-background/60 p-3 text-sm font-medium text-foreground/80">
              C Square Club is a platform where beginners become coders, coders become competitors,
              and competitors become builders.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
