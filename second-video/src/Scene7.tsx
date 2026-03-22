/**
 * Scene 7 — 135 frames (4.5 s)
 *
 * Script: "That's why Rocket B can run before Rocket A,
 *          even if Rocket A is written first."
 *
 * ─── TIMING MAP ──────────────────────────────────────────────────────────────
 *
 *   0–10      blank — nothing visible
 *   10–18     Scene 1 background fades in (T-line, pads, rockets, snippets)
 *
 *   18–25     Rocket B engine glow
 *   24–50     Rocket B lift-off (easeIn — slow start, fast exit)
 *   28–35     Rocket A engine glow
 *   34–62     Rocket A lift-off (easeIn)
 *
 *   22–65     Smoke B expands
 *   32–75     Smoke A expands
 *
 *   48–60     "1st" badge fades in at B's pad (B already gone)
 *   62–74     "2nd" badge fades in at A's pad (A already gone)
 *
 *   80–100    "That's why" text fades in above T-line
 *   105–120   Fade out everything
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Scene 1 geometry ────────────────────────────────────────────────────────

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

// ─── Static components ───────────────────────────────────────────────────────

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

const RocketFlame: React.FC<{ flameP: number; color1: string; color2: string }> = ({
  flameP, color1, color2,
}) => {
  if (flameP <= 0) return null;
  const fh = Math.round(flameP * 180);
  const fw = Math.round(200 + flameP * 180);
  return (
    <svg width={fw} height={fh} viewBox={`0 0 ${fw} ${fh}`}
      style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", pointerEvents: "none" }}
      fill="none">
      <path d={`M${fw*.15} 0 Q${fw*.05} ${fh*.6} ${fw*.3} ${fh} Q${fw*.5} ${fh*1.1} ${fw*.7} ${fh} Q${fw*.95} ${fh*.6} ${fw*.85} 0Z`} fill={color2} opacity={0.35} />
      <path d={`M${fw*.25} 0 Q${fw*.15} ${fh*.5} ${fw*.38} ${fh*.85} Q${fw*.5} ${fh*.95} ${fw*.62} ${fh*.85} Q${fw*.85} ${fh*.5} ${fw*.75} 0Z`} fill={color2} opacity={0.65} />
      <path d={`M${fw*.35} 0 Q${fw*.28} ${fh*.4} ${fw*.42} ${fh*.7} Q${fw*.5} ${fh*.8} ${fw*.58} ${fh*.7} Q${fw*.72} ${fh*.4} ${fw*.65} 0Z`} fill={color1} opacity={0.9} />
      <ellipse cx={fw*.5} cy={4} rx={fw*.18} ry={6} fill="rgba(255,255,255,0.9)" />
    </svg>
  );
};

const SmokePuff: React.FC<{ smokeP: number; cx: number; baseY: number }> = ({
  smokeP, cx, baseY,
}) => {
  if (smokeP <= 0) return null;
  const puffs = [
    { dx: -30, dyFrac: 0.3, r: 40 + smokeP * 90,  delay: 0    },
    { dx:  20, dyFrac: 0.5, r: 30 + smokeP * 70,  delay: 0.1  },
    { dx:  60, dyFrac: 0.2, r: 50 + smokeP * 110, delay: 0.05 },
    { dx: -60, dyFrac: 0.4, r: 35 + smokeP * 80,  delay: 0.15 },
  ];
  return (
    <>
      {puffs.map((p, i) => {
        const localP  = Math.max(0, smokeP - p.delay);
        const opacity = localP > 0 ? Math.max(0, 0.55 - smokeP * 0.55) : 0;
        return (
          <div key={i} style={{
            position: "absolute",
            left: cx + p.dx - p.r,
            top:  baseY - p.r * p.dyFrac * 2 - p.r,
            width: p.r * 2, height: p.r * 2,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(180,180,180,${opacity}) 0%, rgba(120,120,120,0) 70%)`,
            pointerEvents: "none",
          }} />
        );
      })}
    </>
  );
};

// ─── Finish line ─────────────────────────────────────────────────────────────

const FINISH_Y = SAFE.top + 180;
const FINISH_LABEL_X = ARM_RIGHT - 4;

const FinishLine: React.FC<{ op: number }> = ({ op }) => {
  if (op <= 0) return null;
  return (
    <svg width={W} height={H}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      {/* Dashed line */}
      <line
        x1={ARM_LEFT} y1={FINISH_Y}
        x2={ARM_RIGHT} y2={FINISH_Y}
        stroke="rgba(255,255,255,0.85)"
        strokeWidth={5}
        strokeDasharray="24 14"
        strokeLinecap="round"
        opacity={op}
      />
      {/* "FINISH" label — right end */}
      <rect
        x={FINISH_LABEL_X - 140} y={FINISH_Y - 36}
        width={140} height={36}
        rx={6}
        fill="rgba(255,255,255,0.12)"
        opacity={op}
      />
      <text
        x={FINISH_LABEL_X - 70} y={FINISH_Y - 12}
        textAnchor="middle"
        fontFamily="'Syne', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="rgba(255,255,255,0.9)"
        letterSpacing="4"
        opacity={op}
      >FINISH</text>
      {/* Checkered flag pattern */}
      {[0,1,2,3,4,5].map(col => (
        [0,1,2,3].map(row => (
          (col + row) % 2 === 0 && (
            <rect
              key={`${col}-${row}`}
              x={FINISH_LABEL_X - 148 + col * 8} y={FINISH_Y - 36 + row * 9}
              width={8} height={9}
              fill="rgba(255,255,255,0.45)"
              opacity={op}
            />
          )
        ))
      ))}
    </svg>
  );
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
// Two cannons — left and right edges — fire upward and inward.
// Gravity pulls them back down across the full canvas.
// Ported from reference: seeded deterministic, mixed shapes, paper flap.

const CONFETTI_COLORS = [
  "#FF5F56", "#FFBD2E", "#27C93F", "#4D9FFF",
  "#CBA6F7", "#FF9F43", "#FFFFFF", "#A5D6FF",
  "#FF6B9D", "#FFE566", "#A6E3A1", "#80C4FF",
];

// Seeded pseudo-random — same output every render
const sr = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

interface ConfettiParticle {
  id: number;
  x0: number; y0: number;
  vx: number; vy: number;
  gravity: number;
  color: string;
  width: number; height: number;
  rotation0: number;
  rotSpeed: number;
  delay: number;
  life: number;
  shape: "rect" | "circle" | "strip";
}

// Cannons fire from just off left/right edges, roughly at the T-line height
const CANNON_Y = CANVAS.height * 0.5 + 100;

const PARTICLES: ConfettiParticle[] = (() => {
  const list: ConfettiParticle[] = [];
  const total = 90;   // 45 per side
  for (let i = 0; i < total; i++) {
    const isLeft = i < total / 2;
    const r = (o: number) => sr(i * 19 + o);

    const x0 = isLeft
      ? -10 + r(1) * 40
      : CANVAS.width - 30 + r(1) * 40;
    const y0 = CANNON_Y + (r(2) - 0.5) * 80;

    const angleDeg = 55 + r(3) * 30;
    const angleRad = angleDeg * (Math.PI / 180);
    const speed    = 36 + r(4) * 28;

    const vx = Math.cos(angleRad) * speed * (isLeft ? 1 : -1) * (0.5 + r(5) * 0.8);
    const vy = -Math.sin(angleRad) * speed;   // upward

    const shapes = ["rect", "rect", "rect", "circle", "strip"] as const;

    const shape  = shapes[Math.floor(r(9) * shapes.length)];
    const width  = shape === "strip" ? 5 + r(10) * 4  : 12 + r(10) * 16;
    const height = shape === "strip" ? 24 + r(11) * 18 : width * (0.35 + r(11) * 0.65);

    list.push({
      id: i, x0, y0, vx, vy,
      gravity:   1.0 + r(6) * 0.7,
      color:     CONFETTI_COLORS[Math.floor(r(12) * CONFETTI_COLORS.length)],
      width, height,
      rotation0: r(13) * 360,
      rotSpeed:  (r(14) - 0.5) * 20,
      delay:     Math.floor(r(7) * 10),
      life:      55 + Math.floor(r(8) * 30),
      shape,
    });
  }
  return list;
})();

const ConfettiPiece: React.FC<{ p: ConfettiParticle; elapsed: number; op: number }> = ({
  p, elapsed, op,
}) => {
  const t = elapsed - p.delay;
  if (t <= 0 || t > p.life) return null;

  const x = p.x0 + p.vx * t;
  const y = p.y0 + p.vy * t + 0.5 * p.gravity * t * t;

  const fadeStart  = p.life * 0.65;
  const particleOp = (t < fadeStart
    ? 1
    : interpolate(t, [fadeStart, p.life], [1, 0])) * op;
  if (particleOp <= 0) return null;

  const rotation = p.rotation0 + p.rotSpeed * t;
  // Paper flap — oscillates scaleX
  const flapFreq = 0.15 + sr(p.id * 5) * 0.12;
  const scaleX   = Math.abs(Math.cos(t * flapFreq)) * 0.8 + 0.2;

  const borderRadius =
    p.shape === "circle" ? "50%" :
    p.shape === "strip"  ? "4px" : "3px";

  return (
    <div style={{
      position:        "absolute",
      left:            x,
      top:             y,
      width:           p.width,
      height:          p.height,
      background:      p.color,
      borderRadius,
      opacity:         particleOp,
      transform:       `rotate(${rotation}deg) scaleX(${scaleX})`,
      transformOrigin: "center center",
      pointerEvents:   "none",
    }} />
  );
};

const Confetti: React.FC<{ triggerFrame: number; currentFrame: number; op: number }> = ({
  triggerFrame, currentFrame, op,
}) => {
  if (op <= 0 || currentFrame < triggerFrame) return null;
  const elapsed = currentFrame - triggerFrame;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {PARTICLES.map((p) => (
        <ConfettiPiece key={p.id} p={p} elapsed={elapsed} op={op} />
      ))}
    </AbsoluteFill>
  );
};

// ─── Badge ────────────────────────────────────────────────────────────────────

const Badge: React.FC<{
  label: string; emoji: string;
  cx: number; y: number;
  color: string; op: number;
  slideP: number;
}> = ({ label, emoji, cx, y, color, op, slideP }) => {
  const slideY = interpolate(slideP, [0, 1], [y + 60, y]);
  return (
    <div style={{
      position:      "absolute",
      top:           slideY,
      left:          cx - 170,
      width:         340,
      textAlign:     "center",
      opacity:       op,
      background:    `${color}22`,
      border:        `3px solid ${color}`,
      borderRadius:  20,
      padding:       "20px 0",
      fontFamily:    FONTS.display,
      fontWeight:    900,
      color,
      letterSpacing: "-0.01em",
      lineHeight:    "1",
      boxShadow:     `0 0 32px ${color}44`,
    }}>
      <div style={{ fontSize: 72 }}>{emoji}</div>
      <div style={{ fontSize: 42, marginTop: 8 }}>{label}</div>
    </div>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  // Nothing before frame 10
  if (frame < 10) return <AbsoluteFill />;

  // Global fade-out
  const fadeOut = 1 - prog(frame, 105, 120);

  // Background fade-in
  const bgOp = prog(frame, 10, 18, "out");

  // Engine glows
  const glowBP = prog(frame, 18, 25, "out");
  const glowAP = prog(frame, 28, 35, "out");

  // Lift-off — easeIn: slow start, fast exit
  const liftBP = prog(frame, 24, 50, "in");
  const liftAP = prog(frame, 34, 62, "in");

  const ROCKET_TRAVEL = ROCKET_BOT_Y + 100;
  const rocketBY = -(liftBP * ROCKET_TRAVEL);
  const rocketAY = -(liftAP * ROCKET_TRAVEL);

  // Flames
  const flameBP = Math.max(glowBP * 0.4, liftBP);
  const flameAP = Math.max(glowAP * 0.4, liftAP);

  // Smoke
  const smokeBP = prog(frame, 22, 65, "out");
  const smokeAP = prog(frame, 32, 75, "out");

  // Finish line — appears as B approaches
  const finishOp = prog(frame, 22, 30, "out");

  // Confetti fires when B crosses finish line (~frame 36)
  const CONFETTI_TRIGGER = 36;
  const confettiOp = fadeOut;

  // Badges
  const badge1Op    = prog(frame, 48, 58, "out");
  const badge1Slide = prog(frame, 48, 62, "out");
  const badge2Op    = prog(frame, 62, 72, "out");
  const badge2Slide = prog(frame, 62, 76, "out");

  // "That's why" text
  const textOp = prog(frame, 80, 94, "out");

  // Badge Y — sits where rocket was (pad top area)
  const BADGE_Y = ROCKET_BOT_Y - 300;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>

      {/* ── T-line ───────────────────────────────────────────────────────── */}
      <svg width={W} height={H}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", opacity: bgOp }}>
        <line x1={STEM_X} y1={STEM_TOP}  x2={STEM_X}    y2={STEM_BOTTOM} stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        <line x1={STEM_X} y1={ARM_Y}     x2={ARM_LEFT}  y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
        <line x1={STEM_X} y1={ARM_Y}     x2={ARM_RIGHT} y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
      </svg>

      {/* ── Pads ─────────────────────────────────────────────────────────── */}
      <div style={{ opacity: bgOp }}>
        <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_A_CX - PAD_W / 2 }}><S1Pad /></div>
        <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_B_CX - PAD_W / 2 }}><S1Pad /></div>
      </div>

      {/* ── Code snippets ────────────────────────────────────────────────── */}
      <div style={{ opacity: bgOp }}>
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
          <span style={{ color: PUNC }}>(); </span>
        </div>
      </div>

      {/* ── Finish line ──────────────────────────────────────────────────── */}
      <FinishLine op={finishOp * fadeOut} />

      {/* ── Confetti — shoots when B crosses finish line ──────────────────── */}
      <Confetti
        triggerFrame={CONFETTI_TRIGGER}
        currentFrame={frame}
        op={confettiOp}
      />

      {/* ── Smoke ────────────────────────────────────────────────────────── */}
      <SmokePuff smokeP={smokeBP} cx={COL_B_CX} baseY={PAD_BOT_Y} />
      <SmokePuff smokeP={smokeAP} cx={COL_A_CX} baseY={PAD_BOT_Y} />

      {/* ── Rocket A ─────────────────────────────────────────────────────── */}
      <div style={{ opacity: bgOp }}>
        <div style={{
          position: "absolute",
          top:  ROCKET_BOT_Y - ROCKET_H + rocketAY,
          left: COL_A_CX - ROCKET_W / 2,
        }}>
          {glowAP > 0 && (
            <div style={{
              position: "absolute", bottom: -20, left: "50%",
              transform: "translateX(-50%)",
              width: 120 + glowAP * 80, height: 120 + glowAP * 80,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(255,160,40,${glowAP * 0.7}) 0%, rgba(255,80,0,0) 70%)`,
              pointerEvents: "none",
            }} />
          )}
          <RocketBodyA />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>
            <RocketFlame flameP={flameAP} color1="#FFE566" color2="#FF7A20" />
          </div>
        </div>
      </div>

      {/* ── Rocket B (launches first) ─────────────────────────────────────── */}
      <div style={{ opacity: bgOp }}>
        <div style={{
          position:  "absolute",
          top:       ROCKET_BOT_Y - ROCKET_H + rocketBY,
          left:      COL_B_CX - ROCKET_W / 2,
          transform: "scaleX(-1)",
        }}>
          {glowBP > 0 && (
            <div style={{
              position: "absolute", bottom: -20, left: "50%",
              transform: "translateX(-50%) scaleX(-1)",
              width: 120 + glowBP * 80, height: 120 + glowBP * 80,
              borderRadius: "50%",
              background: `radial-gradient(circle, rgba(80,160,255,${glowBP * 0.7}) 0%, rgba(0,80,255,0) 70%)`,
              pointerEvents: "none",
            }} />
          )}
          <RocketBodyB />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", display: "flex", justifyContent: "center" }}>
            <RocketFlame flameP={flameBP} color1="#CCF0FF" color2="#4A9FFF" />
          </div>
        </div>
      </div>

      {/* ── Badge B — 1st ────────────────────────────────────────────────── */}
      {badge1Op > 0 && (
        <Badge
          label="Rocket B"
          emoji="🥇"
          cx={COL_B_CX}
          y={BADGE_Y}
          color={B_BODY}
          op={badge1Op}
          slideP={badge1Slide}
        />
      )}

      {/* ── Badge A — 2nd ────────────────────────────────────────────────── */}
      {badge2Op > 0 && (
        <Badge
          label="Rocket A"
          emoji="🥈"
          cx={COL_A_CX}
          y={BADGE_Y}
          color={A_BODY}
          op={badge2Op}
          slideP={badge2Slide}
        />
      )}

      {/* ── "That's why" text ────────────────────────────────────────────── */}
      {textOp > 0 && (
        <div style={{
          position:      "absolute",
          top:           SAFE.top + 40,
          left:          SAFE.left,
          width:         CANVAS.safeWidth,
          textAlign:     "center",
          fontFamily:    FONTS.display,
          fontSize:      64,
          fontWeight:    900,
          color:         COLORS.white,
          letterSpacing: "-0.02em",
          lineHeight:    "1.15",
          opacity:       textOp,
        }}>

        </div>
      )}

    </AbsoluteFill>
  );
};