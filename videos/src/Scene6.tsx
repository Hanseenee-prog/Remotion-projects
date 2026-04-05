import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

function tok(color: string, text: string) {
  return <span style={{ color }}>{text}</span>;
}

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 16], [30, 0], { extrapolateRight: "clamp" });

  // Code block dramatic entrance
  const codeScale = spring({ frame, fps, from: 0.85, to: 1, config: { damping: 12, stiffness: 160 }, delay: 22 });
  const codeOp = interpolate(frame, [18, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Glow pulse
  const glowOp = interpolate(
    frame % 45,
    [0, 22, 45],
    [0.4, 0.9, 0.4]
  );

  // Sub-label
  const subOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [55, 75], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Checkmarks
  const checks = [
    { text: "Deep clone — nested too", delay: 65 },
    { text: "Dates stay as Dates", delay: 80 },
    { text: "undefined preserved", delay: 95 },
  ];

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 60 }}>
        <div style={{ fontFamily: display, fontSize: 60, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          Use{" "}
          <span style={{ color: C.accentA }}>structuredClone()</span>
          <br />instead.
        </div>
      </div>

      {/* THE CODE — center stage */}
      <div style={{
        opacity: codeOp,
        transform: `scale(${codeScale})`,
        position: "relative",
        marginBottom: 48,
      }}>
        {/* Glow */}
        <div style={{
          position: "absolute",
          inset: -20,
          borderRadius: 32,
          background: `rgba(126,231,135,${glowOp * 0.15})`,
          filter: "blur(24px)",
          zIndex: 0,
        }} />

        <div style={{
          position: "relative",
          zIndex: 1,
          background: C.codeBg,
          borderRadius: 24,
          border: `2px solid rgba(126,231,135,0.4)`,
          padding: "44px 48px",
        }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
            {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
              <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
            ))}
          </div>

          <div style={{ fontFamily: mono, fontSize: 40, lineHeight: "64px" }}>
            {tok(C.keyword, "const ")}
            {tok(C.codeText, "clone")}
            {tok(C.punctuation, " = ")}
            <br />
            <span style={{ paddingLeft: 36 }}>
              {tok(C.fnName, "structuredClone")}
              {tok(C.punctuation, "(")}
              {tok(C.codeText, "original")}
              {tok(C.punctuation, ")")}
            </span>
          </div>
        </div>
      </div>

      {/* Checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, opacity: subOp, transform: `translateY(${subY}px)` }}>
        {checks.map((c, i) => {
          const op = interpolate(frame, [c.delay, c.delay + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x = interpolate(frame, [c.delay, c.delay + 16], [-30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              opacity: op,
              transform: `translateX(${x}px)`,
              display: "flex",
              alignItems: "center",
              gap: 16,
              fontFamily: display,
              fontSize: 32,
              color: C.accentA,
              fontWeight: 600,
            }}>
              <span style={{ fontSize: 28 }}>✅</span>
              {c.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
