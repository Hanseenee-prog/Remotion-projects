import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

function tok(color: string, text: string) {
  return <span style={{ color }}>{text}</span>;
}

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const slideIn = interpolate(frame, [0, 18], [60, 0], { extrapolateRight: "clamp" });
  const fadeIn = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  const consoleOp = interpolate(frame, [15, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const result1Op = interpolate(frame, [36, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const result2Op = interpolate(frame, [52, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Bug flash effect — red pulse when result2 appears
  const bugPulse = interpolate(frame, [64, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const bugScale = interpolate(frame, [64, 72], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const labelOp = interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [75, 95], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const codeFontSize = 33;
  const lineH = 50;

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Heading */}
      <div style={{
        opacity: fadeIn,
        transform: `translateY(${slideIn}px)`,
        marginBottom: 44,
      }}>
        <div style={{ fontFamily: display, fontSize: 58, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          …and it <span style={{ color: C.accentC }}>also changed</span>
          <br />the original.
        </div>
      </div>

      {/* Code block — console.log calls */}
      <div style={{
        opacity: consoleOp,
        background: C.codeBg,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: "32px 40px",
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: codeFontSize, lineHeight: `${lineH}px` }}>
          <div>
            {tok(C.fnName, "console")}
            {tok(C.punctuation, ".")}
            {tok(C.fnName, "log")}
            {tok(C.punctuation, "(")}
            {tok(C.codeText, "clone")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "address")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "city")}
            {tok(C.punctuation, ")")}
          </div>
          <div>
            {tok(C.fnName, "console")}
            {tok(C.punctuation, ".")}
            {tok(C.fnName, "log")}
            {tok(C.punctuation, "(")}
            {tok(C.codeText, "original")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "address")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "city")}
            {tok(C.punctuation, ")")}
          </div>
        </div>
      </div>

      {/* Terminal output */}
      <div style={{
        background: "#0A0F14",
        borderRadius: 16,
        border: `1px solid rgba(255,255,255,0.08)`,
        padding: "28px 36px",
        fontFamily: mono,
        fontSize: 36,
        lineHeight: "56px",
      }}>
        {/* clone result */}
        <div style={{ opacity: result1Op, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: C.comment, fontSize: 26 }}>clone →</span>
          <span style={{ color: C.accentA }}>"Abuja"</span>
          <span style={{ fontSize: 28, marginLeft: 8 }}>✅</span>
        </div>

        {/* original result — the bug */}
        <div style={{
          opacity: result2Op,
          transform: `scale(${bugScale})`,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: `rgba(255,123,114,${bugPulse * 0.12})`,
          borderLeft: `3px solid rgba(255,123,114,${bugPulse})`,
          padding: "4px 12px",
          marginLeft: -12,
          borderRadius: 8,
        }}>
          <span style={{ color: C.comment, fontSize: 26 }}>original →</span>
          <span style={{ color: C.accentC }}>"Abuja"</span>
          <span style={{ fontSize: 28, marginLeft: 8 }}>😱</span>
        </div>
      </div>

      {/* Caption */}
      <div style={{
        opacity: labelOp,
        transform: `translateY(${labelY}px)`,
        marginTop: 44,
        fontFamily: display,
        fontSize: 38,
        color: C.accentC,
        fontWeight: 700,
      }}>
        Nested objects are still shared.
      </div>
    </AbsoluteFill>
  );
};
