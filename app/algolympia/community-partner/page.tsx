import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import type { Metadata } from 'next';
import { Network, Megaphone, Image as ImageIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Community Partner | AlgOlympia',
  description:
    'Join forces with AlgOlympia 2026. Partner with us to scale your community and grow together.',
};

export default function CommunityPartnerPage() {
  return (
    <div className="relative isolate min-h-screen bg-background text-foreground">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 items-start">
              
              {/* Left Column - Content */}
              <div className="max-w-2xl lg:sticky lg:top-24">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 backdrop-blur-sm">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">AlgOlympia 2026</span>
                </div>

                <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-balance">
                  Become a <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Community</span>
                  <br />
                  <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Partner</span>
                </h1>
                
                <p className="mb-8 text-lg leading-relaxed text-foreground/70">
                  Are you a tech community, coding club, or student organization? Partner with the biggest hybrid ICPC × Hackathon event in North India. Gain massive brand exposure, co-promote, and let's grow together!
                </p>

                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Network className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Brand Visibility</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        Your community logo featured on our website and major digital promotional material.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <Megaphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">Cross Promotion</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        We actively amplify partners who help us reach new audiences to maximize mutual growth.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground">High-Quality Assets</h3>
                      <p className="text-sm text-foreground/60 leading-relaxed mt-1">
                        Make sure you have a high-resolution version of your logo in PNG or SVG for our creatives.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Closed Notice */}
              <div className="relative">
                <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-sm md:p-10">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary">
                      Registration Closed
                    </span>
                  </div>

                  <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground">
                    Community partner applications are now closed.
                  </h2>

                  <p className="mt-4 text-base leading-relaxed text-foreground/70">
                    Thank you for the incredible response. We are no longer accepting new community partner registrations for AlgOlympia 2026.
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-foreground/60">
                    If you have already submitted your details, our team will reach out to you with the next steps.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
