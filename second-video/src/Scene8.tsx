/**
 * Scene 8 — 75 frames (2.5 s)
 *
 * Script:
 *   "Follow to discover more hidden tips like this."
 *
 * Planned content:
 *   - Clean CTA card slides up
 *   - Profile handle or avatar (optional)
 *   - "Follow for more" text with a glowing accent underline
 *   - Maybe a subtle looping shimmer/pulse on the follow button shape
 *   - Ends on a still hold so Instagram caption is readable
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene8: React.FC = () => {
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
          Scene 8 — Follow CTA
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
