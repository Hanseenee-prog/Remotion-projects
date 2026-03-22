/**
 * Scene 6 — 165 frames (5.5 s)
 *
 * Script: "Functions like setTimeout are asynchronous —
 *          they wait for other code to finish before running."
 *
 * ─── TIMING MAP ──────────────────────────────────────────────────────────────
 *
 *   Cards shrink + move left     →  prog(frame,  0, 35, "inOut")
 *   Arrow to setTimeout 1        →  prog(frame, 40, 55, "out")
 *   Arrow to setTimeout 2        →  prog(frame, 48, 63, "out")
 *   "asynchronous" label fade-in →  prog(frame, 58, 72, "out")
 *   Arrows + label fade OUT      →  prog(frame, 80, 85)          ← fade away
 *   Cards return to centre+full  →  prog(frame, 85,105, "inOut") ← expand back
 *   Cards reorder (async → btm)  →  prog(frame, 85,105, "inOut") ← same progress
 *   Everything fades out         →  prog(frame,155,160)
 *
 * Card reorder: setTimeout cards (i=1,3) sink to slots 3,4
 *               sync cards (i=0,2,4) rise to slots 0,1,2
 *               Numbers stay tied to their original line.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Scene 5 geometry (must match Scene5.tsx exactly) ────────────────────────

const WIN_W      = 820;
const WIN_X      = SAFE.left + Math.round((CANVAS.safeWidth - WIN_W) / 2);
const BAR_H      = 72;
const LINE_H     = 136;
const GUTTER_W   = 72;
const CODE_FONT  = 40;
const WIN_BODY_H = LINE_H * 5 + 12;
const WIN_H      = BAR_H + WIN_BODY_H;
const TITLE_SPACE = 140;
const WIN_Y = SAFE.top + TITLE_SPACE + Math.round(
  (CANVAS.safeHeight - TITLE_SPACE - WIN_H) / 2
);
const MAX_GAP = 80;

// Scene 5 end-state: cards at splitP=1
function splitLineY(i: number): number {
  return WIN_Y + BAR_H + 6 + i * LINE_H + (i - 2) * MAX_GAP;
}

// Full-size card Y at a given slot (used for final reorder target)
function fullSlotY(slot: number): number {
  return WIN_Y + BAR_H + 6 + slot * LINE_H + (slot - 2) * MAX_GAP;
}

// Shrunk state constants
const CARD_TARGET_W   = Math.round(WIN_W  * 0.65);
const CARD_TARGET_H   = Math.round(LINE_H * 0.65);
const CARD_TARGET_GAP = 44;
const CARD_TARGET_X   = SAFE.left;

// Shrunk Y of each card (target of shrink phase)
function shrunkCardY(i: number): number {
  const base    = WIN_Y + BAR_H + 6 + i * LINE_H;
  const gap     = (i - 2) * CARD_TARGET_GAP;
  const rowComp = i * (LINE_H - CARD_TARGET_H);
  return base + gap - rowComp;
}

// Reorder: which final slot does each original card index go to?
// Original:  [0=console, 1=setTimeout, 2=console, 3=setTimeout, 4=console]
// Reordered: slot 0=card0, slot1=card2, slot2=card4, slot3=card1, slot4=card3
const FINAL_SLOT = [0, 3, 1, 4, 2];

// ─── Tokens ───────────────────────────────────────────────────────────────────

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

// ─── Arrow ───────────────────────────────────────────────────────────────────

const HorizArrow: React.FC<{
  originX: number; targetX: number; y: number; drawP: number; op: number;
}> = ({ originX, targetX, y, drawP, op }) => {
  if (drawP <= 0 || op <= 0) return null;
  const HEAD_W = 28, HEAD_H = 40, STROKE = 6;
  const shaftEnd = originX - (originX - (targetX + HEAD_W)) * Math.min(drawP / 0.75, 1);
  const headOp   = Math.max(0, (drawP - 0.75) / 0.25) * op;
  return (
    <svg width={CANVAS.width} height={CANVAS.height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <line x1={originX} y1={y} x2={shaftEnd} y2={y}
        stroke={COLORS.rocketA} strokeWidth={STROKE} strokeLinecap="round"
        opacity={op} />
      {headOp > 0 && (
        <polygon
          points={`${targetX+HEAD_W},${y-HEAD_H/2} ${targetX+HEAD_W},${y+HEAD_H/2} ${targetX},${y}`}
          fill={COLORS.rocketA} opacity={headOp} />
      )}
    </svg>
  );
};

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  // Global fade-out
  const fadeOut = 1 - prog(frame, 155, 160);

  // ── Phase 1: shrink + move left (0–35) ──────────────────────────────────
  const shrinkP = prog(frame,  0, 35, "inOut");
  const cardW   = interpolate(shrinkP, [0, 1], [WIN_W,         CARD_TARGET_W]);
  const cardH   = interpolate(shrinkP, [0, 1], [LINE_H,        CARD_TARGET_H]);
  const cardX   = interpolate(shrinkP, [0, 1], [WIN_X,         CARD_TARGET_X]);

  // ── Phase 3: return to centre + reorder (85–105) ────────────────────────
  const returnP = prog(frame, 85, 105, "inOut");
  // Expand dimensions back to full size
  const finalW  = interpolate(returnP, [0, 1], [CARD_TARGET_W, WIN_W]);
  const finalH  = interpolate(returnP, [0, 1], [CARD_TARGET_H, LINE_H]);
  const finalX  = interpolate(returnP, [0, 1], [CARD_TARGET_X, WIN_X]);

  // Which phase are we in?
  const inReturn = frame >= 85;
  const inShrunk = frame >= 35 && frame < 85;  // fully shrunk hold

  // Per-card Y calculation
  function cardYForIndex(i: number): number {
    if (!inReturn) {
      // Shrink phase or hold
      return shrunkCardY(i);
    } else {
      // Return + reorder: interpolate from shrunk Y → final slot Y (full size)
      const fromY = shrunkCardY(i);
      const toY   = fullSlotY(FINAL_SLOT[i]);
      return interpolate(returnP, [0, 1], [fromY, toY]);
    }
  }

  // ── Arrow + label visibility ─────────────────────────────────────────────
  const arrow1Raw = prog(frame, 40, 55, "out");
  const arrow2Raw = prog(frame, 48, 63, "out");
  const labelRaw  = prog(frame, 58, 72, "out");
  // Fade all of these out at 80–85
  const chromeFade = 1 - prog(frame, 80, 85);

  const arrow1P = arrow1Raw;   // draw progress stays — just opacity changes
  const arrow2P = arrow2Raw;
  const arrowOp = chromeFade;
  const labelOp = labelRaw * chromeFade;

  // Arrow geometry — based on shrunk card positions
  const LABEL_W    = 320;
  const ARROW_ORIG = CANVAS.width - SAFE.right - LABEL_W - 24;
  const arrow1Y    = shrunkCardY(1) + CARD_TARGET_H / 2;
  const arrow2Y    = shrunkCardY(3) + CARD_TARGET_H / 2;
  const arrowTargX = CARD_TARGET_X + CARD_TARGET_W;
  const labelY     = (arrow1Y + arrow2Y) / 2 - 32;

  // ── Phase 4: scan line passes slots 0, 1, stops halfway through slot 2 ──

  // Slot 2 = card i=4 (third sync card). Line stops at its midpoint.
  const SCAN_START_Y = fullSlotY(0);
  const SCAN_END_Y   = fullSlotY(2) + LINE_H / 2;  // halfway through slot 2
  const scanP        = prog(frame, 130, 150, "inOut");
  const scanY        = interpolate(scanP, [0, 1], [SCAN_START_Y, SCAN_END_Y]);
  const scanVisible  = frame >= 130 && frame < 155;

  function cardCentreY(i: number): number {
    return fullSlotY(FINAL_SLOT[i]) + LINE_H / 2;
  }
  // Only sync cards (slots 0,1) are ever fully passed — slot 2 is only half-passed at end
  function isPassed(i: number): boolean {
    return scanVisible && scanY > cardCentreY(i);
  }
  function passedOp(i: number): number {
    if (!scanVisible) return 0;
    const centre = cardCentreY(i);
    return Math.max(0, Math.min(1, (scanY - centre) / (LINE_H * 0.4)));
  }

  // Clock icon on async cards — visible from frame 130, fades in over 12f
  const clockOp = prog(frame, 130, 142, "out");

  // Per-card font scale
  function fontScaleFor(h: number): number { return h / LINE_H; }

  return (
    <AbsoluteFill style={{ opacity: fadeOut }}>

      {/* ── Cards ────────────────────────────────────────────────────────── */}
      {LINES.map((line, i) => {
        const isAsync  = i === 1 || i === 3;
        const passed   = isPassed(i);
        const badgeOp  = passedOp(i);

        const w = inReturn ? finalW  : cardW;
        const h = inReturn ? finalH  : cardH;
        const x = inReturn ? finalX  : cardX;
        const y = cardYForIndex(i);

        const fs    = fontScaleFor(h);
        const gFont = Math.round(30        * fs);
        const cFont = Math.round(CODE_FONT * fs);
        const gW    = Math.round(GUTTER_W  * fs);

        // Border colour: async thinner orange, sync turns green after scan passes
        const borderCol = isAsync
          ? COLORS.rocketA
          : passed
            ? COLORS.string
            : "rgba(255,255,255,0.09)";
        const borderW = isAsync ? "1.5px" : passed ? "2px" : "1px";
        const shadow  = isAsync
          ? `0 0 8px ${COLORS.rocketA}44`
          : passed
            ? `0 0 14px ${COLORS.string}44`
            : "none";

        return (
          <div key={i} style={{
            position:     "absolute",
            top: y, left: x, width: w, height: h,
            borderRadius: 8, background: "#0D1117",
            border:    `${borderW} solid ${borderCol}`,
            boxShadow: shadow,
            display: "flex", alignItems: "center",
            overflow: "hidden",
          }}>

            {/* Scan highlight flash — brief bright strip as line passes */}
            {scanVisible && Math.abs(scanY - (y + h / 2)) < h * 0.6 && (
              <div style={{
                position: "absolute", inset: 0,
                background: isAsync
                  ? `rgba(255,107,53,${Math.max(0, 0.12 - Math.abs(scanY - (y + h/2)) / (h * 5))})`
                  : `rgba(166,227,161,${Math.max(0, 0.15 - Math.abs(scanY - (y + h/2)) / (h * 4))})`,
                pointerEvents: "none",
              }} />
            )}

            {/* Gutter */}
            <div style={{
              width: gW, textAlign: "right", paddingRight: 10,
              fontFamily: FONTS.mono, fontSize: gFont,
              color: "#6E7681", flexShrink: 0, position: "relative",
            }}>{i + 1}</div>

            {/* Code */}
            <div style={{
              fontFamily: FONTS.mono, fontSize: cFont,
              lineHeight: `${h}px`, whiteSpace: "pre", position: "relative",
            }}>
              {renderLine(line)}
            </div>

            {/* ── Tick badge (sync cards, top-left) ── */}
            {!isAsync && badgeOp > 0 && (
              <div style={{
                position: "absolute", top: 8, left: 8,
                width: 30, height: 30, borderRadius: "50%",
                background: COLORS.string,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: badgeOp,
              }}>
                <svg width={17} height={17} viewBox="0 0 17 17" fill="none">
                  <path
                    d="M3.5 8.5 L7 12 L13.5 5"
                    stroke="#0D1117"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}

            {/* ── Clock waiting icon (async cards, top-left) ── */}
            {isAsync && clockOp > 0 && (
              <div style={{
                position: "absolute", top: 8, left: 8,
                width: 30, height: 30, borderRadius: "50%",
                background: `${COLORS.rocketA}22`,
                border: `1.5px solid ${COLORS.rocketA}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: clockOp,
              }}>
                <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="9" r="7.5" stroke={COLORS.rocketA} strokeWidth={1.5} />
                  <line x1="9" y1="9" x2="6.2" y2="5.5"
                    stroke={COLORS.rocketA} strokeWidth={1.8} strokeLinecap="round" />
                  <line x1="9" y1="9" x2="9" y2="3.5"
                    stroke={COLORS.rocketA} strokeWidth={1.5} strokeLinecap="round" />
                  <circle cx="9" cy="9" r="1.2" fill={COLORS.rocketA} />
                </svg>
              </div>
            )}

          </div>
        );
      })}

      {/* ── Scan line ────────────────────────────────────────────────────── */}
      {scanVisible && (
        <div style={{
          position:   "absolute",
          top:        scanY - 2,
          left:       WIN_X,
          width:      WIN_W,
          height:     4,
          borderRadius: 2,
          background: `linear-gradient(90deg,
            transparent 0%,
            rgba(255,255,255,0.08) 10%,
            rgba(255,255,255,0.55) 40%,
            rgba(255,255,255,0.55) 60%,
            rgba(255,255,255,0.08) 90%,
            transparent 100%)`,
          boxShadow:  "0 0 12px rgba(255,255,255,0.4), 0 0 24px rgba(255,255,255,0.15)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Arrows ───────────────────────────────────────────────────────── */}
      <HorizArrow originX={ARROW_ORIG} targetX={arrowTargX}
        y={arrow1Y} drawP={arrow1P} op={arrowOp} />
      <HorizArrow originX={ARROW_ORIG} targetX={arrowTargX}
        y={arrow2Y} drawP={arrow2P} op={arrowOp} />

      {/* ── "asynchronous" label ─────────────────────────────────────────── */}
      {labelOp > 0 && (
        <div style={{
          position:      "absolute",
          top:           labelY,
          left:          ARROW_ORIG + 12,
          width:         LABEL_W + 20,
          opacity:       labelOp,
          background:    `${COLORS.rocketA}22`,
          border:        `2px solid ${COLORS.rocketA}`,
          borderRadius:  12,
          padding:       "14px 12px",
          fontFamily:    FONTS.display,
          fontSize:      36,
          fontWeight:    800,
          color:         COLORS.rocketA,
          letterSpacing: "0.02em",
          textAlign:     "center",
          lineHeight:    "1",
        }}>
          asynchronous
        </div>
      )}

    </AbsoluteFill>
  );
};