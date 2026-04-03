// Scene 9 — "Wrap your function with throttle — only runs every 200ms"
// 240 frames
//
// Sequence:
//   0–10:   Initial code present (let + listener)
//   10–70:  Type throttle wrap: "= throttle((e) => { updateAnimation(e); })"
//   80–100: Type delay: ", 200"
//   105–135: Highlight phase (dim rest of code)
//   135–145: Code window fades out
//   140–230: Demo visualization
//   230–240: Final fade out

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { COLORS, FONTS, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  return text.slice(0, Math.floor(clamp((frame - sf) / (ef - sf)) * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode; op?: number }> = ({ c, children, op = 1 }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre", opacity: op }}>{children}</span>
);
const FONT = 34;
const LH   = 1.7;
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
        }}></div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>throttle.js</span>
      </div>
    </div>
    <div style={{ padding: "28px 40px 36px" }}>{children}</div>
  </div>
);

const ThrottleDemo: React.FC<{ frame: number }> = ({ frame }) => {
  const demoFrame = frame - 140; // Adjusted start frame
  if (demoFrame < 0) return null;

  const THROTTLE_INTERVAL = 7;
  const TOTAL_EVENTS = 28;

  return (
    <div style={{
      width: 880, background: COLORS.codeBg, border: "1.5px solid rgba(255,255,255,0.09)",
      borderRadius: 20, padding: "36px 40px", display: "flex", flexDirection: "column", gap: 28,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 26, color: COLORS.muted }}>
        <span>scroll events</span>
        <span style={{ color: COLORS.accentA }}>actual calls (throttled)</span>
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {Array.from({ length: TOTAL_EVENTS }).map((_, i) => {
          const evFrame = i * 3;
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
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentC }}>{Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 3) + 1)}</span>
        </div>
        <div style={{ flex: 1, padding: "16px 20px", borderRadius: 12, background: `${COLORS.accentA}12`, border: `1px solid ${COLORS.accentA}40`, display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>calls made</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentA }}>{Math.min(Math.ceil(TOTAL_EVENTS / THROTTLE_INTERVAL), Math.ceil((Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 3) + 1)) / THROTTLE_INTERVAL))}</span>
        </div>
      </div>
    </div>
  );
};

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const globalOut = interpolate(frame, [230, 240], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // New Typing Parts
  const assignment = useTyped(" = throttle((e) => {\n", 10, 35, frame);
  const innerBody  = useTyped("  updateAnimation(e);\n", 35, 60, frame);
  const closeBrace = useTyped("})", 60, 70, frame);
  const delayTyped = useTyped(", 200", 80, 100, frame);

  const isHighlight = frame >= 105 && frame < 135;
  const baseOp = isHighlight ? DIM : 1;
  const codeOut = interpolate(frame, [135, 145], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const demoIn = interpolate(frame, [140, 150], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", opacity: globalOut }}>
      {frame < 145 && (
        <div style={{ opacity: codeOut, width: 920 }}>
          <CodeWindow>
            {/* Line 1: let throttleUpdate + assignment part */}
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              <T c={COLORS.keyword} op={baseOp}>let </T>
              <T c={COLORS.value} op={baseOp}>throttleUpdate</T>
              {frame < 10 && <T c={COLORS.punctuation} op={baseOp}>;</T>}
              <T c={COLORS.punctuation}>{assignment.split('throttle')[0]}</T>
              {assignment.includes('throttle') && <T c={COLORS.fnName}>throttle</T>}
              <T c={COLORS.punctuation}>{assignment.split('throttle')[1] || ""}</T>
              {frame >= 10 && frame < 35 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>

            {/* Line 2: inner body */}
            {assignment.endsWith("\n") && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
                <T c={COLORS.value}>{innerBody.split('(')[0]}</T>
                {innerBody.includes('(') && <T c={COLORS.punctuation}>(</T>}
                <T c={COLORS.value}>{innerBody.split('(')[1]?.split(')')[0]}</T>
                {innerBody.includes(')') && <T c={COLORS.punctuation}>)</T>}
                <T c={COLORS.punctuation}>{innerBody.split(')')[1] || ""}</T>
                {frame >= 35 && frame < 60 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
              </div>
            )}

            {/* Line 3: Close brace + Delay */}
            {innerBody.endsWith("\n") && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
                <T c={COLORS.punctuation}>{closeBrace.replace(')', '')}</T>
                <T c={COLORS.number}>{delayTyped}</T>
                <T c={COLORS.punctuation}>{closeBrace.includes(')') ? ");" : ""}</T>
                {((frame >= 60 && frame < 70) || (frame >= 80 && frame < 100)) && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
              </div>
            )}

            <div style={{ height: LH * FONT }} />

            {/* Event Listener (Pre-existing) */}
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: baseOp }}>
              <T c={COLORS.value}>container</T><T c={COLORS.punctuation}>.</T>
              <T c={COLORS.fnName}>addEventListener</T><T c={COLORS.punctuation}>(</T>
              <T c={COLORS.string}>'scroll'</T><T c={COLORS.punctuation}>, (</T>
              <T c={COLORS.value}>e</T><T c={COLORS.punctuation}>) </T>
              <T c={COLORS.keyword}>{"=>"}</T><T c={COLORS.punctuation}> {"{"}</T>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: baseOp }}>
              <T c={COLORS.value}>    throttleUpdate</T><T c={COLORS.punctuation}>(</T>
              <T c={COLORS.value}>e</T><T c={COLORS.punctuation}>);</T>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", color: COLORS.punctuation, opacity: baseOp }}>
              {"});"}
            </div>
          </CodeWindow>
        </div>
      )}

      {frame >= 140 && (
        <div style={{ opacity: demoIn }}>
          <ThrottleDemo frame={frame} />
        </div>
      )}
    </AbsoluteFill>
  );
};