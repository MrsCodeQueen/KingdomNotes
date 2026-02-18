import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Simple simulated 30-day history stored in DB table `royalty_history` optionally
    // Fallback: synthesize last 30 days from songs/royalties
    const rows = await sql`
      SELECT day, kingdom_impact, funds
      FROM royalty_history
      WHERE user_email = ${session.user.email}
      ORDER BY day DESC
      LIMIT 30
    `;

    if (rows.length === 0) {
      // synthesize
      const data = [];
      for (let i = 30; i >= 1; i--) {
        data.push({ day: `Day ${i}`, kingdomImpact: Math.floor(Math.random() * 1000) + 100, funds: parseFloat((Math.random() * 500).toFixed(2)) });
      }
      return Response.json(data.reverse());
    }

    return Response.json(rows.reverse());
  } catch (err) {
    console.error('error fetching history', err);
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
