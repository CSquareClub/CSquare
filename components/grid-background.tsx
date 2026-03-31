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

  const baseBg = isDarkTheme ? '#100c08' : '#faf6f0';
  const gridLine = isDarkTheme ? 'rgba(251,146,60,0.08)' : 'rgba(194,65,12,0.08)';
  const overlayMid = isDarkTheme ? 'rgba(23,17,11,0.4)' : 'rgba(245,232,214,0.35)';
  const overlayEnd = isDarkTheme ? 'rgba(16,12,8,0.93)' : 'rgba(250,246,240,0.94)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: mounted ? baseBg : '#000000' }}>
      {/* Lightweight grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.52] animate-grid"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
        }}
      />

      {/* Ambient glows */}
      <div
        className="absolute -top-28 left-1/2 h-[470px] w-[80%] -translate-x-1/2 rounded-full blur-3xl animate-drift-slow"
        style={{ background: isDarkTheme ? 'rgba(251,146,60,0.2)' : 'rgba(249,115,22,0.18)' }}
      />
      <div
        className="absolute bottom-[-60px] right-[-40px] h-[360px] w-[360px] rounded-full blur-3xl animate-orbit-float"
        style={{ background: isDarkTheme ? 'rgba(220,38,38,0.16)' : 'rgba(234,88,12,0.12)' }}
      />
      <div
        className="absolute bottom-[20%] left-[-70px] h-[280px] w-[280px] rounded-full blur-3xl animate-drift-slow"
        style={{ background: isDarkTheme ? 'rgba(180,83,9,0.12)' : 'rgba(194,65,12,0.11)' }}
      />

      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '18px 18px',
      }} />
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent, ${overlayMid}, ${overlayEnd})` }}
      />
    </div>
  );
}
