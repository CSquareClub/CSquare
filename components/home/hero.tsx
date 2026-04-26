import Link from 'next/link';
import { Rocket, ArrowRight } from 'lucide-react';
import { ALGOLYMPIA_IS_POSTPONED, ALGOLYMPIA_POSTPONED_MESSAGE } from '@/lib/algolympia-config';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-16 md:pt-24 lg:pt-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
            <span className="h-px w-10 bg-primary" />
            C Square Club
            <span className="h-px w-10 bg-primary" />
          </div>

          <h1 className="text-[3.2rem] font-semibold leading-[0.92] tracking-[0.02em] text-foreground sm:text-[4.7rem] md:text-[6.2rem] lg:text-[7.4rem]">
            Build. <span className="text-primary">Compete.</span> Grow.
          </h1>

          <p className="mt-5 font-mono text-lg uppercase tracking-[0.24em] text-foreground/80 sm:text-2xl">
            Chandigarh University Coding Community
          </p>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground/52 sm:text-xl">
            C Square Club is a student-driven technical community where beginners become coders,
            coders become competitors, and competitors become builders through events, mentorship,
            and collaborative projects.
          </p>

          {ALGOLYMPIA_IS_POSTPONED ? (
            <div className="mt-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {ALGOLYMPIA_POSTPONED_MESSAGE}
            </div>
          ) : null}

          <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
            >
              <Rocket size={16} />
              Explore Events
            </Link>
            <Link
              href="/events/algolympia"
              className="inline-flex items-center justify-center gap-2 border border-border bg-card/70 px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-all hover:border-primary/40 hover:text-primary"
            >
              AlgOlympia Details
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-14 border-y border-border py-8">
          <div className="grid grid-cols-2 gap-y-7 text-left sm:grid-cols-4 sm:gap-6">
            {[
              ['10+', 'Events'],
              ['1000+', 'Members'],
              ['4', 'Tracks'],
              ['Live', 'Community'],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-mono text-4xl font-semibold uppercase text-foreground sm:text-5xl">
                  <span className={value === 'Live' ? 'text-primary' : ''}>{value}</span>
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-foreground/46">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
