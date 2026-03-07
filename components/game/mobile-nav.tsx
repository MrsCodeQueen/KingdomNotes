"use client"

import { cn } from "@/lib/utils"
import { Swords, User, Radio, Coins, Globe, MoreHorizontal } from "lucide-react"

interface MobileNavProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const NAV_ITEMS = [
  { id: "actions", label: "Actions", icon: Swords },
  { id: "character", label: "Profile", icon: User },
  { id: "songs", label: "Studio", icon: Radio },
  { id: "finance", label: "Finance", icon: Coins },
  { id: "world", label: "World", icon: Globe },
  { id: "more", label: "More", icon: MoreHorizontal },
]

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 py-1.5 rounded-lg transition-all touch-target no-select",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground active:bg-muted/50"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "drop-shadow-[0_0_6px_rgba(217,170,60,0.5)]")} />
              <span className="text-[10px] font-medium leading-tight">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
