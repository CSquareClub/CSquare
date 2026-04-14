import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Code, Globe, Zap, Target, Rocket } from 'lucide-react';
import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AlgOlympia: Collegiate Programming Contest 2026 | C Square Club',
  description:
    'AlgOlympia is a global-level collegiate programming contest organized by C Square Club at Chandigarh University. Teams of 3 compete for ₹2.5 Lakhs prize pool on 20th–21st April 2026.',
};

const highlights = [
  {
    icon: Zap,
    title: 'Multi-Round Coding Challenges',
    description: 'Testing speed, accuracy, and logic across escalating difficulty levels.',
  },
  {
    icon: Target,
    title: 'Real-World Problem Scenarios',
    description: 'Inspired by industry-level challenges that mirror actual engineering problems.',
  },
  {
    icon: Users,
    title: 'Team-Based Competition',
    description: 'Collaborative team-based competition promoting strategic thinking.',
  },
  {
    icon: Globe,
    title: 'Global Networking',
    description: 'Connect with top coders and tech enthusiasts from around the world.',
  },
];

const stats = [
  { value: '₹2.5L', label: 'Prize Pool' },
  { value: '3', label: 'Per Team' },
  { value: '2', label: 'Days' },
  { value: 'Global', label: 'Scale' },
];

export default function AlgolympiaEventPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="overflow-hidden pb-16 pt-16 md:pt-20 lg:pt-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Link
              href="/events"
              className="mb-10 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              <ArrowLeft size={16} />
              Back to Events
            </Link>

            <div className="animate-fade-in-up">
              <div className="mb-6 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
                <span className="h-px w-10 bg-primary" />
                C Square Club Presents
                <span className="h-px w-10 bg-primary" />
              </div>

              <h1 className="text-[2.8rem] font-semibold leading-[0.92] tracking-[0.02em] text-foreground sm:text-[4rem] md:text-[5rem] lg:text-[6rem]">
                Alg<span className="text-primary">Olympia</span>
              </h1>

              <p className="mt-4 font-mono text-base uppercase tracking-[0.24em] text-foreground/80 sm:text-xl">
                Collegiate Programming Contest 2026
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-foreground/60">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar size={14} className="text-primary" />
                  20th – 21st April 2026
                </span>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={14} className="text-primary" />
                  Chandigarh University
                </span>
                <span className="hidden h-4 w-px bg-border sm:block" />
                <span className="inline-flex items-center gap-1.5">
                  <Trophy size={14} className="text-primary" />
                  Prize Pool: ₹2.5 Lakhs
                </span>
              </div>

              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href="/algolympia/register"
                  className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-8 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                >
                  <Rocket size={16} />
                  Register Now
                </Link>
              </div>
            </div>

            {/* Stats Strip */}
            <div className="mt-14 border-y border-border py-8">
              <div className="grid grid-cols-2 gap-y-7 text-left sm:grid-cols-4 sm:gap-6">
                {stats.map(({ value, label }) => (
                  <div key={label}>
                    <p className="font-mono text-4xl font-semibold uppercase text-foreground sm:text-5xl">
                      <span className={value === 'Global' ? 'text-primary' : ''}>{value}</span>
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-foreground/46">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="pb-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-card/60 p-8 md:p-10">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">About AlgOlympia</p>
              <p className="text-lg leading-relaxed text-foreground/75">
                AlgOlympia is a global-level collegiate programming contest organized by the C Square Club at Chandigarh University. Designed to bring together some of the brightest coding minds, the event aims to foster innovation, problem-solving, and competitive programming excellence on an international stage.
              </p>
              <p className="mt-5 text-lg leading-relaxed text-foreground/75">
                Scheduled for 20th–21st April 2026, AlgOlympia invites students from across the world to compete in teams of three, tackling a series of challenging algorithmic and data-structure-based problems. With a prize pool of ₹2.5 Lakhs, the competition promises high stakes, intense competition, and an unforgettable experience.
              </p>
            </div>
          </div>
        </section>

        {/* Highlights Grid */}
        <section className="pb-20 md:pb-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">What Awaits You</h2>
              <p className="mt-2 text-sm text-foreground/60">Participants will engage in:</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {highlights.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="group relative cursor-default overflow-hidden rounded-2xl border border-border bg-card/65 p-6 transition-all duration-500 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
                  >
                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                    <Icon className="mb-5 h-10 w-10 text-primary transition-transform duration-500 group-hover:scale-105" />
                    <h3 className="mb-2 text-lg font-semibold text-foreground/90">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-foreground/50">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-accent/10 p-8 md:p-12">
              {/* Decorative glow */}
              <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-accent/10 blur-3xl" />

              <div className="relative z-10 text-center">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Ready to Compete?
                </p>
                <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
                  Form your trio. Compete. Conquer. 🚀
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-foreground/60">
                  AlgOlympia is not just a contest—it&apos;s a platform to push boundaries, showcase talent, and be part of a growing global coding community.
                </p>

                <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Link
                    href="/algolympia/register"
                    className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-8 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                  >
                    <Code size={16} />
                    Register Your Team
                  </Link>
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
