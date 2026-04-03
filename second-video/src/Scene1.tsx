// Scene 1 — "You're calling a function every single time you scroll… and that's fine"

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ── Layout ─────────────────────────────────────────────────────────────────────
const CX           = 540;
const CONTAINER_CY = 1000;
const CONTAINER_W  = 800;
const CONTAINER_H  = 440;

const CONT_TOP    = CONTAINER_CY - CONTAINER_H / 2;
const CONT_BOTTOM = CONTAINER_CY + CONTAINER_H / 2;

// ── Timing ─────────────────────────────────────────────────────────────────────
const SCROLL_EVENTS  = 56;      // Doubled
const EVENTS_START   = 10;
const EVENT_INTERVAL = 2;       // Tighter interval for more bursts
const TRAVEL_FRAMES  = 32;

const eventFrame = (i: number) => EVENTS_START + i * EVENT_INTERVAL;

// ── Border-edge spawn ─────────────────────────────────────────────────────────
function getBorderSpawn(angleDeg: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const hw  = CONTAINER_W / 2;
  const hh  = CONTAINER_H / 2;
  const tx  = cos !== 0 ? hw / Math.abs(cos) : Infinity;
  const ty  = sin !== 0 ? hh / Math.abs(sin) : Infinity;
  const t   = Math.min(tx, ty);
  return [cos * t, sin * t];
}

// 56 directions (repeats cycle with variation)
const BURST_CONFIG = Array.from({ length: 56 }).map((_, i) => ({
  angle: -180 + (i * 37) % 360, 
  dist: 280 + (i * 17) % 100
}));

// ── Scroll container mock ──────────────────────────────────────────────────────
const ROWS     = 20;
const ROW_H    = 52;
const ROW_GAP  = 10;
const VISIBLE_H = CONTAINER_H - 40;
const TOTAL_CONTENT_H = ROWS * (ROW_H + ROW_GAP);

export const ROW_STYLES = [
  { bg: "rgba(121,192,255,0.08)", border: "rgba(121,192,255,0.15)", dot: COLORS.accentB },
  { bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.07)", dot: COLORS.accentA },
  { bg: "rgba(126,231,135,0.06)", border: "rgba(126,231,135,0.12)", dot: COLORS.accentA },
  { bg: "rgba(210,168,255,0.06)", border: "rgba(210,168,255,0.12)", dot: COLORS.accentD },
  { bg: "rgba(255,123,114,0.06)", border: "rgba(255,123,114,0.12)", dot: COLORS.accentC },
];

const ScrollMock: React.FC<{ scrollPos: number; active: boolean }> = ({ scrollPos, active }) => {
  const THUMB_H = 60;
  const TRACK_H = CONTAINER_H - 24;
  const thumbTop = scrollPos * (TRACK_H - THUMB_H);
  const maxScroll = TOTAL_CONTENT_H - VISIBLE_H;
  const contentOffset = scrollPos * maxScroll;

  return (
    <div style={{
      width: CONTAINER_W, height: CONTAINER_H,
      background: "#0D1117",
      border: `2.5px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.14)"}`,
      borderRadius: 24, overflow: "hidden",
      boxShadow: active
        ? `0 0 48px ${COLORS.accentB}30, 0 32px 80px rgba(0,0,0,0.6)`
        : "0 32px 80px rgba(0,0,0,0.5)",
      display: "flex", flexDirection: "row",
    }}>
      {/* Content */}
      <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
        <div style={{
          position: "absolute",
          top: -contentOffset, left: 0, right: 0,
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

      {/* Scrollbar */}
      <div style={{ width: 16, background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.07)", position: "relative", flexShrink: 0 }}>
        <div style={{
          position: "absolute", top: thumbTop, left: 2, right: 2,
          height: THUMB_H, borderRadius: 5,
          background: active ? COLORS.accentB : "rgba(255,255,255,0.22)",
          boxShadow: active ? `0 0 10px ${COLORS.accentB}88` : "none",
        }} />
      </div>
    </div>
  );
};

// ── Flying burst ───────────────────────────────────────────────────────────────
const ScrollBurst: React.FC<{ index: number; frame: number }> = ({ index, frame }) => {
  const sf  = eventFrame(index);
  const age = frame - sf;
  if (age < 0 || age > TRAVEL_FRAMES + 6) return null;

  const cfg = BURST_CONFIG[index];
  const rad = (cfg.angle * Math.PI) / 180;
  const [bx, by] = getBorderSpawn(cfg.angle);

  const t = clamp(age / TRAVEL_FRAMES);
  const e = easeOut(t);

  const x = CX + bx + Math.cos(rad) * cfg.dist * e;
  const y = CONTAINER_CY + by + Math.sin(rad) * cfg.dist * e;

  const opacity = t < 0.25 ? t / 0.25 : interpolate(t, [0.25, 1], [1, 0]);
  const scale   = interpolate(e, [0, 1], [0.5, 1]);

  return (
    <div style={{
      position: "absolute", left: x, top: y,
      transform: `translate(-50%, -50%) scale(${scale})`,
      opacity, pointerEvents: "none", zIndex: 20, whiteSpace: "nowrap",
    }}>
      <div style={{
        fontFamily: FONTS.mono, fontSize: 26, fontWeight: 700,
        color: COLORS.accentB, background: `${COLORS.accentB}18`,
        border: `1.5px solid ${COLORS.accentB}55`,
        borderRadius: 10, padding: "8px 18px", letterSpacing: "0.02em",
      }}>
        scrolling…
      </div>
    </div>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  const eventsTriggered = Array.from({ length: SCROLL_EVENTS }).filter(
    (_, i) => frame >= eventFrame(i)
  ).length;

  const scrollPos = clamp((eventsTriggered / SCROLL_EVENTS) * 0.4);

  const isActive = Array.from({ length: SCROLL_EVENTS }).some((_, i) => {
    const age = frame - eventFrame(i);
    return age >= 0 && age < 14;
  });

  const entranceO = easeOut(clamp(prog(frame, 0, 20) * 4));
  const entranceY = interpolate(easeOut(prog(frame, 0, 22)), [0, 1], [40, 0]);

  // Container scales up/down on each burst
  const containerScalePulse = Array.from({ length: SCROLL_EVENTS }).reduce<number>((acc, _, i) => {
    const age = frame - eventFrame(i);
    if (age >= 0 && age < 18) {
      const p = age / 18;
      const pulse = Math.sin(p * Math.PI);
      return Math.max(acc, pulse * 0.055);
    }
    return acc;
  }, 0);
  const containerScale = 1 + containerScalePulse;

  const codeO = easeOut(prog(frame, 10, 28));
  const sceneFade = interpolate(frame, [145, 160], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const counterO = easeOut(prog(frame, 25, 40));

  return (
    <AbsoluteFill style={{ background: "transparent", opacity: sceneFade, overflow: "hidden" }}>
      <div style={{
        position: "absolute", top: CONT_TOP - 200, left: "50%",
        transform: "translateX(-50%)",
        opacity: counterO, zIndex: 30, textAlign: "center", whiteSpace: "nowrap",
      }}>
        <span style={{ fontFamily: FONTS.display, fontSize: 52, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.01em" }}>
          browser fires{" "}
          <span style={{ color: COLORS.accentB, fontWeight: 900 }}>{eventsTriggered}×</span>{" "}
          per second
        </span>
      </div>

      {Array.from({ length: SCROLL_EVENTS }).map((_, i) => (
        <ScrollBurst key={i} index={i} frame={frame} />
      ))}

      <div style={{
        position: "absolute", top: CONTAINER_CY, left: "50%",
        transform: `translate(-50%, -50%) translateY(${entranceY}px) scale(${containerScale})`,
        transformOrigin: "center center",
        opacity: entranceO,
        zIndex: 5,
        filter: containerScalePulse > 0.01
          ? `drop-shadow(0 0 ${Math.round(containerScalePulse * 20)}px ${COLORS.accentB})`
          : "none",
      }}>
        <ScrollMock scrollPos={scrollPos} active={isActive} />
      </div>

      <div style={{
        position: "absolute", top: CONT_BOTTOM + 200, left: "50%",
        transform: "translateX(-50%)",
        opacity: codeO, zIndex: 10, width: "70%",
      }}>
        <div style={{
          background: COLORS.codeBg,
          border: "1.5px solid rgba(255,255,255,0.09)",
          borderRadius: 16, padding: "22px 36px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700,
          lineHeight: 1.75, display: "flex", flexDirection: "column", gap: 0,
        }}>
          <div>
            <span style={{ color: COLORS.value }}>container</span><span style={{ color: COLORS.punctuation }}>.</span>
            <span style={{ color: COLORS.fnName }}>addEventListener</span><span style={{ color: COLORS.punctuation }}>(</span>
            <span style={{ color: COLORS.string }}>'scroll'</span><span style={{ color: COLORS.punctuation }}>, ()</span> <span style={{ color: COLORS.keyword }}>={">"}</span> <span style={{ color: COLORS.punctuation }}>{"{"}</span>
          </div>
          <div style={{ paddingLeft: 48 }}>
            <span style={{ color: COLORS.fnName }}>console</span><span style={{ color: COLORS.punctuation }}>.</span>
            <span style={{ color: COLORS.fnName }}>log</span><span style={{ color: COLORS.punctuation }}>(</span>
            <span style={{ color: COLORS.string }}>'scrolling...'</span><span style={{ color: COLORS.punctuation }}>);</span>
          </div>
          <div><span style={{ color: COLORS.punctuation }}>{"}"}</span><span style={{ color: COLORS.punctuation }}>)</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};