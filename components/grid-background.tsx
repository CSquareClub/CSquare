'use client';

import { useTheme } from 'next-themes';

export default function GridBackground() {
  const { resolvedTheme } = useTheme();
  const isDarkTheme = resolvedTheme !== 'light';

  const baseBg = isDarkTheme ? '#071815' : '#f3f7f5';
  const gridLine = isDarkTheme ? 'rgba(82,227,194,0.1)' : 'rgba(15,143,122,0.11)';
  const overlayMid = isDarkTheme ? 'rgba(10,33,30,0.45)' : 'rgba(211,240,232,0.36)';
  const overlayEnd = isDarkTheme ? 'rgba(7,24,21,0.94)' : 'rgba(243,247,245,0.95)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: baseBg }}>
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
        style={{ background: isDarkTheme ? 'rgba(82,227,194,0.24)' : 'rgba(15,143,122,0.2)' }}
      />
      <div
        className="absolute bottom-[-60px] right-[-40px] h-[360px] w-[360px] rounded-full blur-3xl animate-orbit-float"
        style={{ background: isDarkTheme ? 'rgba(255,143,102,0.2)' : 'rgba(255,107,74,0.17)' }}
      />
      <div
        className="absolute bottom-[20%] left-[-70px] h-[280px] w-[280px] rounded-full blur-3xl animate-drift-slow"
        style={{ background: isDarkTheme ? 'rgba(99,163,255,0.14)' : 'rgba(46,109,246,0.1)' }}
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
