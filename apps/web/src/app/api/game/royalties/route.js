import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user and their songs
    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json({ totalRoyalties: 0, songRoyalties: [] });
    }

    const songs = await sql`
      SELECT id, title, streams
      FROM songs
      WHERE user_id = ${users[0].id}
    `;

    // Calculate royalties (simulated: $0.003 per stream)
    const royaltyPerStream = 0.003;
    const songRoyalties = songs.map((song) => ({
      songId: song.id,
      title: song.title,
      streams: song.streams,
      royalties: (song.streams * royaltyPerStream).toFixed(2),
    }));

    const totalRoyalties = songRoyalties
      .reduce((sum, song) => sum + parseFloat(song.royalties), 0)
      .toFixed(2);

    return Response.json({
      totalRoyalties,
      songRoyalties,
      royaltyPerStream,
    });
  } catch (error) {
    console.error("Error fetching royalties:", error);
    return Response.json(
      { error: "Failed to fetch royalties" },
      { status: 500 },
    );
  }
}

// Simulate streaming activity
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (users.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const songs = await sql`
      SELECT id FROM songs WHERE user_id = ${users[0].id}
    `;

    if (songs.length === 0) {
      return Response.json({ message: "No songs to generate streams for" });
    }

    // Add random streams to each song
    for (const song of songs) {
      const newStreams = Math.floor(Math.random() * 100) + 50; // 50-149 streams
      await sql`
        UPDATE songs
        SET streams = streams + ${newStreams}
        WHERE id = ${song.id}
      `;
    }

    return Response.json({ success: true, message: "Streams generated" });
  } catch (error) {
    console.error("Error generating streams:", error);
    return Response.json(
      { error: "Failed to generate streams" },
      { status: 500 },
    );
  }
}
