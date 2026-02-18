import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const sessions = await sql`
      SELECT id, start_ts, required_game_minutes, anointing_boost, completed_at
      FROM fast_sessions
      WHERE user_email = ${session.user.email}
      ORDER BY start_ts DESC
      LIMIT 1
    `;

    if (sessions.length === 0) return Response.json(null);
    return Response.json(sessions[0]);
  } catch (err) {
    console.error('error fetching fast session', err);
    return Response.json({ error: 'Failed' }, { status: 500 });
  }
}
