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

  const baseBg = isDarkTheme ? '#0a0f18' : '#f8fafc';
  const gridLine = isDarkTheme ? 'rgba(34,211,238,0.1)' : 'rgba(8,145,178,0.08)';
  const overlayMid = isDarkTheme ? 'rgba(15,23,42,0.32)' : 'rgba(226,232,240,0.35)';
  const overlayEnd = isDarkTheme ? 'rgba(10,15,24,0.92)' : 'rgba(248,250,252,0.92)';

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" style={{ backgroundColor: mounted ? baseBg : '#000000' }}>
      {/* Lightweight grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridLine} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridLine} 1px, transparent 1px)
          `,
          backgroundSize: '52px 52px',
        }}
      />

      {/* Soft static color washes */}
      <div
        className="absolute -top-24 left-1/2 h-[440px] w-[80%] -translate-x-1/2 rounded-full blur-3xl"
        style={{ background: isDarkTheme ? 'rgba(34,211,238,0.15)' : 'rgba(6,182,212,0.14)' }}
      />
      <div
        className="absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full blur-3xl"
        style={{ background: isDarkTheme ? 'rgba(14,116,144,0.18)' : 'rgba(8,145,178,0.12)' }}
      />
      
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(to bottom, transparent, ${overlayMid}, ${overlayEnd})` }}
      />
    </div>
  );
}
