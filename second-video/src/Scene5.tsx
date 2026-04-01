// Scene 5 — "Return a new function, use ...args to collect arguments"
//
// Timeline:
//   0-10   : Scene 4 code ("function debounce...") appears.
//   10-35  : "  return (...args) => {" types out.
//   40-55  : "    callback(...args);" types out BEFORE dimming.
//   60-70  : Everything dims EXCEPT "...args".
//   70-165 : Dim phase 1 holds. An annotation appears explaining "...args", 
//            pointing from [e.target.value] to the code.
//   165-175: Code restores to full brightness.
//   175-185: Everything dims EXCEPT "callback(...args);".
//   250-260: Code restores to full brightness.
//   270    : End of scene.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
function prog(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}

// ─── Tokens ───────────────────────────────────────────────────────────────────
const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
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
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Opacity & Dimming Logic ──────────────────────────────────────────────
  const dim1 = clamp(prog(frame, 60, 70) - prog(frame, 165, 175)); 
  const dim2 = clamp(prog(frame, 175, 185) - prog(frame, 250, 260)); 
  const DIM_LEVEL = 0.8; 

  const baseOp  = 1 - (dim1 * DIM_LEVEL) - (dim2 * DIM_LEVEL);
  const args1Op = 1 - (dim2 * DIM_LEVEL); 
  const line3Op = 1 - (dim1 * DIM_LEVEL); 

  // ── Typing Logic ─────────────────────────────────────────────────────────
  const line2Text = "  return (...args) => {";
  const line2 = useTyped(line2Text, 10, 35, frame);
  const line2done = line2.length >= line2Text.length;

  const line3Text = "    callback(...args);";
  const line3 = useTyped(line3Text, 40, 55, frame); 
  const line3done = line3.length >= line3Text.length;

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // ── Code Rendering ───────────────────────────────────────────────────────
  const renderLine2 = () => {
    const chunks = [
      { text: "  ",      color: COLORS.codeText,    type: "base" },
      { text: "return ", color: COLORS.keyword,     type: "base" },
      { text: "(",       color: COLORS.punctuation, type: "base" },
      { text: "...",     color: "#D2A8FF",          type: "args" },
      { text: "args",    color: COLORS.value,       type: "args" },
      { text: ") ",      color: COLORS.punctuation, type: "base" },
      { text: "=>",      color: COLORS.keyword,     type: "base" },
      { text: " {",      color: COLORS.punctuation, type: "base" },
    ];
    let left = line2.length;
    return chunks.map((ch, i) => {
      if (left <= 0) return null;
      const s = ch.text.slice(0, left);
      left -= ch.text.length;
      const op = ch.type === "args" ? args1Op : baseOp;
      return (
        <span key={i} style={{ opacity: op, transition: "opacity 0.2s" }}>
          <T c={ch.color}>{s}</T>
        </span>
      );
    });
  };

  const renderLine3 = () => {
    const chunks = [
      { text: "    ",     color: COLORS.codeText },
      { text: "callback", color: COLORS.fnName },
      { text: "(",        color: COLORS.punctuation },
      { text: "...",      color: "#D2A8FF" },
      { text: "args",     color: COLORS.value },
      { text: ");",       color: COLORS.punctuation },
    ];
    let left = line3.length;
    return chunks.map((ch, i) => {
      if (left <= 0) return null;
      const s = ch.text.slice(0, left);
      left -= ch.text.length;
      return (
        <span key={i} style={{ opacity: line3Op, transition: "opacity 0.2s" }}>
          <T c={ch.color}>{s}</T>
        </span>
      );
    });
  };

  return (
    <AbsoluteFill style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {/* ── Container for exact coordinate mapping ── */}
      <div style={{ 
        ...fadeUp(frame, 6, 16), 
        position: "relative",  
        width: 920,
      }}>
        
        {/* Annotation Box: The [e.target.value] example */}
        {dim1 > 0 && (
          <div style={{
            position: "absolute",
            top: -210,
            left: "50%",
            transform: `translate(-50%, ${(1 - dim1) * 15}px)`,
            opacity: dim1,
            padding: "20px 28px",
            borderRadius: 14,
            background: COLORS.codeBg,
            border: `1.5px solid #FF7B72`,
            display: "flex",
            alignItems: "center",
            boxShadow: `0 24px 48px rgba(0,0,0,0.5)`,
            zIndex: 10,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 35, fontWeight: 700, whiteSpace: "nowrap" }}>
              <span style={{ opacity: 0.4 }}><T c={COLORS.fnName}>searchMovies</T></span>
              <span style={{ opacity: 0.4 }}><T c={COLORS.punctuation}>(</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.squareBracket}>[</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.atRule}>e</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.value}>.</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.property}>target</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.value}>.</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.value}>value</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.squareBracket}>]</T></span>
              <span style={{ opacity: 0.4 }}><T c={COLORS.punctuation}>)</T></span>
            </div>
          </div>
        )}

        {/* Curved Arrow pointing to the spread arguments */}
        {dim1 > 0 && (
          <svg style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
            pointerEvents: "none", overflow: "visible", zIndex: 20
          }}>
            <defs>
              <marker id="arrow-args" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke="#FF7B72" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <path
              d="M 550 -150 C 590 140, 300 50, 340 175"
              fill="none"
              stroke="#FF7B72"
              strokeWidth="4"
              strokeDasharray="6 6"
              strokeLinecap="round"
              markerEnd="url(#arrow-args)"
              opacity={dim1}
            />
          </svg>
        )}

        <CodeWindow>
          {/* Line 1: Header */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseOp, transition: "opacity 0.2s" }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* Line 2: The Return with ...args */}
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

          {/* Line 3: The Execution */}
          {frame >= 40 && (
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

          {/* Line 4: Closure End */}
          {line2done && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseOp, transition: "opacity 0.2s", whiteSpace: "pre" }}>
              {"  };"}
            </div>
          )}

          {/* Line 5: Debounce End */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseOp, transition: "opacity 0.2s" }}>
            {"}"}
          </div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};