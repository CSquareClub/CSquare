import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import ContributorApplicationForm from '@/components/cusoc/contributor-application-form';

export default function ContributorApplicationPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-8 max-w-4xl text-center">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-mono text-foreground/80">~/cusoc/contributor-application</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Contributor <span className="text-[#ef4444]">Application</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Ready to level up your coding skills? Join CUSoC 2026 as a contributor and work on exciting projects alongside experienced mentors.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <ContributorApplicationForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

