'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function GridBackground() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDarkTheme = theme !== 'light';

  useEffect(() => {
    setMounted(true);
  }, []);

  const baseBg = isDarkTheme ? '#000000' : '#f2f6ff';
  const gridLine = isDarkTheme ? 'rgba(79,179,246,0.28)' : 'rgba(37,99,235,0.18)';
  const overlayMid = isDarkTheme ? 'rgba(0,0,0,0.34)' : 'rgba(226,236,255,0.4)';
  const overlayEnd = isDarkTheme ? 'rgba(0,0,0,0.92)' : 'rgba(236,242,255,0.9)';
  const particleColor = isDarkTheme ? 'rgba(56,189,248,0.85)' : 'rgba(37,99,235,0.5)';
  const ringColor = isDarkTheme ? 'rgba(148,163,184,0.22)' : 'rgba(37,99,235,0.18)';
  const particles = [
    { top: '12%', left: '10%', size: 4, delay: '0s', duration: '7s' },
    { top: '24%', left: '78%', size: 3, delay: '1s', duration: '8s' },
    { top: '38%', left: '32%', size: 5, delay: '2s', duration: '9s' },
    { top: '55%', left: '14%', size: 3, delay: '0.6s', duration: '6.8s' },
    { top: '63%', left: '70%', size: 4, delay: '1.7s', duration: '8.6s' },
    { top: '74%', left: '46%', size: 3, delay: '0.4s', duration: '7.5s' },
    { top: '18%', left: '54%', size: 2, delay: '2.2s', duration: '9.5s' },
    { top: '82%', left: '22%', size: 4, delay: '1.4s', duration: '8.1s' },
    { top: '44%', left: '88%', size: 2, delay: '0.9s', duration: '6.9s' },
  ] as const;
  const rings = [
    { top: '22%', left: '18%', size: 360, duration: '28s', delay: '0s' },
    { top: '46%', left: '62%', size: 280, duration: '34s', delay: '1.2s' },
    { top: '66%', left: '40%', size: 220, duration: '30s', delay: '0.8s' },
  ] as const;
  const overlayParticles = [
    { top: '10%', left: '8%', size: 6, delay: '0.2s', duration: '10s' },
    { top: '16%', left: '72%', size: 5, delay: '0.8s', duration: '11s' },
    { top: '28%', left: '38%', size: 7, delay: '1.3s', duration: '12s' },
    { top: '42%', left: '12%', size: 6, delay: '0.4s', duration: '10.5s' },
    { top: '50%', left: '84%', size: 5, delay: '1.7s', duration: '11.5s' },
    { top: '64%', left: '56%', size: 7, delay: '0.9s', duration: '12.2s' },
    { top: '72%', left: '26%', size: 5, delay: '1.1s', duration: '10.8s' },
    { top: '84%', left: '68%', size: 6, delay: '0.6s', duration: '11.8s' },
  ] as const;

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: mounted ? baseBg : '#000000' }}>
      {/* Subtle grid pattern */}
      <div
        className="animate-grid absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Top radial gradient for the hero glow */}
      <div className={`absolute top-0 left-1/2 h-[600px] w-[80%] max-w-4xl -translate-x-1/2 rounded-[100%] blur-[120px] pointer-events-none ${isDarkTheme ? 'bg-blue-500/10' : 'bg-blue-400/20'}`} />

      {/* Floating rings */}
      {rings.map((ring, index) => (
        <div
          key={`ring-${index}`}
          className="pointer-events-none absolute animate-orbit-float rounded-full border"
          style={{
            top: ring.top,
            left: ring.left,
            width: `${ring.size}px`,
            height: `${ring.size}px`,
            borderColor: ringColor,
            animationDuration: ring.duration,
            animationDelay: ring.delay,
          }}
        />
      ))}

      {/* Moving particles */}
      {particles.map((particle, index) => (
        <span
          key={`particle-${index}`}
          className="pointer-events-none absolute rounded-full"
          style={{
            top: particle.top,
            left: particle.left,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particleColor,
            boxShadow: `0 0 ${particle.size * 3}px ${particleColor}`,
            animation: `driftSlow ${particle.duration} ease-in-out ${particle.delay} infinite, twinkle 4s ease-in-out ${particle.delay} infinite`,
          }}
        />
      ))}
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent, ${overlayMid}, ${overlayEnd})` }}
      />

      {/* Top particle overlay */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {overlayParticles.map((particle, index) => (
          <span
            key={`overlay-particle-${index}`}
            className="absolute rounded-full"
            style={{
              top: particle.top,
              left: particle.left,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: isDarkTheme ? 'rgba(125,211,252,0.82)' : 'rgba(37,99,235,0.58)',
              animation: `driftWide ${particle.duration} ease-in-out ${particle.delay} infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
