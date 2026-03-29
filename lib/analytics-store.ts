import prisma from "@/lib/db";

export type TopPage = {
  path: string;
  views: number;
};

export type DailyImpression = {
  date: string;
  views: number;
};

export type DashboardAnalyticsSummary = {
  totalImpressions: number;
  impressionsToday: number;
  uniqueVisitors: number;
  uniqueVisitorsToday: number;
  topPages: TopPage[];
  impressionsLast7Days: DailyImpression[];
};

type TopPageRow = {
  path: string;
  views: bigint | number;
};

type DailyImpressionRow = {
  day: Date | string;
  views: bigint | number;
};

let tableReady = false;

async function ensureAnalyticsTable() {
  if (tableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS website_impressions (
      id SERIAL PRIMARY KEY,
      path TEXT NOT NULL,
      visitor_id TEXT NOT NULL,
      referrer TEXT,
      user_agent TEXT,
      visited_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  tableReady = true;
}

export async function trackWebsiteImpression(input: {
  path: string;
  visitorId: string;
  referrer?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await ensureAnalyticsTable();

  await prisma.$executeRawUnsafe(
    `INSERT INTO website_impressions (path, visitor_id, referrer, user_agent)
     VALUES ($1, $2, $3, $4);`,
    input.path,
    input.visitorId,
    input.referrer ?? null,
    input.userAgent ?? null
  );
}

export async function getDashboardAnalyticsSummary(): Promise<DashboardAnalyticsSummary> {
  await ensureAnalyticsTable();

  const [
    totalRows,
    todayRows,
    uniqueRows,
    uniqueTodayRows,
    topPageRows,
    dailyRows,
  ] = await Promise.all([
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS count FROM website_impressions;`
    ),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*)::bigint AS count
       FROM website_impressions
       WHERE visited_at >= DATE_TRUNC('day', NOW());`
    ),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(DISTINCT visitor_id)::bigint AS count FROM website_impressions;`
    ),
    prisma.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(DISTINCT visitor_id)::bigint AS count
       FROM website_impressions
       WHERE visited_at >= DATE_TRUNC('day', NOW());`
    ),
    prisma.$queryRawUnsafe<TopPageRow[]>(
      `SELECT path, COUNT(*)::bigint AS views
       FROM website_impressions
       GROUP BY path
       ORDER BY views DESC
       LIMIT 5;`
    ),
    prisma.$queryRawUnsafe<DailyImpressionRow[]>(
      `SELECT DATE_TRUNC('day', visited_at) AS day, COUNT(*)::bigint AS views
       FROM website_impressions
       WHERE visited_at >= DATE_TRUNC('day', NOW()) - INTERVAL '6 day'
       GROUP BY day
       ORDER BY day ASC;`
    ),
  ]);

  const dailyMap = new Map<string, number>();
  for (const row of dailyRows) {
    const date = row.day instanceof Date ? row.day : new Date(row.day);
    dailyMap.set(date.toISOString().slice(0, 10), Number(row.views));
  }

  const impressionsLast7Days: DailyImpression[] = Array.from({ length: 7 }).map((_, index) => {
    const day = new Date();
    day.setUTCHours(0, 0, 0, 0);
    day.setUTCDate(day.getUTCDate() - (6 - index));
    const key = day.toISOString().slice(0, 10);

    return {
      date: key,
      views: dailyMap.get(key) ?? 0,
    };
  });

  return {
    totalImpressions: Number(totalRows[0]?.count ?? 0),
    impressionsToday: Number(todayRows[0]?.count ?? 0),
    uniqueVisitors: Number(uniqueRows[0]?.count ?? 0),
    uniqueVisitorsToday: Number(uniqueTodayRows[0]?.count ?? 0),
    topPages: topPageRows.map((row: TopPageRow) => ({ path: row.path, views: Number(row.views) })),
    impressionsLast7Days,
  };
}
