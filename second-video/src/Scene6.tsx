// Scene 6 — "Return a new function, use ...args"
// 210 frames — mirrors debounce Scene5 exactly

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { COLORS, FONTS, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  return text.slice(0, Math.floor(clamp((frame - sf) / (ef - sf)) * text.length));
}
function prog(frame: number, start: number, end: number) { return clamp((frame - start) / (end - start)); }

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);
const FONT = 38;
const LH   = 1.9;

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

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  const dim1 = clamp(prog(frame, 60, 70) - prog(frame, 165, 175));
  const DIM_LEVEL = 0.8;
  const baseOp  = 1 - dim1 * DIM_LEVEL;
  const args1Op = 1;

  const line2Text = "  return (...args) => {";
  const line2 = useTyped(line2Text, 10, 36, frame);
  const line2Done = line2.length >= line2Text.length;

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;
  const dimP = easeOut(prog(frame, 60, 70));

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div style={{ position: "relative", width: 920 }}>

        {/* Annotation box: appears above, pointing to ...args */}
        {dim1 > 0 && (
          <div style={{
            position: "absolute", top: -150, left: "50%",
            transform: `translate(-50%, ${(1 - dimP) * 15}px)`,
            opacity: dimP, padding: "20px 28px", borderRadius: 14,
            background: COLORS.codeBg, border: `1.5px solid #161B22`,
            display: "flex", alignItems: "center",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5)", zIndex: 10,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 35, fontWeight: 700, whiteSpace: "nowrap" }}>
              <span style={{ opacity: 0.35 }}><T c={COLORS.fnName}>onScroll</T></span>
              <span style={{ opacity: 0.35 }}><T c={COLORS.punctuation}>(</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.squareBracket}>[</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.atRule}>e</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.value}>.</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.property}>scrollY</T></span>
              <span style={{ opacity: 1 }}><T c={COLORS.squareBracket}>]</T></span>
              <span style={{ opacity: 0.35 }}><T c={COLORS.punctuation}>)</T></span>
            </div>
          </div>
        )}

        {dim1 > 0 && (
          <svg style={{
            position: "absolute", top: 70, left: 0, width: "100%", height: "100%",
            pointerEvents: "none", overflow: "visible", zIndex: 20,
          }}>
            <defs>
              <marker id="arrow-args6" viewBox="0 0 12 12" refX="6" refY="6" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 2 2 L 10 6 L 2 10" fill="none" stroke={COLORS.accentC} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>
            <path
              d="M 600 -150 C 590 140, 300 50, 340 175"
              fill="none" stroke={COLORS.accentC}
              strokeWidth="4" strokeDasharray="6 6" strokeLinecap="round"
              markerEnd="url(#arrow-args6)" opacity={dim1}
            />
          </svg>
        )}

        <CodeWindow>
          {/* function throttle(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseOp }}>
            <T c={COLORS.keyword}>function </T><T c={COLORS.fnName}>throttle</T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T><T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* let isAllowed = true; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseOp }}>
            <T c={COLORS.keyword}>  let </T><T c={COLORS.value}>isAllowed</T>
            <T c={COLORS.punctuation}> = </T><T c={COLORS.keyword}>true</T>
            <T c={COLORS.punctuation}>;</T>
          </div>

          {/* return (...args) => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
            {(() => {
              const chunks = [
                { text: "  ", color: COLORS.codeText, type: "base" },
                { text: "return ", color: COLORS.keyword, type: "base" },
                { text: "(", color: COLORS.punctuation, type: "base" },
                { text: "...", color: "#D2A8FF", type: "args" },
                { text: "args", color: COLORS.value, type: "args" },
                { text: ") ", color: COLORS.punctuation, type: "base" },
                { text: "=>", color: COLORS.keyword, type: "base" },
                { text: " {", color: COLORS.punctuation, type: "base" },
              ];
              let left = line2.length;
              return chunks.map((ch, i) => {
                if (left <= 0) return null;
                const s = ch.text.slice(0, left);
                left -= ch.text.length;
                const op = ch.type === "args" ? args1Op : baseOp;
                return <span key={i} style={{ opacity: op }}><T c={ch.color}>{s}</T></span>;
              });
            })()}
            {!line2Done && (
              <span style={{
                display: "inline-block", width: 3, height: "0.82em",
                background: COLORS.accentA, marginLeft: 3,
                verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
              }} />
            )}
          </div>

          {/* }; */}
          {line2Done && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseOp, paddingLeft: "2ch" }}>
              {"};"}
            </div>
          )}

          {/* } */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseOp }}>
            {"}"}
          </div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};
