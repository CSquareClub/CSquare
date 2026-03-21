'use client';

import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-20 border-t border-border bg-gradient-to-b from-transparent to-background/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 hidden border-r border-border pr-8 md:col-span-1 md:block">
            <h3 className="font-bold text-2xl font-mono tracking-tight text-foreground/90 mb-4">&lt;C_Square/&gt;</h3>
            <p className="text-foreground/50 text-sm leading-relaxed pr-4">
              Empowering student developers to learn, build, and conquer the tech world together.
            </p>
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
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
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
          </div>

          <div>
            <h4 className="font-semibold text-foreground/90 mb-6">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:hello@csquare.club" className="text-foreground/50 hover:text-foreground transition-colors">
                  hello@csquare.club
                </a>
              </li>
            </ul>
            <div className="flex gap-4 mt-8">
              <a
                href="#"
                className="text-foreground/40 hover:text-[#0ea5e9] transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="#"
                className="text-foreground/40 hover:text-[#0ea5e9] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={20} />
              </a>
              <a
                href="#"
                className="text-foreground/40 hover:text-[#0ea5e9] transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-foreground/40 hover:text-[#0ea5e9] transition-colors"
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
             <h3 className="font-bold text-xl font-mono tracking-tight text-foreground/90 mb-2">&lt;C_Square/&gt;</h3>
             <p className="text-foreground/50 text-xs">Empowering student developers to learn, build, and conquer.</p>
          </div>
          
          <p className="text-sm text-foreground/40 text-center md:text-left">
            © {new Date().getFullYear()} C Square Club. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
