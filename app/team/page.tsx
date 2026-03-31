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
      {/* TeamClient removed due to missing file. Add TeamCard or other components here if needed. */}
      <Footer />
    </div>
  );
}
