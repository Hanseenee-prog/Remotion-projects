import React from "react";
import { AbsoluteFill, Audio, Img, Series, staticFile } from "remotion";
import { DURATIONS, TOTAL_FRAMES, COLORS } from "./tokens";
import { Scene1 } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";
import { Scene6 } from "./Scene6";
import { Scene7 } from "./Scene7";
import { Scene8 } from "./Scene8";
export { TOTAL_FRAMES };

export const ReelBackground: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D" }} />
    <AbsoluteFill>
      <Img
        src={staticFile("bg-image.jpg")}
        style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }}
      />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.7) 100%)",
      }}
    />
  </AbsoluteFill>
);

export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
    <ReelBackground />
    <Audio src={staticFile("voiceover-clone.mp3")} />
    <Series>
      <Series.Sequence durationInFrames={DURATIONS.s1}><Scene1 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s2}><Scene2 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s3}><Scene3 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s4}><Scene4 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s5}><Scene5 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s6}><Scene6 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s7}><Scene7 /></Series.Sequence>
      <Series.Sequence durationInFrames={DURATIONS.s8}><Scene8 /></Series.Sequence>
    </Series>
  </AbsoluteFill>
);
