// Scene 9 — "Wrap your function with throttle — only runs every 200ms"
// 180 frames
//
// Two parts:
//   0–80:  Code window shows throttle usage typing in
//          "const throttledUpdate = throttle(updateAnimation, 200);"
//          then "container.addEventListener('scroll', throttledUpdate);"
//   80–170: Split view — scroll container fires MANY events, but only
//            periodic pulses (every 200ms ≈ 6 frames) actually reach the
//            animation engine. Others are greyed out/blocked.
//   170–180: Fade out

import React from "react";

import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

import { COLORS, FONTS, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  return text.slice(0, Math.floor(clamp((frame - sf) / (ef - sf)) * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);
const FONT = 36;
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
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>app.js</span>
      </div>
    </div>
    <div style={{ padding: "28px 40px 36px" }}>{children}</div>
  </div>
);

// Smooth scroll demo — shows events vs actual calls
const ThrottleDemo: React.FC<{ frame: number }> = ({ frame }) => {
  const demoFrame = frame - 82;  // relative to demo start
  if (demoFrame < 0) return null;

  const THROTTLE_INTERVAL = 7;  // frames between allowed calls (~200ms at 30fps)
  const TOTAL_EVENTS = 28;

  return (
    <div style={{
      width: 880,
      background: COLORS.codeBg,
      border: "1.5px solid rgba(255,255,255,0.09)",
      borderRadius: 20,
      padding: "36px 40px",
      display: "flex",
      flexDirection: "column",
      gap: 28,
    }}>
      {/* Label row */}
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: FONTS.mono, fontSize: 26, color: COLORS.muted }}>
        <span>scroll events</span>
        <span style={{ color: COLORS.accentA }}>actual calls (throttled)</span>
      </div>

      {/* Event dots row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        {Array.from({ length: TOTAL_EVENTS }).map((_, i) => {
          const evFrame   = i * 3;
          const isVisible = demoFrame >= evFrame;
          const isAllowed = i % THROTTLE_INTERVAL === 0;

          if (!isVisible) return null;

          const age = demoFrame - evFrame;
          const popSpr = clamp(age / 6);
          const scale  = interpolate(easeOutBack(popSpr), [0, 1], [0, 1]);

          return (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              transform: `scale(${scale})`,
              transformOrigin: "center bottom",
            }}>
              {/* Arrow: green if allowed, red X if blocked */}
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: isAllowed ? `${COLORS.accentA}20` : `${COLORS.accentC}15`,
                border: `2.5px solid ${isAllowed ? COLORS.accentA : COLORS.accentC}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
                boxShadow: isAllowed ? `0 0 12px ${COLORS.accentA}44` : "none",
              }}>
                {isAllowed ? "✓" : "✗"}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 32 }}>
        <div style={{
          flex: 1, padding: "16px 20px", borderRadius: 12,
          background: `${COLORS.accentC}12`, border: `1px solid ${COLORS.accentC}40`,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>events fired</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentC }}>
            {Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 3) + 1)}
          </span>
        </div>
        <div style={{
          flex: 1, padding: "16px 20px", borderRadius: 12,
          background: `${COLORS.accentA}12`, border: `1px solid ${COLORS.accentA}40`,
          display: "flex", flexDirection: "column", gap: 6,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>calls made</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, color: COLORS.accentA }}>
            {Math.min(
              Math.ceil(TOTAL_EVENTS / THROTTLE_INTERVAL),
              Math.ceil((Math.min(TOTAL_EVENTS, Math.floor(demoFrame / 3) + 1)) / THROTTLE_INTERVAL)
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalOut = interpolate(frame, [165, 180], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  const line1 = "const throttledUpdate = throttle(updateAnimation, 200);";
  const line2 = "container.addEventListener('scroll', throttledUpdate);";

  const typed1 = useTyped(line1, 8, 52, frame);
  const typed2 = useTyped(line2, 56, 80, frame);
  const done1  = typed1.length >= line1.length;
  const done2  = typed2.length >= line2.length;

  const codeOut = interpolate(frame, [76, 84], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const demoIn = interpolate(frame, [82, 92], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "transparent", opacity: globalOut,
    }}>

      {/* Code window — fades out when demo appears */}
      {frame < 88 && (
        <div style={{ opacity: codeOut, width: 920 }}>
          <CodeWindow>
            {/* Line 1 */}
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              {(() => {
                const chunks = [
                  { text: "const ", color: COLORS.keyword },
                  { text: "throttledUpdate", color: COLORS.value },
                  { text: " = ", color: COLORS.punctuation },
                  { text: "throttle", color: COLORS.fnName },
                  { text: "(", color: COLORS.punctuation },
                  { text: "onScroll", color: COLORS.fnName },
                  { text: ", ", color: COLORS.punctuation },
                  { text: "200", color: COLORS.number },
                  { text: ");", color: COLORS.punctuation },
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

            {/* Line 2 */}
            {frame >= 56 && (
              <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
                {(() => {
                  const chunks = [
                    { text: "container", color: COLORS.value },
                    { text: ".", color: COLORS.punctuation },
                    { text: "addEventListener", color: COLORS.fnName },
                    { text: "(", color: COLORS.punctuation },
                    { text: "'scroll'", color: COLORS.string },
                    { text: ", ", color: COLORS.punctuation },
                    { text: "throttledUpdate", color: COLORS.value },
                    { text: ");", color: COLORS.punctuation },
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
          </CodeWindow>
        </div>
      )}

      {/* Demo — appears after code fades */}
      {frame >= 82 && (
        <div style={{ opacity: demoIn }}>
          <ThrottleDemo frame={frame} />
        </div>
      )}

    </AbsoluteFill>
  );
};
