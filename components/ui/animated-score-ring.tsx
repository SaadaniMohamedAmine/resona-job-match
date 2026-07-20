"use client";

import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/ui/score-ring";

export function AnimatedScoreRing({ score, size }: { score: number; size?: number }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setDisplayed(score));
    return () => cancelAnimationFrame(frame);
  }, [score]);

  return <ScoreRing score={displayed} size={size} />;
}
