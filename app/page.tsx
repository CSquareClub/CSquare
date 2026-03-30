import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import Hero from '@/components/home/hero';
import Features from '@/components/home/features';
import ClubDescription from '@/components/home/club-description';
import GalleryGrid from '@/components/events/gallery-grid';

export default function Home() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />
      
      <main className="relative z-10">
        <Hero />
        <Features />
        <ClubDescription />

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold tracking-tight md:text-3xl">C Square Moments</h2>
                <p className="mt-2 text-sm text-foreground/65">Highlights from our workshops, coding sessions, and club events.</p>
              </div>
            </div>

            <GalleryGrid />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
