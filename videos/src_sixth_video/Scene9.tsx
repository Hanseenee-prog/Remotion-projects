// Scene 9 — "Wrap your function with throttle — only runs every 200ms"
// Total Duration: 330 frames
//
// Sequence:
//   0–10:    Initial code present (let + listener)
//   10–35:   Type throttle wrap: "= throttle((e) => {"
//   35–60:   Type inner: "  updateAnimation(e);"
//   60–70:   Type closing brace: "}"
//   80–100:  Type delay: ", 200);"
//   105–135: Highlight phase (dim rest of code)
//   135–145: Code window fades out
//   140–160: Scroll container animates in and starts scrolling
//   190–210: Demo visualization springs up to center; background dim overlay appears
//   300–315: Demo visualization moves down below scroll container; scroll container moves up
//   328–330: Global fade out

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

const getC = (curr: number, start: number, len: number) => {
  if (curr <= start) return 0;
  if (curr >= start + len) return len;
  return curr - start;
};

const T: React.FC<{ c: string; children: React.ReactNode; op?: number }> = ({ c, children, op = 1 }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre", opacity: op }}>{children}</span>
);

const FONT = 34;
const LH   = 1.7;
const DIM  = 0.18;

// ── Shared Scene 1 Styles ──────────────────────────────────────────────────────

export const ROW_STYLES = [
  { bg: "rgba(121,192,255,0.08)", border: "rgba(121,192,255,0.15)", dot: COLORS.accentB },
  { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)", dot: COLORS.accentA },
  { bg: "rgba(126,231,135,0.06)", border: "rgba(126,231,135,0.12)", dot: COLORS.accentA },
  { bg: "rgba(210,168,255,0.06)", border: "rgba(210,168,255,0.12)", dot: COLORS.accentD },
  { bg: "rgba(255,123,114,0.06)", border: "rgba(255,123,114,0.12)", dot: COLORS.accentC },
];

// ── Components ─────────────────────────────────────────────────────────────────

const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
    width: 1000, borderRadius: 18, background: COLORS.codeBg,
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
    <div style={{ padding: "28px 40px 36px" }}>{children}</div>
  </div>
);

const ScrollContainerMock: React.FC<{ frame: number }> = ({ frame }) => {
  const scrollOffset = (frame - 140) * 4.5; // Constant scroll speed
  const ROW_H = 92;
  const ROW_GAP = 10;
  const ROWS = 30; // Enough to scroll infinitely over the remaining frames
  
  return (
    <div style={{
      width: 800, height: 540,
      background: "#0D1117",
      border: "2.5px solid rgba(255,255,255,0.14)",
      borderRadius: 24, overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "row",
      top: -100, position: "relative",
    }}>
      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute",
          top: -scrollOffset, left: 0, right: 0,
          padding: "20px 28px",
          display: "flex", flexDirection: "column", gap: ROW_GAP,
        }}>
          {Array.from({ length: ROWS }).map((_, i) => {
            const s = ROW_STYLES[i % ROW_STYLES.length];
            return (
              <div key={i} style={{
                height: ROW_H, borderRadius: 12,
                background: s.bg, border: `1px solid ${s.border}`,
                display: "flex", alignItems: "center",
                paddingLeft: 18, gap: 14, flexShrink: 0,
              }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.dot, opacity: 0.75 }} />
                <div style={{ height: 9, borderRadius: 4, background: "rgba(255,255,255,0.07)", width: `${40 + (i * 13) % 40}%` }} />
                <div style={{ height: 9, borderRadius: 4, background: "rgba(255,255,255,0.04)", width: `${15 + (i * 7) % 20}%`, marginLeft: "auto", marginRight: 12 }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Scrollbar Mock */}
      <div style={{ width: 16, background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.07)", position: "relative", flexShrink: 0 }}>
        <div style={{
          position: "absolute", top: (scrollOffset * 0.4) % 360 + 20, left: 2, right: 2,
          height: 60, borderRadius: 5,
          background: "rgba(255,255,255,0.22)",
        }} />
      </div>
    </div>
  );
};

const ThrottleDemo: React.FC<{ frame: number }> = ({ frame }) => {
  const demoFrame = frame - 190; 
  if (demoFrame < 0) return null;

  const THROTTLE_INTERVAL = 7;
  const TOTAL_EVENTS = 28;

  return (
    <div style={{
      width: 880, background: COLORS.codeBg, border: `2px solid ${COLORS.accentB}44`,
      borderRadius: 20, padding: "36px 40px", display: "flex", flexDirection: "column", gap: 28,
      boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 26, color: COLORS.muted }}>
        <span>scroll events</span>
        <span style={{ color: COLORS.accentA }}>actual calls (throttled)</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {Array.from({ length: TOTAL_EVENTS }).map((_, i) => {
          const evFrame = i * 4;
          const isVisible = demoFrame >= evFrame;
          const isAllowed = i % THROTTLE_INTERVAL === 0;
          if (!isVisible) return null;
          const age = demoFrame - evFrame;
          const scale = interpolate(easeOutBack(clamp(age / 6)), [0, 1], [0, 1]);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, transform: `scale(${scale})`, transformOrigin: "center bottom" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: isAllowed ? `${COLORS.accentA}20` : `${COLORS.accentC}15`,
                border: `2.5px solid ${isAllowed ? COLORS.accentA : COLORS.accentC}`,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                boxShadow: isAllowed ? `0 0 12px ${COLORS.accentA}44` : "none",
              }}>
                {isAllowed ? "✓" : "✗"}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{ flex: 1, padding: "16px 20px", borderRadius: 12, background: `${COLORS.accentC}12`, border: `1px solid ${COLORS.accentC}40`, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>events fired</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentC }}>{Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 4) + 1)}</span>
        </div>
        <div style={{ flex: 1, padding: "16px 20px", borderRadius: 12, background: `${COLORS.accentA}12`, border: `1px solid ${COLORS.accentA}40`, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>calls made</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentA }}>{Math.min(Math.ceil(TOTAL_EVENTS / THROTTLE_INTERVAL), Math.ceil((Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 4) + 1)) / THROTTLE_INTERVAL))}</span>
        </div>
      </div>
    </div>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Code Window Timings ──
  const c1 = Math.floor(prog(frame, 10, 35) * 20); // " = throttle((e) => {"
  const c2 = Math.floor(prog(frame, 35, 60) * 21); // "  updateAnimation(e);"
  const c3 = Math.floor(prog(frame, 60, 70) * 1);  // "}"
  const c4 = Math.floor(prog(frame, 80, 100) * 7); // ", 200);"
  
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;
  const isHighlight = frame >= 105 && frame < 135;
  const baseOp = isHighlight ? DIM : 1;
  const codeOut = interpolate(frame, [135, 145], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Layout Visuals (140-330) ──
  
  // Scroll Container Movement
  // 140-160: Enters from bottom
  // 300-315: Moves UP to make room for Demo drop
  const scrollEntrance = interpolate(easeOut(prog(frame, 140, 160)), [0, 1], [40, 0]);
  const scrollExitUp = interpolate(easeInOut(prog(frame, 300, 315)), [0, 1], [0, -180]); // Moves up by 180px
  const scrollY = scrollEntrance + scrollExitUp;
  
  const scrollIn = interpolate(frame, [140, 160], [0, 1], { extrapolateRight: "clamp" });

  // Dark Overlay (appears over scroll container when Demo is center)
  // Fades in 190-210, Fades out 300-315
  const overlayFadeIn = interpolate(frame, [190, 210], [0, 0.75], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const overlayFadeOut = interpolate(frame, [300, 315], [0, 0.75], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });
  const overlayOp = frame < 250 ? overlayFadeIn : 0.55 - overlayFadeOut;

  // Demo Movement
  // 190-210: Slides from +800px to 0 (Center)
  // 300-315: Slides from 0 to +380px (Below scroll container)
  const demoIntroP = easeOut(prog(frame, 190, 210));
  const demoOutroP = easeInOut(prog(frame, 300, 315));
  
  const demoY = frame < 250 
    ? interpolate(demoIntroP, [0, 1], [800, 0])
    : interpolate(demoOutroP, [0, 1], [0, 380]);
    
  const demoScale = frame < 250
    ? interpolate(demoIntroP, [0, 1], [0.8, 1])
    : interpolate(demoOutroP, [0, 1], [1, 0.85]);

  // Global Fade Out
  const globalOut = interpolate(frame, [328, 330], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", opacity: globalOut }}>
      
      {/* ── 1. Code Phase (0-145) ── */}
      {frame < 145 && (
        <div style={{ opacity: codeOut, width: 920, position: "absolute" }}>
          <CodeWindow>
            {/* Line 1 */}
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              <T c={COLORS.keyword} op={baseOp}>let </T>
              <T c={COLORS.value} op={baseOp}>throttleUpdate</T>
              {frame < 10 && <T c={COLORS.punctuation} op={baseOp}>;</T>}
              <T c={COLORS.punctuation}>{" = ".slice(0, getC(c1, 0, 3))}</T>
              <T c={COLORS.fnName}>{"throttle".slice(0, getC(c1, 3, 8))}</T>
              <T c={COLORS.punctuation}>{"((".slice(0, getC(c1, 11, 2))}</T>
              <T c={COLORS.keyword}>{"e".slice(0, getC(c1, 13, 1))}</T>
              <T c={COLORS.punctuation}>{") ".slice(0, getC(c1, 14, 2))}</T>
              <T c={COLORS.keyword}>{"=> ".slice(0, getC(c1, 16, 3))}</T>
              <T c={COLORS.punctuation}>{"{".slice(0, getC(c1, 19, 1))}</T>
              {frame >= 10 && frame < 35 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>

            {/* Line 2 */}
            {c1 >= 20 && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
                <T c={COLORS.codeText}>{"  ".slice(0, getC(c2, 0, 2))}</T>
                <T c={COLORS.fnName}>{"updateAnimation".slice(0, getC(c2, 2, 15))}</T>
                <T c={COLORS.punctuation}>{"(".slice(0, getC(c2, 17, 1))}</T>
                <T c={COLORS.keyword}>{"e".slice(0, getC(c2, 18, 1))}</T>
                <T c={COLORS.punctuation}>{");".slice(0, getC(c2, 19, 2))}</T>
                {frame >= 35 && frame < 60 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
              </div>
            )}

            {/* Line 3: Close brace + Delay */}
            {c2 >= 21 && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
                <T c={COLORS.punctuation}>{"}".slice(0, getC(c3, 0, 1))}</T>
                <T c={COLORS.punctuation}>{", ".slice(0, getC(c4, 0, 2))}</T>
                <T c={COLORS.number}>{"200".slice(0, getC(c4, 2, 3))}</T>
                <T c={COLORS.punctuation}>{");".slice(0, getC(c4, 5, 2))}</T>
                {((frame >= 60 && frame < 70) || (frame >= 80 && frame < 100)) && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
              </div>
            )}

            <div style={{ height: LH * FONT }} />

            {/* Pre-existing Event Listener */}
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: baseOp }}>
              <T c={COLORS.value}>container</T><T c={COLORS.punctuation}>.</T>
              <T c={COLORS.fnName}>addEventListener</T><T c={COLORS.punctuation}>(</T>
              <T c={COLORS.string}>'scroll'</T><T c={COLORS.punctuation}>, (</T>
              <T c={COLORS.keyword}>e</T><T c={COLORS.punctuation}>) </T>
              <T c={COLORS.keyword}>{"=>"}</T><T c={COLORS.punctuation}> {"{"}</T>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: baseOp }}>
              <T c={COLORS.value}>    throttleUpdate</T><T c={COLORS.punctuation}>(</T>
              <T c={COLORS.keyword}>e</T><T c={COLORS.punctuation}>);</T>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", color: COLORS.punctuation, opacity: baseOp }}>
              {"});"}
            </div>
          </CodeWindow>
        </div>
      )}

      {/* ── 2. Demo Phase (140-330) ── */}
      {frame >= 140 && (
        <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          
          {/* Background Scroll Container */}
          <div style={{ opacity: scrollIn, transform: `translateY(${scrollY}px)` }}>
            <ScrollContainerMock frame={frame} />
          </div>

          {/* Dimming Overlay */}
          {frame >= 190 && (
            <AbsoluteFill style={{ backgroundColor: "rgba(0,0,0,1)", opacity: overlayOp, zIndex: 10 }} />
          )}

          {/* Foreground Demo Visualization */}
          {frame >= 190 && (
            <div style={{ 
              position: "absolute", 
              zIndex: 20, 
              transform: `translateY(${demoY}px) scale(${demoScale})`,
              opacity: demoY > 800 ? 0 : 1 // Hide initially
            }}>
              <ThrottleDemo frame={frame} />
            </div>
          )}

        </AbsoluteFill>
      )}

    </AbsoluteFill>
  );
};