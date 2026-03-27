// Scene 2 — "Here's why. CSS animates between states — a before and an after."
//
// Visual: Two state boxes connected by an arrow — "before" and "after".
// A line animates across the arrow to illustrate the in-between.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function fadeUp(frame: number, startFrame: number, duration = 18, distance = 28) {
  const t = Math.min(Math.max((frame - startFrame) / duration, 0), 1);
  const e = easeOut(t);
  return {
    opacity: e,
    transform: `translateY(${(1 - e) * distance}px)`,
  };
}

function useTyped(text: string, startFrame: number, cps = 38, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return text.slice(0, chars);
}

// ─── State Box ────────────────────────────────────────────────────────────────
const StateBox: React.FC<{
  label: string;
  sublabel: string;
  accent: string;
  style?: React.CSSProperties;
}> = ({ label, sublabel, accent, style }) => (
  <div
    style={{
      width: 280,
      padding: "36px 32px",
      borderRadius: 18,
      background: "rgba(255,255,255,0.05)",
      border: `1.5px solid ${accent}44`,
      boxShadow: `0 0 40px ${accent}18`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
      ...style,
    }}
  >
    <span
      style={{
        fontFamily: FONTS.mono,
        fontSize: 22,
        color: COLORS.comment,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      {sublabel}
    </span>
    <span
      style={{
        fontFamily: FONTS.display,
        fontSize: 36,
        fontWeight: 700,
        color: accent,
        letterSpacing: "-0.01em",
      }}
    >
      {label}
    </span>
  </div>
);

// ─── Animated Arrow ───────────────────────────────────────────────────────────
const AnimatedArrow: React.FC<{ progress: number }> = ({ progress }) => {
  const lineW = 220;
  const filled = progress * lineW;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        position: "relative",
        width: lineW + 24,
      }}
    >
      {/* Track */}
      <div
        style={{
          width: lineW,
          height: 3,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 2,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Fill */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: filled,
            height: "100%",
            background: `linear-gradient(90deg, ${COLORS.accentA}, ${COLORS.accentB})`,
            borderRadius: 2,
            transition: "none",
          }}
        />
      </div>
      {/* Arrow head */}
      <div
        style={{
          width: 0,
          height: 0,
          borderTop: "9px solid transparent",
          borderBottom: "9px solid transparent",
          borderLeft: `14px solid ${progress > 0.95 ? COLORS.accentB : "rgba(255,255,255,0.15)"}`,
          transition: "border-left-color 0.2s",
        }}
      />
    </div>
  );
};

// ─── Dot that travels along the arrow ─────────────────────────────────────────
const TravelDot: React.FC<{ progress: number }> = ({ progress }) => {
  if (progress <= 0.01 || progress >= 0.99) return null;
  const lineW = 220;
  const x = progress * lineW;
  return (
    <div
      style={{
        position: "absolute",
        left: x - 9,
        top: "50%",
        transform: "translateY(-50%)",
        width: 18,
        height: 18,
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${COLORS.accentA}, ${COLORS.accentB})`,
        boxShadow: `0 0 16px ${COLORS.accentA}88`,
      }}
    />
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const headline1 = "Here's why.";
  const headline2 = "CSS animates between";
  const headline3 = "states —";

  const sub1 = "a before and an after.";

  const th1 = useTyped(headline1, 0, 40, frame);
  const th2 = useTyped(headline2, 18, 40, frame);
  const th3 = useTyped(headline3, 36, 40, frame);
  const ts1 = useTyped(sub1, 52, 40, frame);

  // State boxes appear
  const beforeBoxStyle = fadeUp(frame, 40, 20);
  const afterBoxStyle = fadeUp(frame, 52, 20);
  const arrowStyle = fadeUp(frame, 46, 16);

  // Arrow fill progress: travels from 0→1 between frame 60 and frame 90
  const arrowProgress = interpolate(frame, [60, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "in-between" label
  const inBetweenStyle = fadeUp(frame, 78, 16);

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
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 70 }}>
        {[
          { text: th1, start: 0, dim: false },
          { text: th2, start: 10, dim: false },
          { text: th3, start: 24, dim: false },
        ].map(({ text, start, dim }, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(frame, start, 16),
              fontFamily: FONTS.display,
              fontSize: 68,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        ))}
        <div
          style={{
            ...fadeUp(frame, 46, 16),
            fontFamily: FONTS.display,
            fontSize: 56,
            fontWeight: 600,
            color: COLORS.muted,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
            marginTop: 4,
          }}
        >
          {ts1}
        </div>
      </div>

      {/* ── State diagram ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          marginTop: 20,
        }}
      >
        <div style={beforeBoxStyle}>
          <StateBox
            label="opacity: 0"
            sublabel="before"
            accent={COLORS.accentC}
          />
        </div>

        {/* Arrow zone */}
        <div
          style={{
            ...arrowStyle,
            position: "relative",
            display: "flex",
            alignItems: "center",
            height: 60,
            marginTop: 0,
          }}
        >
          <AnimatedArrow progress={arrowProgress} />
          <TravelDot progress={arrowProgress} />
        </div>

        <div style={afterBoxStyle}>
          <StateBox
            label="opacity: 1"
            sublabel="after"
            accent={COLORS.accentA}
          />
        </div>
      </div>

      {/* ── "in-between" callout ────────────────────────────── */}
      <div
        style={{
          ...inBetweenStyle,
          marginTop: 40,
          padding: "16px 36px",
          borderRadius: 100,
          background: "rgba(126,231,135,0.08)",
          border: `1px solid ${COLORS.accentA}33`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.accentA,
            letterSpacing: "0.02em",
          }}
        >
          CSS needs an in-between to animate
        </span>
      </div>
    </AbsoluteFill>
  );
};
