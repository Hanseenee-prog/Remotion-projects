// Scene 7 — "Fix it: let timer, clearTimeout on each new event"
//
// Visual: Two new lines type in: "let timer" before the return,
// and "clearTimeout(timer); timer = setTimeout(...)" inside the function.
// Demo shows only ONE timer survives each keypress.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  const p = clamp((frame - sf) / (ef - sf));
  return text.slice(0, Math.floor(p * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);

const FONT = 34;
const LH   = 1.85;

const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 960, borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      paddingLeft: 24, height: 72,
    }}>
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.codeBg, borderRadius: "8px 8px 0 0",
        padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "none", marginBottom: -1,
      }}>
        <div style={{
          background: "#C9A227", borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" as const,
        }}>js</div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>
          debounce.js
        </span>
      </div>
    </div>
    <div style={{ padding: "28px 44px 36px" }}>{children}</div>
  </div>
);

const HL: React.FC<{ children: React.ReactNode; active?: boolean }> = ({ children, active }) => (
  <div style={{
    background: active ? `${COLORS.accentA}14` : "transparent",
    borderLeft: active ? `3px solid ${COLORS.accentA}` : "3px solid transparent",
    paddingLeft: active ? 8 : 8,
    borderRadius: active ? "0 6px 6px 0" : 0,
    margin: "0 -8px",
  }}>
    {children}
  </div>
);

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const letTimer  = useTyped("  let timer;", 12, 35, frame);
  const letDone   = letTimer.length >= "  let timer;".length;

  const clearLine = useTyped("    clearTimeout(timer);", 50, 75, frame);
  const clearDone = clearLine.length >= "    clearTimeout(timer);".length;

  const timerLine = useTyped("    timer = setTimeout(() => callback(...args), delay);", 78, 120, frame);
  const timerDone = timerLine.length >= "    timer = setTimeout(() => callback(...args), delay);".length;

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // Keystroke demo (frames 140+): only ONE timer survives
  const DEMO_START = 140;
  const KEY_INT    = 20;
  const KEYS       = ["A", "v", "e", "n", "g", "e", "r", "s"];
  const keysVisible = Math.min(
    Math.floor(Math.max(frame - DEMO_START, 0) / KEY_INT),
    KEYS.length
  );

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: SAFE.top + 50,
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>

      {/* Headline */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 36 }}>
        {[
          { text: "Fix it with",        start: 0 },
          { text: "clearTimeout.",      start: 6, accent: COLORS.accentA },
        ].map(({ text, start, accent }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 14),
            fontFamily: FONTS.display,
            fontSize: 68,
            fontWeight: 800,
            color: accent ?? COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Code window */}
      <div style={{ ...fadeUp(frame, 6, 14) }}>
        <CodeWindow>
          {/* Line 0 */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* let timer — NEW highlighted line */}
          <HL active={frame >= 12 && frame < 80}>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              {(() => {
                const chunks = [
                  { text: "  ",       color: COLORS.codeText   },
                  { text: "let ",     color: COLORS.keyword    },
                  { text: "timer",    color: COLORS.value      },
                  { text: ";",        color: COLORS.punctuation },
                ];
                let left = letTimer.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left);
                  left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!letDone && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>
          </HL>

          {/* return function */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>{"  return "}</T>
            <T c={COLORS.keyword}>function</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.spread}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* clearTimeout — NEW */}
          <HL active={frame >= 50 && frame < 130}>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              {(() => {
                const chunks = [
                  { text: "    ",             color: COLORS.codeText   },
                  { text: "clearTimeout",      color: COLORS.fnName     },
                  { text: "(",               color: COLORS.punctuation },
                  { text: "timer",           color: COLORS.value      },
                  { text: ");",              color: COLORS.punctuation },
                ];
                let left = clearLine.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left);
                  left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!clearDone && letDone && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>
          </HL>

          {/* timer = setTimeout — NEW */}
          <HL active={frame >= 78 && frame < 145}>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT - 2, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              {(() => {
                const chunks = [
                  { text: "    ",           color: COLORS.codeText   },
                  { text: "timer",          color: COLORS.value      },
                  { text: " = ",            color: COLORS.punctuation },
                  { text: "setTimeout",     color: COLORS.fnName     },
                  { text: "(() => ",        color: COLORS.punctuation },
                  { text: "callback",       color: COLORS.fnName     },
                  { text: "(",             color: COLORS.punctuation },
                  { text: "...",           color: COLORS.spread      },
                  { text: "args",          color: COLORS.value       },
                  { text: "), ",           color: COLORS.punctuation },
                  { text: "delay",         color: COLORS.value       },
                  { text: ");",            color: COLORS.punctuation },
                ];
                let left = timerLine.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left);
                  left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!timerDone && clearDone && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>
          </HL>

          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>{"  }"}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>{"}"}</div>
        </CodeWindow>
      </div>

      {/* Demo: only last timer survives */}
      {frame >= DEMO_START && (
        <div style={{
          ...fadeUp(frame, DEMO_START, 12),
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          marginTop: 28,
          padding: "20px 28px",
          borderRadius: 16,
          background: `${COLORS.accentA}10`,
          border: `1.5px solid ${COLORS.accentA}33`,
        }}>
          <div style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted, marginBottom: 10 }}>
            Typing "Avengers" fast…
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" as const }}>
            {Array.from({ length: keysVisible }).map((_, i) => {
              const isLast = i === keysVisible - 1;
              const age    = frame - (DEMO_START + i * KEY_INT);
              return (
                <div key={i} style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  background: isLast ? `${COLORS.accentA}22` : `${COLORS.accentC}14`,
                  border: `1.5px solid ${isLast ? COLORS.accentA : COLORS.accentC}66`,
                  fontFamily: FONTS.mono,
                  fontSize: 22,
                  color: isLast ? COLORS.accentA : COLORS.muted,
                  opacity: isLast ? 1 : 0.45,
                }}>
                  {isLast ? `'${KEYS[i]}' — active timer ✓` : `'${KEYS[i]}' — cleared`}
                </div>
              );
            })}
          </div>
          {keysVisible >= KEYS.length && (
            <div style={{
              marginTop: 16,
              fontFamily: FONTS.display,
              fontSize: 28,
              fontWeight: 700,
              color: COLORS.accentA,
            }}>
              ✅ Only 1 API call fires!
            </div>
          )}
        </div>
      )}

    </AbsoluteFill>
  );
};
