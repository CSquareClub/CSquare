'use client';

import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

interface EventCardProps {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  image: string;
}

export default function EventCard({
  title,
  description,
  date,
  time,
  location,
  attendees,
  category,
  image,
}: EventCardProps) {
  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/70 transition-all duration-500 hover:border-[#dc2626]/35 hover:bg-card hover:shadow-[0_0_30px_rgba(220,38,38,0.15)]">
      {/* Subtle top highlight on hover */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#dc2626]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />
      
      {/* Image Banner */}
      <div className="relative h-48 w-full flex-shrink-0 overflow-hidden bg-card">
        <img src={image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={title} />
        {/* Gradient Overlay for Text Polish */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent opacity-90" />
        
        {/* Floating Category Tag */}
        <span className="absolute top-4 right-4 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#dc2626]/20 text-[#dc2626] border border-[#dc2626]/30 backdrop-blur-md">
          {category}
        </span>
      </div>

      <div className="p-6 flex flex-col flex-grow relative z-10 -mt-8">
        <div className="flex items-start justify-between mb-4">
          <span className="rounded-md border border-border bg-card/80 px-2 py-1 text-sm font-medium text-foreground/60 backdrop-blur-sm">{date}</span>
        </div>

        <h3 className="text-xl font-bold mb-3 text-foreground/90 group-hover:text-[#dc2626] transition-colors leading-tight">
          {title}
        </h3>

        <p className="text-foreground/60 text-sm mb-6 leading-relaxed flex-grow">{description}</p>

        <div className="space-y-3 mb-6 text-sm text-foreground/60">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#dc2626]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#dc2626]" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={16} className="text-[#dc2626]" />
            <span>{attendees} attending</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
          <button className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground transition-all duration-300 hover:border-[#dc2626] hover:bg-[#dc2626] hover:text-white group-hover:shadow-[0_0_15px_rgba(220,38,38,0.3)]">
            Register Now
          </button>
          <ArrowRight size={16} className="text-[#dc2626] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}
