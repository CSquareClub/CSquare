'use client';

import { useTheme } from 'next-themes';

export default function GridBackground() {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme !== 'light';

  const baseBg = isDarkTheme ? '#100c08' : '#faf6f0';
  const gridLine = isDarkTheme ? 'rgba(251,146,60,0.08)' : 'rgba(194,65,12,0.08)';
  const overlayMid = isDarkTheme ? 'rgba(23,17,11,0.4)' : 'rgba(245,232,214,0.35)';
  const overlayEnd = isDarkTheme ? 'rgba(16,12,8,0.93)' : 'rgba(250,246,240,0.94)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: baseBg }}>
      {/* Lightweight grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.38] animate-grid"
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
        className="absolute -top-24 left-1/2 h-[390px] w-[75%] -translate-x-1/2 rounded-full blur-3xl animate-drift-slow"
        style={{ background: isDarkTheme ? 'rgba(251,146,60,0.14)' : 'rgba(249,115,22,0.13)' }}
      />
      <div
        className="absolute bottom-[-50px] right-[-30px] h-[300px] w-[300px] rounded-full blur-3xl animate-orbit-float"
        style={{ background: isDarkTheme ? 'rgba(220,38,38,0.12)' : 'rgba(234,88,12,0.1)' }}
      />
      <div
        className="absolute bottom-[20%] left-[-50px] h-[220px] w-[220px] rounded-full blur-3xl animate-drift-slow"
        style={{ background: isDarkTheme ? 'rgba(180,83,9,0.09)' : 'rgba(194,65,12,0.08)' }}
      />

      <div className="absolute inset-0 opacity-[0.02]" style={{
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
