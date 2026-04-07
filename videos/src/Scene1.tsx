// Scene 1 — "Every time you click search… you send a request to your server."
// 120 frames (4s) @ 30fps
//
// SCRIPT:
//   "Every time you click search…
//    you send a request to your server."
//
// VISUAL IDEAS:
//   - Search bar UI element slides in
//   - User clicks → animated request arrow/line shoots up toward a server icon
//   - One clean request, everything calm

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
