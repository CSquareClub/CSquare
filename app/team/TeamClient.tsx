"use client";
import { useMemo, useState } from 'react';
import TeamCard from '@/components/team/team-card';

export default function TeamClient({ members }: { members: any[] }) {
  // Memoize members
  const memoizedMembers = useMemo(() => members, [members]);
  // Limit number of items rendered at once
  const [showAll, setShowAll] = useState(false);
  const MEMBER_LIMIT = 9;
  const displayedMembers = showAll ? memoizedMembers : memoizedMembers.slice(0, MEMBER_LIMIT);

  return (
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
          {displayedMembers.length ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {displayedMembers.map((member) => (
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
          {memoizedMembers.length > MEMBER_LIMIT && !showAll && (
            <div className="flex justify-center mt-6">
              <button className="rounded-full bg-blue-600 text-white px-6 py-2 font-semibold shadow hover:bg-blue-700 transition" onClick={() => setShowAll(true)}>
                Show More
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}