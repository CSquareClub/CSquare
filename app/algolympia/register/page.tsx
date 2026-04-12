import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import AlgolympiaRegistrationForm from '@/components/algolympia/registration-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlgOlympia Registration | C Square Club',
  description:
    'Register your team for AlgOlympia — the ultimate hybrid ICPC x Hackathon competitive programming arena by C Square Club.',
};

export default function AlgolympiaRegisterPage() {
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
                  <span className="text-sm font-mono text-foreground/80">~/algolympia/register</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Alg<span className="text-primary">Olympia</span>{' '}
                <span className="text-foreground/60">Registration</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/60">
                Compete. Solve. Rank. Register your team of 3 for the ultimate
                competitive programming arena.
              </p>

              {/* Stats strip */}
              <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-6 rounded-xl border border-border bg-card/50 px-6 py-3 backdrop-blur-sm">
                {[
                  ['3', 'Members/Team'],
                  ['₹300', 'Fee'],
                  ['Hybrid', 'ICPC × Hackathon'],
                ].map(([value, label]) => (
                  <div key={label} className="text-center">
                    <p className="font-mono text-lg font-semibold text-primary">{value}</p>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-foreground/40">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Form */}
            <div className="mx-auto max-w-4xl">
              <AlgolympiaRegistrationForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
