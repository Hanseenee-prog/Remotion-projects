import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const display = FONTS.display;
const mono = FONTS.mono;

// ─── Hammer × Spanner SVG icon ────────────────────────────────────────────────
const HackIcon: React.FC<{ size: number; opacity: number; rotation: number }> = ({ size, opacity, rotation }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity, transform: `rotate(${rotation}deg)` }}
  >
    {/* Spanner — diagonal top-left to bottom-right */}
    <g transform="rotate(-45 100 100)" fill={C.accentC} opacity={0.9}>
      {/* Slim connecting bar */}
      <rect x="94" y="38" width="12" height="124" />
      {/* Top C-shaped head */}
      <path d="M 94 40 C 94 30, 80 30, 80 20 L 80 6 C 80 3, 82 1, 85 1 L 87 1 C 90 1, 92 3, 92 6 L 92 20 C 92 29, 108 29, 108 20 L 108 6 C 108 3, 110 1, 113 1 L 115 1 C 118 1, 120 3, 120 6 L 120 20 C 120 30, 106 30, 106 40 Z" />
      {/* Bottom C-shaped head */}
      <path d="M 94 40 C 94 30, 80 30, 80 20 L 80 6 C 80 3, 82 1, 85 1 L 87 1 C 90 1, 92 3, 92 6 L 92 20 C 92 29, 108 29, 108 20 L 108 6 C 108 3, 110 1, 113 1 L 115 1 C 118 1, 120 3, 120 6 L 120 20 C 120 30, 106 30, 106 40 Z" transform="rotate(180 100 100)" />
    </g>

    {/* Hammer — diagonal top-right to bottom-left */}
    <g transform="rotate(45 100 100)">
      {/* handle */}
      <rect x="91" y="50" width="18" height="140" rx="9" fill={C.accentD} opacity={0.9} />
      {/* head */}
      <rect x="60" y="14" width="80" height="46" rx="10" fill={C.accentD} opacity={0.9} />
    </g>

  </svg>
);

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Icon entrance ──────────────────────────────────────────────────────────
  const iconSpring = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, stiffness: 160 }, delay: 0 });
  const iconScale  = interpolate(iconSpring, [0, 1], [0.4, 1]);
  const iconOp     = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  // Slow spin settling
  const iconRot    = interpolate(iconSpring, [0, 1], [30, 0]);

  // Crossed-out slash that draws across the icon
  const slashProgress = interpolate(frame, [18, 42], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Text lines ─────────────────────────────────────────────────────────────
  const line1Op = interpolate(frame, [30, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line1Y  = interpolate(frame, [30, 46], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const line2Op = interpolate(frame, [48, 64], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2Y  = interpolate(frame, [48, 64], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── bg radial glow ─────────────────────────────────────────────────────────
  const bgGlow = spring({ frame, fps, from: 0, to: 1, config: { damping: 24, stiffness: 60 }, delay: 10 });

  const ICON_SIZE = 280;
  // Slash path length (diagonal across icon bounding box)
  const slashLen = Math.sqrt(ICON_SIZE * ICON_SIZE + ICON_SIZE * ICON_SIZE);

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: `${SAFE.top}px ${SAFE.left}px`,
    }}>

      {/* bg radial — red-tinted for "stop" feel */}
      <div style={{
        position: "absolute",
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,123,114,0.09) 0%, transparent 70%)",
        transform: `scale(${bgGlow})`,
        top: "50%",
        left: "50%",
        marginLeft: -350,
        marginTop: -350,
        zIndex: 0,
      }} />

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>

        {/* ── Icon + slash container ───────────────────────────────────────── */}
        <div style={{
          position: "relative",
          width: ICON_SIZE,
          height: ICON_SIZE,
          transform: `scale(${iconScale})`,
          opacity: iconOp,
          marginBottom: 52,
        }}>
          <HackIcon size={ICON_SIZE} opacity={1} rotation={iconRot} />
        </div>

        {/* ── "Stop using hacks." ──────────────────────────────────────────── */}
        <div style={{
          opacity: line1Op,
          transform: `translateY(${line1Y}px)`,
          textAlign: "center",
          marginBottom: 20,
        }}>
          <span style={{ fontFamily: display, fontSize: 76, fontWeight: 900, color: C.white, lineHeight: 1.05 }}>
            Stop using{" "}
          </span>
          <span style={{ fontFamily: display, fontSize: 76, fontWeight: 900, color: C.accentC, lineHeight: 1.05 }}>
            hacks.
          </span>
        </div>

        {/* ── "Use what the browser already gives you." ────────────────────── */}
        <div style={{
          opacity: line2Op,
          transform: `translateY(${line2Y}px)`,
          textAlign: "center",
        }}>
          <span style={{ fontFamily: display, fontSize: 38, color: C.muted, fontWeight: 500, lineHeight: 1.5 }}>
            Use what the browser already gives you.
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};