// Scene 6 — "Next, we wrap the callback in a setTimeout with the delay…"
//
// Timeline:
//   0-10   : Scene 5 code is static.
//   10-40  : "    setTimeout(() => {" types out.
//   45-75  : "    }, delay);" types out.
//   150    : End of scene.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 0) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  const p = clamp((frame - sf) / (ef - sf));
  return text.slice(0, Math.floor(p * text.length));
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T: React.FC<{ c: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ c, children, style }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre", ...style }}>{children}</span>
);

const FONT = 38;
const LH   = 1.9;

// ─── Code Window Wrapper ──────────────────────────────────────────────────────
const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920, borderRadius: 18,
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
    <div style={{ padding: "32px 44px 40px" }}>{children}</div>
  </div>
);

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Typing Logic ─────────────────────────────────────────────────────────
  const lineStartText = "    setTimeout(() => {";
  const lineEndText   = "    }, delay);";
  
  const typedStart = useTyped(lineStartText, 10, 40, frame);
  const typedEnd   = useTyped(lineEndText, 45, 75, frame);

  const startDone = typedStart.length === lineStartText.length;
  const endDone   = typedEnd.length === lineEndText.length;
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // ── Global fade-out ────────────────────────────────────────────────────────
  const globalOut = interpolate(frame, [120, 128], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const renderTypedLine = (fullText: string, currentText: string, chunks: {text: string, color: string}[], isCurrentLine: boolean) => {
    let charCounter = 0;
    return (
      <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
        {chunks.map((ch, i) => {
          const startIdx = charCounter;
          charCounter += ch.text.length;
          const visiblePart = currentText.slice(startIdx, charCounter);
          return <T key={i} c={ch.color}>{visiblePart}</T>;
        })}
        {isCurrentLine && currentText.length < fullText.length && (
          <span style={{
            display: "inline-block", width: 3, height: "0.82em",
            background: COLORS.accentA, marginLeft: 2,
            verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
          }} />
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: globalOut,
    }}>
      <div style={{ ...fadeUp(frame, 0, 15), width: 920 }}>
        <CodeWindow>
          {/* function debounce(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* return (...args) => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>  return </T>
            <T c={COLORS.punctuation}>(</T>
            <T c={"#D2A8FF"}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>) </T>
            <T c={COLORS.keyword}>{"=>"}</T>
            <T c={COLORS.punctuation}> {"{"}</T>
          </div>

          {/* setTimeout(() => { */}
          {renderTypedLine(
            lineStartText, 
            typedStart, 
            [
              { text: "    ",       color: COLORS.codeText },
              { text: "setTimeout", color: COLORS.fnName },
              { text: "(() ",       color: COLORS.punctuation },
              { text: "=>",         color: COLORS.keyword },
              { text: " {",         color: COLORS.punctuation },
            ],
            frame >= 10 && !startDone
          )}

          {/* callback(...args); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.codeText}>      </T>
            <T c={COLORS.fnName}>callback</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={"#D2A8FF"}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>);</T>
          </div>

          {/* }, delay); */}
          {renderTypedLine(
            lineEndText, 
            typedEnd, 
            [
              { text: "    }, ",   color: COLORS.punctuation },
              { text: "delay",    color: COLORS.value },
              { text: ");",       color: COLORS.punctuation },
            ],
            startDone && !endDone
          )}

          {/* }; (The return closing brace) */}
          <div style={{ 
            fontFamily: FONTS.mono, 
            fontSize: FONT, 
            fontWeight: 700, 
            lineHeight: LH, 
            color: COLORS.punctuation,
            paddingLeft: "2ch" // Explicit indentation to match 'return'
          }}>
            {"};"}
          </div>

          {/* } (The function closing brace) */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>
            {"}"}
          </div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};