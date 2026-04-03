// Scene 2 — "But imagine if every scroll call runs heavy logic…
//             like updating animations or tracking scroll position —
//             your app would lag fast."
//
// Visual: Scroll container on the right. On the left, a live "scroll-driven
// animation" — a progress bar and an animated element that react to scrollPos.
// Each scroll event fires a "heavy work" spike. FPS meter drops as spikes pile.
// No server, no Avengers. Just scroll → animation lag.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ── Timing ─────────────────────────────────────────────────────────────────────
const EVENTS      = 10;
const EVENT_START = 18;
const EVENT_INT   = 12;   // rapid-fire
const eventFrame  = (i: number) => EVENT_START + i * EVENT_INT;

// ── Scroll container (same style, smaller, on the right) ──────────────────────
const ScrollMock: React.FC<{ scrollPos: number; active: boolean }> = ({
  scrollPos, active,
}) => {
  const TRACK_H  = 260;
  const THUMB_H  = 70;
  const thumbTop = scrollPos * (TRACK_H - THUMB_H);
  const ROWS = 7;
  const contentOffset = scrollPos * (ROWS * 60 - 200);

  return (
    <div style={{
      width: 380,
      height: 400,
      background: "#0D1117",
      border: `2px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.12)"}`,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: active
        ? `0 0 32px ${COLORS.accentB}22, 0 24px 60px rgba(0,0,0,0.5)`
        : "0 24px 60px rgba(0,0,0,0.5)",
      display: "flex",
      flexDirection: "row",
    }}>
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute",
          top: -contentOffset,
          left: 0, right: 0,
          padding: "18px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {Array.from({ length: ROWS }).map((_, i) => (
            <div key={i} style={{
              height: 44,
              borderRadius: 10,
              background: i % 2 === 0
                ? "rgba(121,192,255,0.07)"
                : "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 14,
              gap: 10,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: [COLORS.accentA, COLORS.accentB, COLORS.accentC, COLORS.accentD][i % 4],
                opacity: 0.6,
              }} />
              <div style={{
                height: 8, borderRadius: 4,
                background: "rgba(255,255,255,0.06)",
                width: `${50 + (i * 17) % 35}%`,
              }} />
            </div>
          ))}
        </div>
        <div style={{
          position: "absolute", bottom: 12, left: 16,
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted,
        }}>
          scrollY:{" "}
          <span style={{ color: COLORS.accentB, fontWeight: 700 }}>
            {Math.round(scrollPos * 480)}
          </span>
        </div>
      </div>
      <div style={{
        width: 14, background: "rgba(255,255,255,0.04)",
        borderLeft: "1px solid rgba(255,255,255,0.07)",
        position: "relative", flexShrink: 0,
      }}>
        <div style={{
          position: "absolute", top: thumbTop, left: 2, right: 2,
          height: THUMB_H, borderRadius: 5,
          background: active ? COLORS.accentB : "rgba(255,255,255,0.2)",
          boxShadow: active ? `0 0 8px ${COLORS.accentB}88` : "none",
        }} />
      </div>
    </div>
  );
};

// ── Scroll-driven animation panel (left side) ─────────────────────────────────
// Shows 3 things that "update" on each scroll:
//  1. A progress bar that fills with scrollPos
//  2. A circle that moves horizontally
//  3. A box that rotates / changes color
const AnimPanel: React.FC<{
  scrollPos: number;
  spikePulse: number;   // 0–1: how fresh the last spike is
  lagP: number;         // 0–1: cumulative lag level
}> = ({ scrollPos, spikePulse, lagP }) => {
  // When spiking, the animation "stutters" — slightly wrong values
  const stutter = spikePulse * (Math.random() > 0.5 ? 1 : -1) * 0.08;
  const displayPos = clamp(scrollPos + (lagP > 0.5 ? stutter : 0));

  const circleX = interpolate(displayPos, [0, 1], [0, 240]);
  const barFill  = displayPos * 100;
  const boxRot   = displayPos * 180;
  const boxColor = `hsl(${120 + displayPos * 200}, 70%, 55%)`;

  return (
    <div style={{
      width: 420,
      background: COLORS.codeBg,
      border: `2px solid ${lagP > 0.6 ? COLORS.accentC : "rgba(255,255,255,0.10)"}`,
      borderRadius: 20,
      padding: "28px 28px",
      boxShadow: lagP > 0.6
        ? `0 0 32px ${COLORS.accentC}22`
        : "0 24px 60px rgba(0,0,0,0.4)",
      display: "flex",
      flexDirection: "column",
      gap: 28,
    }}>
      {/* Panel title */}
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 22,
        color: COLORS.muted,
        letterSpacing: "0.06em",
        textTransform: "uppercase" as const,
        textAlign: "center",
      }}>
        scroll-driven animation
      </div>

      {/* 1. Progress bar */}
      <div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted,
          marginBottom: 10,
        }}>
          progress
        </div>
        <div style={{
          width: "100%", height: 18, borderRadius: 9,
          background: "rgba(255,255,255,0.07)", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${barFill}%`,
            background: `linear-gradient(90deg, ${COLORS.accentA}, ${COLORS.accentB})`,
            borderRadius: 9,
            boxShadow: `0 0 12px ${COLORS.accentA}66`,
          }} />
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.accentA,
          marginTop: 8, textAlign: "right",
        }}>
          {Math.round(barFill)}%
        </div>
      </div>

      {/* 2. Moving circle */}
      <div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted,
          marginBottom: 12,
        }}>
          translateX
        </div>
        <div style={{
          width: "100%", height: 48, borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.07)",
          position: "relative",
        }}>
          <div style={{
            position: "absolute",
            left: circleX,
            top: "50%",
            transform: "translateY(-50%)",
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: COLORS.accentB,
            boxShadow: `0 0 16px ${COLORS.accentB}88`,
          }} />
        </div>
        <div style={{
          fontFamily: FONTS.mono, fontSize: 20, color: COLORS.accentB,
          marginTop: 8,
        }}>
          {Math.round(circleX)}px
        </div>
      </div>

      {/* 3. Rotating box */}
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted,
            marginBottom: 12,
          }}>
            rotate + color
          </div>
          <div style={{
            width: 60, height: 60, borderRadius: 12,
            background: boxColor,
            transform: `rotate(${boxRot}deg)`,
            boxShadow: `0 0 20px ${boxColor}66`,
          }} />
        </div>
        <div style={{
          flex: 1,
          fontFamily: FONTS.mono,
          fontSize: 20,
          color: COLORS.muted,
          lineHeight: 1.7,
        }}>
          <div><span style={{ color: COLORS.value }}>rotate</span>({Math.round(boxRot)}deg)</div>
          <div><span style={{ color: COLORS.value }}>color</span>: hsl({Math.round(120 + displayPos * 200)}, 70%)</div>
        </div>
      </div>

      {/* Heavy work indicator */}
      {spikePulse > 0.05 && (
        <div style={{
          opacity: spikePulse,
          padding: "12px 18px",
          borderRadius: 10,
          background: `${COLORS.accentC}14`,
          border: `1px solid ${COLORS.accentC}55`,
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.accentC,
          textAlign: "center",
        }}>
          ⚙️ recalculating layout…
        </div>
      )}
    </div>
  );
};

// ── Heavy work spike bar ────────────────────────────────────────────────────────
// Each event creates a spike on a mini bar chart at the bottom
const SpikeBar: React.FC<{ idx: number; frame: number }> = ({ idx, frame }) => {
  const sf  = eventFrame(idx);
  const age = frame - sf;
  if (age < 0) return null;

  const heights = [62, 80, 55, 90, 74, 88, 66, 92, 70, 85];
  const h = heights[idx % heights.length];

  // Bar rises then slowly settles
  const riseP = clamp(age / 8);
  const fallP = age > 30 ? clamp((age - 30) / 40) : 0;
  const barH  = h * easeOut(riseP) * (1 - fallP * 0.7);

  return (
    <div style={{
      width: 42,
      height: barH,
      borderRadius: "6px 6px 0 0",
      background: `linear-gradient(to top, ${COLORS.accentC}, ${COLORS.accentC}88)`,
      boxShadow: riseP > 0.5 ? `0 0 12px ${COLORS.accentC}66` : "none",
      alignSelf: "flex-end",
    }} />
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eventsTriggered = Array.from({ length: EVENTS }).filter(
    (_, i) => frame >= eventFrame(i)
  ).length;

  const scrollPos = clamp(eventsTriggered / EVENTS);

  const isActive = Array.from({ length: EVENTS }).some((_, i) => {
    const age = frame - eventFrame(i);
    return age >= 0 && age < 12;
  });

  // How fresh is the most recent spike (0=stale, 1=just fired)
  const spikePulse = Array.from({ length: EVENTS }).reduce<number>((acc, _, i) => {
    const age = frame - eventFrame(i);
    if (age >= 0 && age < 24) {
      return Math.max(acc, interpolate(age, [0, 4, 24], [0, 1, 0]));
    }
    return acc;
  }, 0);

  // Cumulative lag: rises as events pile up
  const lagP = clamp(eventsTriggered / EVENTS);

  // FPS: drops as events accumulate
  const fpsBase   = interpolate(lagP, [0, 0.4, 0.8, 1], [60, 45, 22, 10]);
  const fpsNoise  = Math.sin(frame * 1.1) * 4 * lagP;
  const fps_disp  = Math.max(7, Math.round(fpsBase + fpsNoise));
  const fpsColor  = fps_disp > 45 ? COLORS.accentA : fps_disp > 25 ? "#F0C674" : COLORS.accentC;

  // Scene fade out
  const sceneFade = interpolate(frame, [148, 163], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Recoil on scroll container
  const recoilY = Array.from({ length: EVENTS }).reduce<number>((acc, _, i) => {
    const age = frame - eventFrame(i);
    if (age >= 0 && age < 12) {
      return Math.max(acc, interpolate(age, [0, 3, 12], [0, 14, 0]));
    }
    return acc;
  }, 0);

  const entranceO = easeOut(clamp(prog(frame, 0, 20) * 4));

  return (
    <AbsoluteFill style={{
      background: "transparent",
      opacity: sceneFade,
      overflow: "hidden",
    }}>

      {/* ── Main content: two panels side by side, centered vertically ────────── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 44,
        opacity: entranceO,
      }}>

        {/* Left: scroll-driven animation panel */}
        <AnimPanel scrollPos={scrollPos} spikePulse={spikePulse} lagP={lagP} />

        {/* Right: scroll container */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
          transform: `translateY(${recoilY}px)`,
        }}>
          {/* Code label above */}
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 22,
            color: COLORS.muted,
            textAlign: "center",
            letterSpacing: "0.02em",
          }}>
            <span style={{ color: COLORS.value }}>el</span>
            <span style={{ color: COLORS.punctuation }}>.</span>
            <span style={{ color: COLORS.fnName }}>addEventListener</span>
            <span style={{ color: COLORS.punctuation }}>(</span>
            <span style={{ color: COLORS.string }}>'scroll'</span>
            <span style={{ color: COLORS.punctuation }}>, </span>
            <span style={{ color: COLORS.fnName }}>updateAnimation</span>
            <span style={{ color: COLORS.punctuation }}>)</span>
          </div>
          <ScrollMock scrollPos={scrollPos} active={isActive} />

          {/* Arrow between panels (conceptual: scroll → updates anim) */}
          <div style={{
            position: "absolute",
            left: -60,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 0,
            pointerEvents: "none",
          }}>
            {/* Arrow shaft */}
            <div style={{
              width: 60,
              height: 3,
              background: `rgba(255,255,255,0.25)`,
              borderRadius: 2,
              position: "relative",
            }}>
              {/* Arrow head */}
              <div style={{
                position: "absolute",
                left: -1,
                top: "50%",
                transform: "translateY(-50%)",
                width: 0,
                height: 0,
                borderTop: "7px solid transparent",
                borderBottom: "7px solid transparent",
                borderRight: "12px solid rgba(255,255,255,0.25)",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Heavy work spike bars (bottom center) ─────────────────────────────── */}
      <div style={{
        position: "absolute",
        bottom: 220,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: 700,
      }}>
        {/* FPS meter */}
        <div style={{
          width: "100%",
          padding: "18px 24px",
          background: "rgba(22,27,34,0.85)",
          border: `2px solid ${fpsColor}44`,
          borderRadius: 16,
          display: "flex",
          alignItems: "center",
          gap: 20,
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: COLORS.white,
            flexShrink: 0,
          }}>
            FPS
          </div>
          <div style={{
            flex: 1, height: 12, borderRadius: 6,
            background: "rgba(255,255,255,0.08)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%",
              width: `${(fps_disp / 60) * 100}%`,
              background: fpsColor,
              borderRadius: 6,
              boxShadow: `0 0 8px ${fpsColor}88`,
            }} />
          </div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 28, fontWeight: 800,
            color: fpsColor, minWidth: 80, textAlign: "right",
          }}>
            {fps_disp} {fps_disp < 25 ? "🐢" : fps_disp < 45 ? "⚠️" : "✓"}
          </div>
        </div>

        {/* Spike bars */}
        <div style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          height: 100,
          width: "100%",
          paddingTop: 4,
        }}>
          {Array.from({ length: EVENTS }).map((_, i) => (
            <SpikeBar key={i} idx={i} frame={frame} />
          ))}
          <div style={{
            fontFamily: FONTS.mono, fontSize: 20, color: COLORS.muted,
            alignSelf: "center", marginLeft: 8, whiteSpace: "nowrap",
          }}>
            updateAnimation() calls
          </div>
        </div>

        {eventsTriggered >= 6 && (
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            fontWeight: 800,
            color: COLORS.accentC,
            opacity: easeOut(prog(frame, eventFrame(5), eventFrame(5) + 16)),
          }}>
            {eventsTriggered} heavy calls — app lags! 🔴
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};