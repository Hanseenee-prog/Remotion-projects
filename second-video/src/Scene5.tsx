// Scene 5 — "Return a new function, use ...args to collect arguments"
//
// Visual: Code window continues. "return function(...args) {" types in,
// then an annotation shows how ...args collects and forwards arguments.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
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

const FONT = 38;
const LH   = 1.9;

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

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  const line2 = useTyped("  return function(...args) {", 10, 45, frame);
  const line2done = line2.length >= "  return function(...args) {".length;

  const line3 = useTyped("    callback(...args);", 55, 85, frame);
  const line3done = line3.length >= "    callback(...args);".length;

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // Colour the line2 segments
  const renderLine2 = () => {
    const chunks = [
      { text: "  ",          color: COLORS.codeText   },
      { text: "return ",     color: COLORS.keyword     },
      { text: "function",    color: COLORS.keyword     },
      { text: "(",           color: COLORS.punctuation },
      { text: "...",         color: COLORS.spread      },
      { text: "args",        color: COLORS.value       },
      { text: ") {",         color: COLORS.punctuation },
    ];
    let left = line2.length;
    return chunks.map((ch, i) => {
      if (left <= 0) return null;
      const s = ch.text.slice(0, left);
      left -= ch.text.length;
      return <T key={i} c={ch.color}>{s}</T>;
    });
  };

  const renderLine3 = () => {
    const chunks = [
      { text: "    ",        color: COLORS.codeText   },
      { text: "callback",    color: COLORS.fnName     },
      { text: "(",           color: COLORS.punctuation },
      { text: "...",         color: COLORS.spread      },
      { text: "args",        color: COLORS.value       },
      { text: ");",          color: COLORS.punctuation },
    ];
    let left = line3.length;
    return chunks.map((ch, i) => {
      if (left <= 0) return null;
      const s = ch.text.slice(0, left);
      left -= ch.text.length;
      return <T key={i} c={ch.color}>{s}</T>;
    });
  };

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: SAFE.top + 80,
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>

      {/* Headline */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 52 }}>
        {[
          { text: "Return a new function.",       start: 0 },
          { text: "Use ...args to collect",       start: 8 },
          { text: "all arguments.",               start: 16 },
        ].map(({ text, start }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Code window */}
      <div style={{ ...fadeUp(frame, 6, 16) }}>
        <CodeWindow>
          {/* Line 1 — static (from Scene 4) */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* Line 2 — types in */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
            {renderLine2()}
            {!line2done && (
              <span style={{
                display: "inline-block", width: 3, height: "0.82em",
                background: COLORS.accentA, marginLeft: 3,
                verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
              }} />
            )}
          </div>

          {/* Line 3 — callback(...args); types in */}
          {frame >= 50 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              {renderLine3()}
              {!line3done && line2done && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>
          )}

          {frame >= 50 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>
              {"  }"}
            </div>
          )}

          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>
            {"}"}
          </div>
        </CodeWindow>
      </div>

      {/* ...args annotation */}
      <div style={{
        ...fadeUp(frame, 90, 16),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        marginTop: 40,
        padding: "24px 32px",
        borderRadius: 16,
        background: `${COLORS.accentD}12`,
        border: `1px solid ${COLORS.accentD}44`,
        display: "flex",
        gap: 20,
        alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 32 }}>💡</span>
        <div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: COLORS.accentD, marginBottom: 8 }}>
            ...args
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 26, color: COLORS.muted, lineHeight: 1.5 }}>
            Collects all arguments into an array, then forwards them to callback exactly as they were.
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
