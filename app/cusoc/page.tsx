import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import CusocForm from '@/components/join/cusoc-form';
import Image from 'next/image';

export default function CusocPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="overflow-hidden py-10 md:py-14 lg:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-8 max-w-4xl text-center">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-sm">
                  <span className="text-sm font-mono text-foreground/80">~/cusoc/register</span>
                </div>
              </div>
              
              <div className="mb-5 flex justify-center">
                <Image src="/cusoc.png" alt="CUSoC Logo" width={200} height={80} className="object-contain" priority />
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                CUSoC <span className="text-[#ef4444]">Registration</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Chandigarh University Summer of Code — Choose your track and start your open-source journey.
              </p>
            </div>

            <div className="mx-auto max-w-4xl mb-12">
              <div className="rounded-2xl border border-primary/20 bg-black/20 p-6 backdrop-blur-sm sm:p-8">
                <h2 className="mb-6 text-2xl font-bold text-foreground flex items-center gap-2">
                  <span className="text-primary">📅</span> Program Timeline
                </h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-primary/10 text-primary">
                      <tr>
                        <th className="px-4 py-3 font-semibold rounded-tl-lg">Phase</th>
                        <th className="px-4 py-3 font-semibold">Duration</th>
                        <th className="px-4 py-3 font-semibold rounded-tr-lg">Objective</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-foreground/80">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium">Pilot Summer Program</td>
                        <td className="px-4 py-4 whitespace-nowrap">15 May 2026 – 15 July 2026</td>
                        <td className="px-4 py-4">Identification and training of high-potential contributors</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium">Final Showcase & Evaluation Day</td>
                        <td className="px-4 py-4 whitespace-nowrap">21 July 2026</td>
                        <td className="px-4 py-4">Final assessment, project showcase, and evaluation</td>
                      </tr>
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-4 font-medium">CUSoC Cohort Program</td>
                        <td className="px-4 py-4 whitespace-nowrap">25 July 2026 – April 2027</td>
                        <td className="px-4 py-4">Long-term mentorship and production-scale engineering training</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                  <h3 className="mb-4 text-lg font-semibold text-foreground">Pilot Program Applications</h3>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <a href="/cusoc/contributor-application" className="group flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center transition-all hover:bg-primary hover:text-black">
                      <span className="text-xl mb-2 group-hover:scale-110 transition-transform">💻</span>
                      <span className="font-medium">Contributor Application</span>
                    </a>
                    <a href="/cusoc/mentor-application" className="group flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center transition-all hover:bg-primary hover:text-black">
                      <span className="text-xl mb-2 group-hover:scale-110 transition-transform">🎓</span>
                      <span className="font-medium">Mentor Application</span>
                    </a>
                    <a href="/cusoc/project-proposal" className="group flex flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/5 p-4 text-center transition-all hover:bg-primary hover:text-black">
                      <span className="text-xl mb-2 group-hover:scale-110 transition-transform">🚀</span>
                      <span className="font-medium">Project Proposal</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="mx-auto max-w-4xl">
              <CusocForm />
            </div> */}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
