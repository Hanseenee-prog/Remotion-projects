/**
 * Scene 6 — 165 frames (5.5 s)
 *
 * Script:
 *   "Functions like setTimeout are asynchronous —
 *    they wait for other code to finish before running."
 *
 * Planned content:
 *   - Two-lane visual: "Call Stack" lane vs "Task Queue" lane
 *   - setTimeout token moves to the queue/waiting area
 *   - normalFn token stays in the call stack lane and runs immediately
 *   - Label: "async = waits its turn"
 *   - Rocket A shown waiting, Rocket B shown running ahead
 */

import React from "react";
import { AbsoluteFill } from "remotion";
import { SAFE, COLORS, FONTS } from "./tokens";

export const Scene6: React.FC = () => {
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
          Scene 6 — Async Explained
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
