// Scene 6 — "Before sending a new request… check if a controller already exists…
//            and abort the previous one."
// 180 frames (6s) @ 30fps
//
// SCRIPT:
//   "Before sending a new request…
//    check if a controller already exists…
//    and abort the previous one."
//
// VISUAL IDEAS:
//   - Code block builds line by line:
//       if (controllerRef.current) {
//         controllerRef.current.abort()
//       }
//   - Highlight the `if` check first, then the `.abort()` call
//   - Maybe dim the `if` line and glow the `.abort()` as voiceover says "abort the previous one"
//   - A small visual: old request arrow gets struck through / fades out when abort fires

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
