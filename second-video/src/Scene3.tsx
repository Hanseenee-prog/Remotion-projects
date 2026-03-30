// Scene 3 — "We use debounce — waits until you stop typing"
//
// Visual: Timeline with keystrokes shown as spikes, debounce waits shown as
// a held gate, then ONE function call fires at the end.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }

// Keystroke spike positions (0–1 along the timeline)
const KEYSTROKES = [0.08, 0.17, 0.26, 0.34, 0.42, 0.5, 0.58, 0.66];
const TIMELINE_W = 860;
const DEBOUNCE_FIRE = 0.88; // where the single call fires

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timeline sweeper: progresses across the timeline from frame 40 to 120
  const sweepP = clamp((frame - 40) / 80);

  // Single call fires after typing stops
  const singleCallPop = spring({
    fps,
    frame: Math.max(0, frame - 108),
    config: { damping: 12, stiffness: 220 },
  });

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
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 80 }}>
        {[
          { text: "We use",           start: 0,  dim: false },
          { text: "debounce.",        start: 4,  accent: COLORS.accentA },
          { text: "It waits until",   start: 12, dim: false },
          { text: "you stop typing.", start: 20, dim: false },
        ].map(({ text, start, accent, dim }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            color: accent ?? COLORS.white,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Timeline diagram */}
      <div style={{
        ...fadeUp(frame, 30, 18),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        position: "relative",
        height: 320,
      }}>

        {/* Track */}
        <div style={{
          position: "absolute",
          top: 120,
          left: 0,
          width: TIMELINE_W,
          height: 4,
          background: "rgba(255,255,255,0.12)",
          borderRadius: 2,
        }} />

        {/* Sweep indicator */}
        <div style={{
          position: "absolute",
          top: 120,
          left: 0,
          width: sweepP * TIMELINE_W,
          height: 4,
          background: COLORS.accentB,
          borderRadius: 2,
          boxShadow: `0 0 12px ${COLORS.accentB}`,
        }} />

        {/* Keystroke spikes */}
        {KEYSTROKES.map((pos, i) => {
          const visible = sweepP >= pos;
          const spikeH  = 80 + Math.random() * 20; // fixed heights
          const hs       = [80, 90, 75, 88, 82, 92, 78, 86][i];
          return (
            <div key={i} style={{
              position: "absolute",
              left: pos * TIMELINE_W,
              top: 120 - hs,
              width: 6,
              height: hs,
              background: COLORS.accentC,
              borderRadius: 3,
              opacity: visible ? 0.85 : 0,
              boxShadow: `0 0 10px ${COLORS.accentC}88`,
            }} />
          );
        })}

        {/* "User typing" label */}
        <div style={{
          position: "absolute",
          top: 140,
          left: 0,
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.muted,
        }}>
          keystrokes
        </div>

        {/* Debounce wait bracket */}
        {sweepP > 0.68 && (
          <div style={{
            position: "absolute",
            top: 60,
            left: KEYSTROKES[KEYSTROKES.length - 1] * TIMELINE_W + 10,
            width: (DEBOUNCE_FIRE - KEYSTROKES[KEYSTROKES.length - 1]) * TIMELINE_W - 10,
            opacity: clamp((sweepP - 0.68) / 0.1),
          }}>
            {/* Wait arrow */}
            <div style={{
              height: 3,
              background: "#F0C674",
              borderRadius: 2,
              boxShadow: "0 0 10px #F0C67488",
              position: "relative",
            }}>
              <div style={{
                position: "absolute",
                right: -1,
                top: -6,
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderLeft: "12px solid #F0C674",
              }} />
            </div>
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 22,
              color: "#F0C674",
              marginTop: 8,
              textAlign: "center",
            }}>
              wait 1s…
            </div>
          </div>
        )}

        {/* Single call fires */}
        {sweepP >= DEBOUNCE_FIRE && (
          <div style={{
            position: "absolute",
            left: DEBOUNCE_FIRE * TIMELINE_W,
            top: 28,
            transform: `scale(${singleCallPop})`,
            transformOrigin: "bottom center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
          }}>
            <div style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: COLORS.accentA + "22",
              border: `2px solid ${COLORS.accentA}`,
              fontFamily: FONTS.mono,
              fontSize: 22,
              fontWeight: 700,
              color: COLORS.accentA,
              whiteSpace: "nowrap",
              boxShadow: `0 0 24px ${COLORS.accentA}44`,
            }}>
              searchMovies() ✓
            </div>
            {/* Spike */}
            <div style={{
              width: 6,
              height: 52,
              background: COLORS.accentA,
              borderRadius: 3,
              boxShadow: `0 0 12px ${COLORS.accentA}`,
            }} />
          </div>
        )}

      </div>

      {/* Bottom caption */}
      <div style={{
        ...fadeUp(frame, 115, 16),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        marginTop: 24,
        padding: "24px 32px",
        borderRadius: 16,
        background: `${COLORS.accentA}10`,
        border: `1px solid ${COLORS.accentA}33`,
      }}>
        <span style={{
          fontFamily: FONTS.display,
          fontSize: 32,
          fontWeight: 600,
          color: COLORS.accentA,
        }}>
          8 keystrokes → 1 API call
        </span>
      </div>

    </AbsoluteFill>
  );
};
