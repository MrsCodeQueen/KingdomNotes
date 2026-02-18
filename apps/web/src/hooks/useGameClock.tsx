import { useEffect, useRef, useState } from "react";

// Game clock: 1 real second == 1 game minute
// Tracks day, hour, minute. Speed multipliers: 1x, 2x, 3x

export default function useGameClock(initial = { day: 1, hour: 6, minute: 0 }) {
  const [time, setTime] = useState(initial);
  const speedRef = useRef(1); // 1x default
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    function tick() {
      // advance game minutes by speed
      setTime((prev) => {
        let totalMinutes = prev.minute + speedRef.current; // each tick is 1 second -> 1 minute * speed
        let hour = prev.hour;
        let day = prev.day;
        while (totalMinutes >= 60) {
          totalMinutes -= 60;
          hour += 1;
        }
        while (hour >= 24) {
          hour -= 24;
          day += 1;
        }
        return { day, hour, minute: totalMinutes };
      });
    }

    intervalRef.current = window.setInterval(tick, 1000); // 1 real second
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, []);

  const setSpeed = (s: 1 | 2 | 3) => {
    speedRef.current = s;
  };

  return { time, setSpeed, getSpeed: () => speedRef.current };
}