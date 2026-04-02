'use client';

import { Linkedin } from 'lucide-react';
import { useMemo, useState } from 'react';

interface TeamCardProps {
  name: string;
  role: string;
  about: string;
  linkedin?: string;
  image?: string | null;
}

export default function TeamCard({
  name,
  role,
  about,
  linkedin,
  image,
}: TeamCardProps) {
  const fallbackImage = useMemo(
    () =>
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=1200&q=80',
    []
  );
  const [currentImage, setCurrentImage] = useState(image || fallbackImage);

  return (
    <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/10 bg-card/42 shadow-[0_16px_45px_rgba(0,0,0,0.12)] backdrop-blur-2xl backdrop-saturate-150 transition-all duration-300 hover:border-primary hover:bg-card/55 hover:shadow-[0_20px_55px_rgba(0,0,0,0.16)]">
      {/* Subtle top highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      {/* Image Banner */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-white/10">
        <img
          src={currentImage}
          className="w-full h-full object-cover object-[center_30%] transition-transform duration-500 group-hover:scale-[1.02]"
          alt={name}
          onError={() => setCurrentImage(fallbackImage)}
        />
        {/* Gradient Overlay for Text Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/22 to-transparent opacity-90" />
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10 -mt-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground/90 group-hover:text-[#dc2626] transition-colors leading-tight mb-1">
            {name}
          </h3>
          <p className="text-sm text-[#dc2626]/80 font-semibold">{role}</p>
        </div>

        <p className="text-foreground/60 text-sm mb-6 leading-relaxed flex-grow">{about}</p>

        <div className="mt-auto flex gap-4 border-t border-border pt-4">
          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-[#dc2626] transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
