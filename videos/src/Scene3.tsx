import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const display = FONTS.display;
const mono = FONTS.mono;

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 18], [30, 0], { extrapolateRight: "clamp" });

  // Box entrance springs
  const box1Scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 180 }, delay: 15 });
  const box2Scale = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 180 }, delay: 35 });

  // Arrow draw — SVG strokeDashoffset
  const arrowProgress = interpolate(frame, [55, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Shared object box
  const sharedScale = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 180 }, delay: 75 });

  // Warning label
  const warnOp = interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const arrowLen = 160; // approximate path length

  const boxStyle = (color: string): React.CSSProperties => ({
    border: `2px solid ${color}`,
    background: `${color}11`,
    borderRadius: 16,
    padding: "24px 32px",
    fontFamily: mono,
    fontSize: 28,
    color: C.codeText,
    lineHeight: 1.6,
    minWidth: 360,
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: display,
    fontSize: 22,
    color: C.muted,
    marginBottom: 8,
    letterSpacing: 0.5,
  };

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 60 }}>
        <div style={{ fontFamily: display, fontSize: 60, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          Spread only makes a<br />
          <span style={{ color: C.accentB }}>shallow copy.</span>
        </div>
      </div>

      {/* Diagram area */}
      <div style={{ position: "relative", width: "100%" }}>

        {/* original box */}
        <div style={{ transform: `scale(${box1Scale})`, transformOrigin: "left center", marginBottom: 20 }}>
          <div style={labelStyle}>original</div>
          <div style={boxStyle(C.accentA)}>
            <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span></div>
            <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
          </div>
        </div>

        {/* clone box */}
        <div style={{ transform: `scale(${box2Scale})`, transformOrigin: "left center", marginBottom: 40 }}>
          <div style={labelStyle}>clone (spread)</div>
          <div style={boxStyle(C.accentB)}>
            <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span> <span style={{ color: C.comment, fontSize: 22 }}>✓ copied</span></div>
            <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
          </div>
        </div>

        {/* Both arrows pointing right to shared object — drawn as SVG */}
        <svg
          style={{ position: "absolute", top: 60, left: 420, overflow: "visible" }}
          width={260} height={180}
        >
          {/* Arrow from original */}
          <path
            d="M 0,40 C 80,40 80,120 160,120"
            stroke={C.accentC}
            strokeWidth={3}
            fill="none"
            strokeDasharray={280}
            strokeDashoffset={280 * (1 - arrowProgress)}
            strokeLinecap="round"
          />
          {/* Arrow from clone */}
          <path
            d="M 0,140 C 80,140 80,120 160,120"
            stroke={C.accentC}
            strokeWidth={3}
            fill="none"
            strokeDasharray={280}
            strokeDashoffset={280 * (1 - arrowProgress)}
            strokeLinecap="round"
          />
          {/* Arrowhead */}
          {arrowProgress > 0.85 && (
            <polygon
              points="160,113 148,107 148,133"
              fill={C.accentC}
              opacity={interpolate(arrowProgress, [0.85, 1], [0, 1])}
            />
          )}
        </svg>

        {/* Shared nested object */}
        <div style={{
          transform: `scale(${sharedScale})`,
          transformOrigin: "right center",
          position: "absolute",
          right: 0,
          top: 50,
        }}>
          <div style={{ ...labelStyle, color: C.accentC }}>{ } address (shared!)</div>
          <div style={{
            ...boxStyle(C.accentC),
            background: "rgba(255,123,114,0.1)",
            minWidth: 280,
          }}>
            <div><span style={{ color: C.property }}>city</span>: <span style={{ color: C.string }}>"Lagos"</span></div>
          </div>
        </div>

        {/* Warning note */}
        <div style={{
          opacity: warnOp,
          marginTop: 220,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "rgba(255,123,114,0.08)",
          border: "1px solid rgba(255,123,114,0.25)",
          borderRadius: 12,
          padding: "18px 24px",
        }}>
          <span style={{ fontSize: 32 }}>⚠️</span>
          <span style={{ fontFamily: display, fontSize: 30, color: C.accentC, fontWeight: 600 }}>
            Both point to the same nested object
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
