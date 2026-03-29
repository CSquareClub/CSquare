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
  const [nowLabel, setNowLabel] = useState("");
  const { theme, setTheme } = useTheme();
  const isDark = theme !== 'light';

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

  const logoSrc = mounted && !isDark ? '/c-square.png' : '/c-square-white.png';

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/events', label: 'Events' },
    { href: '/team', label: 'Team' },
    { href: '/cusoc', label: 'Register for CUSoC' },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="absolute left-0 top-0 h-[2px] w-full bg-border/40">
        <div
          className="h-full bg-primary transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
            <Image src={logoSrc} alt="C Square Club" width={160} height={36} className="h-9 w-auto object-contain" priority />
            <span className="font-mono text-lg font-bold tracking-tight text-foreground/90">&lt;C_Square/&gt;</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <span className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-xs text-foreground/70">
              LIVE {nowLabel || '--:--'}
            </span>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  pathname === item.href
                    ? 'text-primary'
                    : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <JoinNowModal className="inline-flex items-center justify-center rounded-lg border-2 border-primary bg-primary/10 px-4 py-2 font-mono text-sm font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/20 hover:shadow-[0_0_20px_color-mix(in_oklab,var(--primary)_35%,transparent)]">
              Join Now
            </JoinNowModal>
            
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/60 p-2 text-foreground/70 transition-colors hover:bg-card hover:text-primary"
              aria-label="Toggle theme"
            >
              {mounted && isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)} className={`block px-4 py-3 rounded transition-colors ${pathname === item.href ? 'text-primary font-semibold bg-primary/10' : 'text-foreground/70 hover:text-foreground hover:bg-card/60'}`}>
                {item.label}
              </Link>
            ))}
            <div onClick={() => setIsOpen(false)}>
              <JoinNowModal
                className="mt-2 inline-flex w-full items-center justify-center rounded-xl border-2 border-primary bg-primary/10 px-4 py-3 font-mono text-sm font-semibold uppercase tracking-wider text-primary transition-all hover:bg-primary/20"
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
        )}
      </div>
    </nav>
  );
}
