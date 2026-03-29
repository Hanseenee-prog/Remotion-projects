// Scene 4 — "Two properties change that."
//
// Timeline (30fps):
//   0–12   : Both cards start stacked at center (scale 0 → 1, spring pop)
//   12–40  : Cards fan open — left rotates to -28°, right to +28°
//             pivot is bottom-center of both cards (they share the axis)
//   45–70  : Sentence "Two properties change that." fades + slides up, word by word
//   70–120 : Hold — everything visible
//
// The "handfan" mechanic:
//   Both cards sit in a wrapper whose transform-origin is "bottom center".
//   Left card rotates negative degrees, right card positive.
//   The bottom edges stay kissing at the same point — the pivot.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(Math.max(v, lo), hi);
}
function prog(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// ─── Card dimensions ──────────────────────────────────────────────────────────

const CARD_W = 520;
const CARD_H = 520;
const BORDER_R = 36;

// How far each card fans out (degrees)
const FAN_DEG = 27;

// ─── Single fan card ──────────────────────────────────────────────────────────
// The wrapper's transform-origin is bottom-center (bottom of the card).
// Rotating the wrapper around that point = handfan open.

const FanCard: React.FC<{
  side: "left" | "right";
  rotationDeg: number;    // current rotation in degrees
  popScale: number;       // 0 → 1 entrance pop
  accentColor: string;
  number: string;
  propertyText: string;   // the blurred CSS property name
  blurAmount: number;     // px blur on the property text
}> = ({ side, rotationDeg, popScale, accentColor, number, propertyText, blurAmount }) => {
  const isLeft = side === "left";

  return (
    // Outer wrapper: handles rotation around bottom-center
    <div
      style={{
        position: "absolute",
        // Both cards pivot from the same bottom-center point.
        // We offset left/right by half card width so their inner bottom
        // corners meet at the pivot.
        left: isLeft ? -CARD_W : 0,
        bottom: 0,
        width: CARD_W,
        height: CARD_H,
        transformOrigin: isLeft ? "bottom right" : "bottom left",
        transform: `rotate(${rotationDeg}deg) scale(${popScale})`,
        willChange: "transform",
        zIndex: isLeft ? 1 : 2,
      }}
    >
      {/* Card face */}
      <div
        style={{
          width: CARD_W,
          height: CARD_H,
          borderRadius: BORDER_R,
          background: COLORS.codeBg,
          border: `5px solid ${accentColor}`,
          boxShadow: `0 40px 100px rgba(0,0,0,0.7), 0 0 0 1px ${accentColor}22`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Subtle accent glow behind number */}
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: accentColor,
            opacity: 0.06,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -65%)",
          }}
        />

        {/* Number */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 180,
            fontWeight: 800,
            color: accentColor,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            position: "relative",
            zIndex: 1,
          }}
        >
          {number}
        </div>

        {/* Property — blurred */}
        <div
          style={{
            fontFamily: FONTS.mono,
            fontSize: 36,
            fontWeight: 700,
            color: COLORS.codeText,
            textAlign: "center",
            lineHeight: 1.5,
            padding: "0 40px",
            filter: `blur(${blurAmount}px)`,
            opacity: 0.75,
            position: "relative",
            zIndex: 1,
          }}
        >
          {propertyText}
        </div>
      </div>
    </div>
  );
};

// ─── Word-by-word sentence ────────────────────────────────────────────────────

const SentenceWord: React.FC<{
  word: string;
  frame: number;
  startFrame: number;
  color?: string;
}> = ({ word, frame, startFrame, color }) => {
  const p = prog(frame, startFrame, startFrame + 14);
  const e = easeOutBack(p);
  return (
    <span
      style={{
        display: "inline-block",
        opacity: clamp(p * 3),
        transform: `translateY(${interpolate(easeOut(p), [0, 1], [40, 0])}px) scale(${interpolate(e, [0, 1], [0.85, 1])})`,
        color: color ?? COLORS.white,
        marginRight: 24,
        willChange: "transform, opacity",
      }}
    >
      {word}
    </span>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Cards pop in (frame 0–12) ─────────────────────────────────────────────
  const popSpring = spring({
    fps,
    frame,
    config: { damping: 12, stiffness: 200, mass: 0.7 },
    durationInFrames: 16,
  });
  const popScale = interpolate(popSpring, [0, 1], [0, 1]);

  // ── Fan open (frame 12–42) ────────────────────────────────────────────────
  const fanSpring = spring({
    fps,
    frame: Math.max(0, frame - 12),
    config: { damping: 14, stiffness: 100, mass: 1.0 },
    durationInFrames: 36,
  });
  const fanDeg = interpolate(fanSpring, [0, 1], [0, FAN_DEG]);

  // ── Blur dissolves as fan opens (reveal the text gradually) ──────────────
  // Blur goes from 8px → 3.5px as fan opens, stays blurred but legible-ish
  const blurAmount = interpolate(fanSpring, [0, 1], [8, 3.5]);

  // ── Sentence words stagger in (frame 45 onward) ───────────────────────────
  // "Two"(45) "properties"(52) "change"(59) "that."(66)
  const sentenceWords: { word: string; start: number; color?: string }[] = [
    { word: "Two",         start: 45, color: COLORS.accentA  },
    { word: "properties", start: 52                          },
    { word: "change",     start: 59                          },
    { word: "that.",      start: 66                          },
  ];

  // ── Pivot dot pulse ───────────────────────────────────────────────────────
  const dotScale = spring({
    fps,
    frame: Math.max(0, frame - 8),
    config: { damping: 10, stiffness: 200 },
    durationInFrames: 12,
  });

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Fan pivot area ─────────────────────────────────────────────── */}
      {/* This container is the anchor point. Cards extend upward from here. */}
      <div
        style={{
          position: "relative",
          width: CARD_W * 2,  // enough room for both rotated cards
          height: CARD_H + 40,
          marginBottom: 80,
        }}
      >
        {/* Shared pivot origin sits at horizontal center, vertical bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            height: CARD_H,
            width: 0,
          }}
        >
          {/* Left card — rotates negative (counter-clockwise) */}
          <FanCard
            side="left"
            rotationDeg={-fanDeg}
            popScale={popScale}
            accentColor={COLORS.accentC}   // red — #FF7B72
            number="1"
            propertyText="@starting-style"
            blurAmount={blurAmount}
          />

          {/* Right card — rotates positive (clockwise) */}
          <FanCard
            side="right"
            rotationDeg={fanDeg}
            popScale={popScale}
            accentColor={COLORS.accentA}   // green — #7EE787
            number="2"
            propertyText={`transition-behavior:\nallow-discrete`}
            blurAmount={blurAmount}
          />
        </div>

        {/* Pivot dot — tiny indicator where the cards hinge */}
        <div
          style={{
            position: "absolute",
            bottom: -6,
            left: "50%",
            transform: `translate(-50%, 0) scale(${dotScale})`,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.20)",
            border: "1.5px solid rgba(255,255,255,0.35)",
            zIndex: 10,
          }}
        />
      </div>

      {/* ── "Two properties change that." ──────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "nowrap",
          fontFamily: FONTS.display,
          fontSize: 72,
          fontWeight: 800,
          letterSpacing: "-0.025em",
          lineHeight: 1.1,
        }}
      >
        {sentenceWords.map(({ word, start, color }) => (
          <SentenceWord
            key={word}
            word={word}
            frame={frame}
            startFrame={start}
            color={color}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};