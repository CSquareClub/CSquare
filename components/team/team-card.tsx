'use client';

import { Github, Linkedin, Twitter } from 'lucide-react';

interface TeamCardProps {
  name: string;
  role: string;
  bio: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  image: string;
}

export default function TeamCard({
  name,
  role,
  bio,
  github,
  linkedin,
  twitter,
  image,
}: TeamCardProps) {
  return (
    <div className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card/70 transition-all duration-500 hover:border-[#dc2626]/30 hover:bg-card hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]">
      {/* Subtle top highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

      {/* Image Banner */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-card">
        <img src={image} className="w-full h-full object-cover object-[center_30%] transition-transform duration-700 group-hover:scale-105" alt={name} />
        {/* Gradient Overlay for Text Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent opacity-90" />
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10 -mt-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground/90 group-hover:text-[#dc2626] transition-colors leading-tight mb-1">
            {name}
          </h3>
          <p className="text-sm text-[#dc2626]/80 font-semibold">{role}</p>
        </div>

        <p className="text-foreground/60 text-sm mb-6 leading-relaxed flex-grow">{bio}</p>

        <div className="mt-auto flex gap-4 border-t border-border pt-4">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-[#dc2626] transition-colors"
              aria-label="GitHub"
            >
              <Github size={18} />
            </a>
          )}
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
          {twitter && (
            <a
              href={twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground/40 hover:text-[#dc2626] transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={18} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
