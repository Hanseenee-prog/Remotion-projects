// Scene 8 — "Check caption for more details. If you enjoyed this video, follow for more."
//
// Visual: Clean CTA card centred on screen. Profile avatar placeholder + follow button.
// Minimal, elegant exit to the series.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
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

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();

  // Card entrance
  const cardT = Math.min(Math.max((frame - 4) / 22, 0), 1);
  const cardScale = easeOutBack(cardT);
  const cardOpacity = interpolate(frame, [4, 18], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered inner items
  const checkCaptionStyle = fadeUp(frame, 20, 16);
  const followStyle = fadeUp(frame, 30, 16);
  const taglineStyle = fadeUp(frame, 40, 16);

  // Glow pulse
  const glowOpacity = interpolate(
    frame % 50,
    [0, 25, 50],
    [0.15, 0.3, 0.15],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
      }}
    >
      {/* ── CTA card ─────────────────────────────────────────── */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `scale(${cardScale})`,
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          borderRadius: 28,
          background: "rgba(255,255,255,0.05)",
          border: `1.5px solid rgba(255,255,255,0.12)`,
          boxShadow: `0 0 80px ${COLORS.accentA}${Math.round(glowOpacity * 255).toString(16).padStart(2, "0")}`,
          padding: "60px 64px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 36,
        }}
      >
        {/* Avatar ring */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: `conic-gradient(${COLORS.accentA}, ${COLORS.accentB}, ${COLORS.accentA})`,
            padding: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              background: COLORS.codeBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 40 }}>✦</span>
          </div>
        </div>

        {/* Caption reminder */}
        <div style={checkCaptionStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "16px 32px",
              borderRadius: 100,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <span style={{ fontSize: 28 }}>📎</span>
            <span
              style={{
                fontFamily: FONTS.display,
                fontSize: 26,
                fontWeight: 600,
                color: COLORS.offWhite,
              }}
            >
              Check caption for more details
            </span>
          </div>
        </div>

        {/* Main CTA */}
        <div style={{ ...followStyle, textAlign: "center" }}>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 52,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
            }}
          >
            Enjoyed this?
          </div>
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              background: `linear-gradient(90deg, ${COLORS.accentA}, ${COLORS.accentB})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Follow for more.
          </div>
        </div>

        {/* Tagline */}
        <div style={taglineStyle}>
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 26,
              fontWeight: 400,
              color: COLORS.muted,
              letterSpacing: "0.01em",
            }}
          >
            CSS tips, every week. 🎨
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
