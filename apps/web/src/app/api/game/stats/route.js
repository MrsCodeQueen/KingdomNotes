import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await sql`
      SELECT id, email, anointing, charisma, kingdom_funds, energy, followers, created_at
      FROM users
      WHERE email = ${session.user.email}
    `;

    if (rows.length === 0) {
      // Create new user with default stats
      const newUser = await sql`
        INSERT INTO users (email, anointing, charisma, kingdom_funds, energy, followers)
        VALUES (${session.user.email}, 10, 10, 100.00, 100, 0)
        RETURNING id, email, anointing, charisma, kingdom_funds, energy, followers, created_at
      `;
      return Response.json(newUser[0]);
    }

    // Regenerate energy based on last update
    const user = rows[0];
    try {
      const res2 = await sql`
        SELECT energy_last_updated
        FROM users
        WHERE id = ${user.id}
      `;
      const last = res2[0]?.energy_last_updated ? new Date(res2[0].energy_last_updated).getTime() : Date.now();
      const now = Date.now();

      // 1 real second == 1 game minute. Regen rule: 1 energy per 5 game-minutes (5 real seconds at 1x)
      const elapsedSeconds = Math.floor((now - last) / 1000);
      const gainedEnergy = Math.floor(elapsedSeconds / 5);
      if (gainedEnergy > 0) {
        const newEnergy = Math.min((user.energy || 0) + gainedEnergy, 100);
        await sql`
          UPDATE users
          SET energy = ${newEnergy}, energy_last_updated = to_timestamp(${Math.floor(now / 1000)})
          WHERE id = ${user.id}
        `;
        user.energy = newEnergy;
      }
    } catch (e) {
      console.error('Error regenerating energy', e);
    }

    return Response.json(user);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
