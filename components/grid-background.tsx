'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function GridBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkTheme = mounted ? resolvedTheme !== 'light' : true;

  const baseBg = isDarkTheme ? '#050505' : '#080808';
  const gridLine = isDarkTheme ? 'rgba(255, 210, 50, 0.09)' : 'rgba(255, 210, 50, 0.08)';
  const overlayMid = isDarkTheme ? 'rgba(8, 8, 8, 0.35)' : 'rgba(8, 8, 8, 0.34)';
  const overlayEnd = isDarkTheme ? 'rgba(5, 5, 5, 0.96)' : 'rgba(6, 6, 6, 0.95)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: baseBg }}>
      {/* Lightweight grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.62] animate-grid"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)
          `,
          backgroundSize: '46px 46px',
        }}
      />

      {/* Ambient glow */}
      <div
        className="absolute -top-20 left-1/2 h-[360px] w-[70%] -translate-x-1/2 rounded-full blur-3xl animate-drift-slow"
        style={{ background: 'rgba(255, 210, 50, 0.11)' }}
      />
      <div
        className="absolute right-[-80px] top-1/4 h-[320px] w-[320px] rounded-full blur-3xl animate-orbit-float"
        style={{ background: 'rgba(255, 210, 50, 0.08)' }}
      />
      <div
        className="absolute bottom-[12%] left-[-60px] h-[260px] w-[260px] rounded-full blur-3xl animate-drift-slow"
        style={{ background: 'rgba(255, 210, 50, 0.06)' }}
      />

      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
        backgroundSize: '20px 20px',
      }} />
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent, ${overlayMid}, ${overlayEnd})` }}
      />
    </div>
  );
}
