'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Linkedin, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';

export default function Footer() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted ? resolvedTheme !== 'light' : true;

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && !isDark ? '/c-square.png' : '/c-square-white.png';

  return (
    <footer className="relative z-10 mt-20 border-t border-border/50 bg-gradient-to-b from-transparent via-background/40 to-background/55 backdrop-blur-2xl backdrop-saturate-150">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/45 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 hidden border-r border-border pr-8 md:col-span-1 md:block">
            <Image src={logoSrc} alt="C Square Club" width={170} height={40} className="mb-4 h-10 w-auto object-contain" />
            <h3 className="mb-3 font-mono text-2xl font-bold tracking-tight text-foreground/90">&lt;C_Square/&gt;</h3>
            <p className="text-foreground/50 text-sm leading-relaxed pr-4">
              A platform where beginners become coders, coders become competitors, and competitors become builders.
            </p>
            <div className="mt-6 inline-flex items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-primary/90">
              Built by students
            </div>
          </div>

          <div className="md:col-span-1 md:pl-8">
            <h4 className="font-semibold text-foreground/90 mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-foreground/50 hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-foreground/50 hover:text-foreground transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-foreground/50 hover:text-foreground transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/cusoc" className="text-foreground/50 hover:text-foreground transition-colors">
                  Join Now
                </Link>
              </li>
            </ul>
          </div>

          {/* <div>
            <h4 className="font-semibold text-foreground/90 mb-6">Community</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors">
                  Discord Server
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors">
                  GitHub Organization
                </a>
              </li>
              <li>
                <a href="#" className="text-foreground/50 hover:text-foreground transition-colors">
                  Twitter Updates
                </a>
              </li>
            </ul>
          </div> */}

          <div>
            <h4 className="font-semibold text-foreground/90 mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:csquareclub@cumail.in" className="text-foreground/50 hover:text-foreground transition-colors">
                  csquareclub@cumail.in
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-8">
              {/* <a
                href="#"
                className="text-foreground/40 hover:text-[#dc2626] transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a> */}
              <a
                href="https://www.linkedin.com/company/csquare-club/"
                target='_blank'
                rel="noopener noreferrer"
                className="rounded-full border border-border/60 bg-background/35 p-2 text-foreground/40 backdrop-blur-md transition-colors hover:border-primary/40 hover:text-[#dc2626]"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              {/* <a
                href="#"
                className="text-foreground/40 hover:text-[#dc2626] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a> */}
              <a
                href="mailto:csquareclub@cumail.in"
                className="rounded-full border border-border/60 bg-background/35 p-2 text-foreground/40 backdrop-blur-md transition-colors hover:border-primary/40 hover:text-[#dc2626]"
                aria-label="Email"
              >
                <Mail size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between border-t border-border pt-8 md:flex-row">
          {/* Mobile-only logo */}
          <div className="mb-6 w-full border-b border-border pb-6 text-center md:hidden">
             <Image src={logoSrc} alt="C Square Club" width={150} height={34} className="mx-auto mb-2 h-8 w-auto object-contain" />
             <h3 className="mb-2 font-mono text-xl font-bold tracking-tight text-foreground/90">&lt;C_Square/&gt;</h3>
             <p className="text-foreground/50 text-xs">Beginners become coders. Coders become competitors. Competitors become builders.</p>
          </div>
          
          <p className="text-sm text-foreground/40 text-center md:text-left">
            © {new Date().getFullYear()} C Square Club. All rights reserved.
          </p>
          <p className="mt-3 text-xs text-foreground/45 md:mt-0">
            Crafted with consistency, clarity, and community focus.
          </p>
        </div>
      </div>
    </footer>
  );
}
