/**
 * Scene 3 — 90 frames (3 s)
 *
 * Script:
 *   "pause for effect as the rockets launch"
 *
 * Planned content:
 *   - Both rockets visible on launch pad
 *   - Dramatic countdown or launch animation (engines glow, smoke particles)
 *   - No VO — pure visual tension beat
 *   - Rocket A fires first visually (written order) but we leave the outcome ambiguous
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene3: React.FC = () => {
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
          Scene 3 — Launch Pause
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
