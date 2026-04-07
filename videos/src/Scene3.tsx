// Scene 3 — "…and the first one might still come back and overwrite the new data.
//            This is called a race condition."
// 150 frames (5s) @ 30fps
//
// SCRIPT:
//   "…and the first one might still come back and overwrite the new data.
//    This is called a race condition."
//
// VISUAL IDEAS:
//   - Request 1 arrow arrives back first (out of order) — highlighted in red
//   - UI result area shows stale/wrong data flashing in
//   - "Race Condition" label slams in with red accent
//   - Maybe a timeline showing the two overlapping request lifetimes

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
