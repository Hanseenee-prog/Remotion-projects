// Scene 3 — "We use debounce — waits until you stop typing"
//
// Timeline:
//   0–50   : "We use" + "Debounce" stagger in ("Debounce" bigger, below "We use")
//   50–60  : "We use" fades out, "Debounce" floats up to top anchor
//   60–170 : Diagram appears — keystrokes track | clock | searchMovies()
//            Sweep plays frames 75–155. "8 keystrokes → 1 API call" at frame 140.
//   172–180: Everything fades out

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(Math.max(v, lo), hi);
}
function prog(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}

// ─── Constants ────────────────────────────────────────────────────────────────
// Narrower timeline so the three sections balance comfortably on 1000px safe width
const TIMELINE_W   =  450;   // just the keystrokes section width
const SPIKE_HEIGHTS = [72, 84, 68, 80, 74, 86, 70, 78];

// Keystroke positions (0–1 within TIMELINE_W)
const KEYSTROKES = [0.06, 0.17, 0.27, 0.36, 0.45, 0.54, 0.64, 0.74];
const DEBOUNCE_FIRE_POS = 0.93; // within the keystrokes section

// Sweep: frame 75 → 128  (finishes well before 140)
const SWEEP_START = 75;
const SWEEP_END   = 128;

// Sections are laid out horizontally across safeWidth (1000px):
//   Keystrokes block : 560px  (left-anchored)
//   Gap              :  60px
//   Clock column     :  80px  (centred)
//   Gap              :  60px
//   searchMovies()   : rest

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Global fade-out (frames 172–180) ────────────────────────────────────────
  const globalOut = interpolate(frame, [200, 210], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── "Debounce" word: intro (0–30) then float up (50–60) ────────────────────
  const debounceInP  = easeOut(prog(frame, 10, 20));
  const debounceUpP  = easeOut(prog(frame, 50, 62));

  // Starts center-ish, floats to top
  const debounceTop  = interpolate(debounceUpP, [0, 1], [1920 / 2 + 40, SAFE.top + 650]);
  const weUseOpacity = interpolate(frame, [0, 1, 50, 58], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const weUseFadeIn  = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Diagram section visibility ───────────────────────────────────────────────
  const diagramIn = easeOut(prog(frame, 62, 76));

  // ── Sweep ────────────────────────────────────────────────────────────────────
  const sweepP = clamp((frame - SWEEP_START) / (SWEEP_END - SWEEP_START));

  // ── Clock + searchMovies appear tied to sweep position ──────────────────────
  const clockOpacity  = easeOut(clamp((sweepP - 0.72) / 0.12));
  const callOpacity   = easeOut(clamp((sweepP - 0.90) / 0.08));

  // ── Single call spring pop ───────────────────────────────────────────────────
  const callPopFrame = SWEEP_START + Math.round(DEBOUNCE_FIRE_POS * (SWEEP_END - SWEEP_START));
  const singleCallPop = spring({
    fps,
    frame: Math.max(0, frame - callPopFrame),
    config: { damping: 12, stiffness: 220 },
  });

  // ── "8 keystrokes → 1 API call" badge ───────────────────────────────────────
  const badgeOpacity = easeOut(prog(frame, 132, 142));

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>

      {/* ── "Debounce" — floats from center to top ────────────────────────── */}
      <div style={{
        position: "absolute",
        top: debounceTop,
        left: "50%",
        transform: "translateX(-50%)",
        opacity: debounceInP * globalOut,
        textAlign: "center",
        zIndex: 20,
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: interpolate(debounceUpP, [0, 1], [96, 72]),
          fontWeight: 900,
          color: COLORS.accentB,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          textShadow: `0 0 60px ${COLORS.accentA}44`,
        }}>
          Debounce
        </div>
      </div>

      {/* ── "We use" — appears under Debounce, fades out at frame 62 ────────── */}
      <div style={{
        position: "absolute",
        top: 1920 / 2  - 50,   // just above the Debounce starting position
        left: "50%",
        transform: "translateX(-50%)",
        opacity: weUseFadeIn * weUseOpacity * globalOut,
        textAlign: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: 60,
          fontWeight: 700,
          color: COLORS.white,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          We use
        </div>
      </div>

      {/* ── Diagram (visible from frame 62 onward) ───────────────────────────── */}
      <div style={{
        position: "absolute",
        top: "50%",
        left: SAFE.left + 20,
        right: SAFE.right + 20,
        transform: "translateY(-10%)",   // nudge up slightly so badge fits below
        opacity: diagramIn * globalOut,
      }}>

        {/* ── Three-column layout ───────────────────────────────────────────── */}
        {/*
          | Keystrokes section (560px) | gap(40) | Clock (100px) | gap(40) | searchMovies |
          Total: 560 + 40 + 100 + 40 + ~220 = 960px  ≈ safeWidth 1000px ✓
        */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          width: "100%",
        }}>

          {/* ── 1. Keystrokes block ─────────────────────────────────────────── */}
          <div style={{
            position: "relative",
            width: TIMELINE_W,
            height: 260,
            flexShrink: 0,
          }}>
            {/* Track */}
            <div style={{
              position: "absolute",
              top: 140,
              left: 0,
              width: 350,
              height: 4,
              background: "rgba(255,255,255,0.12)",
              borderRadius: 2,
            }} />

            {/* Sweep fill */}
            <div style={{
              position: "absolute",
              top: 140,
              left: 0,
              width: sweepP * TIMELINE_W - 100,
              height: 4,
              background: COLORS.accentB,
              borderRadius: 2,
              boxShadow: `0 0 10px ${COLORS.accentB}`,
            }} />

            {/* Spikes */}
            {KEYSTROKES.map((pos, i) => {
              const visible = sweepP >= pos;
              const h = SPIKE_HEIGHTS[i];
              return (
                <div key={i} style={{
                  position: "absolute",
                  left: pos * TIMELINE_W,
                  top: 140 - h,
                  width: 6,
                  height: h,
                  background: COLORS.accentC,
                  borderRadius: 3,
                  opacity: visible ? 0.88 : 0,
                  boxShadow: `0 0 10px ${COLORS.accentC}88`,
                }} />
              );
            })}

            {/* "keystrokes" label */}
            <div style={{
              position: "absolute",
              top: 158,
              left: "20.5%",
              fontFamily: FONTS.mono,
              fontSize: 33,
              color: COLORS.muted,
              textTransform: "uppercase"
            }}>
              keystrokes
            </div>
          </div>

          {/* ── Gap ─────────────────────────────────────────────────────────── */}
          <div style={{ width: 10, flexShrink: 0 }} />

          {/* ── 2. Clock column ─────────────────────────────────────────────── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            opacity: clockOpacity,
            flexShrink: 0,
            width: 120,
          }}>
            {/* Clock — white tinted via filter */}
            <span style={{
              fontSize: 90,
              lineHeight: 1,
              filter: "brightness(0) invert(1) drop-shadow(0 0 16px rgba(255,255,255,0.35))",
            }}>
              <b>⏱</b>
            </span>
            {/* 1s label — white */}
            <span style={{
              fontFamily: FONTS.mono,
              fontSize: 36,
              fontWeight: 800,
              color: COLORS.white,
              letterSpacing: "0.02em",
            }}>
              1s
            </span>
          </div>

          {/* ── Gap ─────────────────────────────────────────────────────────── */}
          <div style={{ width: 54, flexShrink: 0 }} />

          {/* ── 3. searchMovies() card ──────────────────────────────────────── */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: callOpacity,
            flex: 1,
          }}>

            {/* Card: bg accentB, border animates accentB → accentA as spring settles */}
            <div style={{
              transform: `scale(${singleCallPop})`,
              transformOrigin: "top center",
              padding: "20px 28px",
              borderRadius: 16,
              background: "#0D0D0D",
              border: `2.5px solid ${singleCallPop > 0.7 ? COLORS.accentB : COLORS.accentB}`,
              fontFamily: FONTS.mono,
              fontSize: 26,
              fontWeight: 700,
              color: COLORS.accentB,
              whiteSpace: "nowrap",
              boxShadow: `0 0 32px ${COLORS.accentB}55`,
              textAlign: "center",
            }}>
              searchMovies()
            </div>
          </div>

        </div>

        {/* ── "8 keystrokes → 1 API call" badge ─────────────────────────────── */}
        <div style={{
          marginTop: 72,
          display: "flex",
          justifyContent: "center",
          opacity: badgeOpacity,
        }}>
          <div style={{
            padding: "22px 40px",
            borderRadius: 16,
            background: `${COLORS.accentB}10`,
            border: `1px solid ${COLORS.accentB}44`,
            boxShadow: `0 0 40px ${COLORS.accentB}14`,
          }}>
            <span style={{
              fontFamily: FONTS.display,
              fontSize: 36,
              fontWeight: 700,
              color: COLORS.accentB,
              letterSpacing: "0.01em",
            }}>
              8 keystrokes → 1 API call
            </span>
          </div>
        </div>

      </div>

    </AbsoluteFill>
  );
};