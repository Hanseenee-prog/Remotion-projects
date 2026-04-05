// Scene 8 — "Use setTimeout to turn the flag back on after delay"
// 210 frames — mirrors debounce Scene6/7

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  return text.slice(0, Math.floor(clamp((frame - sf) / (ef - sf)) * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);
const FONT = 38;
const LH   = 1.9;
const DIM  = 0.18;

const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920, borderRadius: 18, background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)", overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
  }}>
    <div style={{
      display: "flex", alignItems: "center", background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)", paddingLeft: 24, height: 72,
    }}>
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0", padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", marginBottom: -1,
      }}>
        <div style={{
          background: "#C9A227", borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" as const,
        }}>js</div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>throttle.js</span>
      </div>
    </div>
    <div style={{ padding: "32px 44px 40px" }}>{children}</div>
  </div>
);

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();

  const globalOut = interpolate(frame, [110, 120], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  const setTimeoutLine = "      setTimeout(() => {";
  const resetLine      = "        isAllowed = true;";
  const closeLine      = "      }, delay);";

  const typed1 = useTyped(setTimeoutLine, 10, 18, frame);
  const typed2 = useTyped(resetLine,      30, 42, frame);
  const typed3 = useTyped(closeLine,      18, 20, frame);

  const done1 = typed1.length >= setTimeoutLine.length;
  const done2 = typed2.length >= resetLine.length;
  const done3 = typed3.length >= closeLine.length;

  // Highlight: setTimeout block at 130–195
  const hlP     = easeOut(prog(frame, 130, 146));
  const isHL    = frame >= 10;
  const baseDim = isHL ? DIM : 1;
  const setOp   = isHL ? 1 : 1;  // setTimeout lines always bright when highlighted

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "transparent", opacity: globalOut,
    }}>
      <div style={{ width: 920 }}>
        <CodeWindow>
          {/* function throttle(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>function </T><T c={COLORS.fnName}>throttle</T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T><T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* let isAllowed = true; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>  let </T><T c={COLORS.value}>isAllowed</T>
            <T c={COLORS.punctuation}> = </T><T c={COLORS.keyword}>true</T>
            <T c={COLORS.punctuation}>;</T>
          </div>

          {/* Blank line */}
          <div style={{ height: LH * FONT, opacity: baseDim }} />

          {/* return (...args) => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>  return </T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.spread}>...</T><T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>) </T><T c={COLORS.keyword}>{"=>"}</T>
            <T c={COLORS.punctuation}>{" {"}</T>
          </div>

          {/* if (isAllowed) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>    if </T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.value}>isAllowed</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* callback(...args); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.codeText}>{"      "}</T>
            <T c={COLORS.fnName}>callback</T>
            <T c={COLORS.punctuation}>(</T><T c={"#D2A8FF"}>...</T>
            <T c={COLORS.value}>args</T><T c={COLORS.punctuation}>);</T>
          </div>

          {/* isAllowed = false; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.codeText}>{"      "}</T>
            <T c={COLORS.value}>isAllowed</T>
            <T c={COLORS.punctuation}> = </T><T c={COLORS.keyword}>false</T>
            <T c={COLORS.punctuation}>;</T>
          </div>

          {/* Blank line */}
          <div style={{ height: LH * FONT, opacity: baseDim }} />

          {/* setTimeout(() => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: setOp }}>
            {(() => {
              const chunks = [
                { text: "      ", color: COLORS.codeText },
                { text: "setTimeout", color: COLORS.fnName },
                { text: "(() ", color: COLORS.punctuation },
                { text: "=>", color: COLORS.keyword },
                { text: " {", color: COLORS.punctuation },
              ];
              let left = typed1.length;
              return chunks.map((ch, i) => {
                if (left <= 0) return null;
                const s = ch.text.slice(0, left); left -= ch.text.length;
                return <T key={i} c={ch.color}>{s}</T>;
              });
            })()}
            {!done1 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
          </div>

          {/* isAllowed = true; */}
          {frame >= 48 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: setOp }}>
              {(() => {
                const chunks = [
                  { text: "        ", color: COLORS.codeText },
                  { text: "isAllowed", color: COLORS.value },
                  { text: " = ", color: COLORS.punctuation },
                  { text: "true", color: COLORS.keyword },
                  { text: ";", color: COLORS.punctuation },
                ];
                let left = typed2.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left); left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!done2 && done1 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>
          )}

          {/* }, delay); */}
          {frame >= 84 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: setOp }}>
              {(() => {
                const chunks = [
                  { text: "      }, ", color: COLORS.punctuation },
                  { text: "delay", color: COLORS.value },
                  { text: ");", color: COLORS.punctuation },
                ];
                let left = typed3.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left); left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!done3 && done2 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>
          )}
          
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim, paddingLeft: "4ch" }}>
            {"}"}
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim, paddingLeft: "2ch" }}>{"  };"}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim }}>{"}"}</div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};
