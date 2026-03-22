/**
 * Scene 4 — 150 frames (5 s)
 *
 * Script:
 *   "Here's the secret: JavaScript is single-threaded —
 *    it can only do one thing at a time."
 *
 * Planned content:
 *   - "THE SECRET" label stamps in with a dramatic reveal
 *   - Single-lane road or single track visualisation representing one thread
 *   - Text: "JavaScript is single-threaded"
 *   - Sub-label animates in: "one thing at a time"
 *   - Possibly a single worker/person icon processing tasks sequentially
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene4: React.FC = () => {
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
          Scene 4 — Single-Threaded
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
