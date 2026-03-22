/**
 * Scene 2 — 180 frames (6 s)
 *
 * Script: "Which one launches first?"
 *
 * ─── TIMING REFERENCE — edit these prog() calls to adjust every motion ────
 *
 *   Question text typeout  →  visibleChars(frame, 0,   0.95)   ← start frame, chars/frame
 *   Question text fade-out →  prog(frame, 55,  70)              ← start, end
 *   Overlay fade-in        →  prog(frame, 55,  72, "out")       ← start, end
 *   Code window slide-in   →  prog(frame, 65,  85, "out")       ← start, end
 *   Snippet A flight       →  prog(frame, 72,  92, "inOut")     ← start, end
 *   Snippet B flight       →  prog(frame, 80, 100, "inOut")     ← start, end
 *   Overlay fade-out       →  prog(frame, 148, 162, "inOut")    ← start, end
 *   Code window slide-out  →  prog(frame, 148, 165, "inOut")    ← start, end
 *
 * ─── HOW TO READ prog() ──────────────────────────────────────────────────
 *   prog(frame, START, END)
 *   START = frame the motion begins
 *   END   = frame the motion finishes
 *   Shrink the gap → faster. Widen it → slower. Shift both → moves earlier/later.
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Scene 1 geometry (must exactly match Scene1.tsx) ────────────────────────

const W = CANVAS.width;
const H = CANVAS.height;

const STEM_X      = W / 2;                           // 540
const STEM_TOP    = SAFE.top + 360;                  // 520 — matches updated Scene1
const STEM_BOTTOM = Math.round(H / 2 + H / 5);      // 1344
const ARM_Y       = STEM_BOTTOM;
const ARM_LEFT    = SAFE.left;                        // 40
const ARM_RIGHT   = W - SAFE.right;                  // 920

const COL_A_CX = Math.round((ARM_LEFT + STEM_X) / 2);   // 290
const COL_B_CX = Math.round((STEM_X + ARM_RIGHT) / 2);  // 730

const PAD_W      = 260;
const PAD_H      = 32;
const PAD_LEG_H  = 44;
const PAD_TOTAL  = PAD_H + PAD_LEG_H;
const PAD_BOT_Y  = ARM_Y;
const PAD_TOP_Y  = PAD_BOT_Y - PAD_TOTAL;

const ROCKET_W     = 389;
const ROCKET_H     = 594;
const ROCKET_BOT_Y = PAD_TOP_Y;

// Scene 1 snippet source positions
const CODE_S1_TOP = ARM_Y + 32;   // 1376
const SNIP_A_CX   = COL_A_CX;    // 290
const SNIP_B_CX   = COL_B_CX;    // 730

// ─── Code window geometry ────────────────────────────────────────────────────

const WIN_W    = 680;     // narrower than before
const BAR_H    = 64;      // taller title bar
const LINE_H   = 80;      // taller code rows
const GUTTER_W = 64;      // wider gutter
const WIN_H    = BAR_H + LINE_H * 2 + 20;
// Centred horizontally
const WIN_X    = SAFE.left + Math.round((CANVAS.safeWidth - WIN_W) / 2);
const WIN_Y    = 900;     // vertical position of settled window

const CODE_FONT    = 36;  // px — code inside window
const GUTTER_FONT  = 30;  // px — line numbers
const FILENAME_FONT = 25; // px — "script.js" in tab

// Absolute canvas coords where flying text must arrive
// (left edge of code column, top edge of each row)
const LINE1_TARGET_X = WIN_X + GUTTER_W;
const LINE1_TARGET_Y = WIN_Y + BAR_H + Math.round((LINE_H - CODE_FONT) / 2);
const LINE2_TARGET_X = LINE1_TARGET_X;
const LINE2_TARGET_Y = LINE1_TARGET_Y + LINE_H;

// ─── GitHub Dark colours ─────────────────────────────────────────────────────

const GH = {
  bg:       "#0D1117",
  titleBar: "#161B22",
  border:   "#30363D",
  lineNum:  "#6E7681",
  text:     "#E6EDF3",
  keyword:  "#FF7B72",
  fnName:   "#79C0FF",
  number:   "#79C0FF",
  punct:    "#E6EDF3",
} as const;

// ─── Scene 1 static background palette ───────────────────────────────────────

const A_BODY    = "#FF7A20";
const A_DARK    = "#8C3400";
const A_MID     = "#D45A00";
const A_STRIPE  = "#FFB347";
const A_WINDOW  = "#FFE4CC";
const B_BODY    = "#4A9FFF";
const B_DARK    = "#0A2A6E";
const B_MID     = "#1A5CC8";
const B_STRIPE  = "#80C4FF";
const B_WINDOW  = "#CCE8FF";
const PAD_COLOR = "#5A5A6A";
const PAD_LIGHT = "#8A8A9A";
const PAD_DARK  = "#2E2E3A";
const STROKE    = 7;
const LINE_COLOR = "rgba(255,255,255,0.72)";

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function prog(
  frame: number,
  start: number,
  end: number,
  ease: "out" | "inOut" = "inOut"
): number {
  const t = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return ease === "out" ? easeOut(t) : easeInOut(t);
}
function visibleChars(frame: number, startFrame: number, charPeriod = 1.0): number {
  return Math.max(0, Math.floor((frame - startFrame) / charPeriod));
}

// ─── Tokens ──────────────────────────────────────────────────────────────────

type Token = { text: string; color: string };

// Scene 1 snippet colours (Catppuccin under the rockets)
// Also used as FLY_TOKENS — same array, two names removed for clarity.

// GitHub Dark colours — used ONLY inside the window after landing.
const WIN_TOKENS_A: Token[] = [
  { text: "setTimeout", color: COLORS.keyword },
  { text: "(",          color: COLORS.punctuation  },
  { text: "launchA",    color: COLORS.fnName },
  { text: ", ",         color: COLORS.punctuation  },
  { text: "0",          color: COLORS.number },
  { text: ");",         color: COLORS.punctuation  },
];
const WIN_TOKENS_B: Token[] = [
  { text: "launchB", color: COLORS.fnName },
  { text: "();",     color: COLORS.punctuation },
];

// Scene 1 colours — used for BOTH the static snippets under the rockets
// AND the flying snippets in transit. They look identical to Scene 1.
// The crossfade into WIN_TOKENS happens inside the window.
const FLY_TOKENS_A: Token[] = [
  { text: "setTimeout", color: COLORS.keyword     },
  { text: "(",          color: COLORS.punctuation },
  { text: "launchA",    color: COLORS.fnName      },
  { text: ", ",         color: COLORS.punctuation },
  { text: "0",          color: COLORS.number      },
  { text: ");",         color: COLORS.punctuation },
];
const FLY_TOKENS_B: Token[] = [
  { text: "launchB", color: COLORS.fnName      },
  { text: "();",     color: COLORS.punctuation },
];

function renderTokens(tokens: Token[]): React.ReactNode {
  return tokens.map((t, i) => (
    <span key={i} style={{ color: t.color }}>{t.text}</span>
  ));
}

// ─── Static Scene 1 background ───────────────────────────────────────────────

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

const S1RocketA: React.FC = () => (
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

const S1RocketB: React.FC = () => (
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

const S1Background: React.FC = () => (
  <>
    <svg width={W} height={H} style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <line x1={STEM_X} y1={STEM_TOP}  x2={STEM_X}    y2={STEM_BOTTOM} stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
      <line x1={STEM_X} y1={ARM_Y}     x2={ARM_LEFT}  y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
      <line x1={STEM_X} y1={ARM_Y}     x2={ARM_RIGHT} y2={ARM_Y}       stroke={LINE_COLOR} strokeWidth={STROKE} strokeLinecap="round" />
    </svg>
    <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_A_CX - PAD_W / 2 }}><S1Pad /></div>
    <div style={{ position: "absolute", top: PAD_BOT_Y - PAD_TOTAL, left: COL_B_CX - PAD_W / 2 }}><S1Pad /></div>
    <div style={{ position: "absolute", top: ROCKET_BOT_Y - ROCKET_H, left: COL_A_CX - ROCKET_W / 2 }}><S1RocketA /></div>
    <div style={{ position: "absolute", top: ROCKET_BOT_Y - ROCKET_H, left: COL_B_CX - ROCKET_W / 2, transform: "scaleX(-1)" }}><S1RocketB /></div>
  </>
);

// ─── JS Logo ─────────────────────────────────────────────────────────────────

const JSLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="3" fill="#F7DF1E" />
    <text x="12" y="17" textAnchor="middle" fontFamily="'JetBrains Mono',monospace" fontWeight="800" fontSize="11" fill="#000">JS</text>
  </svg>
);

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── TIMING — edit these lines to adjust every motion ──────────────────────

  // 1. Question text typeout
  const Q_TEXT  = "Which one launches first?";
  const qChars  = Math.min(Q_TEXT.length, visibleChars(frame, 0, 0.95));

  // 2. Question text fade-out (happens together with overlay)
  const qOp     = 1 - prog(frame, 50, 58);

  // 3. Full-screen overlay + blur fade-in
  const overlayP    = prog(frame, 50, 60, "out");
  // 3b. Overlay fade-out on exit
  const overlayExP  = prog(frame, 110, 120, "inOut");
  const overlayOp   = overlayP * (1 - overlayExP);

  // 4. Code window slide-in (from below)
  const winP    = prog(frame, 60, 75, "out");
  // 4b. Code window slide-out on exit
  const winExP  = prog(frame, 110, 115, "inOut");
  const winSlideY   = interpolate(winP,  [0, 1], [ARM_Y + 260, WIN_Y]);
  const winSlideExY = interpolate(winExP,[0, 1], [WIN_Y, ARM_Y + 260]);
  const finalWinY   = winExP > 0 ? winSlideExY : winSlideY;
  const finalWinOp  = winP * (1 - winExP);

  // 5. Snippet A flight (from Scene 1 position → line 1 in window)
  const snipAP  = prog(frame, 64, 76, "inOut");

  // 6. Snippet B flight (from Scene 1 position → line 2 in window)
  const snipBP  = prog(frame, 68, 78, "inOut");

  // ─── END TIMING ──────────────────────────────────────────────────────────

  // Flying snippet positions
  const snipAX = interpolate(snipAP, [0, 1], [SNIP_A_CX - 120, LINE1_TARGET_X]);
  const snipAY = interpolate(snipAP, [0, 1], [CODE_S1_TOP,      LINE1_TARGET_Y]);
  const snipBX = interpolate(snipBP, [0, 1], [SNIP_B_CX - 40,  LINE2_TARGET_X]);
  const snipBY = interpolate(snipBP, [0, 1], [CODE_S1_TOP,      LINE2_TARGET_Y]);

  // Flying snippet opacity:
  // - 0 before flight starts
  // - 1 during flight
  // - 0 once it has landed (snipAP === 1), because the window line takes over
  // NO abrupt toggle — we crossfade: flying fades out over last 20% of its travel,
  // and the window line fades in over the same window, so there's always something visible.
  const XFADE_START = 0.8;  // crossfade begins at 80% of flight progress
  const snipAFlyOp  = snipAP > 0
    ? snipAP < XFADE_START
      ? 1
      : 1 - (snipAP - XFADE_START) / (1 - XFADE_START)
    : 0;
  const snipBFlyOp  = snipBP > 0
    ? snipBP < XFADE_START
      ? 1
      : 1 - (snipBP - XFADE_START) / (1 - XFADE_START)
    : 0;

  // Window line opacity: crossfades IN over the last 20% of the snippet's flight
  const line1Op = snipAP > XFADE_START
    ? (snipAP - XFADE_START) / (1 - XFADE_START)
    : 0;
  const line2Op = snipBP > XFADE_START
    ? (snipBP - XFADE_START) / (1 - XFADE_START)
    : 0;

  // Exit: snippets go with window
  const snipExOp = 1 - winExP;

  // Question text Y — immediately above the top of the stem
  const Q_TEXT_Y = STEM_TOP - 100;

  const cursorOn = Math.floor(frame / 9) % 2 === 0;

  return (
    <AbsoluteFill>

      {/* ── Static Scene 1 background ────────────────────────────────────────── */}
      <S1Background />

      {/* Scene 1 code snippets — fade out as overlay comes in */}
      <div style={{
        position: "absolute", top: CODE_S1_TOP, left: ARM_LEFT,
        width: STEM_X - ARM_LEFT, textAlign: "center",
        fontFamily: FONTS.mono, fontSize: 36, lineHeight: "52px",
        whiteSpace: "pre", overflow: "hidden",
        opacity: 1 - overlayP,
      }}>
        {renderTokens(FLY_TOKENS_A)}
      </div>
      <div style={{
        position: "absolute", top: CODE_S1_TOP, left: STEM_X,
        width: ARM_RIGHT - STEM_X, textAlign: "center",
        fontFamily: FONTS.mono, fontSize: 36, lineHeight: "52px",
        whiteSpace: "pre", overflow: "hidden",
        opacity: 1 - overlayP,
      }}>
        {renderTokens(FLY_TOKENS_B)}
      </div>

      {/* ── Question text — above stem top ───────────────────────────────────── */}
      {qChars > 0 && (
        <div style={{
          position: "absolute", top: Q_TEXT_Y,
          left: SAFE.left, width: CANVAS.safeWidth,
          textAlign: "center", fontFamily: FONTS.display,
          fontSize: 62, fontWeight: 800, lineHeight: "1.1",
          color: COLORS.white, letterSpacing: "-0.02em",
          opacity: qOp,
        }}>
          {Q_TEXT.slice(0, qChars)}
          {qChars < Q_TEXT.length && (
            <span style={{ opacity: cursorOn ? 1 : 0, color: COLORS.muted }}>|</span>
          )}
        </div>
      )}

      {/* ── Full-screen overlay + blur — covers everything above ─────────────── */}
      {overlayOp > 0 && (
        <AbsoluteFill style={{
          background:           `rgba(0,0,0,${overlayOp * 0.78})`,
          backdropFilter:       `blur(${overlayOp * 6}px)`,
          WebkitBackdropFilter: `blur(${overlayOp * 6}px)`,
        }} />
      )}

      {/* ── Flying snippet A ─────────────────────────────────────────────────── */}
      {/* Same colours + font as Scene 1. Crossfades into window on landing. */}
      {snipAP > 0 && (
        <div style={{
          position: "absolute", top: snipAY, left: snipAX,
          fontFamily: FONTS.mono, fontSize: 34, lineHeight: "52px",
          whiteSpace: "pre",
          opacity: snipAFlyOp * snipExOp,
          pointerEvents: "none",
        }}>
          {renderTokens(FLY_TOKENS_A)}
        </div>
      )}

      {/* ── Flying snippet B ─────────────────────────────────────────────────── */}
      {snipBP > 0 && (
        <div style={{
          position: "absolute", top: snipBY, left: snipBX,
          fontFamily: FONTS.mono, fontSize: 34, lineHeight: "52px",
          whiteSpace: "pre",
          opacity: snipBFlyOp * snipExOp,
          pointerEvents: "none",
        }}>
          {renderTokens(FLY_TOKENS_B)}
        </div>
      )}

      {/* ── Code window ──────────────────────────────────────────────────────── */}
      {finalWinOp > 0 && (
        <div style={{
          position: "absolute", top: finalWinY, left: WIN_X,
          width: WIN_W, height: WIN_H,
          opacity: finalWinOp,
          borderRadius: 12, overflow: "hidden",
          border: `1.5px solid ${GH.border}`,
          boxShadow: "0 32px 100px rgba(0,0,0,0.85)",
        }}>

          {/* Title bar */}
          <div style={{
            height: BAR_H, background: GH.titleBar,
            display: "flex", alignItems: "center",
            padding: "0 16px", gap: 0,
            borderBottom: `1px solid ${GH.border}`,
          }}>
            {/* Traffic lights */}
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginRight: 14 }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FF5F57" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#FEBC2E" }} />
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#28C840" }} />
            </div>
            {/* Tab — flush right of dots */}
            <div style={{
              display: "flex", alignItems: "center", gap: 8,
              background: GH.bg,
              padding: "6px 16px",
              borderRadius: "6px 6px 0 0",
              border: `1px solid ${GH.border}`,
              borderBottom: "none",
            }}>
              <JSLogo size={20} />
              <span style={{
                fontFamily: FONTS.mono, fontSize: FILENAME_FONT,
                color: GH.text, letterSpacing: "0.01em",
              }}>script.js</span>
            </div>
          </div>

          {/* Code area */}
          <div style={{
            background: GH.bg,
            height: WIN_H - BAR_H,
            padding: "8px 0",
            display: "flex", flexDirection: "column",
          }}>

            {/* Line 1 */}
            <div style={{ display: "flex", alignItems: "center", height: LINE_H, paddingRight: 20 }}>
              <div style={{
                width: GUTTER_W, textAlign: "right", paddingRight: 16,
                fontFamily: FONTS.mono, fontSize: GUTTER_FONT,
                color: GH.lineNum, flexShrink: 0, userSelect: "none",
              }}>1</div>
              {/* Crossfades in as the flying snippet lands */}
              <div style={{
                fontFamily: FONTS.mono, fontSize: CODE_FONT,
                lineHeight: `${LINE_H}px`, whiteSpace: "pre", overflow: "hidden",
                opacity: line1Op,
              }}>
                {renderTokens(WIN_TOKENS_A)}
              </div>
            </div>

            {/* Line 2 */}
            <div style={{ display: "flex", alignItems: "center", height: LINE_H, paddingRight: 20 }}>
              <div style={{
                width: GUTTER_W, textAlign: "right", paddingRight: 16,
                fontFamily: FONTS.mono, fontSize: GUTTER_FONT,
                color: GH.lineNum, flexShrink: 0, userSelect: "none",
              }}>2</div>
              <div style={{
                fontFamily: FONTS.mono, fontSize: CODE_FONT,
                lineHeight: `${LINE_H}px`, whiteSpace: "pre", overflow: "hidden",
                opacity: line2Op,
              }}>
                {renderTokens(WIN_TOKENS_B)}
              </div>
            </div>

          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};