// Scene 2 — "Heavy logic on every scroll → your app lags"
// 165 frames
//
// Visual: Scroll container fires rapid events. Each event triggers an
// "updateAnimation()" call card that stacks. A frame-rate / lag meter
// fills red as events accumulate. The scroll container shows a jittery
// frame counter getting worse. Mirror of debounce Scene 2 but for scroll.

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

const EVENTS       = 8;
const EVENT_START  = 12;
const EVENT_INT    = 14;    // fast — 8 events in ~112 frames
const TRAVEL_FRAMES = 100;

const eventFrame = (i: number) => EVENT_START + i * EVENT_INT;

// The path: scroll container (bottom-center) → animation engine (top-center)
const CX          = 540;
const ENGINE_Y    = 400;
const CONTAINER_Y = 1380;
const SIDE_OFF    = 340;
const BOT_H_Y     = 1200;

function getOutPos(p: number) {
  const d = p * 1500;
  if (d < 180) return { x: CX + 100, y: interpolate(d, [0, 180], [CONTAINER_Y, BOT_H_Y]) };
  if (d < 480) return { x: interpolate(d, [180, 480], [CX + 100, CX + SIDE_OFF]), y: BOT_H_Y };
  if (d < 1320) return { x: CX + SIDE_OFF, y: interpolate(d, [480, 1320], [BOT_H_Y, ENGINE_Y]) };
  return { x: interpolate(d, [1320, 1500], [CX + SIDE_OFF, CX]), y: ENGINE_Y };
}

const EventParticle: React.FC<{ index: number; frame: number }> = ({ index, frame }) => {
  const sf  = eventFrame(index);
  const age = frame - sf;
  const gP  = age / TRAVEL_FRAMES;
  if (gP < 0 || gP > 1) return null;

  const outP = gP;
  const pos  = getOutPos(outP);
  const d    = outP * 1500;

  let type: "dot" | "card" = "dot";
  let scale = 1;
  if (d > 480 && d < 1320) {
    type  = "card";
    scale = interpolate(d, [480, 580, 1220, 1320], [0, 1, 1, 0], { extrapolate: "clamp" } as any);
  }

  return (
    <div style={{ position: "absolute", left: pos.x, top: pos.y, transform: "translate(-50%,-50%)", zIndex: 30 }}>
      {type === "dot" ? (
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: COLORS.accentC, boxShadow: `0 0 24px ${COLORS.accentC}` }} />
      ) : (
        <div style={{
          background: COLORS.codeBg, border: `3px solid ${COLORS.accentC}`,
          padding: "14px 26px", borderRadius: 18,
          fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700,
          color: "white", transform: `scale(${scale})`,
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: COLORS.fnName }}>updateAnimation</span>
          <span style={{ color: COLORS.punctuation }}>()</span>
        </div>
      )}
    </div>
  );
};

// Animation engine graphic (top)
const AnimEngine: React.FC<{ hitPulse: number }> = ({ hitPulse }) => {
  const jerkY  = interpolate(hitPulse, [0, 0.15, 1], [0, -8, 0]);
  const shakeX = Math.sin(hitPulse * Math.PI * 3) * 4 * hitPulse;
  return (
    <div style={{
      position: "absolute", top: ENGINE_Y, left: CX,
      transform: `translate(-50%,-50%) translate(${shakeX}px,${jerkY}px)`,
      display: "flex", flexDirection: "column", gap: 10, zIndex: 100,
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 260, height: 52, background: "#161B22",
          border: `2px solid ${hitPulse > 0.3 ? COLORS.accentC : "#30363D"}`,
          borderRadius: 14, boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", padding: "0 22px", gap: 14,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: hitPulse > 0.1 ? COLORS.accentC : "#333" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: hitPulse > 0.5 ? "#F0C674" : "#333" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 60, height: 8, background: "rgba(255,255,255,0.09)", borderRadius: 4 }} />
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 6, fontFamily: FONTS.mono, fontSize: 24, color: COLORS.subtle, fontWeight: 900 }}>
        ANIMATION ENGINE
      </div>
    </div>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const activeEvents = Array.from({ length: EVENTS }).filter((_, i) => {
    const age = frame - eventFrame(i);
    return age > 0 && age < TRAVEL_FRAMES;
  }).length;

  const engineHit = Array.from({ length: EVENTS }).reduce<number>((acc, _, i) => {
    const hf   = eventFrame(i) + TRAVEL_FRAMES * 0.55;
    const diff = frame - hf;
    return diff > 0 && diff < 16
      ? Math.max(acc, interpolate(diff, [0, 4, 16], [0, 1, 0]))
      : acc;
  }, 0);

  const recoilY = Array.from({ length: EVENTS }).reduce<number>((acc, _, i) => {
    const diff = frame - eventFrame(i);
    return diff >= 0 && diff < 14
      ? Math.max(acc, interpolate(diff, [0, 3, 14], [0, 20, 0], { extrapolateRight: "clamp" } as any))
      : acc;
  }, 0);

  // FPS meter: drops as events pile up
  const fpsTarget = interpolate(activeEvents, [0, 4, 8], [60, 30, 10], { extrapolate: "clamp" } as any);
  const fpsNoise  = Math.sin(frame * 0.8) * 3 * (activeEvents / 8);
  const fpsDisplay = Math.max(6, Math.round(fpsTarget + fpsNoise));
  const fpsColor  = fpsDisplay > 45 ? COLORS.accentA : fpsDisplay > 25 ? "#F0C674" : COLORS.accentC;

  const typedText = "Avengers".slice(0, Math.min(
    Math.floor(Math.max(frame - EVENT_START, 0) / EVENT_INT), 8
  ));

  const sceneFade = interpolate(frame, [145, 163], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "transparent", opacity: sceneFade }}>

      {/* Path lines */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", zIndex: 0 }}>
        <path
          d={`M ${CX + 100} ${CONTAINER_Y} V ${BOT_H_Y} H ${CX + SIDE_OFF} V ${ENGINE_Y} H ${CX}`}
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="8" strokeDasharray="14 18"
        />
      </svg>

      <AnimEngine hitPulse={engineHit} />

      {Array.from({ length: EVENTS }).map((_, i) => (
        <EventParticle key={i} index={i} frame={frame} />
      ))}

      {/* Scroll container */}
      <div style={{
        position: "absolute", top: CONTAINER_Y, left: CX,
        transform: `translate(-50%,-50%) translateY(${recoilY}px)`,
        zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
      }}>
        <div style={{
          width: 500, background: COLORS.codeBg,
          border: "3px solid rgba(255,255,255,0.15)",
          borderRadius: 24, padding: "24px 32px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column", gap: 14,
        }}>
          {/* Simulated scroll bar */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ flex: 1, height: 12, background: "rgba(255,255,255,0.06)", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min((activeEvents / EVENTS) * 100 + 10, 90)}%`,
                background: COLORS.accentB, borderRadius: 6,
              }} />
            </div>
            <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>scroll</span>
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 700, color: COLORS.codeText }}>
            {typedText}
            <span style={{ display: "inline-block", width: 4, height: "0.8em", background: COLORS.accentB, marginLeft: 6, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />
          </span>
        </div>
      </div>

      {/* HUD */}
      <div style={{
        position: "absolute", bottom: 200, left: "50%",
        transform: "translateX(-50%)",
        width: 600, padding: 28,
        background: "rgba(22,27,34,0.85)",
        border: "2px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, fontFamily: FONTS.mono, fontSize: 26, fontWeight: 700 }}>
          <span style={{ color: "white" }}>Frame Rate</span>
          <span style={{ color: fpsColor }}>{fpsDisplay} fps {fpsDisplay < 25 ? "🐢" : fpsDisplay < 45 ? "⚠️" : "✓"}</span>
        </div>
        <div style={{ width: "100%", height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${Math.min((activeEvents / EVENTS) * 100, 100)}%`,
            background: fpsColor, borderRadius: 8,
          }} />
        </div>
        {activeEvents >= 5 && (
          <div style={{ marginTop: 14, textAlign: "center", fontFamily: FONTS.mono, fontSize: 26, fontWeight: 800, color: COLORS.accentC }}>
            {activeEvents} calls per second!
          </div>
        )}
      </div>

    </AbsoluteFill>
  );
};
