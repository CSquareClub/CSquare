import Navigation from '@/components/navigation';
import Footer from '@/components/footer';
import GridBackground from '@/components/grid-background';
import { listPublicTeam } from '@/lib/team-store';
import { isDatabaseConfigured } from '@/lib/db';
import DatabaseUnavailableBanner from '@/components/database-unavailable-banner';

export const dynamic = 'force-dynamic';

export default async function TeamPage() {
  const dbConfigured = isDatabaseConfigured();

  try {
    await listPublicTeam();
  } catch (error) {
    console.error('Failed to load team page data', error);
  }

  return (
    <div className="relative isolate min-h-screen bg-background">
      <GridBackground />
      <Navigation />
      {!dbConfigured ? <DatabaseUnavailableBanner className="pt-4" /> : null}
      {/* TeamClient removed due to missing file. Add TeamCard or other components here if needed. */}
      <Footer />
    </div>
  );
}
