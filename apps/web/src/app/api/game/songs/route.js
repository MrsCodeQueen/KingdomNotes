import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json([]);
    }

    const songs = await sql`
      SELECT id, title, genre, streams, created_at
      FROM songs
      WHERE user_id = ${users[0].id}
      ORDER BY created_at DESC
    `;

    return Response.json(songs);
  } catch (error) {
    console.error("Error fetching songs:", error);
    return Response.json({ error: "Failed to fetch songs" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, genre } = body;

    if (!title) {
      return Response.json({ error: "Title is required" }, { status: 400 });
    }

    // Get user
    const users = await sql`
      SELECT id, charisma FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const user = users[0];

    // Create song
    const newSong = await sql`
      INSERT INTO songs (user_id, title, genre, streams)
      VALUES (${user.id}, ${title}, ${genre || "Worship"}, 0)
      RETURNING id, title, genre, streams, created_at
    `;

    // Increase charisma for writing a song
    const charismaGain = Math.floor(Math.random() * 2) + 1; // 1-2
    await sql`
      UPDATE users
      SET charisma = charisma + ${charismaGain}
      WHERE id = ${user.id}
    `;

    return Response.json({
      song: newSong[0],
      charismaGain,
    });
  } catch (error) {
    console.error("Error creating song:", error);
    return Response.json({ error: "Failed to create song" }, { status: 500 });
  }
}
