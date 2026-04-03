// Scene 4 — "Here's how we build it — throttle(callback, delay)"
// 240 frames — mirrors debounce Scene4 exactly in style
//
// Timeline:
//   0–14   : code window slides in
//   14–65  : "function throttle(callback, delay) {" types out
//   65–125 : settled
//   125–155: callback phase — dim, annotation box + curved arrow in
//   155–185: restore, delay phase — dim, annotation box + curved arrow in
//   185–232: settled
//   232–240: fade out

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function prog(frame: number, start: number, end: number) { return clamp((frame - start) / (end - start)); }
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = clamp((frame - start) / dur);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function useTyped(text: string, startF: number, endF: number, frame: number) {
  const p = clamp((frame - startF) / (endF - startF));
  return text.slice(0, Math.floor(p * text.length));
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
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>
          throttle.js
        </span>
      </div>
    </div>
    <div style={{ padding: "32px 44px 40px" }}>{children}</div>
  </div>
);

const AnnotationBox: React.FC<{
  name: string; nameColor: string; desc: string; opacity: number;
}> = ({ name, nameColor, desc, opacity }) => (
  <div style={{
    opacity, padding: "20px 28px", borderRadius: 14,
    background: COLORS.surface, border: `2px solid ${nameColor}`,
    display: "flex", alignItems: "center", gap: 18,
    boxShadow: opacity > 0.5 ? "0 0 32px rgba(0,0,0,0.4)" : "none",
  }}>
    <span style={{ fontFamily: FONTS.mono, fontSize: 35, fontWeight: 800, color: nameColor, whiteSpace: "nowrap" }}>
      {name}
    </span>
    <span style={{ color: COLORS.subtle, fontSize: 26, flexShrink: 0 }}>—</span>
    <span style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.muted, lineHeight: 1.4 }}>
      {desc}
    </span>
  </div>
);

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  const globalOut = interpolate(frame, [232, 240], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const LINE = "function throttle(callback, delay) {";
  const line1 = useTyped(LINE, 12, 65, frame);
  const line1Done = line1.length >= LINE.length;
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // Timings shifted 15 frames earlier
  const cbDimP  = easeOut(prog(frame, 125, 140)) * (1 - easeOut(prog(frame, 170, 185)));
  const cbLineP = easeOut(prog(frame, 133, 153));
  const cbBoxOp = easeOut(prog(frame, 137, 153)) * (1 - easeOut(prog(frame, 167, 181)));

  const dlDimP  = easeOut(prog(frame, 185, 200));
  const dlLineP = easeOut(prog(frame, 193, 213));
  const dlBoxOp = easeOut(prog(frame, 197, 213));

  const kwOp    = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);
  const cbOp    = interpolate(cbDimP, [0, 1], [1, 1])   * interpolate(dlDimP, [0, 1], [1, DIM]);
  const dlOp    = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, 1]);
  const puncOp  = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);
  const braceOp = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        paddingLeft: SAFE.left + 20, paddingRight: SAFE.right + 20,
        opacity: globalOut,
      }}>

        {/* Annotation: callback (above) */}
        <div style={{ position: "absolute", width: "82.6%", top: 600 }}>
          <AnnotationBox
            name="updateAnimation()"
            nameColor={COLORS.accentC}
            desc="the function you want to control"
            opacity={cbBoxOp * globalOut}
          />
        </div>

        {/* Code window */}
        <div style={{ ...fadeUp(frame, 14, 16), width: "100%", maxWidth: CANVAS.safeWidth, position: "relative" }}>
          <CodeWindow>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              <span style={{ opacity: kwOp }}>
                <T c={COLORS.keyword}>{"function "}</T>
                <T c={COLORS.fnName}>{"throttle"}</T>
              </span>
              <span style={{ opacity: puncOp }}>
                <T c={COLORS.punctuation}>{"("}</T>
              </span>
              {line1.length >= 29 && (
                <span style={{ opacity: cbOp }}>
                  <T c={COLORS.value}>{"callback"}</T>
                </span>
              )}
              {line1.length < 29 && line1.length > 10 && (
                <span style={{ opacity: cbOp }}>
                  <T c={COLORS.value}>{line1.slice(10)}</T>
                </span>
              )}
              {line1.length >= 28 && (
                <span style={{ opacity: puncOp }}>
                  <T c={COLORS.punctuation}>{", "}</T>
                </span>
              )}
              {line1.length >= 34 && (
                <span style={{ opacity: dlOp }}>
                  <T c={COLORS.value}>{"delay"}</T>
                </span>
              )}
              {line1.length >= 29 && line1.length < 34 && (
                <span style={{ opacity: dlOp }}>
                  <T c={COLORS.value}>{line1.slice(28)}</T>
                </span>
              )}
              {line1.length >= 36 && (
                <span style={{ opacity: braceOp }}>
                  <T c={COLORS.punctuation}>{")"}</T>
                </span>
              )}
              {line1.length >= 34 && line1.length < 37 && (
                <span style={{ opacity: braceOp }}>
                  <T c={COLORS.punctuation}>{line1.slice(34)}</T>
                </span>
              )}
              {!line1Done && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>
            {line1Done && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: braceOp }}>
                {"}"}
              </div>
            )}
          </CodeWindow>
        </div>

        {/* Annotation: delay (below) */}
        <div style={{ position: "absolute", bottom: 500, width: "52.4%" }}>
          <AnnotationBox
            name="200"
            nameColor={COLORS.accentB}
            desc="how often it can run (in ms)"
            opacity={dlBoxOp * globalOut}
          />
        </div>

        {/* Curved arrows */}
        <svg
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
          viewBox="0 0 1080 1920" preserveAspectRatio="none"
        >
          <defs>
            <marker id="arrow-cb4" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M 1 1 L 11 6 L 1 11" fill="none" stroke={COLORS.accentC} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <marker id="arrow-dl4" viewBox="0 0 12 12" refX="10" refY="6" markerWidth="8" markerHeight="8" orient="auto">
              <path d="M 1 1 L 11 6 L 1 11" fill="none" stroke={COLORS.accentB} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {/* Arrow 1: callback (Tail at box top, Head at code) */}
          {cbLineP > 0 && (
            <path
              d="M 320 690 C 320 800, 480 680, 550 910"
              fill="none"
              stroke={COLORS.accentC}
              strokeWidth="4"
              strokeDasharray="9 7"
              strokeDashoffset={(1 - cbLineP) * 300}
              strokeLinecap="round"
              markerEnd="url(#arrow-cb4)"
              opacity={cbBoxOp} 
            />
          )}

          {/* Arrow 2: delay (Tail at box bottom, Head at code) */}
          {dlLineP > 0 && (
            <path
              d="M 520 1250 C 520 1150, 780 1200, 740 985"
              fill="none"
              stroke={COLORS.accentB}
              strokeWidth="4"
              strokeDasharray="9 7"
              strokeDashoffset={(1 - dlLineP) * 350}
              strokeLinecap="round"
              markerEnd="url(#arrow-dl4)"
              opacity={dlBoxOp} 
            />
          )}
        </svg>

      </div>
    </AbsoluteFill>
  );
};