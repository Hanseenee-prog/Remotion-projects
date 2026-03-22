/**
 * Scene 7 — 135 frames (4.5 s)
 *
 * Script:
 *   "That's why Rocket B can run before Rocket A,
 *    even if Rocket A is written first."
 *
 * Planned content:
 *   - The big payoff: Rocket B visually launches and crosses the finish line first
 *   - Rocket A is still queued / waiting
 *   - Order counter: "1st → Rocket B" then "2nd → Rocket A" stamps in
 *   - Recap code block with execution order annotations
 *   - Satisfying, high-energy moment — the "aha" scene
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene7: React.FC = () => {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          top:    SAFE.top,
          bottom: SAFE.bottom,
          left:   SAFE.left,
          right:  SAFE.right,
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          justifyContent: "center",
        }}
      >
        {/* STUB PLACEHOLDER */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize:   36,
            color:      COLORS.muted,
            border:     `2px solid ${COLORS.border}`,
            padding:    "24px 48px",
            borderRadius: 12,
          }}
        >
          Scene 7 — The Reveal
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
