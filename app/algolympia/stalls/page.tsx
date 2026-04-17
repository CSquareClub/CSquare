import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import type { Metadata } from 'next';
import {
  ALGOLYMPIA_STALLS_CLOSED_DESCRIPTION,
} from '@/lib/algolympia-stalls-config';

export const metadata: Metadata = {
  title: 'AlgOlympia Stall Registration | C Square Club',
  description: ALGOLYMPIA_STALLS_CLOSED_DESCRIPTION,
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

            <div className="mx-auto max-w-4xl">
              <div className="rounded-3xl border border-border bg-card/80 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm md:p-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">
                    Event Status
                  </span>
                </div>

                <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                  Event postponed until further notice.
                </h2>

                <p className="mt-4 text-base leading-relaxed text-foreground/70">
                  Stall registrations are unavailable right now because AlgOlympia 2026 has been postponed. We&apos;ll share updated details once the event is rescheduled.
                </p>

                {/* <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                  If you have already submitted your details, our team will contact you with the next steps.
                </p> */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
