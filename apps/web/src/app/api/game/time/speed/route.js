import { auth } from '@/auth';
import sql from '@/app/api/utils/sql';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const speed = Number(body?.speed) || 1;
    if (![1,2,3].includes(speed)) return Response.json({ error: 'Invalid speed' }, { status: 400 });

    try {
      await sql`
        INSERT INTO user_time_state (user_id, user_email, current_speed, last_updated_at)
        VALUES ((SELECT id FROM users WHERE email = ${session.user.email}), ${session.user.email}, ${speed}, to_timestamp(${Math.floor(Date.now()/1000)}))
        ON CONFLICT (user_id) DO UPDATE SET current_speed = ${speed}, last_updated_at = to_timestamp(${Math.floor(Date.now()/1000)})
      `;
    } catch (err) {
      console.error('DB error writing user_time_state', err);
      return Response.json({ error: 'DB error, ensure migrations ran' }, { status: 500 });
    }

    return Response.json({ success: true, speed });
  } catch (err) {
    console.error('speed route error', err);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
