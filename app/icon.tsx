import { ImageResponse } from "next/og"

export const size = { width: 32, height: 32 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f1629 0%, #1a1f3a 100%)",
          borderRadius: 6,
        }}
      >
        {/* Flame */}
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          fill="none"
          stroke="#d9aa3c"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
        </svg>
        {/* Treble clef - top left */}
        <svg
          viewBox="0 0 24 24"
          width="7"
          height="7"
          fill="none"
          stroke="#2db9b9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", top: 1, left: 4 }}
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
        {/* Whole note - top right */}
        <svg
          viewBox="0 0 24 24"
          width="6"
          height="6"
          fill="none"
          stroke="#d9aa3c"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", top: 2, right: 3 }}
        >
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        {/* Small note - bottom right */}
        <svg
          viewBox="0 0 24 24"
          width="6"
          height="6"
          fill="none"
          stroke="#2db9b9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ position: "absolute", top: 0, right: 10, opacity: 0.7 }}
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
