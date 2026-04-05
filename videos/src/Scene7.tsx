import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

function tok(color: string, text: string) {
  return <span style={{ color }}>{text}</span>;
}

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 16], [24, 0], { extrapolateRight: "clamp" });

  const codeOp = interpolate(frame, [18, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const resultCloneOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const resultOrigOp = interpolate(frame, [72, 88], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Original stays pulse — calm green
  const origPulse = interpolate(frame, [88, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const origScale = spring({ frame, fps, from: 0.95, to: 1, config: { damping: 14 }, delay: 88 });

  const labelOp = interpolate(frame, [100, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const labelY = interpolate(frame, [100, 120], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const codeFontSize = 30;
  const lineH = 50;

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 44 }}>
        <div style={{ fontFamily: display, fontSize: 56, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          Change the clone…<br />
          <span style={{ color: C.accentA }}>original stays safe. 🛡</span>
        </div>
      </div>

      {/* Code block */}
      <div style={{
        opacity: codeOp,
        background: C.codeBg,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: "28px 36px",
        marginBottom: 32,
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{ fontFamily: mono, fontSize: codeFontSize, lineHeight: `${lineH}px` }}>
          <div>
            {tok(C.keyword, "const ")}
            {tok(C.codeText, "clone")}
            {tok(C.punctuation, " = ")}
            {tok(C.fnName, "structuredClone")}
            {tok(C.punctuation, "(")}
            {tok(C.codeText, "original")}
            {tok(C.punctuation, ")")}
          </div>
          <div style={{ height: 8 }} />
          <div>
            {tok(C.codeText, "clone")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "address")}
            {tok(C.punctuation, ".")}
            {tok(C.property, "city")}
            {tok(C.punctuation, " = ")}
            {tok(C.string, '"Abuja"')}
          </div>
        </div>
      </div>

      {/* Terminal */}
      <div style={{
        background: "#0A0F14",
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 32px",
        fontFamily: mono,
        fontSize: 34,
        lineHeight: "60px",
      }}>
        {/* Clone result */}
        <div style={{ opacity: resultCloneOp, display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ color: C.comment, fontSize: 24 }}>clone.address.city →</span>
          <span style={{ color: C.accentA }}>"Abuja"</span>
          <span style={{ fontSize: 26 }}>✅</span>
        </div>

        {/* Original result — unchanged */}
        <div style={{
          opacity: resultOrigOp,
          transform: `scale(${origScale})`,
          transformOrigin: "left center",
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: `rgba(126,231,135,${origPulse * 0.10})`,
          borderLeft: `3px solid rgba(126,231,135,${origPulse})`,
          padding: "4px 12px",
          marginLeft: -12,
          borderRadius: 8,
        }}>
          <span style={{ color: C.comment, fontSize: 24 }}>original.address.city →</span>
          <span style={{ color: C.accentA }}>"Lagos"</span>
          <span style={{ fontSize: 26 }}>🛡</span>
        </div>
      </div>

      {/* Caption */}
      <div style={{
        opacity: labelOp,
        transform: `translateY(${labelY}px)`,
        marginTop: 40,
        fontFamily: display,
        fontSize: 36,
        color: C.accentA,
        fontWeight: 700,
        lineHeight: 1.4,
      }}>
        No shared references.<br />
        <span style={{ color: C.muted, fontWeight: 500 }}>No surprises.</span>
      </div>
    </AbsoluteFill>
  );
};
