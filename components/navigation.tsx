'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import JoinNowModal from '@/components/join/join-now-modal';

export default function Navigation() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== 'light';

  useEffect(() => {
    setMounted(true);

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
      setScrollProgress(progress);
    };

    updateScrollProgress();

    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const logoSrc = mounted && !isDark ? '/c-square.png' : '/c-square-white.png';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/team', label: 'Team' },
    { href: '/cusoc', label: 'Register for CUSoC' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="absolute left-0 top-0 h-[2px] w-full bg-border/40">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-95">
            <Image src={logoSrc} alt="C Square Club" width={160} height={36} className="h-9 w-auto object-contain" priority />
            <span className="font-mono text-lg font-bold tracking-tight text-foreground/90">&lt;C_Square/&gt;</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 text-sm transition-all ${
                  pathname === item.href
                    ? 'bg-primary/10 text-primary font-semibold shadow-[0_0_0_1px_color-mix(in_oklab,var(--primary)_35%,transparent)]'
                    : 'text-foreground/70 hover:bg-card/80 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <JoinNowModal className="inline-flex items-center justify-center rounded-full border-2 border-primary bg-primary/15 px-5 py-2 font-mono text-xs font-semibold uppercase tracking-[0.15em] text-primary transition-all hover:scale-[1.005] hover:bg-primary/25 hover:shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_24%,transparent)]">
              Join Now
            </JoinNowModal>
            
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/65 p-2 text-foreground/70 shadow-sm transition-colors hover:bg-card hover:text-primary"
              aria-label="Toggle theme"
            >
              {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden rounded-lg border border-border bg-card/65 p-2 text-foreground/80"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
            aria-controls="mobile-navigation"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div id="mobile-navigation" className="animate-fade-in-up md:hidden pb-4 pt-2">
            <div className="space-y-2 rounded-2xl border border-border/80 bg-card/90 p-3 shadow-xl backdrop-blur">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`block rounded-xl px-4 py-3 transition-colors ${pathname === item.href ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground/70 hover:text-foreground hover:bg-background/70'}`}>
                {item.label}
              </Link>
            ))}
            <div onClick={() => setIsOpen(false)}>
              <JoinNowModal
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary transition-all hover:bg-primary/20"
              >
                Join Now
              </JoinNowModal>
            </div>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card/40 px-4 py-3 text-sm text-foreground/80 hover:bg-card hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
