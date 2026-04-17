import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import AmbassadorForm from '@/components/algolympia/ambassador-form';
import type { Metadata } from 'next';
import { Target, Users, Zap } from 'lucide-react';
import {
  ALGOLYMPIA_IS_POSTPONED,
  ALGOLYMPIA_POSTPONED_DESCRIPTION,
  ALGOLYMPIA_POSTPONED_MESSAGE,
} from '@/lib/algolympia-config';

export const metadata: Metadata = {
  title: 'Campus Ambassador Program | AlgOlympia',
  description: ALGOLYMPIA_IS_POSTPONED
    ? ALGOLYMPIA_POSTPONED_DESCRIPTION
    : 'Become a Campus Ambassador for AlgOlympia and lead the coding revolution at your college.',
};

export default function CampusAmbassadorPage() {
  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-center">
              
              {/* Left Column - Content */}
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">AlgOlympia 2026</span>
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Become a <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Campus</span>
                  <br />
                  <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Ambassador</span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-foreground/70">
                  Step up as the official representative of AlgOlympia at your college. Bring the ultimate ICPC × Hackathon experience to your peers, earn exclusive perks, and build your leadership profile.
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Target className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Lead Your Campus</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        Be the point of contact for the largest coding event and mobilize students from your institute.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Track Your Referrals</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        Get a unique referral code. Track how many teams register through your code and earn miles.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Exclusive Perks</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        Top ambassadors get certificates, merchandise, free entry to C Square events, and networking opportunities.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Form / Status */}
              <div className="relative">
                {ALGOLYMPIA_IS_POSTPONED ? (
                  <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm md:p-10">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">
                        Event Status
                      </span>
                    </div>

                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                      {ALGOLYMPIA_POSTPONED_MESSAGE}
                    </h2>

                    <p className="mt-4 text-base leading-relaxed text-foreground/70">
                      Campus ambassador applications are paused while AlgOlympia is postponed. We&apos;ll reopen this once the revised event schedule is announced.
                    </p>
                  </div>
                ) : (
                  <AmbassadorForm />
                )}
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
