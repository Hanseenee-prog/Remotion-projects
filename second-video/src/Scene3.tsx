/**
 * Scene 3 — 120 frames (4 s)
 *
 * Script: "pause for effect as the rockets launch"
 * No voiceover — pure visual drama.
 *
 * ─── TIMING MAP — edit these to adjust every motion ──────────────────────────
 *
 *   Cursor move to icon      →  prog(frame,  0,  8, "inOut")
 *   Cursor click press       →  prog(frame,  8, 10, "out")
 *   Pause→Play icon swap     →  frame >= 10
 *   Play icon fade-in        →  prog(frame, 10, 12, "out")
 *
 *   Rocket B engine glow     →  prog(frame, 12, 20, "out")    ← B launches FIRST
 *   Rocket B lift-off        →  prog(frame, 18, 42, easeIn)   ← slow start, fast exit
 *   Rocket B flame size      →  driven by B lift-off progress
 *
 *   Rocket A engine glow     →  prog(frame, 22, 30, "out")    ← A launches SECOND
 *   Rocket A lift-off        →  prog(frame, 28, 52, easeIn)   ← same physics
 *   Rocket A flame size      →  driven by A lift-off progress
 *
 *   Smoke A expands          →  prog(frame, 20, 80, "out")
 *   Smoke B expands          →  prog(frame, 12, 72, "out")
 *
 *   "huhh" text fade-in      →  prog(frame, 55, 68, "out")
 *   "huhh" text hold         →  frames 68–120
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Font safety: all px hardcoded from 1080×1920 canvas.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Scene 1 geometry (must match Scene1.tsx) ─────────────────────────────────

const W = CANVAS.width;
const H = CANVAS.height;

const STEM_X      = W / 2;
const STEM_TOP    = SAFE.top + 360;
const STEM_BOTTOM = Math.round(H / 2 + H / 5);
const ARM_Y       = STEM_BOTTOM;
const ARM_LEFT    = SAFE.left;
const ARM_RIGHT   = W - SAFE.right;

const COL_A_CX = Math.round((ARM_LEFT + STEM_X) / 2);
const COL_B_CX = Math.round((STEM_X + ARM_RIGHT) / 2);

const PAD_W     = 260;
const PAD_H     = 32;
const PAD_LEG_H = 44;
const PAD_TOTAL = PAD_H + PAD_LEG_H;
const PAD_BOT_Y = ARM_Y;
const PAD_TOP_Y = PAD_BOT_Y - PAD_TOTAL;

const ROCKET_W     = 389;
const ROCKET_H     = 594;
const ROCKET_BOT_Y = PAD_TOP_Y;

const CODE_TOP  = ARM_Y + 32;
const CODE_FONT = 36;
const CODE_LH   = 52;

// ─── Palette ─────────────────────────────────────────────────────────────────

const A_BODY   = "#FF7A20";
const A_DARK   = "#8C3400";
const A_MID    = "#D45A00";
const A_STRIPE = "#FFB347";
const A_WINDOW = "#FFE4CC";
const B_BODY   = "#4A9FFF";
const B_DARK   = "#0A2A6E";
const B_MID    = "#1A5CC8";
const B_STRIPE = "#80C4FF";
const B_WINDOW = "#CCE8FF";
const PAD_COLOR = "#5A5A6A";
const PAD_LIGHT = "#8A8A9A";
const PAD_DARK  = "#2E2E3A";
const STROKE    = 7;
const LINE_COLOR = "rgba(255,255,255,0.72)";

// Token colours for static code display
const KW   = COLORS.keyword;
const PUNC = COLORS.punctuation;
const FN   = COLORS.fnName;
const NUM  = COLORS.number;

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeIn(t: number): number  { return t * t * t; }
function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function prog(
  frame: number, start: number, end: number,
  ease: "in" | "out" | "inOut" = "inOut"
): number {
  const t = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return ease === "in" ? easeIn(t) : ease === "out" ? easeOut(t) : easeInOut(t);
}

// ─── Static Scene 1 components ───────────────────────────────────────────────

const S1Pad: React.FC = () => (
  <svg width={PAD_W} height={PAD_TOTAL} viewBox={`0 0 ${PAD_W} ${PAD_TOTAL}`} fill="none">
    <rect x="0"  y="0"  width={PAD_W} height={3}           rx="1" fill={PAD_LIGHT} opacity={0.6} />
    <rect x="0"  y="3"  width={PAD_W} height={PAD_H - 3}   rx="3" fill={PAD_COLOR} />
    <rect x="0"  y="3"  width={16}    height={PAD_H - 3}   rx="3" fill="rgba(0,0,0,0.25)" />
    <rect x="24" y="12" width="40"    height="8"            rx="2" fill={PAD_DARK} />
    <rect x={PAD_W - 64} y="12" width="40" height="8"      rx="2" fill={PAD_DARK} />
    <rect x={PAD_W / 2 - 6} y="10" width="12" height="12" rx="2" fill={PAD_DARK} opacity={0.7} />
    <rect x="28"         y={PAD_H} width="18" height={PAD_LEG_H}     rx="3" fill={PAD_COLOR} opacity={0.75} />
    <rect x="32"         y={PAD_H} width="8"  height={PAD_LEG_H - 8} rx="2" fill={PAD_DARK}  opacity={0.4} />
    <rect x={PAD_W - 46} y={PAD_H} width="18" height={PAD_LEG_H}     rx="3" fill={PAD_COLOR} opacity={0.75} />
    <rect x={PAD_W - 42} y={PAD_H} width="8"  height={PAD_LEG_H - 8} rx="2" fill={PAD_DARK}  opacity={0.4} />
    <rect x="18"         y={PAD_H + PAD_LEG_H - 8} width="38" height="8" rx="2" fill={PAD_LIGHT} opacity={0.5} />
    <rect x={PAD_W - 56} y={PAD_H + PAD_LEG_H - 8} width="38" height="8" rx="2" fill={PAD_LIGHT} opacity={0.5} />
  </svg>
);

const RocketBodyA: React.FC = () => (
  <svg width={ROCKET_W} height={ROCKET_H} viewBox="0 0 72 110" fill="none">
    <path d="M28 102 Q36 110 44 102 L46 96 L26 96Z" fill={A_DARK} />
    <path d="M30 102 Q36 108 42 102 L43 98 L29 98Z" fill={A_MID} opacity={0.6} />
    <rect x="20" y="82" width="32" height="16" rx="3" fill={A_DARK} />
    <rect x="24" y="84" width="24" height="4"  rx="2" fill={A_MID} opacity={0.5} />
    <rect x="16" y="54" width="40" height="30" rx="2" fill={A_BODY} />
    <rect x="16" y="54" width="8"  height="30" rx="2" fill="rgba(0,0,0,0.22)" />
    <line x1="36" y1="56" x2="36" y2="82" stroke={A_DARK} strokeWidth="1.5" opacity={0.5} />
    <rect x="16" y="68" width="40" height="5"  fill={A_STRIPE} opacity={0.35} />
    <path d="M16 72 L4 96 L16 90Z"  fill={A_DARK} />
    <path d="M16 72 L6 92 L16 88Z"  fill={A_MID} opacity={0.45} />
    <path d="M56 72 L68 96 L56 90Z" fill={A_DARK} />
    <path d="M56 72 L66 92 L56 88Z" fill={A_MID} opacity={0.45} />
    <rect x="16" y="28" width="40" height="28" rx="2" fill={A_BODY} />
    <rect x="16" y="28" width="8"  height="28" rx="2" fill="rgba(0,0,0,0.20)" />
    <rect x="50" y="30" width="4"  height="24" rx="1" fill="rgba(255,255,255,0.12)" />
    <circle cx="36" cy="42" r="9" fill={A_DARK} />
    <circle cx="36" cy="42" r="7" fill={A_WINDOW} opacity={0.25} />
    <circle cx="36" cy="42" r="5" fill={A_WINDOW} opacity={0.55} />
    <circle cx="33" cy="39" r="2" fill="rgba(255,255,255,0.65)" />
    <text x="36" y="76" textAnchor="middle" dominantBaseline="middle" fontFamily="'Syne',sans-serif" fontWeight="900" fontSize="22" fill="rgba(255,255,255,0.95)">A</text>
    <path d="M16 28 Q36 2 56 28Z" fill={A_MID} />
    <path d="M27 22 Q36 5 45 22" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" fill="none" />
    <line x1="36" y1="4" x2="36" y2="28" stroke={A_DARK} strokeWidth="1" opacity={0.4} />
  </svg>
);

const RocketBodyB: React.FC = () => (
  <svg width={ROCKET_W} height={ROCKET_H} viewBox="0 0 72 110" fill="none">
    <path d="M28 102 Q36 110 44 102 L46 96 L26 96Z" fill={B_DARK} />
    <path d="M30 102 Q36 108 42 102 L43 98 L29 98Z" fill={B_MID} opacity={0.6} />
    <rect x="20" y="82" width="32" height="16" rx="3" fill={B_DARK} />
    <rect x="24" y="84" width="24" height="4"  rx="2" fill={B_MID} opacity={0.5} />
    <rect x="16" y="54" width="40" height="30" rx="2" fill={B_BODY} />
    <rect x="16" y="54" width="8"  height="30" rx="2" fill="rgba(0,0,0,0.22)" />
    <line x1="36" y1="56" x2="36" y2="82" stroke={B_DARK} strokeWidth="1.5" opacity={0.5} />
    <rect x="16" y="68" width="40" height="5"  fill={B_STRIPE} opacity={0.35} />
    <path d="M16 72 L4 96 L16 90Z"  fill={B_DARK} />
    <path d="M16 72 L6 92 L16 88Z"  fill={B_MID} opacity={0.45} />
    <path d="M56 72 L68 96 L56 90Z" fill={B_DARK} />
    <path d="M56 72 L66 92 L56 88Z" fill={B_MID} opacity={0.45} />
    <rect x="16" y="28" width="40" height="28" rx="2" fill={B_BODY} />
    <rect x="16" y="28" width="8"  height="28" rx="2" fill="rgba(0,0,0,0.20)" />
    <rect x="50" y="30" width="4"  height="24" rx="1" fill="rgba(255,255,255,0.12)" />
    <circle cx="36" cy="42" r="9" fill={B_DARK} />
    <circle cx="36" cy="42" r="7" fill={B_WINDOW} opacity={0.25} />
    <circle cx="36" cy="42" r="5" fill={B_WINDOW} opacity={0.55} />
    <circle cx="33" cy="39" r="2" fill="rgba(255,255,255,0.65)" />
    <g transform="translate(72,0) scale(-1,1)">
      <text x="36" y="76" textAnchor="middle" dominantBaseline="middle" fontFamily="'Syne',sans-serif" fontWeight="900" fontSize="22" fill="rgba(255,255,255,0.95)">B</text>
    </g>
    <path d="M16 28 Q36 2 56 28Z" fill={B_MID} />
    <path d="M27 22 Q36 5 45 22" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" />
    <line x1="36" y1="4" x2="36" y2="28" stroke={B_DARK} strokeWidth="1" opacity={0.4} />
  </svg>
);

// ─── Rocket flame — rendered below the rocket, grows with launch progress ────
// flameP: 0 = no flame, 1 = full flame at max thrust
// color1/color2: inner/outer flame colours

const RocketFlame: React.FC<{
  flameP: number;
  color1: string;
  color2: string;
}> = ({ flameP, color1, color2 }) => {
  if (flameP <= 0) return null;
  // Flame grows from 0 to ~180px tall as flameP → 1
  const fh = Math.round(flameP * 180);
  const fw = Math.round(200 + flameP * 180);  // wide — matches rocket body at full thrust
  return (
    <svg
      width={fw} height={fh}
      viewBox={`0 0 ${fw} ${fh}`}
      style={{
        position: "absolute",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
      }}
      fill="none"
    >
      {/* Outer flame plume — wide, translucent */}
      <path
        d={`M${fw * 0.15} 0 Q${fw * 0.05} ${fh * 0.6} ${fw * 0.3} ${fh} Q${fw * 0.5} ${fh * 1.1} ${fw * 0.7} ${fh} Q${fw * 0.95} ${fh * 0.6} ${fw * 0.85} 0Z`}
        fill={color2}
        opacity={0.35}
      />
      {/* Mid flame — brighter, narrower */}
      <path
        d={`M${fw * 0.25} 0 Q${fw * 0.15} ${fh * 0.5} ${fw * 0.38} ${fh * 0.85} Q${fw * 0.5} ${fh * 0.95} ${fw * 0.62} ${fh * 0.85} Q${fw * 0.85} ${fh * 0.5} ${fw * 0.75} 0Z`}
        fill={color2}
        opacity={0.65}
      />
      {/* Inner core — bright white-yellow */}
      <path
        d={`M${fw * 0.35} 0 Q${fw * 0.28} ${fh * 0.4} ${fw * 0.42} ${fh * 0.7} Q${fw * 0.5} ${fh * 0.8} ${fw * 0.58} ${fh * 0.7} Q${fw * 0.72} ${fh * 0.4} ${fw * 0.65} 0Z`}
        fill={color1}
        opacity={0.9}
      />
      {/* Bright nozzle exit — small intense oval */}
      <ellipse
        cx={fw * 0.5} cy={4}
        rx={fw * 0.18} ry={6}
        fill="rgba(255,255,255,0.9)"
      />
    </svg>
  );
};

// ─── Smoke puff — expands and fades from pad position ────────────────────────

const SmokePuff: React.FC<{
  smokeP: number;   // 0→1 expansion progress
  cx: number;       // absolute canvas X centre
  baseY: number;    // absolute canvas Y (bottom of pad)
}> = ({ smokeP, cx, baseY }) => {
  if (smokeP <= 0) return null;

  // Three expanding circles at slightly different offsets
  const puffs = [
    { dx: -30, dyFrac: 0.3, r: 40 + smokeP * 90, delay: 0   },
    { dx:  20, dyFrac: 0.5, r: 30 + smokeP * 70, delay: 0.1 },
    { dx:  60, dyFrac: 0.2, r: 50 + smokeP * 110, delay: 0.05 },
    { dx: -60, dyFrac: 0.4, r: 35 + smokeP * 80, delay: 0.15 },
  ];

  return (
    <>
      {puffs.map((p, i) => {
        const localP = Math.max(0, smokeP - p.delay);
        const opacity = localP > 0 ? Math.max(0, 0.55 - smokeP * 0.55) : 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + p.dx - p.r,
              top:  baseY - p.r * p.dyFrac * 2 - p.r,
              width:  p.r * 2,
              height: p.r * 2,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(180,180,180,${opacity}) 0%, rgba(120,120,120,0) 70%)`,
              pointerEvents: "none",
            }}
          />
        );
      })}
    </>
  );
};

// ─── Pause / Play icon ───────────────────────────────────────────────────────

const PauseIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    {/* Two bars */}
    <rect x="10" y="10" width="4" height="12" rx="1.5" fill="white" />
    <rect x="18" y="10" width="4" height="12" rx="1.5" fill="white" />
  </svg>
);

const PlayIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="15" fill="rgba(0,0,0,0.55)" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
    {/* Triangle */}
    <path d="M13 10.5 L22 16 L13 21.5Z" fill="white" />
  </svg>
);

// ─── Cursor SVG ──────────────────────────────────────────────────────────────

const Cursor: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <svg width={96 * scale} height={120 * scale} viewBox="0 0 32 40" fill="none">
    <path d="M4 2 L4 30 L11 23 L16 36 L20 34 L15 21 L24 21Z"
      fill="white" stroke="rgba(0,0,0,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

// ─── Icon position (top-right safe zone) ─────────────────────────────────────

const ICON_SIZE = 220;
const ICON_X    = CANVAS.width - SAFE.right - ICON_SIZE - 16;   // sits flush in right safe zone
const ICON_Y    = SAFE.top + 20;                                  // near top

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Cursor ─────────────────────────────────────────────────────────────────
  // Moves from bottom-right toward the icon, arrives and clicks
  const cursorMoveP = prog(frame, 0, 8, "inOut");
  const cursorClickP = prog(frame, 8, 10, "out");
  const cursorVisible = frame < 14;

  // Cursor start position — comes from bottom right of safe area
  const CURSOR_START_X = CANVAS.width - SAFE.right - 80;
  const CURSOR_START_Y = SAFE.top + 200;
  const CURSOR_END_X   = ICON_X + ICON_SIZE * 0.35;
  const CURSOR_END_Y   = ICON_Y + ICON_SIZE * 0.35;

  const cursorX = interpolate(cursorMoveP, [0, 1], [CURSOR_START_X, CURSOR_END_X]);
  const cursorY = interpolate(cursorMoveP, [0, 1], [CURSOR_START_Y, CURSOR_END_Y]);
  // Click: scale down slightly
  const cursorScale = 1 - cursorClickP * 0.15;

  // ── Icon ───────────────────────────────────────────────────────────────────
  // Pause icon fades out as play fades in (frames 10–12)
  const pauseFadeOp = 1 - prog(frame, 10, 12, "out");
  // Play icon: fades in 10→12, holds 2 frames, fades out 14→18
  const playFadeIn  = prog(frame, 10, 12, "out");
  const playFadeOut = 1 - prog(frame, 30, 32, "out");
  const playFadeOp  = playFadeIn * playFadeOut;
  const showPlay    = frame >= 10;

  // ── Engine glow — before lift-off ──────────────────────────────────────────
  // B glows first (frames 12–18), A glows (frames 22–28)
  const glowBP = prog(frame, 12, 18, "out");
  const glowAP = prog(frame, 22, 28, "out");

  // ── Rocket lift-off — easeIn = slow start, fast exit ──────────────────────
  // B lifts off: 18–42, A: 28–52
  const liftBP = prog(frame, 18, 42, "in");
  const liftAP = prog(frame, 28, 52, "in");

  // Y offset: rockets move UP by ROCKET_H + safe zone height
  // They need to clear the top of the canvas: travel = ROCKET_BOT_Y + 100 (fully off-screen)
  const ROCKET_TRAVEL = ROCKET_BOT_Y + 100;  // enough to clear top
  const rocketBY = -(liftBP * ROCKET_TRAVEL);   // offset from base position
  const rocketAY = -(liftAP * ROCKET_TRAVEL);

  // ── Flame P — grows with lift-off progress ─────────────────────────────────
  // Flame is 0 before glow, builds during glow, peaks during flight
  const flameBP = Math.max(glowBP * 0.4, liftBP);
  const flameAP = Math.max(glowAP * 0.4, liftAP);

  // ── Smoke ──────────────────────────────────────────────────────────────────
  const smokeAP = prog(frame, 20, 80, "out");
  const smokeBP = prog(frame, 12, 72, "out");

  // ── "huhh" hold ────────────────────────────────────────────────────────────
  const huhhOp = prog(frame, 55, 68, "out");

  return (
    <AbsoluteFill>

      {/* ── Static T-line ─────────────────────────────────────────────────── */}
      <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
        <line x1={STEM_X} y1={STEM_TOP}  x2={STEM_X}    y2={STEM_BOTTOM} stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        <line x1={STEM_X} y1={ARM_Y}     x2={ARM_LEFT}  y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        <line x1={STEM_X} y1={ARM_Y}     x2={ARM_RIGHT} y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
      </svg>

      {/* ── Static pads ───────────────────────────────────────────────────── */}
      <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_A_CX - PAD_W / 2 }}>
        <S1Pad />
      </div>
      <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_B_CX - PAD_W / 2 }}>
        <S1Pad />
      </div>

      {/* ── Static code snippets ──────────────────────────────────────────── */}
      <div style={{
        position: "absolute", top: CODE_TOP, left: ARM_LEFT,
        width: STEM_X - ARM_LEFT, textAlign: "center",
        fontFamily: FONTS.mono, fontSize: CODE_FONT, lineHeight: `${CODE_LH}px`,
        whiteSpace: "pre", overflow: "hidden",
      }}>
        <span style={{ color: KW }}>setTimeout</span>
        <span style={{ color: PUNC }}>(</span>
        <span style={{ color: FN }}>launchA</span>
        <span style={{ color: PUNC }}>, </span>
        <span style={{ color: NUM }}>0</span>
        <span style={{ color: PUNC }}>);</span>
      </div>
      <div style={{
        position: "absolute", top: CODE_TOP, left: STEM_X,
        width: ARM_RIGHT - STEM_X, textAlign: "center",
        fontFamily: FONTS.mono, fontSize: CODE_FONT, lineHeight: `${CODE_LH}px`,
        whiteSpace: "pre", overflow: "hidden",
      }}>
        <span style={{ color: FN }}>launchB</span>
        <span style={{ color: PUNC }}>();</span>
      </div>

      {/* ── Smoke A (stays on pad after A launches) ───────────────────────── */}
      <SmokePuff smokeP={smokeAP} cx={COL_A_CX} baseY={PAD_BOT_Y} />

      {/* ── Smoke B ───────────────────────────────────────────────────────── */}
      <SmokePuff smokeP={smokeBP} cx={COL_B_CX} baseY={PAD_BOT_Y} />

      {/* ── Rocket A with flame ───────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: ROCKET_BOT_Y - ROCKET_H + rocketAY,
        left: COL_A_CX - ROCKET_W / 2,
      }}>
        {/* Engine glow halo */}
        {glowAP > 0 && (
          <div style={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120 + glowAP * 80,
            height: 120 + glowAP * 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,160,40,${glowAP * 0.7}) 0%, rgba(255,80,0,0) 70%)`,
            pointerEvents: "none",
          }} />
        )}
        <RocketBodyA />
        {/* Flame below rocket body */}
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>
          <RocketFlame
            flameP={flameAP}
            color1="#FFE566"
            color2="#FF7A20"
          />
        </div>
      </div>

      {/* ── Rocket B with flame (launches first) ──────────────────────────── */}
      <div style={{
        position: "absolute",
        top: ROCKET_BOT_Y - ROCKET_H + rocketBY,
        left: COL_B_CX - ROCKET_W / 2,
        transform: "scaleX(-1)",
      }}>
        {glowBP > 0 && (
          <div style={{
            position: "absolute",
            bottom: -20,
            left: "50%",
            transform: "translateX(-50%) scaleX(-1)",
            width: 120 + glowBP * 80,
            height: 120 + glowBP * 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(80,160,255,${glowBP * 0.7}) 0%, rgba(0,80,255,0) 70%)`,
            pointerEvents: "none",
          }} />
        )}
        <RocketBodyB />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>
          <RocketFlame
            flameP={flameBP}
            color1="#CCF0FF"
            color2="#4A9FFF"
          />
        </div>
      </div>

      {/* ── Pause / Play icon ─────────────────────────────────────────────── */}
      <div style={{ position: "absolute", top: ICON_Y, left: ICON_X }}>
        {!showPlay && (
          <div style={{ opacity: pauseFadeOp }}>
            <PauseIcon size={ICON_SIZE} />
          </div>
        )}
        {showPlay && playFadeOp > 0 && (
          <div style={{ opacity: playFadeOp }}>
            <PlayIcon size={ICON_SIZE} />
          </div>
        )}
      </div>

      {/* ── Cursor ────────────────────────────────────────────────────────── */}
      {cursorVisible && (
        <div style={{
          position: "absolute",
          top:      cursorY,
          left:     cursorX,
          pointerEvents: "none",
        }}>
          <Cursor scale={cursorScale} />
        </div>
      )}

      {/* ── "huhh" reaction text ──────────────────────────────────────────── */}
      {huhhOp > 0 && (
        <div style={{
          position:   "absolute",
          top:        SAFE.top + 60,
          left:       SAFE.left,
          width:      CANVAS.safeWidth,
          textAlign:  "center",
          fontFamily: FONTS.display,
          fontSize:   96,
          fontWeight: 900,
          color:      COLORS.white,
          letterSpacing: "-0.03em",
          opacity:    huhhOp,
          // Placeholder — swap this text for an emoji/gif later
        }}>
          😳
        </div>
      )}

    </AbsoluteFill>
  );
};