import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, Users, Trophy, Code, Globe, Zap, Target, Rocket, Instagram, Linkedin } from 'lucide-react';
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

const communityPartners = [
  // {
  //   name: 'Dream Coders',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/dream-coders--1776188887772-light.png',
  //   instagramUrl: 'https://www.instagram.com/dreamcoderscommunity?igsh=OHdpM2N3b2JkeGR5',
  //   linkedinUrl: 'https://www.linkedin.com/company/dream-coderscommunity/',
  // },
  // {
  //   name: 'Astitwam',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/astitwam-1776191170972-light.png',
  //   instagramUrl: 'https://www.instagram.com/astitwam.events',
  //   linkedinUrl: 'https://www.linkedin.com/company/astitwam-in/',
  // },
  // {
  //   name: 'Shadow Script Community',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/shadow-script-community-1776192371023-light.png',
  //   instagramUrl: 'https://www.instagram.com/shadowscriptofficial',
  //   linkedinUrl: 'https://www.linkedin.com/company/shadow-script-community/',
  // },
  {
    name: 'CU Updates',
    logoUrl:
      'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/cu-updates--1776193122321-light.png',
    instagramUrl: 'https://www.instagram.com/cuupdates1?igsh=MWkydXB6ZGdwcDNqdg==',
    linkedinUrl: 'https://www.linkedin.com/company/cu-updates/',
  },
  // {
  //   name: 'C Square',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/c-square-1776200272807-light.png',
  //   instagramUrl: null,
  //   linkedinUrl: null,
  // },
  {
    name: 'NexaSoul',
    logoUrl:
      'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/nexasoul-1776200780777-light.png',
    instagramUrl: 'https://www.instagram.com/nexasoul_25/',
    linkedinUrl: 'https://www.linkedin.com/in/nexa-soul-982b23380/',
  },
  // {
  //   name: 'Bug2Build',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/bug2build--1776218841703-light.jpg',
  //   instagramUrl: 'https://www.instagram.com/_bug2build_?igsh=emZ3aGQwcjhiZ3Ri',
  //   linkedinUrl: 'https://www.linkedin.com/company/bug2builds/',
  // },
  // {
  //   name: 'Bizlytics',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/bizlytics--1776222133216-light.jpg',
  //   instagramUrl: 'https://www.instagram.com/bizlytics.cu?igsh=MXF6cTZ1eGFvMWhtag==',
  //   linkedinUrl: null,
  // },
  // {
  //   name: 'Nova Sphere',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/nova-sphere-1776277711613-light.jpg',
  //   instagramUrl: 'https://www.instagram.com/cu__life?igsh=MTl2dWNmZTJ4cG9nMw==',
  //   linkedinUrl: 'https://www.linkedin.com/company/novasphere09/',
  // },
  // {
  //   name: 'Campus to Corporate Club',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/campus-to-corporate-club-1776317645240-light.png',
  //   instagramUrl: null,
  //   linkedinUrl: 'https://www.linkedin.com/in/campus-to-corporate-06662a39b/',
  // },
  // {
  //   name: 'Engineering Community',
  //   logoUrl:
  //     'https://d3staw4n9fwwx4.cloudfront.net/algolympia/community-partners/engineering-community--1776329279508-light.png',
  //   instagramUrl: 'https://www.instagram.com/cu_engineering_community?igsh=N3o5ZHhsNTN1N25q',
  //   linkedinUrl: null,
  // },
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

        <section className="pb-20 md:pb-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Community Partners</p>
              <h2 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">Backed by thriving student communities</h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
                AlgOlympia is reaching more campuses and coders with support from these partner communities.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {communityPartners.map((partner) => {
                const primarySocialUrl = partner.linkedinUrl || partner.instagramUrl;
                const isLinkedIn = Boolean(partner.linkedinUrl);
                const SocialIcon = isLinkedIn ? Linkedin : Instagram;
                const socialLabel = isLinkedIn ? 'LinkedIn' : partner.instagramUrl ? 'Instagram' : null;

                return (
                  <div
                    key={partner.name}
                    className="group flex h-full flex-col rounded-2xl border border-border bg-card/65 p-6 transition-all duration-300 hover:border-primary/40 hover:bg-card hover:shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_18%,transparent)]"
                  >
                    <div className="flex h-32 items-center justify-center md:h-36">
                      <img
                        src={partner.logoUrl}
                        alt={partner.name}
                        className="max-h-28 w-auto object-contain md:max-h-32"
                        loading="lazy"
                      />
                    </div>

                    <div className="mt-5 flex min-h-[5.5rem] flex-col items-center justify-between gap-3 text-center">
                      <div className="flex min-h-[3rem] items-center justify-center">
                        <p className="text-base font-semibold leading-snug text-foreground/90">{partner.name}</p>
                      </div>

                      {primarySocialUrl && socialLabel ? (
                        <a
                          href={primarySocialUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${partner.name} ${socialLabel}`}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground/70 transition hover:border-primary hover:text-primary"
                        >
                          <SocialIcon size={16} />
                        </a>
                      ) : null}
                    </div>
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
