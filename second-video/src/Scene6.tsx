/**
 * Scene 6 — 165 frames (5.5 s)
 *
 * Script: "Functions like setTimeout are asynchronous"
 *
 * Opens with the 5 code cards exactly where Scene 5 left them (splitP = 1).
 * Cards shrink + slide left, then arrows point at the two setTimeout cards
 * with an "asynchronous" label pill.
 *
 * ─── TIMING MAP ──────────────────────────────────────────────────────────────
 *
 *   Cards shrink + move left   →  prog(frame,  0, 35, "inOut")
 *   Arrow to setTimeout line 2 →  prog(frame, 40, 55, "out")
 *   Arrow to setTimeout line 4 →  prog(frame, 48, 63, "out")
 *   "asynchronous" label       →  prog(frame, 58, 72, "out")
 *   Fade out                   →  prog(frame,148,165)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Scene 5 card geometry (must exactly match Scene5.tsx) ───────────────────

const WIN_W      = 820;
const WIN_X      = SAFE.left + Math.round((CANVAS.safeWidth - WIN_W) / 2);
const BAR_H      = 72;
const LINE_H     = 136;
const GUTTER_W   = 72;
const CODE_FONT  = 40;
const N_LINES    = 5;
const WIN_BODY_H = LINE_H * N_LINES + 12;
const WIN_H      = BAR_H + WIN_BODY_H;
const TITLE_SPACE = 140;
const WIN_Y = SAFE.top + TITLE_SPACE + Math.round(
  (CANVAS.safeHeight - TITLE_SPACE - WIN_H) / 2
);
const MAX_GAP = 80;

// Cards at full split (Scene 5 end state, splitP = 1)
function splitLineY(i: number): number {
  const base = WIN_Y + BAR_H + 6 + i * LINE_H;
  return base + (i - 2) * MAX_GAP;
}

// Target dimensions after shrink
const CARD_TARGET_W   = Math.round(WIN_W   * 0.65);   // 533px
const CARD_TARGET_H   = Math.round(LINE_H  * 0.65);   // 88px
const CARD_TARGET_GAP = 44;   // reduced gap between cards (was 80)
const CARD_TARGET_X   = SAFE.left;                     // slides to left safe edge

// ─── Tokens (same as Scene 5) ─────────────────────────────────────────────────

type Tok      = { text: string; color: string };
type CodeLine = Tok[];

const LINES: CodeLine[] = [
  [
    { text: "console",   color: COLORS.fnName      },
    { text: ".",         color: COLORS.punctuation },
    { text: "log",       color: COLORS.fnName      },
    { text: "(",         color: COLORS.punctuation },
    { text: "'Started'", color: COLORS.string      },
    { text: ");",        color: COLORS.punctuation },
  ],
  [
    { text: "setTimeout", color: COLORS.keyword     },
    { text: "(",          color: COLORS.punctuation },
    { text: "greetUser",  color: COLORS.fnName      },
    { text: ", ",         color: COLORS.punctuation },
    { text: "10",         color: COLORS.number      },
    { text: ");",         color: COLORS.punctuation },
  ],
  [
    { text: "console",      color: COLORS.fnName      },
    { text: ".",            color: COLORS.punctuation },
    { text: "log",          color: COLORS.fnName      },
    { text: "(",            color: COLORS.punctuation },
    { text: "'Running...'", color: COLORS.string      },
    { text: ");",           color: COLORS.punctuation },
  ],
  [
    { text: "setTimeout", color: COLORS.keyword     },
    { text: "(",          color: COLORS.punctuation },
    { text: "sendData",   color: COLORS.fnName      },
    { text: ", ",         color: COLORS.punctuation },
    { text: "50",         color: COLORS.number      },
    { text: ");",         color: COLORS.punctuation },
  ],
  [
    { text: "console", color: COLORS.fnName      },
    { text: ".",       color: COLORS.punctuation },
    { text: "log",     color: COLORS.fnName      },
    { text: "(",       color: COLORS.punctuation },
    { text: "'Done'",  color: COLORS.string      },
    { text: ");",      color: COLORS.punctuation },
  ],
];

function renderLine(line: CodeLine): React.ReactNode {
  return line.map((tok, i) => (
    <span key={i} style={{ color: tok.color }}>{tok.text}</span>
  ));
}

// ─── Easing ──────────────────────────────────────────────────────────────────

function easeOut(t: number): number { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
function prog(
  frame: number, start: number, end: number,
  ease: "out" | "inOut" = "inOut"
): number {
  const t = Math.max(0, Math.min(1, (frame - start) / (end - start)));
  return ease === "out" ? easeOut(t) : easeInOut(t);
}

// ─── Arrow component ─────────────────────────────────────────────────────────
// Horizontal arrow pointing LEFT toward a card. Draws right-to-left with drawP.
// originX: where the arrow tail starts (right side)
// targetX: where the arrowhead tip ends (at the card right edge)

const HorizArrow: React.FC<{
  originX: number;
  targetX: number;
  y: number;
  drawP: number;
}> = ({ originX, targetX, y, drawP }) => {
  if (drawP <= 0) return null;

  const HEAD_W = 28;
  const HEAD_H = 40;
  const STROKE = 6;

  // Tail draws from originX toward targetX + HEAD_W
  const shaftEnd = originX - (originX - (targetX + HEAD_W)) * Math.min(drawP / 0.75, 1);
  const headOp   = Math.max(0, (drawP - 0.75) / 0.25);

  return (
    <svg
      width={CANVAS.width} height={CANVAS.height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}
    >
      {/* Shaft */}
      <line
        x1={originX} y1={y}
        x2={shaftEnd} y2={y}
        stroke={COLORS.rocketA}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Arrowhead — pointing left */}
      {headOp > 0 && (
        <polygon
          points={`
            ${targetX + HEAD_W},${y - HEAD_H / 2}
            ${targetX + HEAD_W},${y + HEAD_H / 2}
            ${targetX},${y}
          `}
          fill={COLORS.rocketA}
          opacity={headOp}
        />
      )}
    </svg>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  // Fade out at end
  const fadeOut = 1 - prog(frame, 148, 165);

  // Cards shrink + move left — interpolate actual dimensions and positions
  const moveP = prog(frame, 0, 35, "inOut");

  // Animated card dimensions
  const cardW = interpolate(moveP, [0, 1], [WIN_W,    CARD_TARGET_W]);
  const cardH = interpolate(moveP, [0, 1], [LINE_H,   CARD_TARGET_H]);
  const cardX = interpolate(moveP, [0, 1], [WIN_X,    CARD_TARGET_X]);

  // Animated gap between cards (shrinks from MAX_GAP=80 to CARD_TARGET_GAP=44)
  function animCardY(i: number): number {
    const base    = WIN_Y + BAR_H + 6 + i * LINE_H; // original splitLineY base
    const origGap = (i - 2) * MAX_GAP;              // gap at splitP=1 (Scene 5 end)
    const targGap = (i - 2) * CARD_TARGET_GAP;      // gap at target
    const gap     = interpolate(moveP, [0, 1], [origGap, targGap]);
    // Also compress vertical packing: as cardH shrinks, rows shift up
    const rowCompress = (i) * (LINE_H - cardH);     // each card above shifts up by lost height
    return base + gap - rowCompress;
  }

  // Scaled card width (for arrow targeting)
  const scaledCardW = cardW;

  // Arrow origin X — right side, with room for label
  const LABEL_W    = 320;
  const ARROW_ORIG = CANVAS.width - SAFE.right - LABEL_W - 24;

  // Y centres of setTimeout cards (i=1, i=3) — use animated card centres
  const arrow1Y = animCardY(1) + cardH / 2;
  const arrow2Y = animCardY(3) + cardH / 2;

  // Target X = right edge of the shrunk card
  const arrowTargetX = CARD_TARGET_X + scaledCardW;

  // Arrow draw progress
  const arrow1P = prog(frame, 40, 55, "out");
  const arrow2P = prog(frame, 48, 63, "out");

  // Label
  const labelOp = prog(frame, 58, 72, "out");

  // Label Y — between the two setTimeout cards
  const labelY = (arrow1Y + arrow2Y) / 2 - 32;

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>

      {/* ── Cards — all 5, dimensions and positions directly animated ──────── */}
      {LINES.map((line, i) => {
        const isAsync = i === 1 || i === 3;
        const cardY   = animCardY(i);
        // Scale gutter and font proportionally with card height
        const fontScale   = cardH / LINE_H;
        const gutterFont  = Math.round(30  * fontScale);
        const codeFont    = Math.round(CODE_FONT * fontScale);
        const gutterW     = Math.round(GUTTER_W * fontScale);

        return (
          <div
            key={i}
            style={{
              position:     "absolute",
              top:          cardY,
              left:         cardX,
              width:        cardW,
              height:       cardH,
              borderRadius: 8,
              background:   "#0D1117",
              border:       isAsync
                ? `2.5px solid ${COLORS.rocketA}`   // full opacity — clearly visible
                : "1px solid rgba(255,255,255,0.09)",
              // Glow for async cards
              boxShadow:    isAsync
                ? `0 0 12px ${COLORS.rocketA}55, inset 0 0 20px ${COLORS.rocketA}0A`
                : "none",
              display:      "flex",
              alignItems:   "center",
              overflow:     "hidden",
            }}
          >
            <div style={{
              width: gutterW, textAlign: "right", paddingRight: 10,
              fontFamily: FONTS.mono, fontSize: gutterFont,
              color: "#6E7681", flexShrink: 0,
            }}>{i + 1}</div>
            <div style={{
              fontFamily: FONTS.mono, fontSize: codeFont,
              lineHeight: `${cardH}px`, whiteSpace: "pre",
            }}>
              {renderLine(line)}
            </div>
          </div>
        );
      })}

      {/* ── Arrow to setTimeout line 2 (i=1) ────────────────────────────── */}
      <HorizArrow
        originX={ARROW_ORIG}
        targetX={arrowTargetX}
        y={arrow1Y}
        drawP={arrow1P}
      />

      {/* ── Arrow to setTimeout line 4 (i=3) ────────────────────────────── */}
      <HorizArrow
        originX={ARROW_ORIG}
        targetX={arrowTargetX}
        y={arrow2Y}
        drawP={arrow2P}
      />

      {/* ── "asynchronous" label pill ─────────────────────────────────────── */}
      {labelOp > 0 && (
        <div style={{
          position:     "absolute",
          top:          labelY,
          left:         ARROW_ORIG + 12,
          width:        LABEL_W + 20,
          opacity:      labelOp,
          background:   `${COLORS.rocketA}22`,
          border:       `2px solid ${COLORS.rocketA}`,
          borderRadius: 12,
          padding:      "16px 12px",
          fontFamily:   FONTS.display,
          fontSize:     36,
          fontWeight:   800,
          color:        COLORS.rocketA,
          letterSpacing: "0.02em",
          textAlign:    "center",
          lineHeight:   "1",
        }}>
          asynchronous
        </div>
      )}

    </AbsoluteFill>
  );
};