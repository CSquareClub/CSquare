import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import Link from 'next/link';

export default function ProjectProposalPage() {
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
                  <span className="text-sm font-mono text-foreground/80">~/cusoc/project-proposal</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Project <span className="text-[#ef4444]">Proposals</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Share your innovative project ideas with CUSoC. Whether from academia or industry, we want to hear about your vision.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
              {/* Institutional Projects */}
              <Link href="/cusoc/project-proposal/institutional-project">
                <div className="group cursor-pointer rounded-2xl border border-primary/15 bg-black/40 p-8 transition-all hover:border-primary/40 hover:shadow-[0_0_80px_rgba(255,210,50,0.1)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-blue-400">
                    For Faculty
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Institutional Projects
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Present research-oriented or utility-focused projects from your department or research group.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Ideal for academic research and campus improvements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>8-week structured timeline with student contributors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Mentor students through real-world project experience</span>
                    </li>
                  </ul>
                  <button className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90">
                    Submit Institutional Project
                  </button>
                </div>
              </Link>

              {/* Industry Projects */}
              <Link href="/cusoc/project-proposal/industry-project">
                <div className="group cursor-pointer rounded-2xl border border-primary/15 bg-black/40 p-8 transition-all hover:border-primary/40 hover:shadow-[0_0_80px_rgba(255,210,50,0.1)] backdrop-blur-xl">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.24em] text-amber-400">
                    For Industry
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Industry Projects
                  </h2>
                  <p className="text-foreground/70 mb-6">
                    Partner with CUSoC to develop products, features, or solutions with talented student developers.
                  </p>
                  <ul className="space-y-2 text-sm text-foreground/60 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Real-world product development opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Access to skilled developer talent from Chandigarh University</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1">•</span>
                      <span>Showcase your company as an innovation partner</span>
                    </li>
                  </ul>
                  <button className="w-full rounded-xl bg-primary px-6 py-3 font-semibold text-black transition-all hover:bg-primary/90">
                    Submit Industry Project
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
