/**
 * Scene 2 — 120 frames (4 s)
 *
 * Script:
 *   "Which one runs first — even though Rocket A appears first in the code?"
 *
 * Planned content:
 *   - Code block showing both calls in written order (A on top, B below)
 *   - Big bold question: "Which runs first?"
 *   - Arrow or highlight pointing at Rocket A's line with a "?" badge
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene2: React.FC = () => {
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
          Scene 2 — The Question
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
