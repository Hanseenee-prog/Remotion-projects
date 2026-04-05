// Scene 7 — "The Fix: Timer & ClearTimeout + Applying Debounce"
// Total Duration: 300 Frames
//
// Sequence:
//   0-20    : Initial code from Scene 6
//   20-45   : Type "let timer;" quickly
//   45-75   : DIM others, HIGHLIGHT "let timer;"
//   75-100  : Prepend "timer = " to setTimeout
//   100-130 : DIM others, HIGHLIGHT "timer = setTimeout..." AND its inner block
//   130-160 : Type "clearTimeout(timer);"
//   160-185 : DIM others, HIGHLIGHT "clearTimeout(timer);"
//   185-200 : Restore all, Fade out first window
//   200-210 : Fade in second code window
//   210-240 : Type "debounce(() => searchMovies(e));"
//   245-255 : Insert ", 1000" inside the call
//   255-285 : DIM others, HIGHLIGHT ", 1000"
//   285-292 : Restore dim
//   292-300 : Fade out completely in 8 frames

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo = 0, hi = 1) => Math.min(Math.max(v, lo), hi);
const prog = (frame: number, s: number, e: number) => clamp((frame - s) / (e - s));

const T: React.FC<{ c: string; children: React.ReactNode; opacity?: number }> = ({ 
  c, children, opacity = 1 
}) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre", opacity }}>
    {children}
  </span>
);

const FONT = 38;
const LH = 1.9;

// ─── Full Code Window (from Scene 6) ──────────────────────────────────────────
const CodeWindow: React.FC<{ children: React.ReactNode; opacity: number }> = ({ children, opacity }) => (
  <div style={{
    width: 920,
    borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
    opacity,
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

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Animation States: Phase 1 (Frames 0-200) ──
  
  // Phase: let timer;
  const isHighlightingTimer = frame >= 45 && frame < 75;

  // Phase: timer = (Prepended to setTimeout)
  const typeAssignment = prog(frame, 75, 100);
  const isHighlightingAssignment = frame >= 100 && frame < 130;

  // Phase: clearTimeout(timer);
  const isHighlightingClear = frame >= 160 && frame < 185;

  // Global Dim Logic Phase 1
  const anyHighlight = isHighlightingTimer || isHighlightingAssignment || isHighlightingClear;
  const baseDim = anyHighlight ? 0.25 : 1;
  const sceneOpacity = interpolate(frame, [190, 200], [1, 0], { extrapolateRight: "clamp" });

  // Block Opacities Phase 1
  const opTimer = isHighlightingTimer ? 1 : baseDim;
  const opAssignment = isHighlightingAssignment ? 1 : baseDim;
  const opClear = isHighlightingClear ? 1 : baseDim;


  // ── Animation States: Phase 2 (Frames 200-300) ──

  // Fade in / Fade out for Phase 2
  const scene2FadeIn = interpolate(frame, [200, 205], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scene2FadeOut = interpolate(frame, [292, 300], [1, 0], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const scene2Opacity = frame < 290 ? scene2FadeIn : scene2FadeOut;

  // Typing `debounce(() => searchMovies(e));` (32 chars)
  const typeProg1 = prog(frame, 210, 240);
  const c1 = Math.floor(typeProg1 * 32);
  const getC = (start: number, len: number) => {
    if (c1 <= start) return 0;
    if (c1 >= start + len) return len;
    return c1 - start;
  };

  // Typing `, 1000` (6 chars)
  const typeProg2 = prog(frame, 245, 255);
  const c2 = Math.floor(typeProg2 * 6);
  const delayChunk = ", 1000".slice(0, c2);

  // Dim logic Phase 2
  const isHighlightingDelay = frame >= 255 && frame < 285;
  const baseDim2 = isHighlightingDelay ? 0.25 : 1;

  return (
    <AbsoluteFill style={{ 
      background: "transparent", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    }}>
      {frame < 200 ? (
        <CodeWindow opacity={sceneOpacity}>
          {/* function debounce(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* let timer; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: opTimer }}>
            <T c={COLORS.codeText}>  </T>
            <T c={COLORS.keyword}>{"let ".slice(0, Math.floor(prog(frame, 20, 30) * 4))}</T>
            <T c={COLORS.codeText}>{"timer;".slice(0, Math.floor(prog(frame, 30, 45) * 6))}</T>
          </div>

          {/* Blank line under let timer; */}
          <div style={{ height: LH * FONT, opacity: baseDim }} />

          {/* return (...args) => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>  return </T>
            <T c={COLORS.punctuation}>(</T>
            <T c={"#D2A8FF"}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>) </T>
            <T c={COLORS.keyword}>{"=>"}</T>
            <T c={COLORS.punctuation}> {"{"}</T>
          </div>

          {/* clearTimeout(timer); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: opClear }}>
            <T c={COLORS.codeText}>    </T>
            <T c={COLORS.fnName}>{"clearTimeout".slice(0, Math.floor(prog(frame, 130, 145) * 12))}</T>
            <T c={COLORS.punctuation}>{"(".slice(0, Math.floor(prog(frame, 145, 147) * 1))}</T>
            <T c={COLORS.codeText}>{"timer".slice(0, Math.floor(prog(frame, 147, 155) * 5))}</T>
            <T c={COLORS.punctuation}>{");".slice(0, Math.floor(prog(frame, 155, 160) * 2))}</T>
          </div>

          {/* Blank line under clearTimeout(timer); */}
          <div style={{ height: LH * FONT, opacity: baseDim }} />

          {/* timer = setTimeout(() => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: opAssignment }}>
            <T c={COLORS.codeText}>    </T>
            {frame >= 75 && <T c={COLORS.codeText}>{"timer = ".slice(0, Math.floor(typeAssignment * 8))}</T>}
            <T c={COLORS.fnName}>setTimeout</T>
            <T c={COLORS.punctuation}>{"(() "}</T>
            <T c={COLORS.keyword}>{"=>"}</T>
            <T c={COLORS.punctuation}>{" {"}</T>
          </div>

          {/* callback(...args); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: opAssignment }}>
            <T c={COLORS.codeText}>      </T>
            <T c={COLORS.fnName}>callback</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={"#D2A8FF"}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>);</T>
          </div>

          {/* }, delay); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: opAssignment }}>
            <T c={COLORS.punctuation}>    {"}, "}</T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>);</T>
          </div>

          {/* }; (The return closing brace) */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim, paddingLeft: "2ch" }}>
            {"  };"}
          </div>

          {/* } (The function closing brace) */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim }}>
            {"}"}
          </div>

        </CodeWindow>
      ) : (
        <CodeWindow opacity={scene2Opacity}>
          {/* Phase 2: debounce(() => searchMovies(e), 1000); */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.fnName} opacity={baseDim2}>{"debounce".slice(0, getC(0, 8))}</T>
            <T c={COLORS.punctuation} opacity={baseDim2}>{"(".slice(0, getC(8, 1))}</T>
            <T c={COLORS.punctuation} opacity={baseDim2}>{"() ".slice(0, getC(9, 3))}</T>
            <T c={COLORS.keyword} opacity={baseDim2}>{"=> ".slice(0, getC(12, 3))}</T>
            <T c={COLORS.fnName} opacity={baseDim2}>{"searchMovies".slice(0, getC(15, 12))}</T>
            <T c={COLORS.punctuation} opacity={baseDim2}>{"(".slice(0, getC(27, 1))}</T>
            <T c={COLORS.value} opacity={baseDim2}>{"e".slice(0, getC(28, 1))}</T>
            <T c={COLORS.punctuation} opacity={baseDim2}>{")".slice(0, getC(29, 1))}</T>
            
            {/* Delay part: typed in naturally, maintaining its brightness while everything else dims */}
            {c2 > 0 && (
              <span>
                <T c={COLORS.punctuation} opacity={1}>{delayChunk.slice(0, 2)}</T>
                <T c={COLORS.value} opacity={1}>{delayChunk.slice(2)}</T>
              </span>
            )}

            <T c={COLORS.punctuation} opacity={baseDim2}>{");".slice(0, getC(30, 2))}</T>
          </div>
        </CodeWindow>
      )}
    </AbsoluteFill>
  );
};