import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import CoreTeamRegistrationForm from '@/components/join/core-team-registration-form';

export default function CoreTeamPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-12 md:py-16 lg:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-4xl text-center">
              <div className="mb-5 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-mono text-foreground/80">~/core-team/register</span>
                </div>
              </div>

              <h1 className="mb-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                C Square <span className="text-[#ef4444]">Core Team Registration</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Register for the C Square Core Team through the dedicated workflow for CU and outside students.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <CoreTeamRegistrationForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
