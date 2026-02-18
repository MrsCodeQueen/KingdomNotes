import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current user stats
    const users = await sql`
      SELECT id, energy, anointing, followers
      FROM users
      WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Check if user has enough energy
    if (user.energy < 20) {
      return Response.json(
        {
          error: "Not enough energy",
          message: "You need at least 20 energy to lead worship",
        },
        { status: 400 },
      );
    }

    // Calculate gains
    const anointingGain = Math.floor(Math.random() * 3) + 2; // 2-4
    const followersGain = Math.floor(Math.random() * 5) + 3; // 3-7
    const energyCost = 20;

    // Update user stats
    const updated = await sql`
      UPDATE users
      SET 
        energy = energy - ${energyCost},
        anointing = anointing + ${anointingGain},
        followers = followers + ${followersGain}
      WHERE id = ${user.id}
      RETURNING id, email, anointing, charisma, kingdom_funds, energy, followers
    `;

    return Response.json({
      success: true,
      gains: {
        anointing: anointingGain,
        followers: followersGain,
        energyCost: energyCost,
      },
      stats: updated[0],
    });
  } catch (error) {
    console.error("Error leading worship:", error);
    return Response.json({ error: "Failed to lead worship" }, { status: 500 });
  }
}
