// Scene 4 — "Two properties change that."
//
// Layout (matches sketch):
//   Two rectangles slide in from left/right, meet at center with a small gap.
//   Width of each rect is proportional to its text content.
//   Text inside each rect is blurred.
//   After rects settle (~frame 20):
//     — Stem grows UP   from left  rect center → circle "01" pops at top
//     — Stem grows DOWN from right rect center → circle "02" pops at bottom
//   Sentence "Two properties change that." rises in word by word (~frame 30)
//   Hold, then full scene fades out frames 55–60.
//
// Total: 60 frames @ 30fps = 2 seconds

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

// ─── Layout constants ─────────────────────────────────────────────────────────

const RECT_H       = 116;    // rectangle height
const RECT_PAD_X   = 56;     // horizontal padding inside each rect
const GAP          = 30;     // gap between the two rects at rest
const FONT_SIZE    = 48;     // property text font size
const CHAR_W       = 0.575;  // JetBrains Mono approx width ratio at this size

// Compute widths from text — so each rect hugs its content
const TEXT_LEFT    = "@starting-style";
const TEXT_RIGHT   = "transition-behavior";
const RECT_W_L     = Math.ceil(TEXT_LEFT.length  * FONT_SIZE * CHAR_W) + RECT_PAD_X * 2;
const RECT_W_R     = Math.ceil(TEXT_RIGHT.length * FONT_SIZE * CHAR_W) + RECT_PAD_X * 2;

// Stem + circle
const STEM_H       = 100;
const CIRCLE_R     = 62;

// Slide-in distance (off-screen)
const SLIDE_DIST   = 860;

// Solid colors for the shapes
const COLOR_L = "#6366F1"; // Indigo
const COLOR_R = "#EC4899"; // Pink

// Heavy blur to hide the text completely
const BLUR = 10;

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Rects slide in (frames 0–22) ─────────────────────────────────────────
  const slideSpring = spring({
    fps,
    frame,
    config: { damping: 16, stiffness: 160, mass: 0.9 },
    durationInFrames: 24,
  });

  // Final resting positions (each rect measured from its own center, relative to canvas center)
  // Left  rect: its right edge sits at -(GAP/2),  so center = -(RECT_W_L/2 + GAP/2)
  // Right rect: its left  edge sits at +(GAP/2),  so center = +(RECT_W_R/2 + GAP/2)
  const leftRestX  = -(RECT_W_L / 2 + GAP / 2);
  const rightRestX =  (RECT_W_R / 2 + GAP / 2);

  const leftX  = interpolate(slideSpring, [0, 1], [leftRestX  - SLIDE_DIST, leftRestX ]);
  const rightX = interpolate(slideSpring, [0, 1], [rightRestX + SLIDE_DIST, rightRestX]);

  const rectOpacity = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Stems grow (frames 18–30) ─────────────────────────────────────────────
  const stemSpring = spring({
    fps,
    frame: Math.max(0, frame - 18),
    config: { damping: 18, stiffness: 200, mass: 0.6 },
    durationInFrames: 16,
  });
  const stemScale = interpolate(stemSpring, [0, 1], [0, 1]);

  // ── Circles pop in (frames 24–36) ─────────────────────────────────────────
  const circleSpring = spring({
    fps,
    frame: Math.max(0, frame - 24),
    config: { damping: 11, stiffness: 240, mass: 0.5 },
    durationInFrames: 18,
  });
  const circleScale   = interpolate(easeOutBack(clamp(circleSpring)), [0, 1], [0, 1]);
  const circleOpacity = interpolate(frame, [24, 30], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Sentence words stagger in (frames 30–50) ──────────────────────────────
  const sentenceWords: { word: string; start: number; color?: string }[] = [
    { word: "Two",        start: 30, color: COLORS.accentA },
    { word: "properties", start: 36 },
    { word: "change",     start: 42 },
    { word: "that.",      start: 47 },
  ];

  // ── Full scene fade-out (frames 55–60) ────────────────────────────────────
  const sceneFade = interpolate(frame, [55, 60], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        opacity: sceneFade,
        position: "relative",
        left: -30, // Nudge left to visually center the composition (since the right rect is wider)
        scale: 0.75, // Slight overall scale up to add energy and prevent black edges during fade-out
      }}
    >
      {/* ─── Central layout block ─────────────────────────────────────────
          We use a relative container whose center aligns with the canvas center.
          Total height: circle(above) + stem + rect + stem + circle(below)
          We'll overlap the sentence below this via marginBottom.
      ───────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: "relative",
          width: RECT_W_L + RECT_W_R + GAP + CIRCLE_R * 4 + 40,
          height: CIRCLE_R * 2 + STEM_H + RECT_H + STEM_H + CIRCLE_R * 2,
          marginBottom: 60,
          flexShrink: 0,
        }}
      >
        {/* Helper — everything anchored to horizontal center of this container */}
        {(() => {
          const CW = RECT_W_L + RECT_W_R + GAP + CIRCLE_R * 4 + 40;
          const cx = CW / 2;                           // horizontal center of container
          const rectTop = CIRCLE_R * 2 + STEM_H;       // Y where rects sit

          return (
            <>
              {/* ══ LEFT RECT ══════════════════════════════════════════ */}
              <div
                style={{
                  position: "absolute",
                  top: rectTop,
                  left: cx + leftX - RECT_W_L / 2,
                  width: RECT_W_L,
                  height: RECT_H,
                  borderRadius: 18,
                  background: COLOR_L,
                  boxShadow: `0 18px 50px rgba(0,0,0,0.55)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: rectOpacity,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: FONT_SIZE,
                    fontWeight: 700,
                    color: "rgba(0, 0, 0)", // Transparent color
                    filter: `blur(${BLUR}px)`, // Heavily blurred to hide it
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.01em",
                    userSelect: "none",
                  }}
                >
                  {TEXT_LEFT}
                </span>
              </div>

              {/* ══ RIGHT RECT ═════════════════════════════════════════ */}
              <div
                style={{
                  position: "absolute",
                  top: rectTop,
                  left: cx + rightX - RECT_W_R / 2,
                  width: RECT_W_R,
                  height: RECT_H,
                  borderRadius: 18,
                  background: COLOR_R,
                  boxShadow: `0 18px 50px rgba(0,0,0,0.55)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: rectOpacity,
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: FONT_SIZE,
                    fontWeight: 700,
                    color: "rgba(0, 0, 0)", // Transparent color
                    filter: `blur(${BLUR}px)`, // Heavily blurred to hide it
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.01em",
                    userSelect: "none",
                  }}
                >
                  {TEXT_RIGHT}
                </span>
              </div>

              {/* ══ STEM UP — from top of left rect ════════════════════ */}
              <div
                style={{
                  position: "absolute",
                  left: cx + leftX - 2,
                  top: rectTop - STEM_H,
                  width: 4,
                  height: STEM_H,
                  borderRadius: 2,
                  background: COLOR_L,
                  opacity: rectOpacity,
                  transform: `scaleY(${stemScale})`,
                  transformOrigin: "bottom center",
                }}
              />

              {/* ══ CIRCLE 01 — above left rect ════════════════════════ */}
              <div
                style={{
                  position: "absolute",
                  left: cx + leftX - CIRCLE_R,
                  top: rectTop - STEM_H - CIRCLE_R * 2,
                  width: CIRCLE_R * 2,
                  height: CIRCLE_R * 2,
                  borderRadius: "50%",
                  background: COLOR_L,
                  boxShadow: `0 0 28px rgba(99, 102, 241, 0.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: circleOpacity,
                  transform: `scale(${circleScale})`,
                  transformOrigin: "center bottom",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 65,
                    fontWeight: 800,
                    color: "rgba(0, 0, 0)", // Transparent color
                     // Blurred so it acts as an abstract design element
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  01
                </span>
              </div>

              {/* ══ STEM DOWN — from bottom of right rect ══════════════ */}
              <div
                style={{
                  position: "absolute",
                  left: cx + rightX - 2,
                  top: rectTop + RECT_H,
                  width: 4,
                  height: STEM_H,
                  borderRadius: 2,
                  background: COLOR_R,
                  opacity: rectOpacity,
                  transform: `scaleY(${stemScale})`,
                  transformOrigin: "top center",
                }}
              />

              {/* ══ CIRCLE 02 — below right rect ═══════════════════════ */}
              <div
                style={{
                  position: "absolute",
                  left: cx + rightX - CIRCLE_R,
                  top: rectTop + RECT_H + STEM_H,
                  width: CIRCLE_R * 2,
                  height: CIRCLE_R * 2,
                  borderRadius: "50%",
                  background: COLOR_R,
                  boxShadow: `0 0 28px rgba(236, 72, 153, 0.4)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: circleOpacity,
                  transform: `scale(${circleScale})`,
                  transformOrigin: "center top",
                }}
              >
                <span
                  style={{
                    fontFamily: FONTS.mono,
                    fontSize: 65,
                    fontWeight: 800,
                    color: "rgba(0, 0, 0)", // Transparent color
                     // Blurred so it acts as an abstract design element
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  02
                </span>
              </div>
            </>
          );
        })()}
      </div>
    </AbsoluteFill>
  );
};