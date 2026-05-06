'use client';

import Link from 'next/link';
import { Rocket, ArrowRight, Terminal, Code2, Braces } from 'lucide-react';
import { ALGOLYMPIA_IS_POSTPONED, ALGOLYMPIA_POSTPONED_MESSAGE } from '@/lib/algolympia-config';
import { useEffect, useState, useRef } from 'react';

/* ---------- Animated code block content ---------- */
const CODE_LINES = [
  { text: 'class CSquare {', cls: 'text-[#569cd6]' },
  { text: '    public void join() {', cls: 'text-[#dcdcaa]' },
  { text: '        System.out.println("Welcome to coding worlds!");', cls: 'text-[#ce9178]' },
  { text: '    }', cls: 'text-[#dcdcaa]' },
  { text: '', cls: '' },
  { text: '    public static void main(String[] args) {', cls: 'text-[#dcdcaa]' },
  { text: '        CSquare club = new CSquare();', cls: 'text-[#4ec9b0]' },
  { text: '        club.join();', cls: 'text-[#dcdcaa]' },
  { text: '    }', cls: 'text-[#dcdcaa]' },
  { text: '}', cls: 'text-[#dcdcaa]' },
];

const TECH_BADGES = [
  { label: 'C++', x: '82%', y: '8%', delay: 0 },
  { label: 'Python', x: '90%', y: '32%', delay: 0.8 },
  { label: 'DSA', x: '78%', y: '56%', delay: 1.6 },
  { label: 'React', x: '92%', y: '72%', delay: 2.4 },
];

/* ---------- Component ---------- */
export default function Hero() {
  const codeLines = CODE_LINES;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="relative overflow-hidden pb-10 pt-16 md:pt-24 lg:pt-28">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        {/* ── Two-column hero ── */}
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
          {/* ── Left: copy ── */}
          <div className="max-w-2xl flex-1 animate-fade-in-up">
            <div className="mb-8 flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.36em] text-primary/90">
              <span className="h-px w-10 bg-primary" />
              C Square Club
              <span className="h-px w-10 bg-primary" />
            </div>

            <h1 className="text-[3.2rem] font-semibold leading-[0.92] tracking-[0.02em] text-foreground sm:text-[4.7rem] md:text-[5.6rem] lg:text-[6rem]">
              Build. <span className="text-primary">Compete.</span> Grow.
            </h1>

            <p className="mt-5 font-mono text-lg uppercase tracking-[0.24em] text-foreground/80 sm:text-2xl">
              Chandigarh University Coding Community
            </p>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-foreground/52 sm:text-lg">
              C Square Club is a student-driven technical community where beginners become coders,
              coders become competitors, and competitors become builders through events, mentorship,
              and collaborative projects.
            </p>

            {/* {ALGOLYMPIA_IS_POSTPONED ? (
              <div className="mt-6 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {ALGOLYMPIA_POSTPONED_MESSAGE}
              </div>
            ) : null} */}

            <div className="mt-11 flex flex-col gap-4 sm:flex-row sm:items-center">
              {/* <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 border border-primary bg-primary px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
              >
                <Rocket size={16} />
                Explore Events
              </Link> */}
              {/* <Link
                href="/events/algolympia"
                className="inline-flex items-center justify-center gap-2 border border-border bg-card/70 px-7 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-foreground/80 transition-all hover:border-primary/40 hover:text-primary"
              >
                AlgOlympia Details
                <ArrowRight size={16} />
              </Link> */}
            </div>
          </div>

          {/* ── Right: code editor ── */}
          <div
            className="relative hidden flex-1 lg:flex lg:justify-end"
            style={{ perspective: '1200px' }}
          >
            {/* Ambient glow behind the editor */}
            <div
              className="absolute -inset-6 rounded-3xl blur-3xl"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 40%, rgba(255,210,50,0.12) 0%, transparent 70%)',
              }}
            />

            {/* Code editor card */}
            <div
              className="relative w-full max-w-[520px] overflow-hidden rounded-2xl border border-border bg-card/90 shadow-2xl backdrop-blur-sm"
              style={{
                transform: mounted
                  ? 'rotateY(-4deg) rotateX(2deg)'
                  : 'rotateY(0deg) rotateX(0deg)',
                transition: 'transform 0.8s cubic-bezier(.4,0,.2,1)',
              }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                <span className="ml-3 flex items-center gap-1.5 font-mono text-[11px] text-foreground/40">
                  <Code2 size={12} />
                  Main.java
                </span>
                <span className="ml-auto font-mono text-[10px] text-foreground/30">UTF-8</span>
              </div>

              {/* Code area */}
              <div className="h-[420px] overflow-hidden px-5 py-4 font-mono text-[13px] leading-[1.7]">
                {codeLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span className="mr-5 inline-block w-5 select-none text-right text-foreground/20">
                      {i + 1}
                    </span>
                    <span className={`${line.cls} whitespace-pre`}>
                      {line.text}
                      {/* Blinking cursor on the last line */}
                      {i === codeLines.length - 1 && (
                        <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[2px] animate-pulse bg-primary" />
                      )}
                    </span>
                  </div>
                ))}
              </div>

              {/* Status bar */}
              <div className="flex items-center justify-between border-t border-border px-4 py-1.5 font-mono text-[10px] text-foreground/40">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Terminal size={10} />
                    Java 21
                  </span>
                  <span>Ln {codeLines.length}, Col {codeLines.length > 0 ? codeLines[codeLines.length - 1].text.length + 1 : 1}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Braces size={10} />
                    Competitive
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                    Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Floating tech badges */}
            {TECH_BADGES.map((badge) => (
              <div
                key={badge.label}
                className="absolute rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1 font-mono text-[11px] text-foreground/50 backdrop-blur-md"
                style={{
                  left: badge.x,
                  top: badge.y,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  transition: `opacity 0.6s ${badge.delay + 0.4}s, transform 0.6s ${badge.delay + 0.4}s`,
                  animation: mounted
                    ? `float-badge 4s ease-in-out ${badge.delay}s infinite`
                    : 'none',
                }}
              >
                {badge.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className="mt-14 border-y border-border py-8">
          <div className="grid grid-cols-2 gap-y-7 text-left sm:grid-cols-4 sm:gap-6">
            {([
              ['10+', 'Events'],
              ['1000+', 'Members'],
              ['Live', 'Community'],
            ] as const).map(([value, label]) => (
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

      {/* Float animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-badge {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
      `}} />
    </section>
  );
}
