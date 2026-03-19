import React from "react";
import { AbsoluteFill, Audio, Img, Series, staticFile } from "remotion";
import { Scene01Hook } from "./Scene1";
import { Scene2 } from "./Scene2";
import { Scene3 } from "./Scene3";
import { Scene4 } from "./Scene4";
import { Scene5 } from "./Scene5";
import { Scene6 } from "./Scene6";
import { Scene6ctd } from "./Scene6ctd";
import { Scene7IntroPunch } from "./Scene7Intro";

// ─── Timing (frames @ 30fps) ──────────────────────────────────────────────────
export const SCENE_DURATIONS = {
  s01:  4.2 * 30,   // 150f — The Hook (5s to let everything breathe)
  s02:  3 * 30,   //  90f — It Works
  s03:  6 * 30,   // 180f — The Problem
  s04:  4 * 30,   // 120f — The Cost
  s05:  3 * 30,   //  90f — The Question
  s06:  1.8 * 30,   // 150f — Event Delegation Intro
  s06ctd: 2 * 30, //  45f — Event Delegation Continued (gears)
  s07intro: 2 * 30, // 15f — Intro to The Bubble (short teaser before main bubble scene)
  s07:  7 * 30,   // 210f — The Bubble
  s08:  6 * 30,   // 180f — The Solution
  s09:  5 * 30,   // 150f — The Payoff
  s10:  3 * 30,   //  90f — CTA
} as const;

export const TOTAL_DURATION = Object.values(SCENE_DURATIONS).reduce(
  (sum, d) => sum + d,
  0
); // 1440f = 48s

// ─── Design Tokens ────────────────────────────────────────────────────────────
export const COLORS = {
  accent:     "#00FF94",
  accentBlue: "#4D9FFF",
  accentRed:  "#FF4D4D",
  white:      "#FFFFFF",
  offWhite:   "#E8E8E8",
  muted:      "#888888",
  dark:       "#0A0A0A",
} as const;

export const FONTS = {
  mono:    "'JetBrains Mono', 'Fira Code', monospace",
  display: "'DM Sans', sans-serif",
} as const;

// ─── Shared Background ────────────────────────────────────────────────────────
export const ReelBackground: React.FC = () => (
  <AbsoluteFill>
    <AbsoluteFill style={{ backgroundColor: "#0D0D0D" }} />
    <AbsoluteFill>
      <Img
        src={staticFile("bg-image.jpg")}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
      }}
    />
  </AbsoluteFill>
);

// ─── Placeholder ──────────────────────────────────────────────────────────────
const Placeholder: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <AbsoluteFill
    style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
  >
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 36,
        color,
        border: `2px solid ${color}`,
        padding: "24px 40px",
        borderRadius: 8,
        opacity: 0.5,
      }}
    >
      {label}
    </div>
  </AbsoluteFill>
);

// ─── Main Reel ────────────────────────────────────────────────────────────────
export const Reel: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#0D0D0D", overflow: "hidden" }}>
    <Audio src={staticFile("voiceover.mp3")} />
    <ReelBackground />

    <Series>
      <Series.Sequence durationInFrames={SCENE_DURATIONS.s01}>
        <Scene01Hook />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s02}>
        <Scene2 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s03}>
        <Scene3 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s04}>
        <Scene4 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s05}>
        <Scene5 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s06}>
        <Scene6 />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s06ctd}>
        <Scene6ctd />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s07intro}>
        <Scene7IntroPunch />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s07}>
        <Placeholder label="07 — The Bubble" color="#4D9FFF" />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s08}>
        <Placeholder label="08 — The Solution" color="#00FF94" />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s09}>
        <Placeholder label="09 — The Payoff" color="#4D9FFF" />
      </Series.Sequence>

      <Series.Sequence durationInFrames={SCENE_DURATIONS.s10}>
        <Placeholder label="10 — CTA" color="#00FF94" />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);