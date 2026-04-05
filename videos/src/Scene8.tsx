import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const display = FONTS.display;
const mono = FONTS.mono;

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // bg accent circle
  const circleScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 20, stiffness: 80 }, delay: 0 });

  const line1Op = interpolate(frame, [10, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1Y = interpolate(frame, [10, 26], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const line2Op = interpolate(frame, [28, 44], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2Y = interpolate(frame, [28, 44], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const dividerOp = interpolate(frame, [48, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const pillScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, stiffness: 200 }, delay: 60 });

  const handleOp = interpolate(frame, [80, 96], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const handleY = interpolate(frame, [80, 96], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtle pulse on pill
  const pillGlow = interpolate(
    (frame - 65) < 0 ? 0 : (frame - 65) % 50,
    [0, 25, 50],
    [0.3, 0.8, 0.3],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px`, display: "flex", flexDirection: "column", justifyContent: "center" }}>

      {/* Decorative bg circle */}
      <div style={{
        position: "absolute",
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(126,231,135,0.08) 0%, transparent 70%)",
        transform: `scale(${circleScale})`,
        top: "50%",
        left: "50%",
        marginLeft: -300,
        marginTop: -300,
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* Main headline */}
        <div style={{
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
          fontFamily: display,
          fontSize: 72,
          fontWeight: 900,
          color: C.white,
          lineHeight: 1.05,
          marginBottom: 24,
        }}>
          Stop using
        </div>

        <div style={{
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
          fontFamily: display,
          fontSize: 72,
          fontWeight: 900,
          color: C.accentC,
          lineHeight: 1.05,
          marginBottom: 32,
        }}>
          hacks.
        </div>

        {/* Sub */}
        <div style={{
          opacity: line2Op,
          transform: `translateY(${line2Y}px)`,
          fontFamily: display,
          fontSize: 36,
          color: C.muted,
          fontWeight: 500,
          lineHeight: 1.5,
          marginBottom: 60,
        }}>
          Use what the browser<br />already gives you.
        </div>

        {/* Divider */}
        <div style={{
          opacity: dividerOp,
          height: 1,
          background: C.border,
          marginBottom: 52,
        }} />

        {/* Follow pill */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{
            transform: `scale(${pillScale})`,
            position: "relative",
          }}>
            {/* Glow */}
            <div style={{
              position: "absolute",
              inset: -12,
              borderRadius: 100,
              background: `rgba(126,231,135,${pillGlow * 0.15})`,
              filter: "blur(16px)",
            }} />
            <div style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(126,231,135,0.12)",
              border: "2px solid rgba(126,231,135,0.5)",
              borderRadius: 100,
              padding: "18px 36px",
            }}>
              <span style={{ fontSize: 32 }}>🫶</span>
              <span style={{ fontFamily: display, fontSize: 36, fontWeight: 700, color: C.accentA }}>
                Follow for more tips
              </span>
            </div>
          </div>
        </div>

        {/* Handle */}
        <div style={{
          opacity: handleOp,
          transform: `translateY(${handleY}px)`,
          textAlign: "center",
          marginTop: 36,
          fontFamily: mono,
          fontSize: 30,
          color: C.subtle,
          letterSpacing: 1,
        }}>
          @hee_codes
        </div>

      </div>
    </AbsoluteFill>
  );
};
