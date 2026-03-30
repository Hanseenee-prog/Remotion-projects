// Scene 9 — "Want to learn about Throttle next? Follow for more!"

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardSpring = spring({
    fps,
    frame: Math.max(0, frame - 4),
    config: { damping: 14, stiffness: 150 },
  });
  const cardScale   = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  const glowP = interpolate(frame % 50, [0, 25, 50], [0.12, 0.28, 0.12], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>
      <div style={{
        opacity: cardOpacity,
        transform: `scale(${cardScale})`,
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        borderRadius: 28,
        background: "rgba(255,255,255,0.05)",
        border: "1.5px solid rgba(255,255,255,0.12)",
        boxShadow: `0 0 80px ${COLORS.accentA}${Math.round(glowP * 255).toString(16).padStart(2, "0")}`,
        padding: "60px 64px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 36,
      }}>

        {/* Avatar ring */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: `conic-gradient(${COLORS.accentA}, ${COLORS.accentB}, ${COLORS.accentA})`,
          padding: 3,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: "50%",
            background: COLORS.codeBg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 40 }}>✦</span>
          </div>
        </div>

        {/* Throttle teaser */}
        <div style={{ ...fadeUp(frame, 12, 16), textAlign: "center" }}>
          <div style={{
            fontFamily: FONTS.display, fontSize: 40, fontWeight: 700,
            color: COLORS.muted, marginBottom: 16,
          }}>
            Want to learn about
          </div>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 56, fontWeight: 900,
            background: `linear-gradient(90deg, ${COLORS.accentA}, ${COLORS.accentB})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Throttle
          </div>
          <div style={{
            fontFamily: FONTS.display, fontSize: 40, fontWeight: 700,
            color: COLORS.muted, marginTop: 16,
          }}>
            next?
          </div>
        </div>

        {/* CTA */}
        <div style={{ ...fadeUp(frame, 22, 16), textAlign: "center" }}>
          <div style={{
            fontFamily: FONTS.display,
            fontSize: 56,
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            background: `linear-gradient(90deg, ${COLORS.accentA}, ${COLORS.accentB})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Follow for more.
          </div>
        </div>

        {/* Check caption */}
        <div style={{ ...fadeUp(frame, 30, 14) }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 32px", borderRadius: 100,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <span style={{ fontSize: 28 }}>📎</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>
              Full code in the caption
            </span>
          </div>
        </div>

      </div>
    </AbsoluteFill>
  );
};
