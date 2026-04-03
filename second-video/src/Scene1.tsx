// Scene 1 — "You're calling a function every single time you scroll… and that's fine"
//
// Visual: A large scroll container centered. Each scroll event shoots
// "scrolling..." text outward in a random direction, fading as it flies.
// A code snippet above shows the listener. No line, no tiles.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ── Layout ─────────────────────────────────────────────────────────────────────
const CX          = 540;
const CONTAINER_Y = 980;  // center Y of the scroll container

// ── Timing ────────────────────────────────────────────────────────────────────
// Browser fires ~10–20 scroll events/sec. We simulate rapid bursts.
const SCROLL_EVENTS  = 12;
const EVENTS_START   = 24;
const EVENT_INTERVAL = 9;   // very rapid — ~3 per second at 30fps

// Pre-seeded random directions so they don't change frame to frame
// Each entry: [angle_degrees, distance_px, x_wobble]
const BURST_DIRS: Array<[number, number]> = [
  [  -70, 340 ],  // up-left
  [  -10, 280 ],  // up-right
  [ -140, 360 ],  // up-left far
  [   30, 300 ],  // right-down
  [ -100, 320 ],  // left
  [   80, 350 ],  // right
  [ -50,  290 ],  // up
  [  160, 310 ],  // down-left
  [  -20, 370 ],  // right-up
  [ -130, 300 ],  // left-up
  [   50, 340 ],  // right
  [ -160, 280 ],  // left
];

const TRAVEL_FRAMES = 28;

const eventFrame = (i: number) => EVENTS_START + i * EVENT_INTERVAL;

// ── Scroll container mock ──────────────────────────────────────────────────────
const ScrollMock: React.FC<{ scrollPos: number; active: boolean }> = ({
  scrollPos, active,
}) => {
  const TRACK_H = 320;
  const THUMB_H = 90;
  const thumbTop = scrollPos * (TRACK_H - THUMB_H);

  // Rows of fake content
  const ROWS = 8;
  const ROW_H = 54;
  const ROW_GAP = 12;
  const contentOffset = scrollPos * (ROWS * (ROW_H + ROW_GAP) - 280);

  return (
    <div style={{
      width: 800,
      height: 480,
      background: "#0D1117",
      border: `2.5px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.14)"}`,
      borderRadius: 24,
      overflow: "hidden",
      boxShadow: active
        ? `0 0 48px ${COLORS.accentB}28, 0 32px 80px rgba(0,0,0,0.6)`
        : "0 32px 80px rgba(0,0,0,0.5)",
      display: "flex",
      flexDirection: "row",
      transition: "border-color 0.1s",
    }}>
      {/* Content area */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        {/* Scrolling content rows */}
        <div style={{
          position: "absolute",
          top: -contentOffset,
          left: 0, right: 0,
          padding: "24px 32px",
          display: "flex",
          flexDirection: "column",
          gap: ROW_GAP,
        }}>
          {Array.from({ length: ROWS }).map((_, i) => (
            <div key={i} style={{
              height: ROW_H,
              borderRadius: 12,
              background: i % 3 === 0
                ? "rgba(121,192,255,0.08)"
                : i % 3 === 1
                ? "rgba(255,255,255,0.05)"
                : "rgba(126,231,135,0.06)",
              border: i % 3 === 0
                ? "1px solid rgba(121,192,255,0.15)"
                : "1px solid rgba(255,255,255,0.07)",
              display: "flex",
              alignItems: "center",
              paddingLeft: 20,
              gap: 16,
            }}>
              {/* Row decoration */}
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: [COLORS.accentA, COLORS.accentB, COLORS.accentC, COLORS.accentD][i % 4],
                opacity: 0.7,
              }} />
              <div style={{
                flex: 1,
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.06)",
              }} />
              <div style={{
                width: "30%",
                height: 10,
                borderRadius: 5,
                background: "rgba(255,255,255,0.04)",
                marginRight: 20,
              }} />
            </div>
          ))}
        </div>

        {/* scrollY readout */}
        <div style={{
          position: "absolute",
          bottom: 16,
          left: 24,
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.muted,
        }}>
          scrollY:{" "}
          <span style={{ color: COLORS.accentB, fontWeight: 700 }}>
            {Math.round(scrollPos * 480)}
          </span>
        </div>
      </div>

      {/* Scrollbar */}
      <div style={{
        width: 18,
        background: "rgba(255,255,255,0.04)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        flexShrink: 0,
      }}>
        <div style={{
          position: "absolute",
          top: thumbTop,
          left: 3,
          right: 3,
          height: THUMB_H,
          borderRadius: 6,
          background: active ? COLORS.accentB : "rgba(255,255,255,0.22)",
          boxShadow: active ? `0 0 10px ${COLORS.accentB}88` : "none",
        }} />
      </div>
    </div>
  );
};

// ── Flying "scrolling..." burst ────────────────────────────────────────────────
const ScrollBurst: React.FC<{
  index: number;
  frame: number;
}> = ({ index, frame }) => {
  const sf  = eventFrame(index);
  const age = frame - sf;
  if (age < 0 || age > TRAVEL_FRAMES + 8) return null;

  const [angleDeg, dist] = BURST_DIRS[index % BURST_DIRS.length];
  const rad = (angleDeg * Math.PI) / 180;

  const t = clamp(age / TRAVEL_FRAMES);
  const e = easeOut(t);

  const x = CX + Math.cos(rad) * dist * e;
  const y = CONTAINER_Y + Math.sin(rad) * dist * e;

  // Fade: full opacity in first 30%, then fade out
  const opacity =
    t < 0.3
      ? t / 0.3
      : interpolate(t, [0.3, 1], [1, 0]);

  const scale = interpolate(e, [0, 1], [0.6, 1]);

  return (
    <div style={{
      position: "absolute",
      left: x,
      top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity,
      pointerEvents: "none",
      zIndex: 20,
      whiteSpace: "nowrap",
    }}>
      <div style={{
        fontFamily: FONTS.mono,
        fontSize: 28,
        fontWeight: 700,
        color: COLORS.accentB,
        background: `${COLORS.accentB}14`,
        border: `1.5px solid ${COLORS.accentB}44`,
        borderRadius: 10,
        padding: "8px 18px",
        letterSpacing: "0.02em",
      }}>
        scrolling…
      </div>
    </div>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eventsTriggered = Array.from({ length: SCROLL_EVENTS }).filter(
    (_, i) => frame >= eventFrame(i)
  ).length;

  const scrollPos = clamp(eventsTriggered / SCROLL_EVENTS);

  const isActive = Array.from({ length: SCROLL_EVENTS }).some((_, i) => {
    const age = frame - eventFrame(i);
    return age >= 0 && age < 14;
  });

  // Container entrance
  const entranceP = prog(frame, 0, 22);
  const entranceY = interpolate(easeOut(entranceP), [0, 1], [50, 0]);
  const entranceO = clamp(entranceP * 4);

  // Code snippet entrance
  const codeP = prog(frame, 8, 26);
  const codeO = easeOut(codeP);

  // Scene fade out
  const sceneFade = interpolate(frame, [125, 143], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Recoil on container when event fires
  const recoilY = Array.from({ length: SCROLL_EVENTS }).reduce<number>((acc, _, i) => {
    const age = frame - eventFrame(i);
    if (age >= 0 && age < 12) {
      return Math.max(acc, interpolate(age, [0, 3, 12], [0, -10, 0]));
    }
    return acc;
  }, 0);

  return (
    <AbsoluteFill style={{ background: "transparent", opacity: sceneFade, overflow: "hidden" }}>

      {/* ── Code reference (above container) ────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: CONTAINER_Y - 310,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: codeO,
        zIndex: 10,
      }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0,
          background: COLORS.codeBg,
          border: "1.5px solid rgba(255,255,255,0.09)",
          borderRadius: 14,
          padding: "18px 32px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 700,
          whiteSpace: "nowrap",
        }}>
          <span style={{ color: COLORS.value }}>container</span>
          <span style={{ color: COLORS.punctuation }}>.</span>
          <span style={{ color: COLORS.fnName }}>addEventListener</span>
          <span style={{ color: COLORS.punctuation }}>(</span>
          <span style={{ color: COLORS.string }}>'scroll'</span>
          <span style={{ color: COLORS.punctuation }}>, () ={">"} </span>
          <span style={{ color: COLORS.fnName }}>console</span>
          <span style={{ color: COLORS.punctuation }}>.</span>
          <span style={{ color: COLORS.fnName }}>log</span>
          <span style={{ color: COLORS.punctuation }}>(</span>
          <span style={{ color: COLORS.string }}>'scrolling...'</span>
          <span style={{ color: COLORS.punctuation }}>))</span>
        </div>
      </div>

      {/* ── Flying scroll bursts ─────────────────────────────────────────────── */}
      {Array.from({ length: SCROLL_EVENTS }).map((_, i) => (
        <ScrollBurst key={i} index={i} frame={frame} />
      ))}

      {/* ── Scroll container ─────────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: CONTAINER_Y,
        left: "50%",
        transform: `translate(-50%, -50%) translateY(${entranceY + recoilY}px)`,
        opacity: entranceO,
        zIndex: 5,
      }}>
        <ScrollMock scrollPos={scrollPos} active={isActive} />
      </div>

      {/* ── "fires on every scroll event" label (bottom) ────────────────────── */}
      <div style={{
        position: "absolute",
        top: CONTAINER_Y + 270,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: clamp(prog(frame, 30, 48)) * easeOut(1),
        zIndex: 10,
      }}>
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.muted,
          letterSpacing: "0.04em",
          textAlign: "center",
        }}>
          browser fires{" "}
          <span style={{ color: COLORS.accentB, fontWeight: 700 }}>
            {eventsTriggered}×
          </span>{" "}
          per second
        </div>
      </div>

    </AbsoluteFill>
  );
};