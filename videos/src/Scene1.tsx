// Scene 1 — "Every time you click search… you send a request to your server."
// Duration: ~94 frames @ 30fps
// Layout: Portrait (1080x1920)

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

const COLORS = {
  searchBar: "#ffffff",
  searchText: "#202124",
  accentBlue: "#1a73e8",
  serverBody: "#3c4043",
  serverLight: "#34a853",
  imposterBody: "#ea4335",
  imposterVisor: "#8ab4f8",
  text: "#ffffff",
  dashedLine: "rgba(255, 255, 255, 0.4)",
};

const FONTS = {
  sans: "Inter, system-ui, -apple-system, sans-serif",
};

// ─── Enhanced Server Icon ─────────────────────────────────────────────────────
// Modelled after the reference: rack-style server with perspective top panel,
// three drive bays with status LEDs and slot bars, subtle shadow/depth.
const ServerIcon: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => {
  const W = 220;  // rack width
  const BH = 54;  // bay height
  const GAP = 10; // gap between bays
  const RX = 8;

  // Three bays stacked
  const bays = [0, BH + GAP, (BH + GAP) * 2];

  return (
    <div style={{
      transform: `scale(${scale})`,
      opacity,
      filter: "drop-shadow(0px 24px 40px rgba(0,0,0,0.55))",
    }}>
      <svg
        width={W + 20}
        height={(BH + GAP) * 3 + 30}
        viewBox={`0 0 ${W + 20} ${(BH + GAP) * 3 + 30}`}
      >
        {/* Perspective top face */}
        <polygon
          points={`10,18 ${W + 10},18 ${W + 20},6 20,6`}
          fill="#555a5f"
        />
        {/* Left side face */}
        <polygon
          points={`10,18 20,6 20,${(BH + GAP) * 3 + 20} 10,${(BH + GAP) * 3 + 28}`}
          fill="#2a2d30"
        />

        {/* Bays */}
        {bays.map((yOff, i) => (
          <g key={i} transform={`translate(10, ${yOff + 18})`}>
            {/* Bay body */}
            <rect width={W} height={BH} rx={RX} fill="#3c4043" />
            {/* Subtle inner bevel top */}
            <rect width={W} height={4} rx={0} fill="rgba(255,255,255,0.06)" />
            {/* Bottom shadow line */}
            <rect y={BH - 3} width={W} height={3} rx={0} fill="rgba(0,0,0,0.3)" />

            {/* Status LED */}
            <circle cx={20} cy={BH / 2} r={7} fill={i === 0 ? "#34a853" : i === 1 ? "#34a853" : "#fbbc04"} />
            {/* LED glow */}
            <circle cx={20} cy={BH / 2} r={12} fill={i === 0 ? "rgba(52,168,83,0.18)" : i === 1 ? "rgba(52,168,83,0.18)" : "rgba(251,188,4,0.15)"} />

            {/* Drive slot bar */}
            <rect x={42} y={BH / 2 - 5} width={130} height={10} rx={5} fill="rgba(255,255,255,0.09)" />
            {/* Drive slot highlight */}
            <rect x={42} y={BH / 2 - 5} width={40} height={10} rx={5} fill="rgba(255,255,255,0.07)" />

            {/* Small vent holes right side */}
            {[0, 1, 2, 3].map((v) => (
              <rect key={v} x={W - 30 + v * 6} y={12} width={3} height={BH - 24} rx={1.5} fill="rgba(0,0,0,0.35)" />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── Imposter ─────────────────────────────────────────────────────────────────
const Imposter: React.FC<{ yPos: number; scale: number; opacity: number }> = ({ yPos, scale, opacity }) => (
  <div style={{
    position: "absolute",
    top: yPos,
    left: "50%",
    transform: `translateX(-50%) scale(${scale})`,
    opacity,
    zIndex: 10,
  }}>
    <svg width="120" height="150" viewBox="0 0 80 100">
      <rect x="0" y="30" width="20" height="40" rx="8" fill="#c5221f" />
      <rect x="15" y="10" width="50" height="80" rx="25" fill={COLORS.imposterBody} />
      <rect x="40" y="25" width="35" height="25" rx="12" fill={COLORS.imposterVisor} />
      <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
    </svg>
  </div>
);

// ─── Cursor ───────────────────────────────────────────────────────────────────
const Cursor: React.FC<{ x: number; y: number; opacity: number; scale: number }> = ({ x, y, opacity, scale }) => (
  <div style={{
    position: "absolute",
    left: x,
    top: y,
    opacity,
    transform: `scale(${scale})`,
    pointerEvents: "none",
    zIndex: 100,
  }}>
    <svg width="45" height="45" viewBox="0 0 32 32" fill="none">
      <path d="M8 4V24.58L13.2 19.38L16.6 27.38L19.4 26.18L16 18.18H23.2L8 4Z" fill="white" stroke="black" strokeWidth="2" />
    </svg>
  </div>
);

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // 1. Search Bar Entry (0-15f)
  const searchIn = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, mass: 0.8 } });

  // 2. Cursor Click (15-45f)
  const cursorOpacity = interpolate(frame, [12, 18, 45, 50], [0, 1, 1, 0]);
  const cursorMove = interpolate(frame, [18, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const cursorX = interpolate(cursorMove, [0, 1], [width / 2 + 100, width / 2 + 420]);
  const cursorY = interpolate(cursorMove, [0, 1], [height / 2 + 150, height / 2 + 100]);
  const clickScale = interpolate(frame, [35, 38, 42], [5, 4.8, 5], { extrapolateLeft: "clamp" });

  // 3. Layout Shift (45-60f)
  const layoutShift = spring({ frame: frame - 45, fps, from: 0, to: 1, config: { damping: 15 } });
  const searchBarY = interpolate(layoutShift, [0, 1], [height / 2, height * 0.795]);
  const serverOpacity = interpolate(layoutShift, [0.4, 1], [0, 1]);
  const serverScale = spring({ frame: frame - 48, fps, from: 0, to: 1.3, config: { damping: 12 } });

  // 4. Dashed Line (55-70f)
  const lineDraw = interpolate(frame, [55, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lineStartY = height * 0.75;
  const lineEndY = height * 0.22;

  // 5. Imposter
  const imposterPop = spring({ frame: frame - 60, fps, from: 0, to: 1.3, config: { damping: 10 } });
  const travelProgress = interpolate(frame, [72, 100], [0, 0.15], {
    extrapolateLeft: "clamp",
    extrapolateRight: "extend",
    easing: Easing.linear,
  });
  const imposterY = lineStartY - (lineStartY - lineEndY) * travelProgress;

  // 6. Text
  const text1Op = interpolate(frame, [5, 15, 45, 50], [0, 1, 1, 0]);
  const text2Op = interpolate(frame, [55, 65], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", fontFamily: FONTS.sans }}>

      {/* Top Text */}
      <div style={{
        position: "absolute",
        top: 180,
        width: "100%",
        textAlign: "center",
        fontSize: 64,
        fontWeight: 800,
        color: COLORS.text,
        padding: "0 60px",
        opacity: text1Op + text2Op,
        textShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        {frame < 50 ? "Every time you click search…" : "you send a request to your server."}
      </div>

      {/* Dashed Line */}
      {frame > 55 && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line
            x1={width / 2}
            y1={lineStartY}
            x2={width / 2}
            y2={interpolate(lineDraw, [0, 1], [lineStartY, lineEndY])}
            stroke={COLORS.dashedLine}
            strokeWidth="10"
            strokeDasharray="25 20"
            strokeLinecap="round"
          />
        </svg>
      )}

      {/* Server */}
      <div style={{
        position: "absolute",
        top: "12%",
        left: "50%",
        transform: "translateX(-50%)",
      }}>
        <ServerIcon scale={serverScale} opacity={serverOpacity} />
      </div>

      {/* Imposter */}
      {frame > 60 && (
        <Imposter
          yPos={imposterY - 100}
          scale={imposterPop}
          opacity={interpolate(frame, [60, 65], [0, 1])}
        />
      )}

      {/* Search Bar */}
      <div style={{
        position: "absolute",
        top: searchBarY,
        left: "50%",
        transform: `translate(-50%, -50%) scale(${searchIn})`,
        width: 900,
        height: 120,
        backgroundColor: COLORS.searchBar,
        borderRadius: 60,
        display: "flex",
        alignItems: "center",
        padding: "0 45px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
        zIndex: 20,
      }}>
        <div style={{ fontSize: 42, color: COLORS.searchText, flex: 1, fontWeight: 700 }}>
          Top 5 richest men in the world
        </div>
        <div style={{
          width: 70,
          height: 70,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: frame > 35 && frame < 45 ? "rgba(26, 115, 232, 0.1)" : "transparent",
          borderRadius: "50%",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={COLORS.accentBlue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      {/* Cursor */}
      <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} scale={clickScale} />

    </AbsoluteFill>
  );
};