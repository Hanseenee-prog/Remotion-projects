// Scene 2 — "But before that request finishes… you click search again.
//            Now both requests are running at the same time…"
// 150 frames (5s) @ 30fps
//
// SCRIPT:
//   "But before that request finishes…
//    you click search again.
//    Now both requests are running at the same time…"
//
// VISUAL IDEAS:
//   - Request 1 arrow is mid-flight (still travelling)
//   - Second click fires a Request 2 arrow
//   - Both arrows visible, travelling simultaneously — chaotic energy
//   - Labels "Request 1" and "Request 2" appear beside each

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
