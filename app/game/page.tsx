import { GamePageClient } from "@/components/game/game-page-client"

// This is a server component wrapper that prevents static generation
// The actual game logic is in the client component
export const dynamic = "force-dynamic"

export default function GamePage() {
  return <GamePageClient />
}
