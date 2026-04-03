// Scene 3 — "We use Throttle — limits how often a function runs"
// 210 frames
//
// Mirror of debounce Scene3: "Throttle" floats from center to top,
// then a timing diagram shows scroll spikes → throttle window → single call.
// Key difference: throttle fires at REGULAR INTERVALS, not after a gap.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, start: number, end: number) { return clamp((frame - start) / (end - start)); }

const TIMELINE_W   = 440;
// Throttle: fires at regular intervals (every 200ms), ignores in-between events
const SCROLL_SPIKES = [0.05, 0.12, 0.19, 0.26, 0.33, 0.41, 0.49, 0.57, 0.65, 0.73];
const ALLOWED_FIRES = [0.05, 0.26, 0.49, 0.73]; // only these get through
const SPIKE_HEIGHTS = [68, 52, 76, 60, 80, 55, 72, 64, 78, 58];

const SWEEP_START = 72;
const SWEEP_END   = 130;

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const globalOut = interpolate(frame, [192, 210], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const throttleInP = easeOut(prog(frame, 10, 22));
  const throttleUpP = easeOut(prog(frame, 50, 64));

  const throttleTop = interpolate(throttleUpP, [0, 1], [1920 / 2 + 40, SAFE.top + 650]);
  const weUseOpacity = interpolate(frame, [0, 1, 50, 58], [0, 1, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const weUseFadeIn = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const diagramIn = easeOut(prog(frame, 62, 78));
  const sweepP    = clamp((frame - SWEEP_START) / (SWEEP_END - SWEEP_START));

  const clockOpacity = easeOut(clamp((sweepP - 0.70) / 0.14));
  const callOpacity  = easeOut(clamp((sweepP - 0.88) / 0.10));

  const callPopFrame = SWEEP_START + Math.round(0.88 * (SWEEP_END - SWEEP_START));
  const singleCallPop = spring({
    fps,
    frame: Math.max(0, frame - callPopFrame),
    config: { damping: 12, stiffness: 220 },
  });

  const badgeOpacity = easeOut(prog(frame, 136, 148));

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>

      {/* "Throttle" — floats from center to top */}
      <div style={{
        position: "absolute", top: throttleTop, left: "50%",
        transform: "translateX(-50%)",
        opacity: throttleInP * globalOut,
        textAlign: "center", zIndex: 20, pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: interpolate(throttleUpP, [0, 1], [96, 72]),
          fontWeight: 900, color: COLORS.accentA,
          letterSpacing: "-0.03em", lineHeight: 1,
        }}>
          Throttle
        </div>
      </div>

      {/* "We use" */}
      <div style={{
        position: "absolute", top: 1920 / 2 - 50, left: "50%",
        transform: "translateX(-50%)",
        opacity: weUseFadeIn * weUseOpacity * globalOut,
        textAlign: "center", pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: FONTS.display, fontSize: 60, fontWeight: 700,
          color: COLORS.white, letterSpacing: "-0.02em", lineHeight: 1,
        }}>
          We use
        </div>
      </div>

      {/* Diagram */}
      <div style={{
        position: "absolute", top: "50%", left: SAFE.left + 20, right: SAFE.right + 20,
        transform: "translateY(-10%)",
        opacity: diagramIn * globalOut,
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", gap: 0, width: "100%",
        }}>

          {/* Scroll spikes section */}
          <div style={{ position: "relative", width: TIMELINE_W, height: 270, flexShrink: 0 }}>
            {/* Track */}
            <div style={{
              position: "absolute", top: 148, left: 0,
              width: TIMELINE_W - 80 - 80, height: 4,
              background: "rgba(255,255,255,0.12)", borderRadius: 2,
            }} />
            {/* Sweep fill */}
            <div style={{
              position: "absolute", top: 148, left: 0,
              width: sweepP * (TIMELINE_W - 80 - 80),
              height: 4, background: COLORS.accentA,
              borderRadius: 2, boxShadow: `0 0 10px ${COLORS.accentA}`,
            }} />

            {/* All scroll spikes — red (fired but throttled) */}
            {SCROLL_SPIKES.map((pos, i) => {
              const visible = sweepP >= pos;
              const h = SPIKE_HEIGHTS[i];
              const isAllowed = ALLOWED_FIRES.includes(pos);
              return (
                <div key={i} style={{
                  position: "absolute",
                  left: pos * (TIMELINE_W - 80),
                  top: 148 - h,
                  width: isAllowed ? 8 : 5,
                  height: h,
                  background: isAllowed ? COLORS.accentA : COLORS.accentC,
                  borderRadius: 3,
                  opacity: visible ? (isAllowed ? 0.95 : 0.45) : 0,
                  boxShadow: isAllowed ? `0 0 12px ${COLORS.accentA}` : "none",
                }} />
              );
            })}

            {/* "scroll events" label */}
            <div style={{
              position: "absolute", top: 166, left: "10%",
              fontFamily: FONTS.mono, fontSize: 30,
              color: COLORS.muted, textTransform: "uppercase",
            }}>
              scroll events
            </div>
            {/* Throttle window markers */}
            {ALLOWED_FIRES.map((pos, i) => (
              <div key={i} style={{
                position: "absolute",
                left: pos * (TIMELINE_W - 80) - 1,
                top: 100,
                width: 2,
                height: 52,
                background: `${COLORS.accentA}40`,
                borderRadius: 1,
                opacity: sweepP >= pos ? 1 : 0,
              }} />
            ))}
          </div>

          {/* Gap */}
          <div style={{ width: 0, flexShrink: 0 }} />

          {/* Clock */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
            opacity: clockOpacity, flexShrink: 0, width: 120,
            position: "relative", left: -30,
          }}>
            <span style={{
              fontSize: 90, lineHeight: 1,
              filter: "brightness(0) invert(1) drop-shadow(0 0 16px rgba(255,255,255,0.35))",
            }}>
              <b>⏱</b>
            </span>
            <span style={{
              fontFamily: FONTS.mono, fontSize: 36, fontWeight: 800,
              color: COLORS.white, letterSpacing: "0.02em",
            }}>
              200ms
            </span>
          </div>

          <div style={{ width: 50, flexShrink: 0 }} />

          {/* updateAnimation() card */}
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 12,
            opacity: callOpacity, flex: 1,
          }}>
            <div style={{
              transform: `scale(${singleCallPop})`,
              transformOrigin: "top center",
              padding: "18px 24px", borderRadius: 16,
              background: "#0D0D0D",
              border: `2.5px solid ${COLORS.accentA}`,
              fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700,
              color: COLORS.accentA, whiteSpace: "nowrap",
              boxShadow: `0 0 32px ${COLORS.accentA}55`,
              textAlign: "center",
            }}>
              updateAnimation()
            </div>
          </div>
        </div>

        {/* Badge */}
        <div style={{
          marginTop: 72,
          display: "flex", justifyContent: "center",
          opacity: badgeOpacity,
        }}>
          <div style={{
            padding: "22px 40px", borderRadius: 16,
            background: `${COLORS.accentA}10`,
            border: `1px solid ${COLORS.accentA}44`,
          }}>
            <span style={{
              fontFamily: FONTS.display, fontSize: 36, fontWeight: 700,
              color: COLORS.accentA, letterSpacing: "0.01em",
            }}>
              10 events → 4 actual calls
            </span>
          </div>
        </div>
      </div>

    </AbsoluteFill>
  );
};
