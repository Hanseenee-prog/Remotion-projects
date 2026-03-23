/**
 * Scene 1 — 160 frames (~5.3 s)
 *
 * Changes from previous version:
 *   - Launch pads sit ABOVE the T-line (pad bottom = ARM_Y)
 *   - Rockets are 3× the previous height: 660px tall, 432px wide
 *   - Completely redesigned rocket SVG (sleeker, multi-section, larger letter)
 *   - Letter on body is fontSize 22 in viewBox coords — large and clear
 *   - Tokens: setTimeout(launchA, 0); and launchB();
 *   - Code snippets centered under their respective column (ARM_LEFT→STEM_X and STEM_X→ARM_RIGHT)
 *
 * Timeline (scene-local frames):
 *   1–25    Both pads pop up (scaleY from bottom)
 *   30–80   Rocket A slides in from left
 *   115–135 setTimeout(launchA, 0); types out under left branch
 *   140–155 Rocket B slides in from right
 *   155+    launchB(); types out under right branch
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Palette ─────────────────────────────────────────────────────────────────

// Rocket A — orange
const A_BODY    = "#FF7A20";
const A_DARK    = "#8C3400";
const A_MID     = "#D45A00";
const A_STRIPE  = "#FFB347";
const A_WINDOW  = "#FFE4CC";

// Rocket B — blue
const B_BODY    = "#4A9FFF";
const B_DARK    = "#0A2A6E";
const B_MID     = "#1A5CC8";
const B_STRIPE  = "#80C4FF";
const B_WINDOW  = "#CCE8FF";

const PAD_COLOR  = "#5A5A6A";
const PAD_LIGHT  = "#8A8A9A";
const PAD_DARK   = "#2E2E3A";

// ─── Layout ──────────────────────────────────────────────────────────────────

const STROKE     = 7;
const LINE_COLOR = "rgba(255,255,255,0.72)";

const W = CANVAS.width;    // 1080
const H = CANVAS.height;   // 1920

// T-line geometry
const STEM_X      = W / 2;
const STEM_TOP    = SAFE.top + 360;                  // 220
const STEM_BOTTOM = Math.round(H / 2 + H / 5);     // 1344

const ARM_Y     = STEM_BOTTOM;
const ARM_LEFT  = SAFE.left;                        // 40
const ARM_RIGHT = W - SAFE.right;                  // 920

// Column centres
const COL_A_CX = Math.round((ARM_LEFT + STEM_X) / 2);   // 290
const COL_B_CX = Math.round((STEM_X + ARM_RIGHT) / 2);  // 730

// Launch pad — same size as before
const PAD_W     = 260;
const PAD_H     = 32;
const PAD_LEG_H = 44;
const PAD_TOTAL = PAD_H + PAD_LEG_H;   // 76px tall including legs

// Pad sits ABOVE the arm line — pad bottom (including legs) = ARM_Y
const PAD_BOT_Y     = ARM_Y;
const PAD_TOP_Y     = PAD_BOT_Y - PAD_TOTAL;      // platform top edge

// Rocket — 2.7× previous rendered size (3× then scaled to 0.9)
const ROCKET_W = 389;   // Math.round(432 * 0.9)
const ROCKET_H = 594;   // Math.round(660 * 0.9)
// viewBox stays at 72×110 — SVG scales up cleanly

// Rocket sits on top of the platform (not the legs)
// so rocket bottom = pad platform top = PAD_TOP_Y
const ROCKET_BOT_Y = PAD_TOP_Y;
// const ROCKET_TOP_Y = ROCKET_BOT_Y - ROCKET_H;

// Code below arm line — centred under each branch
const CODE_TOP   = ARM_Y + 32;
const CODE_FONT  = 40;
const CODE_LH    = 52;
// Each code block spans its full branch width, text-align center handles the rest
const CODE_W_A   = STEM_X - ARM_LEFT;   // 500px
const CODE_W_B   = ARM_RIGHT - STEM_X;  // 380px

// ─── Helpers ─────────────────────────────────────────────────────────────────

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function prog(frame: number, start: number, end: number, ease: "out" | "inOut" = "inOut"): number {
  const t = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return ease === "out" ? easeOut(t) : easeInOut(t);
}
function visibleChars(frame: number, startFrame: number, charPeriod = 1.6): number {
  return Math.max(0, Math.floor((frame - startFrame) / charPeriod));
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

type Token = { text: string; color: string };

// setTimeout(launchA, 0);
const TOKENS_A: Token[] = [
  { text: "setTimeout", color: COLORS.keyword     },
  { text: "(",          color: COLORS.punctuation },
  { text: "launchA",    color: COLORS.fnName      },
  { text: ", ",         color: COLORS.punctuation },
  { text: "0",          color: COLORS.number      },
  { text: ");",         color: COLORS.punctuation },
];

// launchB();
const TOKENS_B: Token[] = [
  { text: "launchB", color: COLORS.fnName      },
  { text: "();",     color: COLORS.punctuation },
];

const flatA = TOKENS_A.map((t) => t.text).join("");
const flatB = TOKENS_B.map((t) => t.text).join("");

function renderTokens(tokens: Token[], charsToShow: number): React.ReactNode {
  let remaining = charsToShow;
  return tokens.map((token, i) => {
    if (remaining <= 0) return null;
    const slice = token.text.slice(0, remaining);
    remaining -= token.text.length;
    return <span key={i} style={{ color: token.color }}>{slice}</span>;
  });
}

// ─── Rocket SVG ──────────────────────────────────────────────────────────────
// viewBox: 0 0 72 110  (rendered at 432×660 via width/height props)
// Orientation: nose at top, flame at bottom (upright on pad)
// Design: elongated body with panel lines, upper+lower sections, large letter

const RocketA: React.FC = () => (
  <svg width={ROCKET_W} height={ROCKET_H} viewBox="0 0 72 110" fill="none">

    {/* ── Nozzle bell ── */}
    <path d="M28 102 Q36 110 44 102 L46 96 L26 96Z" fill={A_DARK} />
    <path d="M30 102 Q36 108 42 102 L43 98 L29 98Z" fill={A_MID} opacity={0.6} />

    {/* ── Engine section ── */}
    <rect x="20" y="82" width="32" height="16" rx="3" fill={A_DARK} />
    <rect x="24" y="84" width="24" height="4"  rx="2" fill={A_MID} opacity={0.5} />

    {/* ── Lower body ── */}
    <rect x="16" y="54" width="40" height="30" rx="2" fill={A_BODY} />
    {/* Left shadow panel */}
    <rect x="16" y="54" width="8"  height="30" rx="2" fill="rgba(0,0,0,0.22)" />
    {/* Panel line */}
    <line x1="36" y1="56" x2="36" y2="82" stroke={A_DARK} strokeWidth="1.5" opacity={0.5} />
    {/* Horizontal band */}
    <rect x="16" y="68" width="40" height="5" fill={A_STRIPE} opacity={0.35} />

    {/* ── Fins ── */}
    {/* Left fin */}
    <path d="M16 72 L4 96 L16 90Z" fill={A_DARK} />
    <path d="M16 72 L6 92 L16 88Z" fill={A_MID} opacity={0.45} />
    {/* Right fin */}
    <path d="M56 72 L68 96 L56 90Z" fill={A_DARK} />
    <path d="M56 72 L66 92 L56 88Z" fill={A_MID} opacity={0.45} />

    {/* ── Upper body ── */}
    <rect x="16" y="28" width="40" height="28" rx="2" fill={A_BODY} />
    <rect x="16" y="28" width="8"  height="28" rx="2" fill="rgba(0,0,0,0.20)" />
    {/* Upper right highlight */}
    <rect x="50" y="30" width="4" height="24" rx="1" fill="rgba(255,255,255,0.12)" />

    {/* ── Porthole ── */}
    <circle cx="36" cy="42" r="9"  fill={A_DARK} />
    <circle cx="36" cy="42" r="7"  fill={A_WINDOW} opacity={0.25} />
    <circle cx="36" cy="42" r="5"  fill={A_WINDOW} opacity={0.55} />
    {/* Porthole glint */}
    <circle cx="33" cy="39" r="2"  fill="rgba(255,255,255,0.65)" />

    {/* ── Letter A on lower body ── */}
    <text
      x="36" y="76"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="'Syne', sans-serif"
      fontWeight="900"
      fontSize="22"
      fill="rgba(255,255,255,0.95)"
      letterSpacing="-1"
    >A</text>

    {/* ── Nose cone ── */}
    <path d="M16 28 Q36 2 56 28Z" fill={A_MID} />
    {/* Nose tip highlight */}
    <path d="M27 22 Q36 5 45 22" stroke="rgba(255,255,255,0.30)" strokeWidth="1.5" fill="none" />
    {/* Nose seam */}
    <line x1="36" y1="4" x2="36" y2="28" stroke={A_DARK} strokeWidth="1" opacity={0.4} />

  </svg>
);

const RocketB: React.FC = () => (
  <svg width={ROCKET_W} height={ROCKET_H} viewBox="0 0 72 110" fill="none">

    {/* ── Nozzle bell ── */}
    <path d="M28 102 Q36 110 44 102 L46 96 L26 96Z" fill={B_DARK} />
    <path d="M30 102 Q36 108 42 102 L43 98 L29 98Z" fill={B_MID} opacity={0.6} />

    {/* ── Engine section ── */}
    <rect x="20" y="82" width="32" height="16" rx="3" fill={B_DARK} />
    <rect x="24" y="84" width="24" height="4"  rx="2" fill={B_MID} opacity={0.5} />

    {/* ── Lower body ── */}
    <rect x="16" y="54" width="40" height="30" rx="2" fill={B_BODY} />
    <rect x="16" y="54" width="8"  height="30" rx="2" fill="rgba(0,0,0,0.22)" />
    <line x1="36" y1="56" x2="36" y2="82" stroke={B_DARK} strokeWidth="1.5" opacity={0.5} />
    <rect x="16" y="68" width="40" height="5" fill={B_STRIPE} opacity={0.35} />

    {/* ── Fins ── */}
    <path d="M16 72 L4 96 L16 90Z" fill={B_DARK} />
    <path d="M16 72 L6 92 L16 88Z" fill={B_MID} opacity={0.45} />
    <path d="M56 72 L68 96 L56 90Z" fill={B_DARK} />
    <path d="M56 72 L66 92 L56 88Z" fill={B_MID} opacity={0.45} />

    {/* ── Upper body ── */}
    <rect x="16" y="28" width="40" height="28" rx="2" fill={B_BODY} />
    <rect x="16" y="28" width="8"  height="28" rx="2" fill="rgba(0,0,0,0.20)" />
    <rect x="50" y="30" width="4"  height="24" rx="1" fill="rgba(255,255,255,0.12)" />

    {/* ── Porthole ── */}
    <circle cx="36" cy="42" r="9"  fill={B_DARK} />
    <circle cx="36" cy="42" r="7"  fill={B_WINDOW} opacity={0.25} />
    <circle cx="36" cy="42" r="5"  fill={B_WINDOW} opacity={0.55} />
    <circle cx="33" cy="39" r="2"  fill="rgba(255,255,255,0.65)" />

    {/* ── Letter B on lower body — counter-mirrored against parent scaleX(-1) ── */}
    {/* Parent div has scaleX(-1) to flip the rocket; this g undoes that for the text only */}
    <g transform="translate(72,0) scale(-1,1)">
      <text
        x="36" y="76"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="'Syne', sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="rgba(255,255,255,0.95)"
        letterSpacing="-1"
      >B</text>
    </g>

    {/* ── Nose cone ── */}
    <path d="M16 28 Q36 2 56 28Z" fill={B_MID} />
    <path d="M27 22 Q36 5 45 22" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" fill="none" />
    <line x1="36" y1="4" x2="36" y2="28" stroke={B_DARK} strokeWidth="1" opacity={0.4} />

  </svg>
);

// ─── Launch pad ───────────────────────────────────────────────────────────────
// Pad bottom (including legs) sits flush on the ARM_Y line

const Pad: React.FC = () => (
  <svg
    width={PAD_W}
    height={PAD_TOTAL}
    viewBox={`0 0 ${PAD_W} ${PAD_TOTAL}`}
    fill="none"
  >
    {/* Platform top edge highlight */}
    <rect x="0"  y="0"        width={PAD_W} height={3}      rx="1" fill={PAD_LIGHT} opacity={0.6} />
    {/* Platform body */}
    <rect x="0"  y="3"        width={PAD_W} height={PAD_H - 3} rx="3" fill={PAD_COLOR} />
    {/* Left shadow */}
    <rect x="0"  y="3"        width={16}    height={PAD_H - 3} rx="3" fill="rgba(0,0,0,0.25)" />
    {/* Greeble slots */}
    <rect x="24" y="12"       width="40"    height="8"   rx="2" fill={PAD_DARK} />
    <rect x={PAD_W - 64} y="12" width="40" height="8"   rx="2" fill={PAD_DARK} />
    {/* Centre gap */}
    <rect x={PAD_W / 2 - 6} y="10" width="12" height="12" rx="2" fill={PAD_DARK} opacity={0.7} />

    {/* Left leg */}
    <rect x="28"          y={PAD_H} width="18" height={PAD_LEG_H} rx="3" fill={PAD_COLOR} opacity={0.75} />
    {/* Left leg inner */}
    <rect x="32"          y={PAD_H} width="8"  height={PAD_LEG_H - 8} rx="2" fill={PAD_DARK} opacity={0.4} />
    {/* Right leg */}
    <rect x={PAD_W - 46}  y={PAD_H} width="18" height={PAD_LEG_H} rx="3" fill={PAD_COLOR} opacity={0.75} />
    <rect x={PAD_W - 42}  y={PAD_H} width="8"  height={PAD_LEG_H - 8} rx="2" fill={PAD_DARK} opacity={0.4} />

    {/* Foot flanges */}
    <rect x="18"          y={PAD_H + PAD_LEG_H - 8} width="38" height="8" rx="2" fill={PAD_LIGHT} opacity={0.5} />
    <rect x={PAD_W - 56}  y={PAD_H + PAD_LEG_H - 8} width="38" height="8" rx="2" fill={PAD_LIGHT} opacity={0.5} />
  </svg>
);

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  // Pads: frames 1–25
  const padP    = prog(frame, 1, 15, "out");
  const padOp   = Math.min(1, padP * 2);

  // Rocket A: frames 30–55 (tightened from 30–80)
  const rkAP    = prog(frame, 15, 25, "out");
  // Rocket B: frames 140–155 (unchanged)
  const rkBP    = prog(frame, 130, 145, "out");

  // Code A: starts at 58, types fast — ~10 frames to complete
  const charsA  = Math.min(flatA.length, visibleChars(frame, 30, 0.65));
  // Code B: unchanged
  const charsB  = Math.min(flatB.length, visibleChars(frame, 150, 1.1));

  const cursorOn = Math.floor(frame / 9) % 2 === 0;

  // Rocket A slides from off-screen left → centred on COL_A_CX
  const rkAX = interpolate(rkAP, [0, 1], [-ROCKET_W, COL_A_CX - ROCKET_W / 2]);
  // Rocket B slides from off-screen right → centred on COL_B_CX
  const rkBX = interpolate(rkBP, [0, 1], [W + ROCKET_W, COL_B_CX - ROCKET_W / 2]);

  return (
    <AbsoluteFill>

      {/* ── T-line (always at full extent from frame 0) ───────────────────── */}
      <svg
        width={W} height={H}
        style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
      >
        <line
          x1={STEM_X} y1={STEM_TOP} x2={STEM_X} y2={STEM_BOTTOM}
          stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round"
        />
        <line
          x1={STEM_X} y1={ARM_Y} x2={ARM_LEFT} y2={ARM_Y}
          stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round"
        />
        <line
          x1={STEM_X} y1={ARM_Y} x2={ARM_RIGHT} y2={ARM_Y}
          stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round"
        />
      </svg>

      {/* ── Pad A — above left arm ────────────────────────────────────────── */}
      {padP > 0 && (
        <div style={{
          position:        "absolute",
          // Pad total bottom = ARM_Y, so top = ARM_Y - PAD_TOTAL
          top:             PAD_BOT_Y - PAD_TOTAL,
          left:            COL_A_CX - PAD_W / 2,
          transformOrigin: "bottom center",
          transform:       `scaleY(${padP})`,
          opacity:         padOp,
        }}>
          <Pad />
        </div>
      )}

      {/* ── Pad B — above right arm ───────────────────────────────────────── */}
      {padP > 0 && (
        <div style={{
          position:        "absolute",
          top:             PAD_BOT_Y - PAD_TOTAL,
          left:            COL_B_CX - PAD_W / 2,
          transformOrigin: "bottom center",
          transform:       `scaleY(${padP})`,
          opacity:         padOp,
        }}>
          <Pad />
        </div>
      )}

      {/* ── Rocket A ─────────────────────────────────────────────────────── */}
      {rkAP > 0 && (
        <div style={{
          position: "absolute",
          top:      ROCKET_BOT_Y - ROCKET_H,
          left:     rkAX,
        }}>
          <RocketA />
        </div>
      )}

      {/* ── Code A — centered under left branch ──────────────────────────── */}
      <div style={{
        position:   "absolute",
        top:        CODE_TOP,
        left:       ARM_LEFT,
        width:      CODE_W_A,
        textAlign:  "center",
        fontFamily: FONTS.mono,
        fontSize:   CODE_FONT,
        fontWeight: 600,
        lineHeight: `${CODE_LH}px`,
        whiteSpace: "pre",
        overflow:   "hidden",
      }}>
        {renderTokens(TOKENS_A, charsA)}
        {charsA > 0 && charsA < flatA.length && (
          <span style={{ color: COLORS.white, opacity: cursorOn ? 1 : 0 }}>|</span>
        )}
      </div>

      {/* ── Rocket B ─────────────────────────────────────────────────────── */}
      {rkBP > 0 && (
        <div style={{
          position:  "absolute",
          top:       ROCKET_BOT_Y - ROCKET_H,
          left:      rkBX,
          transform: "scaleX(-1)",
        }}>
          <RocketB />
        </div>
      )}

      {/* ── Code B — centered under right branch ─────────────────────────── */}
      <div style={{
        position:   "absolute",
        top:        CODE_TOP,
        left:       STEM_X,
        width:      CODE_W_B,
        textAlign:  "center",
        fontFamily: FONTS.mono,
        fontSize:   CODE_FONT,
        fontWeight: 600,
        lineHeight: `${CODE_LH}px`,
        whiteSpace: "pre",
        overflow:   "hidden",
      }}>
        {renderTokens(TOKENS_B, charsB)}
        {charsB > 0 && charsB < flatB.length && (
          <span style={{ color: COLORS.white, opacity: cursorOn ? 1 : 0 }}>|</span>
        )}
      </div>

    </AbsoluteFill>
  );
};