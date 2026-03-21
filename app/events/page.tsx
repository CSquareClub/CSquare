import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';

export default function EventsPage() {
  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/70">
              Events
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Coming Soon</h1>
            <p className="text-lg text-foreground/65">We are preparing new events. Please check back soon.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
