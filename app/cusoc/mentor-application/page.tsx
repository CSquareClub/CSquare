import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import Link from 'next/link';

export default function MentorApplicationPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-12 max-w-4xl text-center">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-mono text-foreground/80">~/cusoc/mentor-application</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Mentor <span className="text-[#ef4444]">Applications</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Join our mentorship program and guide the next generation of developers through their CUSoC journey.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
              {/* Industry Mentors */}
              <Link href="/cusoc/mentor-application/industry-mentor">
                <div className="group cursor-pointer rounded-2xl border border-primary/15 bg-black/40 p-8 transition-all hover:border-primary/40 hover:shadow-[0_0_80px_rgba(255,210,50,0.1)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-purple-400">
                    Industry
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Industry Mentor
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Share your professional expertise and industry insights with aspiring developers.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>5+ years of experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Guide real-world projects</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Shape the future talent</span>
                    </li>
                  </ul>
                  <button className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90">
                    Apply as Industry Mentor
                  </button>
                </div>
              </Link>

              {/* Faculty Mentors */}
              <Link href="/cusoc/mentor-application/faculty-mentor">
                <div className="group cursor-pointer rounded-2xl border border-primary/15 bg-black/40 p-8 transition-all hover:border-primary/40 hover:shadow-[0_0_80px_rgba(255,210,50,0.1)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-blue-400">
                    Faculty
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Faculty Mentor
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Lead research and academic projects with hands-on mentorship for students.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>From CU Faculty members</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Research & academic guidance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Develop future researchers</span>
                    </li>
                  </ul>
                  <button className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90">
                    Apply as Faculty Mentor
                  </button>
                </div>
              </Link>

              {/* Student Mentors */}
              <Link href="/cusoc/mentor-application/student-mentor">
                <div className="group cursor-pointer rounded-2xl border border-primary/15 bg-black/40 p-8 transition-all hover:border-primary/40 hover:shadow-[0_0_80px_rgba(255,210,50,0.1)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-green-400/20 bg-green-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-green-400">
                    Student
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Student Mentor
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Help your peers grow by sharing knowledge and offering peer mentorship.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>3rd/4th year students</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Peer mentorship & support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Build leadership skills</span>
                    </li>
                  </ul>
                  <button className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90">
                    Apply as Student Mentor
                  </button>
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
