// Scene 4 — "That's why you sometimes see outdated or flickering results."
// 120 frames (4s) @ 30fps
//
// SCRIPT:
//   "That's why you sometimes see outdated or flickering results."
//
// VISUAL IDEAS:
//   - Fake search results list that flickers between two different sets of results
//   - Results toggle/flash rapidly to show the symptom the user recognises
//   - "Outdated" and "Flickering" labels with red highlights
//   - Relatable moment — viewer should think "oh, I've seen this"

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill>
      {/* TODO */}
    </AbsoluteFill>
  );
};
