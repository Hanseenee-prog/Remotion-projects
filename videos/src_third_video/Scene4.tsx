/**
 * Scene 4 — 150 frames (5 s)
 *
 * Visual only — no text.
 *
 * ─── TIMING MAP ──────────────────────────────────────────────────────────────
 *
 *   JS logo pop-in       →  prog(frame,  0, 25, "outBack")
 *   Line draw            →  prog(frame, 15, 42, "inOut")
 *   Dots start           →  DOT_START = 80
 *   Dot period           →  DOT_PERIOD = 22  (dot 1 @ 80, dot 2 @ 102)
 *   Dot travel duration  →  DOT_TRAVEL = 35  (dot 2 exits ~frame 137)
 *   Dot pause at logo    →  DOT_PAUSE  = 8
 *   Everything fade-out  →  prog(frame, 140, 147)
 *
 *   Render order (back → front):
 *     1. Straight line  (behind logo)
 *     2. Dots           (behind logo)
 *     3. JS logo        (on top of everything)
 *
 *   Logo enlarges when hit: scale pulses 1 → 1.18 → 1 during pause window.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS } from "./tokens";

// ─── Layout ──────────────────────────────────────────────────────────────────

const W  = CANVAS.width;
const H  = CANVAS.height;
const CX = W / 2;

// Straight horizontal line through vertical centre
const LINE_Y       = Math.round(H / 2) - 60;
const LINE_X_START = SAFE.left;
const LINE_X_END   = W - SAFE.right;

// Logo
const LOGO_SIZE = 192;
const LOGO_CX   = CX;
const LOGO_CY   = LINE_Y;

// Dot
const DOT_R           = 24;
const HIT_X           = LOGO_CX;
const DOT_ENTRY_COLOR = "#CBA6F7";
const DOT_EXIT_COLOR  = "#A6E3A1";

// Dot timing — tuned so 2 dots fully pass before frame 140
const DOT_START  = 80;
const DOT_PERIOD = 22;
const DOT_TRAVEL = 35;
const DOT_PAUSE  = 8;

// Derived pause window in frames-of-age
const approachF = Math.round(DOT_TRAVEL * 0.5);
const pauseEndF = approachF + DOT_PAUSE;

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function easeOutBack(t: number): number {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function prog(
  frame: number, start: number, end: number,
  ease: "out" | "inOut" | "outBack" = "inOut"
): number {
  const t = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  if (ease === "out")     return easeOut(t);
  if (ease === "outBack") return easeOutBack(t);
  return easeInOut(t);
}

// ─── Dot travel from age ──────────────────────────────────────────────────────

function dotXFromAge(age: number): number {
  if (age <= 0)         return LINE_X_START;
  if (age <= approachF) return interpolate(age / approachF,                        [0, 1], [LINE_X_START, HIT_X]);
  if (age <= pauseEndF) return HIT_X;
  if (age <= DOT_TRAVEL) return interpolate((age - pauseEndF) / (DOT_TRAVEL - pauseEndF), [0, 1], [HIT_X,        LINE_X_END]);
  return LINE_X_END;
}

function dotColorFromAge(age: number): string {
  return age > pauseEndF ? DOT_EXIT_COLOR : DOT_ENTRY_COLOR;
}

function dotOpFromAge(age: number): number {
  if (age <= 0)               return 0;
  if (age <= 4)               return age / 4;
  if (age >= DOT_TRAVEL - 4)  return Math.max(0, (DOT_TRAVEL - age) / 4);
  return 1;
}

// ─── Components ──────────────────────────────────────────────────────────────

const Dot: React.FC<{ x: number; color: string; opacity: number }> = ({
  x, color, opacity,
}) => (
  <div style={{
    position:     "absolute",
    left:         x - DOT_R,
    top:          LINE_Y - DOT_R,
    width:        DOT_R * 2,
    height:       DOT_R * 2,
    borderRadius: "50%",
    background:   color,
    boxShadow:    `0 0 ${DOT_R}px ${color}CC`,
    opacity,
    pointerEvents: "none",
  }} />
);

const JSLogo: React.FC<{
  jerk: number;
  hitScale: number;
  processedCount: number;
  processingNow: boolean;
}> = ({ jerk, hitScale, processedCount, processingNow }) => {
  const jerkX = Math.sin(jerk * Math.PI * 7) * jerk * 12;
  const jerkY = Math.cos(jerk * Math.PI * 5) * jerk * 8;

  const glowColors = ["transparent", "#A6E3A1", "#00FF94"];
  const glowColor   = processedCount > 0 ? glowColors[Math.min(processedCount, 2)] : "transparent";
  const borderColor = processingNow ? "#CBA6F7" : glowColor;
  const borderWidth = processedCount > 0 || processingNow ? 8 : 0;
  const outerGlow   = processedCount > 0
    ? `0 0 40px ${glowColor}88, 0 0 80px ${glowColor}33`
    : "none";

  return (
    <div style={{
      position:        "absolute",
      left:            LOGO_CX - LOGO_SIZE / 2 + jerkX,
      top:             LOGO_CY - LOGO_SIZE / 2 + jerkY,
      width:           LOGO_SIZE,
      height:          LOGO_SIZE,
      borderRadius:    32,
      border:          borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
      boxShadow:       outerGlow,
      // hitScale drives the enlarge pulse
      transform:       `scale(${hitScale})`,
      transformOrigin: "center center",
      pointerEvents:   "none",
    }}>
      <svg width={LOGO_SIZE} height={LOGO_SIZE} viewBox="0 0 192 192" fill="none">
        <rect width="192" height="192" rx="28" fill="#F7DF1E" />
        <rect x="0" y="0" width="28" height="192" rx="28" fill="rgba(0,0,0,0.09)" />
        {processedCount > 0 && (
          <rect width="192" height="192" rx="28"
            fill={`rgba(166,227,161,${Math.min(processedCount * 0.07, 0.18)})`} />
        )}
        <text x="96" y="130" textAnchor="middle"
          fontFamily="'Syne', sans-serif" fontWeight="900"
          fontSize="88" fill="#1A1A1A" letterSpacing="-4">JS</text>
      </svg>
    </div>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-out
  const fadeOut = 1 - prog(frame, 140, 147, "inOut");

  // Logo pop-in
  const logoPopScale = prog(frame,  0, 25, "outBack");
  const logoOp       = prog(frame,  0, 18, "out") * fadeOut;

  // Line draw
  const lineDrawP = prog(frame, 15, 42, "inOut");

  // Active dots
  const activeDots: Array<{ age: number; index: number }> = [];
  const maxDots = 8;
  for (let i = 0; i < maxDots; i++) {
    const spawnFrame = DOT_START + i * DOT_PERIOD;
    const age = frame - spawnFrame;
    if (age >= 0 && age <= DOT_TRAVEL) {
      activeDots.push({ age, index: i });
    }
  }

  // Jerk
  function jerkForAge(age: number): number {
    const norm = age / DOT_TRAVEL;
    const pA   = approachF / DOT_TRAVEL;
    const pB   = pauseEndF / DOT_TRAVEL;
    if (norm < pA - 0.04 || norm > pB + 0.04) return 0;
    const t = (norm - (pA - 0.04)) / 0.12;
    return Math.sin(Math.max(0, Math.min(1, t)) * Math.PI);
  }
  let jerk = 0;
  for (const { age } of activeDots) jerk = Math.max(jerk, jerkForAge(age));

  // Processed count
  let processedCount = 0;
  for (let i = 0; i < maxDots; i++) {
    const age = frame - (DOT_START + i * DOT_PERIOD);
    if (age > pauseEndF) processedCount++;
  }
  processedCount = Math.min(processedCount, 2);

  const processingNow = activeDots.some(({ age }) => age >= approachF && age <= pauseEndF);

  // Logo hit scale — pulses to 1.18 during pause window, springs back
  // We use the jerk value (0→1 bell) to drive the scale smoothly
  const hitScale = logoPopScale * (1 + jerk * 0.18);

  return (
    <AbsoluteFill>

      {/* ── 1. Straight line — BEHIND logo ───────────────────────────────── */}
      {lineDrawP > 0 && (
        <svg width={W} height={H}
          style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none",
                   opacity: fadeOut }}>
          {/* Glow */}
          <line
            x1={LINE_X_START} y1={LINE_Y}
            x2={LINE_X_START + (LINE_X_END - LINE_X_START) * lineDrawP} y2={LINE_Y}
            stroke="rgba(255,255,255,0.12)" strokeWidth={22} strokeLinecap="round"
          />
          {/* Main line */}
          <line
            x1={LINE_X_START} y1={LINE_Y}
            x2={LINE_X_START + (LINE_X_END - LINE_X_START) * lineDrawP} y2={LINE_Y}
            stroke="rgba(255,255,255,0.55)" strokeWidth={10} strokeLinecap="round"
          />
        </svg>
      )}

      {/* ── 2. Dots — BEHIND logo ────────────────────────────────────────── */}
      {activeDots.map(({ age, index }) => {
        const x  = dotXFromAge(age);
        const op = dotOpFromAge(age) * fadeOut;
        return op > 0
          ? <Dot key={index} x={x} color={dotColorFromAge(age)} opacity={op} />
          : null;
      })}

      {/* ── 3. JS Logo — ON TOP of line and dots ─────────────────────────── */}
      <div style={{
        position:        "absolute",
        left: 0, top: 0, width: W, height: H,
        pointerEvents:   "none",
        opacity:         logoOp,
        transform:       `scale(${hitScale})`,
        transformOrigin: `${LOGO_CX}px ${LOGO_CY}px`,
      }}>
        <JSLogo
          jerk={jerk}
          hitScale={1}   // outer scale already applied above; inner is always 1
          processedCount={processedCount}
          processingNow={processingNow}
        />
      </div>

    </AbsoluteFill>
  );
};