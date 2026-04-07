// Scene 5 — "To fix this, use AbortController.
//            First, create a controller for the request."
// 150 frames (5s) @ 30fps
//
// SCRIPT:
//   "To fix this, use AbortController.
//    First, create a controller for the request."
//
// VISUAL IDEAS:
//   - "AbortController" name enters with green accent — the solution arrives
//   - Code line appears: `const controller = new AbortController()`
//   - Token-by-token or line reveal
//   - Simple, clean — just one line, let it breathe

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
