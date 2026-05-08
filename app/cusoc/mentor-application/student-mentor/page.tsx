import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import StudentMentorApplicationForm from '@/components/cusoc/student-mentor-form';

export default function StudentMentorPage() {
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
                  <span className="text-sm font-mono text-foreground/80">~/cusoc/mentor-application/student-mentor</span>
                </div>
              </div>

              <h1 className="mb-3 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Student Mentor <span className="text-[#ef4444]">Application</span>
              </h1>
              <p className="mx-auto max-w-2xl text-lg leading-relaxed text-foreground/70">
                Help your peers learn and grow through peer mentorship during the CUSoC program.
              </p>
            </div>

            <div className="mx-auto max-w-4xl">
              <StudentMentorApplicationForm />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
