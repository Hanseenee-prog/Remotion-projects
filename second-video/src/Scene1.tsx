// Scene 1 — "You're calling a function every single time you scroll… and that's fine"
//
// Visual: A scrollable container mock in the center. A scroll thumb moves down.
// Each scroll event fires an onScroll("updateUI") label that travels UP a dashed
// line and lands as a tile at the top — identical mechanic to the debounce video.
// Labels: updateUI("pos") rising up, turning to dot at 60%, landing as tiles.
// 150 frames total.

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
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ── Layout ────────────────────────────────────────────────────────────────────
const TILE_ROW_Y  = 300;
const SCROLL_Y    = 1020;   // top of the scroll mock container

const LINE_TOP_Y  = TILE_ROW_Y + 120;
const LINE_BOT_Y  = SCROLL_Y - 20;
const LINE_HEIGHT = LINE_BOT_Y - LINE_TOP_Y;
const LINE_X      = 540;

const TILE_SIZE = 120;
const TILE_GAP  = 16;

// ── Timing ────────────────────────────────────────────────────────────────────
const SCROLL_EVENTS  = 5;        // how many scroll events fire
const EVENT_INTERVAL = 22;       // frames between scroll events
const EVENTS_START   = 20;
const LAUNCH_DELAY   = 6;
const TRAVEL_FRAMES  = 38;
const DOT_THRESHOLD  = 0.60;

const TILE_COLORS = [
  COLORS.accentA,
  COLORS.accentB,
  COLORS.accentC,
  COLORS.accentD,
  COLORS.accentA,
];

const SCROLL_LABELS = ["0", "120", "240", "360", "480"];

const eventFrame  = (i: number) => EVENTS_START + i * EVENT_INTERVAL;
const launchFrame = (i: number) => eventFrame(i) + LAUNCH_DELAY;
const arriveFrame = (i: number) => launchFrame(i) + TRAVEL_FRAMES;

// ── Scroll container mock ─────────────────────────────────────────────────────
const ScrollMock: React.FC<{ scrollPos: number; active: boolean; frame: number }> = ({
  scrollPos, active, frame,
}) => {
  // scrollPos 0→1 = thumb travels from top to bottom of track
  const TRACK_H = 240;
  const THUMB_H = 80;
  const thumbTop = scrollPos * (TRACK_H - THUMB_H);

  return (
    <div style={{
      width: 680,
      background: "#0D1117",
      border: `2.5px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.14)"}`,
      borderRadius: 20,
      padding: "0",
      overflow: "hidden",
      boxShadow: active ? `0 0 32px ${COLORS.accentB}28` : "none",
      display: "flex",
      flexDirection: "row",
    }}>
      {/* Content area */}
      <div style={{
        flex: 1,
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}>
        {/* Simulated content rows that move up as user scrolls */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const offset = scrollPos * 180;
          const rowY = i * 60 - offset;
          const visible = rowY > -30 && rowY < 280;
          if (!visible) return null;
          return (
            <div key={i} style={{
              position: "absolute",
              top: 28 + rowY,
              left: 32,
              right: 56,
              height: 42,
              borderRadius: 8,
              background: i % 2 === 0
                ? "rgba(255,255,255,0.06)"
                : "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
            }} />
          );
        })}
        {/* Label */}
        <div style={{
          position: "absolute",
          bottom: 18, left: 32,
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.muted,
        }}>
          scrollY: <span style={{ color: COLORS.accentB }}>
            {Math.round(scrollPos * 480)}
          </span>
        </div>
      </div>

      {/* Scrollbar track */}
      <div style={{
        width: 20,
        background: "rgba(255,255,255,0.04)",
        borderLeft: "1px solid rgba(255,255,255,0.08)",
        position: "relative",
        height: TRACK_H + THUMB_H,
        flexShrink: 0,
      }}>
        {/* Thumb */}
        <div style={{
          position: "absolute",
          top: thumbTop,
          left: 4,
          right: 4,
          height: THUMB_H,
          borderRadius: 6,
          background: active ? COLORS.accentB : "rgba(255,255,255,0.25)",
          boxShadow: active ? `0 0 12px ${COLORS.accentB}88` : "none",
          transition: "background 0.15s",
        }} />
      </div>
    </div>
  );
};

// ── Letter tile ───────────────────────────────────────────────────────────────
const Tile: React.FC<{ label: string; enterProgress: number; color: string }> = ({
  label, enterProgress, color,
}) => {
  const s = interpolate(easeOutBack(clamp(enterProgress)), [0, 1], [0, 1]);
  const o = clamp(enterProgress * 3);
  return (
    <div style={{
      width: TILE_SIZE, height: TILE_SIZE, borderRadius: 18,
      background: COLORS.codeBg, border: `3px solid ${color}`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 4,
      opacity: o, transform: `scale(${s})`,
      transformOrigin: "center bottom",
      boxShadow: `0 4px 24px ${color}30`,
    }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.muted }}>
        pos
      </span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 800, color }}>
        {label}
      </span>
    </div>
  );
};

// ── Travelling label ──────────────────────────────────────────────────────────
const TravellingCall: React.FC<{ label: string; progress: number; color: string }> = ({
  label, progress, color,
}) => {
  const isBeyond     = progress >= DOT_THRESHOLD;
  const labelOpacity = isBeyond
    ? clamp(1 - (progress - DOT_THRESHOLD) / 0.07)
    : clamp(progress / 0.12);
  const dotOpacity   = isBeyond
    ? clamp((progress - DOT_THRESHOLD) / 0.07) * clamp(1 - (progress - 0.93) / 0.07)
    : 0;
  const y = LINE_BOT_Y - progress * LINE_HEIGHT;

  return (
    <div style={{
      position: "absolute", left: LINE_X, top: y,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none", zIndex: 10,
    }}>
      <div style={{
        opacity: labelOpacity,
        transform: "translateX(-50%)", marginLeft: "50%",
        whiteSpace: "nowrap",
        background: `${color}18`, border: `2px solid ${color}80`,
        borderRadius: 12, padding: "10px 22px",
        display: "inline-flex", alignItems: "center", gap: 0,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: color, marginRight: 12, flexShrink: 0,
          boxShadow: `0 0 8px ${color}`,
        }} />
        <span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700 }}>
          <span style={{ color: COLORS.fnName }}>onScroll</span>
          <span style={{ color: COLORS.punctuation }}>(</span>
          <span style={{ color: COLORS.value }}>{label}</span>
          <span style={{ color: COLORS.punctuation }}>)</span>
        </span>
      </div>
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 20, height: 20, borderRadius: "50%",
        background: color, opacity: dotOpacity,
        boxShadow: `0 0 14px ${color}`,
      }} />
    </div>
  );
};

// ── Scene ─────────────────────────────────────────────────────────────────────
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const eventsTriggered = Math.min(
    SCROLL_EVENTS,
    Array.from({ length: SCROLL_EVENTS }).filter((_, i) => frame >= eventFrame(i)).length
  );

  // Scroll position: thumb advances with each event
  const scrollPos = clamp(eventsTriggered / SCROLL_EVENTS);

  const entranceP = prog(frame, 0, 20);
  const entranceY = interpolate(easeOut(entranceP), [0, 1], [60, 0]);
  const entranceO = clamp(entranceP * 3);

  const sceneFade = interpolate(frame, [130, 148], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const tileEnterSprings = Array.from({ length: SCROLL_EVENTS }).map((_, i) => {
    return spring({
      fps,
      frame: Math.max(0, frame - arriveFrame(i)),
      config: { damping: 11, stiffness: 220, mass: 0.6 },
      durationInFrames: 14,
    });
  });

  const labelProgresses = Array.from({ length: SCROLL_EVENTS }).map((_, i) => {
    if (frame < launchFrame(i)) return -1;
    const elapsed = frame - launchFrame(i);
    const raw = clamp(elapsed / TRAVEL_FRAMES);
    if (raw >= 1) return -1;
    return easeOut(raw);
  });

  const lineOp    = prog(frame, 10, 24);
  const lastEvF   = eventsTriggered > 0 ? eventFrame(eventsTriggered - 1) : -999;
  const isActive  = frame - lastEvF < 12;

  // Shoot recoil on scroll container
  const containerScale = Array.from({ length: SCROLL_EVENTS }).reduce<number>((acc, _, i) => {
    const lf = launchFrame(i);
    const spr = spring({ fps, frame: frame - lf, config: { stiffness: 350, damping: 14 } });
    return Math.max(acc, interpolate(spr, [0, 0.35, 1], [1, 1.05, 1]));
  }, 1);

  const totalTileW  = SCROLL_EVENTS * TILE_SIZE + (SCROLL_EVENTS - 1) * TILE_GAP;
  const tileRowLeft = (1080 - totalTileW) / 2;

  return (
    <AbsoluteFill style={{ background: "transparent", opacity: sceneFade }}>

      {/* Dashed line */}
      <svg style={{
        position: "absolute", top: 0, left: 0,
        width: 1080, height: 1920, pointerEvents: "none",
        opacity: lineOp,
      }} width="1080" height="1920">
        <line
          x1={LINE_X} y1={LINE_TOP_Y} x2={LINE_X} y2={LINE_BOT_Y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="6" strokeDasharray="14 11" strokeLinecap="round"
        />
      </svg>

      {/* Tile row */}
      <div style={{
        position: "absolute", top: TILE_ROW_Y, left: tileRowLeft,
        display: "flex", gap: TILE_GAP,
      }}>
        {Array.from({ length: SCROLL_EVENTS }).map((_, i) => (
          <Tile
            key={i}
            label={SCROLL_LABELS[i]}
            enterProgress={tileEnterSprings[i]}
            color={TILE_COLORS[i]}
          />
        ))}
      </div>

      {/* Travelling labels */}
      {Array.from({ length: SCROLL_EVENTS }).map((_, i) => {
        const p = labelProgresses[i];
        if (p < 0) return null;
        return (
          <TravellingCall
            key={i}
            label={`${SCROLL_LABELS[i]}`}
            progress={p}
            color={TILE_COLORS[i]}
          />
        );
      })}

      {/* Scroll container + listener label */}
      <div style={{
        position: "absolute",
        top: SCROLL_Y, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: entranceO, transform: `translateY(${entranceY}px)`,
      }}>
        {/* Listener label above */}
        <div style={{
          fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700,
          color: COLORS.muted, marginBottom: 14,
          letterSpacing: "0.02em",
        }}>
          container.addEventListener(
          <span style={{ color: COLORS.string }}>'scroll'</span>,{" "}
          <span style={{ color: COLORS.fnName }}>onScroll</span>)
        </div>

        <div style={{ transform: `scale(${containerScale})`, transformOrigin: "center top" }}>
          <ScrollMock scrollPos={scrollPos} active={isActive} frame={frame} />
        </div>
      </div>

    </AbsoluteFill>
  );
};
