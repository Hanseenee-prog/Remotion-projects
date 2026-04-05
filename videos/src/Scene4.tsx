import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

function tok(color: string, text: string) {
  return <span style={{ color }}>{text}</span>;
}

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 18], [30, 0], { extrapolateRight: "clamp" });

  const codeOp = interpolate(frame, [20, 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Hack" badge bounces in
  const hackScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 10, stiffness: 200 }, delay: 50 });

  // Highlight stringify part
  const highlightJSON = interpolate(frame, [65, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const captionOp = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const captionY = interpolate(frame, [90, 110], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const codeFontSize = 31;
  const lineH = 52;

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Title row */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 44, display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ fontFamily: display, fontSize: 58, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          So you tried the<br /><span style={{ color: C.accentD }}>JSON trick…</span>
        </div>
        {/* Hack badge */}
        <div style={{
          transform: `scale(${hackScale}) rotate(-8deg)`,
          transformOrigin: "center center",
          background: "rgba(210,168,255,0.15)",
          border: "2px solid rgba(210,168,255,0.5)",
          borderRadius: 12,
          padding: "8px 20px",
          fontFamily: display,
          fontSize: 26,
          color: C.accentD,
          fontWeight: 700,
          letterSpacing: 1,
          alignSelf: "flex-start",
          marginTop: 8,
        }}>
          🛠 HACK
        </div>
      </div>

      {/* Code block */}
      <div style={{
        opacity: codeOp,
        background: C.codeBg,
        borderRadius: 20,
        border: `1px solid ${C.border}`,
        padding: "32px 40px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {["#FF5F57","#FEBC2E","#28C840"].map((c, i) => (
            <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>

        {/* Glow highlight on the inner expression */}
        <div style={{
          position: "absolute",
          top: 68 + lineH + 8,
          left: 0,
          right: 0,
          height: lineH,
          background: `rgba(210,168,255,${highlightJSON * 0.1})`,
          borderLeft: `3px solid rgba(210,168,255,${highlightJSON})`,
        }} />

        <div style={{ fontFamily: mono, fontSize: codeFontSize, lineHeight: `${lineH}px` }}>

          {/* const clone = */}
          <div>
            {tok(C.keyword, "const ")}
            {tok(C.codeText, "clone")}
            {tok(C.punctuation, " =")}
          </div>

          {/* JSON.parse(JSON.stringify(original)) */}
          <div style={{ paddingLeft: 36 }}>
            {tok(C.fnName, "JSON")}
            {tok(C.punctuation, ".")}
            {tok(C.fnName, "parse")}
            {tok(C.punctuation, "(")}
            {tok(C.fnName, "JSON")}
            {tok(C.punctuation, ".")}
            {tok(C.fnName, "stringify")}
            {tok(C.punctuation, "(")}
            {tok(C.codeText, "original")}
            {tok(C.punctuation, "))")}
          </div>

          <div style={{ height: 20 }} />

          {/* comment */}
          <div>
            {tok(C.comment, "// Serialize → deserialize")}
          </div>
          <div>
            {tok(C.comment, '// Looks like a "deep clone"...')}
          </div>
        </div>
      </div>

      {/* Caption */}
      <div style={{
        opacity: captionOp,
        transform: `translateY(${captionY}px)`,
        marginTop: 44,
        fontFamily: display,
        fontSize: 36,
        color: C.muted,
        fontWeight: 500,
        lineHeight: 1.4,
      }}>
        Clever... but it comes<br />with hidden costs.
      </div>
    </AbsoluteFill>
  );
};
