import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, duration } = body || {};

    if (!action) {
      return Response.json({ error: "Action is required" }, { status: 400 });
    }

    // Get current user stats
    const users = await sql`
      SELECT id, energy, anointing, charisma, followers
      FROM users
      WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];
    const maxEnergy = 100;

    // Defaults
    let energyGain = 0;
    let anointingGain = 0;
    let charismaGain = 0;
    let followersGain = 0;

    // Unlock requirements (simple): conferences unlock at 1000 followers
    if (action === "worship_conference" && user.followers < 1000) {
      return Response.json({ error: "Worship conferences unlock at 1,000 followers" }, { status: 400 });
    }

    // Interpret actions
    switch (action) {
      case "nap":
        // User requested: Take a Nap (+20 Energy)
        energyGain = 20;
        break;
      case "private_worship":
        // User requested: Private Worship (+15 Anointing)
        anointingGain = 15;
        break;
      case "read_word":
        // User requested: Read the Word (+10 Energy and +10 Anointing)
        energyGain = 10;
        anointingGain = 10;
        break;
      case "fast_start": {
        // duration can be: partial (6h), daily (24h), esther (72h)
        let hours = 6;
        let energyLoss = 10;
        let anointingBoost = 5;
        switch (duration) {
          case "partial":
            hours = 6;
            energyLoss = 10;
            anointingBoost = 5;
            break;
          case "daily":
            hours = 24;
            energyLoss = 30;
            anointingBoost = 20;
            break;
          case "esther":
            hours = 72;
            energyLoss = 80;
            anointingBoost = 75;
            break;
          default:
            hours = 6;
        }
        // required game minutes
        const requiredGameMinutes = hours * 60; // hours -> minutes

        // Deduct energy immediately as fasting drains energy
        await sql`
          UPDATE users
          SET energy = GREATEST(energy - ${energyLoss}, 0)
          WHERE id = ${user.id}
        `;

        // Persist fasting session to DB (fast_sessions table). If the table doesn't exist, return helpful error.
        try {
          const inserted = await sql`
            INSERT INTO fast_sessions (user_id, user_email, start_ts, required_game_minutes, anointing_boost, completed_at)
            VALUES (${user.id}, ${session.user.email}, to_timestamp(${Math.floor(Date.now() / 1000)}), ${requiredGameMinutes}, ${anointingBoost}, NULL)
            RETURNING id, start_ts, required_game_minutes, anointing_boost
          `;

          return Response.json({
            success: true,
            message: `Fasting started for ${duration}. Return after ${requiredGameMinutes} game-minutes to claim.`,
            session: inserted[0],
          });
        } catch (err) {
          console.error('DB error inserting fast session', err);
          return Response.json({ error: 'Database table `fast_sessions` missing or query failed. Run the migration to create the table.' }, { status: 500 });
        }
      }
      case "fast_complete": {
        // Look up active fast session in DB
        try {
          const sessions = await sql`
            SELECT id, start_ts, required_game_minutes, anointing_boost
            FROM fast_sessions
            WHERE user_id = ${user.id} AND completed_at IS NULL
            ORDER BY start_ts DESC
            LIMIT 1
          `;

          if (sessions.length === 0) {
            return Response.json({ error: 'No fasting session found' }, { status: 400 });
          }

          const entry = sessions[0];

          // Compute elapsed game minutes using server time: 1 real second == 1 game minute
          const startTs = new Date(entry.start_ts).getTime();
          const elapsedRealSeconds = (Date.now() - startTs) / 1000;
          const elapsedGameMinutes = Math.floor(elapsedRealSeconds);

          // If client provided a gameElapsedMinutes, we can accept it as supplementary but server is authoritative here
          const clientElapsed = typeof body?.gameElapsedMinutes === 'number' ? Number(body.gameElapsedMinutes) : null;
          const effectiveElapsed = clientElapsed !== null ? Math.max(elapsedGameMinutes, clientElapsed) : elapsedGameMinutes;

          if (effectiveElapsed < entry.required_game_minutes) {
            return Response.json({ error: 'Fasting not yet complete', remaining: entry.required_game_minutes - effectiveElapsed }, { status: 400 });
          }

          // Apply permanent anointing boost and mark session completed
          const updatedComplete = await sql`
            UPDATE users
            SET anointing = anointing + ${entry.anointing_boost}
            WHERE id = ${user.id}
            RETURNING id, email, anointing, charisma, kingdom_funds, energy, followers
          `;

          await sql`
            UPDATE fast_sessions
            SET completed_at = to_timestamp(${Math.floor(Date.now() / 1000)})
            WHERE id = ${entry.id}
          `;

          return Response.json({ success: true, gains: { anointing: entry.anointing_boost }, stats: updatedComplete[0] });
        } catch (err) {
          console.error('DB error on fast_complete', err);
          return Response.json({ error: 'Failed to complete fast. Ensure fast_sessions table exists.' }, { status: 500 });
        }
      }
      case "worship_conference":
        energyGain = 40;
        anointingGain = 5;
        charismaGain = 3;
        followersGain = 50;
        break;
      default:
        return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    // Apply gains but don't exceed max energy
    const updated = await sql`
      UPDATE users
      SET
        energy = LEAST(energy + ${energyGain}, ${maxEnergy}),
        anointing = anointing + ${anointingGain},
        charisma = charisma + ${charismaGain},
        followers = followers + ${followersGain}
      WHERE id = ${user.id}
      RETURNING id, email, anointing, charisma, kingdom_funds, energy, followers
    `;

    return Response.json({
      success: true,
      gains: {
        energy: energyGain,
        anointing: anointingGain,
        charisma: charismaGain,
        followers: followersGain,
      },
      stats: updated[0],
    });
  } catch (error) {
    console.error("Error applying restore action:", error);
    return Response.json({ error: "Failed to apply action" }, { status: 500 });
  }
}
