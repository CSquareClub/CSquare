import Link from 'next/link';
import { Rocket, ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-10 pt-16 md:pt-24 lg:pt-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-4xl animate-fade-in-up">
          <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
            <span className="h-px w-10 bg-primary" />
            C Square Presents
            <span className="h-px w-10 bg-primary" />
          </div>

          <h1 className="text-[3.2rem] font-semibold uppercase leading-[0.92] tracking-[0.02em] text-foreground sm:text-[4.7rem] md:text-[6.2rem] lg:text-[7.4rem]">
            Alg<span className="text-primary">Olympia</span>
          </h1>

          <p className="mt-5 font-mono text-lg uppercase tracking-[0.24em] text-foreground/80 sm:text-2xl">
            Collegiate Programming Contest 2026
          </p>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-foreground/52 sm:text-xl">
            A global-level collegiate programming contest by C Square Club at Chandigarh University. Teams of 3 compete in algorithmic and data-structure challenges for a prize pool of ₹2.5 Lakhs. 20th–21st April 2026.
          </p>

          <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/algolympia/register"
              className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
            >
              <Rocket size={16} />
              Register Now
            </Link>
            <Link
              href="/events/algolympia"
              className="inline-flex items-center justify-center gap-2 border border-border bg-card/70 px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-all hover:border-primary/40 hover:text-primary"
            >
              View Details
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="mt-14 border-y border-border py-8">
          <div className="grid grid-cols-2 gap-y-7 text-left sm:grid-cols-4 sm:gap-6">
            {[
              ['3', 'Participants'],
              ['4', 'Problems'],
              ['2', 'Submissions'],
              ['Live', 'Status'],
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
