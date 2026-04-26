'use client';

import Link from 'next/link';
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
  const [nowLabel, setNowLabel] = useState('');
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? 'dark') === 'dark';

  useEffect(() => {
    setMounted(true);

    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(100, (scrollTop / scrollHeight) * 100) : 0;
      setScrollProgress(progress);
    };

    const updateNowLabel = () => {
      const now = new Date();
      setNowLabel(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };

    updateScrollProgress();
    updateNowLabel();

    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    const timer = window.setInterval(updateNowLabel, 30000);

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.clearInterval(timer);
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

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/team', label: 'Team' },
    { href: '/cusoc', label: 'CUSOC' },
    { href: '/core-team', label: 'Core Team' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="absolute left-0 top-0 h-px w-full bg-border/50">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="grid h-8 w-8 place-items-center bg-primary font-mono text-xs font-semibold text-primary-foreground">c2</div>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              CSQUARE
              <span className="ml-2 text-foreground/65">/ CLUB</span>
            </span>
          </Link>

          <div className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm uppercase tracking-[0.14em] transition-colors ${
                  pathname === item.href ? 'text-primary' : 'text-foreground/68 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-foreground/60">
              LIVE {nowLabel || '--:--'}
            </span>

            <JoinNowModal className="inline-flex items-center justify-center border border-primary bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-primary-foreground transition-colors hover:bg-primary/90">
              Join Now
            </JoinNowModal>

            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="inline-flex items-center justify-center border border-border bg-card px-2.5 py-2 text-foreground/70 transition-colors hover:text-primary"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {mounted ? (
                isDark ? <Sun size={16} /> : <Moon size={16} />
              ) : (
                <span className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-sm border border-border bg-card p-2 text-foreground/80 md:hidden"
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
            <div className="space-y-2 border border-border bg-card p-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`block px-4 py-3 text-sm uppercase tracking-[0.14em] transition-colors ${pathname === item.href ? 'bg-primary/12 text-primary' : 'text-foreground/70 hover:text-foreground hover:bg-background/80'}`}>
                {item.label}
              </Link>
            ))}
            <div onClick={() => setIsOpen(false)}>
              <JoinNowModal
                className="mt-2 inline-flex w-full items-center justify-center border border-primary bg-primary px-4 py-3 font-mono text-sm font-semibold uppercase tracking-[0.14em] text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Join Now
              </JoinNowModal>
            </div>
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 border border-border bg-background px-4 py-3 text-sm text-foreground/80 transition-colors hover:bg-card hover:text-foreground"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {mounted ? (
                isDark ? <Sun size={16} /> : <Moon size={16} />
              ) : (
                <span className="h-4 w-4" aria-hidden="true" />
              )}
              {mounted ? (isDark ? 'Light Mode' : 'Dark Mode') : 'Theme'}
            </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
