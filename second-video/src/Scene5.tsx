/**
 * Scene 5 — 90 frames (3 s)
 *
 * Script: "It uses something called the event loop."
 *
 * ─── TIMING MAP (user-updated values) ────────────────────────────────────────
 *
 *   Window slides up            →  prog(frame,  0, 12, "out")
 *   "The Event Loop" title      →  prog(frame, 12, 25)
 *   Title bar fade-out          →  prog(frame, 36, 44)
 *   Cards split apart           →  prog(frame, 36, 44, "out")
 *   Merged bg fades             →  prog(frame, 36, 44)
 *   Arrow 1                     →  prog(frame, 34, 44)
 *   Arrow 2                     →  prog(frame, 39, 50)
 *   Arrow 3                     →  prog(frame, 44, 55)
 *   Arrow 4                     →  prog(frame, 49, 60)
 *   "starts loop" label         →  prog(frame, 55, 64)
 *   "restarts loop" label       →  prog(frame, 72, 82)
 *
 *   Fade-out at end:
 *     Cards + code stay visible (no fade) — used as entry state for Scene 6
 *     Everything else (title, arrows, labels, title bar) fades →  prog(frame, 82, 90)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { SAFE, CANVAS, COLORS, FONTS } from "./tokens";

// ─── Layout ──────────────────────────────────────────────────────────────────

const W = CANVAS.width;

const WIN_W      = 820;
const WIN_X      = SAFE.left + Math.round((CANVAS.safeWidth - WIN_W) / 2);
const BAR_H      = 72;
const LINE_H     = 136;
const GUTTER_W   = 72;
const CODE_FONT  = 46;
const N_LINES    = 5;
const WIN_BODY_H = LINE_H * N_LINES + 12;
const WIN_H      = BAR_H + WIN_BODY_H;

const TITLE_SPACE = 140;
const WIN_Y = SAFE.top + TITLE_SPACE + Math.round(
  (CANVAS.safeHeight - TITLE_SPACE - WIN_H) / 2
);

const MAX_GAP = 80;

function baseLineY(i: number): number {
  return WIN_Y + BAR_H + 6 + i * LINE_H;
}
function splitLineY(i: number, splitP: number): number {
  return baseLineY(i) + (i - 2) * MAX_GAP * splitP;
}

const ARROW_CX     = WIN_X + WIN_W / 2;
const ARROW_COLOR  = COLORS.number;
const ARROW_HEAD_H = 28;
const ARROW_HEAD_W = 36;
const TITLE_Y      = SAFE.top + 40;

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

// ─── Tokens ──────────────────────────────────────────────────────────────────

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

// ─── JS Logo ─────────────────────────────────────────────────────────────────

const JSLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="3" fill="#F7DF1E" />
    <text x="12" y="17" textAnchor="middle"
      fontFamily="'JetBrains Mono',monospace" fontWeight="800"
      fontSize="11" fill="#000">JS</text>
  </svg>
);

// ─── SVG Arrow ───────────────────────────────────────────────────────────────

const VertArrow: React.FC<{ y1: number; y2: number; drawP: number }> = ({
  y1, y2, drawP,
}) => {
  if (drawP <= 0) return null;
  const bodyEnd  = y2 - ARROW_HEAD_H;
  const drawnEnd = y1 + (bodyEnd - y1) * Math.min(drawP / 0.8, 1);
  const headOp   = Math.max(0, (drawP - 0.8) / 0.2);
  return (
    <svg width={W} height={CANVAS.height}
      style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
      <line
        x1={ARROW_CX} y1={y1} x2={ARROW_CX} y2={drawnEnd}
        stroke={ARROW_COLOR} strokeWidth={6} strokeLinecap="round"
      />
      {headOp > 0 && (
        <polygon
          points={`
            ${ARROW_CX - ARROW_HEAD_W / 2},${y2 - ARROW_HEAD_H}
            ${ARROW_CX + ARROW_HEAD_W / 2},${y2 - ARROW_HEAD_H}
            ${ARROW_CX},${y2}
          `}
          fill={ARROW_COLOR} opacity={headOp}
        />
      )}
    </svg>
  );
};

// ─── Shared title bar markup ──────────────────────────────────────────────────

const TitleBarContent: React.FC = () => (
  <>
    <div style={{ display: "flex", gap: 7, alignItems: "center", marginRight: 12 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FF5F57" }} />
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#FEBC2E" }} />
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#28C840" }} />
    </div>
    <div style={{
      display: "flex", alignItems: "center", gap: 7,
      background: "#0D1117",
      padding: "5px 14px", borderRadius: "6px 6px 0 0",
      border: "1px solid #30363D", borderBottom: "none",
    }}>
      <JSLogo size={26} />
      <span style={{ fontFamily: FONTS.mono, fontSize: 30, color: "#E6EDF3" }}>
        script.js
      </span>
    </div>
  </>
);

// ─── Scene ───────────────────────────────────────────────────────────────────

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  // Selective fade — only non-card elements fade out
  const chromeFade = 1 - prog(frame, 82, 90);

  // ── Phase 1 ─────────────────────────────────────────────────────────────
  const winSlideP = prog(frame,  0, 12, "out");
  const winEntryY = interpolate(winSlideP, [0, 1], [WIN_Y + 100, WIN_Y]);
  const labelOp   = prog(frame, 12, 25) * chromeFade;

  // ── Phase 2 ─────────────────────────────────────────────────────────────
  const titleBarOp = (1 - prog(frame, 36, 44)) * chromeFade;
  const splitP     = prog(frame, 36, 44, "out");
  const winBgOp    = (1 - prog(frame, 36, 44)) * chromeFade;
  const inSplit    = frame >= 36;

  // Arrows — user-updated timing from document
  const arrowPs = [
    prog(frame, 34, 44) * chromeFade,
    prog(frame, 39, 50) * chromeFade,
    prog(frame, 44, 55) * chromeFade,
    prog(frame, 49, 60) * chromeFade,
  ];

  const startsOp   = prog(frame, 55, 64) * chromeFade;
  const restartsOp = prog(frame, 72, 82) * chromeFade;

  return (
    // No opacity on AbsoluteFill — cards must remain visible
    <AbsoluteFill>

      {/* ── Phase 1: merged code window ──────────────────────────────────── */}
      {!inSplit && winSlideP > 0 && (
        <div style={{
          position: "absolute", top: winEntryY, left: WIN_X,
          width: WIN_W, height: WIN_H,
          borderRadius: 12, overflow: "hidden",
          border: "1.5px solid rgba(255,255,255,0.10)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7)",
        }}>
          <div style={{
            height: BAR_H, background: "#161B22",
            display: "flex", alignItems: "center", padding: "0 16px",
            borderBottom: "1px solid #30363D",
          }}>
            <TitleBarContent />
          </div>
          <div style={{ background: "#0D1117", padding: "6px 0" }}>
            {LINES.map((line, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", height: LINE_H }}>
                <div style={{
                  width: GUTTER_W, textAlign: "right", paddingRight: 14,
                  fontFamily: FONTS.mono, fontSize: 30,
                  color: "#6E7681", flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: CODE_FONT,
                  fontWeight: 600,
                  lineHeight: `${LINE_H}px`, whiteSpace: "pre",
                }}>
                  {renderLine(line)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── "The Event Loop" title ────────────────────────────────────────── */}
      {labelOp > 0 && (
        <div style={{
          position: "absolute", top: TITLE_Y,
          left: SAFE.left, width: CANVAS.safeWidth,
          textAlign: "center", fontFamily: FONTS.display,
          fontSize: 64, fontWeight: 900,
          color: COLORS.keyword, letterSpacing: "-0.02em",
          opacity: labelOp,
        }}>
          The Event Loop
        </div>
      )}

      {/* ── Phase 2: split cards + arrows ────────────────────────────────── */}
      {inSplit && (
        <>
          {/* Merged bg — fades, chrome only */}
          {winBgOp > 0 && (
            <div style={{
              position: "absolute", top: WIN_Y, left: WIN_X,
              width: WIN_W, height: WIN_H,
              background: "#0D1117", borderRadius: 12,
              border: "1.5px solid rgba(255,255,255,0.10)",
              opacity: winBgOp,
            }} />
          )}

          {/* Title bar — fades, chrome only */}
          {titleBarOp > 0 && (
            <div style={{
              position: "absolute", top: WIN_Y, left: WIN_X,
              width: WIN_W, height: BAR_H,
              background: "#161B22", borderRadius: "12px 12px 0 0",
              border: "1.5px solid rgba(255,255,255,0.10)",
              borderBottom: "1px solid #30363D",
              opacity: titleBarOp,
              display: "flex", alignItems: "center", padding: "0 16px",
            }}>
              <TitleBarContent />
            </div>
          )}

          {/* ── Cards — NO fade, stay visible into Scene 6 ─────────────────── */}
          {LINES.map((line, i) => {
            const cardY = splitLineY(i, splitP);
            return (
              <div key={i} style={{
                position: "absolute",
                top: cardY, left: WIN_X,
                width: WIN_W, height: LINE_H,
                borderRadius: 8,
                background: "#0D1117",
                border: "1px solid rgba(255,255,255,0.09)",
                display: "flex", alignItems: "center",
                overflow: "hidden",
                // opacity intentionally omitted — always 1
              }}>
                <div style={{
                  width: GUTTER_W, textAlign: "right", paddingRight: 14,
                  fontFamily: FONTS.mono, fontSize: 30,
                  color: "#6E7681", flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: CODE_FONT,
                  fontWeight: 600,
                  lineHeight: `${LINE_H}px`, whiteSpace: "pre",
                }}>
                  {renderLine(line)}
                </div>
              </div>
            );
          })}

          {/* "starts loop" — fades */}
          {startsOp > 0 && (
            <div style={{
              position: "absolute",
              top: splitLineY(0, splitP) - 46,
              left: WIN_X, width: WIN_W,
              textAlign: "center", fontFamily: FONTS.display,
              fontSize: 28, fontWeight: 700,
              color: COLORS.muted, letterSpacing: "0.08em",
              textTransform: "uppercase", opacity: startsOp,
            }}>
              starts loop
            </div>
          )}

          {/* Arrows — fades */}
          {arrowPs.map((p, i) => {
            const y1 = splitLineY(i,     splitP) + LINE_H;
            const y2 = splitLineY(i + 1, splitP);
            return <VertArrow key={i} y1={y1} y2={y2} drawP={p} />;
          })}

          {/* "restarts loop" — fades */}
          {restartsOp > 0 && (
            <div style={{
              position: "absolute",
              top: splitLineY(4, splitP) + LINE_H + 10,
              left: WIN_X, width: WIN_W,
              textAlign: "center", fontFamily: FONTS.display,
              fontSize: 28, fontWeight: 700,
              color: COLORS.muted, letterSpacing: "0.08em",
              textTransform: "uppercase", opacity: restartsOp,
            }}>
              restarts loop
            </div>
          )}
        </>
      )}

    </AbsoluteFill>
  );
};