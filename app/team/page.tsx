import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import TeamCard from '@/components/team/team-card';
import { listPublicTeam } from '@/lib/team-store';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const members = await listPublicTeam();

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />

      <main className="relative z-10">
        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <p className="mb-4 inline-flex items-center rounded-full border border-border bg-card/70 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-foreground/70">
              Team
            </p>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Meet The Team</h1>
            <p className="text-lg text-foreground/65">The people building C Square and driving our technical community forward.</p>
          </div>
        </section>

        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {members.length ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {members.map((member) => (
                  <TeamCard
                    key={member.id}
                    name={member.name}
                    role={member.role}
                    about={member.about}
                    linkedin={member.linkedin || undefined}
                    image={member.image}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-border bg-card/60 p-6 text-sm text-foreground/65">
                Team members will appear here once they are added from the admin portal.
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
