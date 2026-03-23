'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-20 lg:py-32 xl:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* Left Column content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 backdrop-blur-sm animate-fade-in-up">
              <span className="text-sm font-mono text-foreground/80">~ ./start_club.sh</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 tracking-tight animate-fade-in-up md:leading-[1.1]" style={{ animationDelay: '0.1s' }}>
              Code. <span className="text-[#ef4444]">Create.</span><br />
              Conquer.
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-foreground/60 mb-10 max-w-xl animate-fade-in-up leading-relaxed" style={{ animationDelay: '0.2s' }}>
              Bridging the gap between academic learning and real-world application. Join a community of developers, innovators, and problem-solvers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <Link
                href="https://cuintranet.in/join-now"
                target='_blank'
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#dc2626] px-6 py-3 font-medium text-white transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:bg-[#b91c1c] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)]"
              >
                Join the Club <ArrowRight size={18} />
              </Link>
              <Link
                href="/events"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card/60 px-6 py-3 font-medium text-foreground transition-all duration-300 hover:bg-card"
              >
                Explore Events
              </Link>
            </div>
          </div>

          {/* Right Column: Code Window */}
          <div className="relative animate-fade-in-up mx-auto lg:mx-0 lg:ml-auto w-full max-w-[500px] min-w-0" style={{ animationDelay: '0.4s' }}>
            <div className="relative z-10 w-full overflow-hidden rounded-xl border border-border bg-card/80 backdrop-blur-md shadow-2xl">
              {/* Window Header */}
              <div className="flex min-w-0 items-center border-b border-border/70 bg-card px-4 py-3">
                <div className="flex gap-2.5 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                </div>
                <div className="flex-1 text-center text-xs text-foreground/50 font-mono pr-8 truncate">
                  main.cpp - C_Square_Club
                </div>
              </div>
              
              {/* Code Content */}
              <div className="w-full overflow-x-auto whitespace-pre p-4 font-mono text-[10px] leading-relaxed text-foreground sm:p-6 sm:text-sm dark:text-[#e6e6e6]">
                <div><span className="text-[#ff7b72]">#include</span> <span className="text-[#7ee787]">&lt;iostream&gt;</span></div>
                <div><span className="text-[#ff7b72]">#include</span> <span className="text-[#7ee787]">&lt;club_resources&gt;</span></div>
                <br />
                <div><span className="text-[#79c0ff]">int</span> main() {'{'}</div>
                <div className="pl-4"><span className="text-[#79c0ff]">Club</span>* c_square <span className="text-[#ff7b72]">=</span> <span className="text-[#ff7b72]">new</span> <span className="text-[#79c0ff]">Club</span>(<span className="text-[#ffab70]">"Chandigarh University"</span>);</div>
                <br />
                <div className="pl-4"><span className="text-[#ff7b72]">if</span> (student.isPassionate()) {'{'}</div>
                <div className="pl-8">c_square<span className="text-[#ff7b72]">-&gt;</span>addMember(student);</div>
                <div className="pl-8">student.learnSkills({'{'}<span className="text-[#ffab70]">"Dev"</span>, <span className="text-[#ffab70]">"DSA"</span>, <span className="text-[#ffab70]">"AI"</span>{'}'});</div>
                <div className="pl-4">{'}'}</div>
                <br />
                <div className="pl-4">c_square<span className="text-[#ff7b72]">-&gt;</span>hostHackathon(<span className="text-[#ffab70]">"Zinnovatio 3.0"</span>);</div>
                <div className="pl-4"><span className="text-[#ff7b72]">return</span> <span className="text-[#79c0ff]">0</span>;</div>
                <div>{'}'}</div>
              </div>
            </div>
            
            {/* Decorative glow behind code window */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#ef4444] to-[#b91c1c] opacity-20 blur-2xl -z-10 rounded-[2rem]"></div>
          </div>

        </div>
      </div>
    </section>
  );
}
