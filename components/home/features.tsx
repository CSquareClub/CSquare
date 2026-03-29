'use client';

import { Users, Lightbulb, Rocket, Trophy } from 'lucide-react';

const features = [
  {
    icon: Lightbulb,
    title: 'Learning Initiatives',
    description: 'DSA sessions, language workshops, and peer doubt-solving groups.',
  },
  {
    icon: Trophy,
    title: 'Competitive Programming',
    description: 'Weekly contests and platform practice to improve speed and logic.',
  },
  {
    icon: Rocket,
    title: 'Project Building',
    description: 'Hands-on development sessions and collaborative real-world builds.',
  },
  {
    icon: Users,
    title: 'Community and Impact',
    description: 'A supportive network preparing students for interviews and placements.',
  },
];

export default function Features() {
  return (
    <section className="py-20 md:py-32 relative z-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Learn. Compete. Build.</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Bridging academic learning with industry requirements through structured practice.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-border bg-card/65 p-6 transition-all duration-500 hover:border-[#dc2626]/40 hover:bg-card hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]"
              >
                {/* Subtle top highlight on hover */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <Icon className="w-10 h-10 text-[#dc2626] mb-5 group-hover:scale-110 transition-transform duration-500" />
                <h3 className="text-lg font-semibold mb-2 text-foreground/90">{feature.title}</h3>
                <p className="text-foreground/50 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
