// Scene 7 — "So now… even with display involved, your card can fade in, move,
//             and scale smoothly. No JavaScript. No hacks. No setTimeout."
//
// Visual: The button is shown, card smoothly fades + slides + scales in.
// Three "No X" badges pop in one by one at the bottom.

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
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function fadeUp(frame: number, startFrame: number, duration = 18, distance = 28) {
  const t = Math.min(Math.max((frame - startFrame) / duration, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * distance}px)` };
}

function useTyped(text: string, startFrame: number, cps = 38, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return text.slice(0, chars);
}

// ─── Smooth animated card ─────────────────────────────────────────────────────
const SmoothCard: React.FC<{ frame: number; fps: number; triggerFrame: number }> = ({
  frame,
  fps,
  triggerFrame,
}) => {
  const elapsed = frame - triggerFrame;

  const opacity = interpolate(elapsed, [0, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const translateY = interpolate(elapsed, [0, 22], [32, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  const scale = interpolate(elapsed, [0, 22], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeOut,
  });

  if (elapsed < 0) return null;

  return (
    <div
      style={{
        width: 560,
        borderRadius: 20,
        background: "rgba(126,231,135,0.07)",
        border: `1.5px solid ${COLORS.accentA}44`,
        padding: "40px 44px",
        backdropFilter: "blur(12px)",
        boxShadow: `0 24px 64px rgba(0,0,0,0.5), 0 0 40px ${COLORS.accentA}18`,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
      }}
    >
      <p
        style={{
          fontFamily: FONTS.display,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.offWhite,
          margin: "0 0 14px 0",
          lineHeight: 1.3,
        }}
      >
        Every great UI deserves a graceful entrance.
      </p>
      <p
        style={{
          fontFamily: FONTS.display,
          fontSize: 20,
          color: COLORS.muted,
          margin: 0,
          lineHeight: 1.6,
        }}
      >
        With @starting-style, this card now fades, slides, and scales in — pure CSS.
      </p>

      {/* Subtle checkmark row */}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        {["fade in", "slide up", "scale in"].map((label, i) => {
          const badgeOpacity = interpolate(elapsed - 10 - i * 6, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={label}
              style={{
                opacity: badgeOpacity,
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 16px",
                borderRadius: 100,
                background: `${COLORS.accentA}18`,
                border: `1px solid ${COLORS.accentA}44`,
              }}
            >
              <span style={{ color: COLORS.accentA, fontSize: 16 }}>✓</span>
              <span style={{ fontFamily: FONTS.display, fontSize: 18, color: COLORS.accentA }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const line1 = "So now…";
  const tl1 = useTyped(line1, 0, 40, frame);

  // Button appears at frame 20
  const btnStyle = fadeUp(frame, 18, 18);

  // Card triggers at frame 45 (smooth entrance)
  const CARD_TRIGGER = 45;

  // "No X" badges
  const noItems = ["No JavaScript.", "No hacks.", "No setTimeout."];
  const badgeStartFrames = [90, 102, 114];

  // Bottom caption
  const cap = "Pure CSS. Display animated.";
  const tc = useTyped(cap, 120, 38, frame);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: SAFE.top + 80,
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
      }}
    >
      {/* ── Headline ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 52 }}>
        <div
          style={{
            ...fadeUp(frame, 0, 14),
            fontFamily: FONTS.display,
            fontSize: 72,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {tl1}
        </div>
        <div
          style={{
            ...fadeUp(frame, 10, 14),
            fontFamily: FONTS.display,
            fontSize: 52,
            fontWeight: 500,
            color: COLORS.muted,
            lineHeight: 1.3,
          }}
        >
          {frame >= 10
            ? "even with display involved,"
            : ""}
        </div>
        <div
          style={{
            ...fadeUp(frame, 20, 14),
            fontFamily: FONTS.display,
            fontSize: 52,
            fontWeight: 500,
            color: COLORS.muted,
            lineHeight: 1.3,
          }}
        >
          {frame >= 20 ? "your card can animate smoothly." : ""}
        </div>
      </div>

      {/* ── Button ───────────────────────────────────────────── */}
      <div style={btnStyle}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "22px 48px",
            borderRadius: 14,
            background: frame >= CARD_TRIGGER
              ? "rgba(126,231,135,0.18)"
              : "rgba(255,255,255,0.08)",
            border: `1.5px solid ${frame >= CARD_TRIGGER ? COLORS.accentA : "rgba(255,255,255,0.15)"}`,
          }}
        >
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 26,
              fontWeight: 600,
              color: frame >= CARD_TRIGGER ? COLORS.accentA : COLORS.offWhite,
            }}
          >
            Show Card
          </span>
        </div>
      </div>

      {/* ── Smooth card ──────────────────────────────────────── */}
      <div style={{ marginTop: 32 }}>
        <SmoothCard frame={frame} fps={fps} triggerFrame={CARD_TRIGGER} />
      </div>

      {/* ── "No X" badges ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 18,
          marginTop: 36,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {noItems.map((label, i) => {
          const t = Math.min(
            Math.max((frame - badgeStartFrames[i]) / 14, 0),
            1
          );
          const e = easeOutBack(Math.min(t, 1));
          return (
            <div
              key={label}
              style={{
                opacity: t > 0 ? interpolate(t, [0, 0.4], [0, 1], { extrapolateRight: "clamp" }) : 0,
                transform: `scale(${t > 0 ? e : 0.7})`,
                padding: "14px 30px",
                borderRadius: 100,
                background: "rgba(126,231,135,0.1)",
                border: `1.5px solid ${COLORS.accentA}55`,
                boxShadow: t >= 0.9 ? `0 0 24px ${COLORS.accentA}22` : "none",
              }}
            >
              <span
                style={{
                  fontFamily: FONTS.display,
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.accentA,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── Bottom caption ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 50,
          left: SAFE.left + 20,
          right: SAFE.right + 20,
          ...fadeUp(frame, 118, 16),
          fontFamily: FONTS.display,
          fontSize: 34,
          fontWeight: 500,
          color: COLORS.muted,
        }}
      >
        {tc}
      </div>
    </AbsoluteFill>
  );
};
