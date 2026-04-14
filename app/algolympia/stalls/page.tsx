import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import StallRegistrationForm from '@/components/algolympia/stall-registration-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlgOlympia Stall Registration | C Square Club',
  description:
    'Register your stall for AlgOlympia 2026 — the global-level collegiate programming contest by C Square Club at Chandigarh University.',
};

export default function StallRegistrationPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mx-auto mb-10 max-w-4xl text-center">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-mono text-foreground/80">~/algolympia/stalls</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Alg<span className="text-primary">Olympia</span>{' '}
                <span className="text-foreground/60">Stall Registration</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/60">
                Set up your stall at AlgOlympia 2026. Showcase your project, sell merch,
                or run an activity booth at the biggest coding event.
              </p>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-4xl">
              <StallRegistrationForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
