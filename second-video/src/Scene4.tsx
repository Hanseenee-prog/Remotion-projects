// Scene 4 — "Here's how we build it — debounce(callback, delay)"
//
// Visual: Code window. "function debounce(callback, delay) {" types in.
// Then parameter annotations appear below explaining callback and delay.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }

// Typed line helper
function useTyped(text: string, startF: number, endF: number, frame: number) {
  const p = clamp((frame - startF) / (endF - startF));
  return text.slice(0, Math.floor(p * text.length));
}

// Syntax token
const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);

const FONT = 38;
const LH   = 1.9;

// Code window shell
const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920,
    borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
  }}>
    {/* Title bar */}
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
        background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0",
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

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  // Line 1 types: "function debounce(callback, delay) {"
  const line1 = useTyped("function debounce(callback, delay) {", 20, 60, frame);

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;
  const line1Done = line1.length >= "function debounce(callback, delay) {".length;

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
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 60 }}>
        {[
          { text: "Here's how", start: 0 },
          { text: "we build it.", start: 8 },
        ].map(({ text, start }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: 70,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Code window */}
      <div style={{ ...fadeUp(frame, 14, 16) }}>
        <CodeWindow>
          {/* function debounce(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
            {(() => {
              // Parse and colour the typed portion
              const full = "function debounce(callback, delay) {";
              const shown = line1;
              const chunks: Array<{ text: string; color: string }> = [
                { text: "function ",  color: COLORS.keyword   },
                { text: "debounce",   color: COLORS.fnName    },
                { text: "(",          color: COLORS.punctuation },
                { text: "callback",   color: COLORS.value     },
                { text: ", ",         color: COLORS.punctuation },
                { text: "delay",      color: COLORS.value     },
                { text: ") {",        color: COLORS.punctuation },
              ];
              let left = shown.length;
              return chunks.map((ch, i) => {
                if (left <= 0) return null;
                const s = ch.text.slice(0, left);
                left -= ch.text.length;
                return <T key={i} c={ch.color}>{s}</T>;
              });
            })()}
            {/* typing cursor */}
            {!line1Done && (
              <span style={{
                display: "inline-block", width: 3, height: "0.82em",
                background: COLORS.accentA, marginLeft: 3,
                verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
              }} />
            )}
          </div>

          {/* Closing brace placeholder */}
          {line1Done && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>
              {"}"}
            </div>
          )}
        </CodeWindow>
      </div>

      {/* Parameter annotations */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginTop: 48, display: "flex", flexDirection: "column", gap: 24 }}>
        {[
          {
            name: "callback",
            color: COLORS.value,
            desc: "the function you want to control",
            start: 65,
          },
          {
            name: "delay",
            color: COLORS.value,
            desc: "how long to wait (in ms)",
            start: 80,
          },
        ].map(({ name, color, desc, start }) => (
          <div key={name} style={{
            ...fadeUp(frame, start, 14),
            display: "flex",
            alignItems: "center",
            gap: 20,
            padding: "18px 28px",
            borderRadius: 14,
            background: COLORS.surface,
            border: `1px solid ${COLORS.border}`,
          }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 30, fontWeight: 800, color }}>
              {name}
            </span>
            <span style={{ color: COLORS.subtle, fontSize: 24 }}>—</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 28, color: COLORS.muted }}>
              {desc}
            </span>
          </div>
        ))}
      </div>

    </AbsoluteFill>
  );
};
