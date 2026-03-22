/**
 * Scene 5 — 90 frames (3 s)
 *
 * Script:
 *   "It uses something called the event loop."
 *
 * Planned content:
 *   - "EVENT LOOP" title reveals large and centred
 *   - Circular arrow / loop diagram appears (simple SVG loop icon)
 *   - Maybe a glowing ring that spins in
 *   - Short — just enough to plant the concept before Scene 6 explains async
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene5: React.FC = () => {
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
          Scene 5 — Event Loop Intro
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
