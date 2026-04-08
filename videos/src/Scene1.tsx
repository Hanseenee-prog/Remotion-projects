// Scene 1 — "Every time you click search… you send a request to your server."
// Duration: ~94 frames @ 30fps

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
  imposterBody: "#ea4335",
  imposterVisor: "#8ab4f8",
  text: "#ffffff",
  dashedLine: "rgba(255, 255, 255, 0.4)",
};

const FONTS = { sans: "Inter, system-ui, -apple-system, sans-serif" };

// ─── Flat Stacked Server Icon (matches reference image) ───────────────────────
// Three server units stacked, each a flat rectangle with vents + LEDs + bays
export const ServerIcon: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => {
  const W = 340;   // unit width
  const UH = 78;   // unit height
  const GAP = 10;  // gap between units
  const UNITS = 3;
  const totalH = UNITS * UH + (UNITS - 1) * GAP + 28; // +shadow ellipse

  // LED colors per unit (top→bottom)
  const leds = [
    ["#3ec66a", "#3ec66a", "#ea4335"],
    ["#3ec66a", "#fbbc04", "#3ec66a"],
    ["#3ec66a", "#3ec66a", "#3ec66a"],
  ];

  return (
    <div style={{
      transform: `scale(${scale})`,
      opacity,
      transformOrigin: "top center",
      filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
    }}>
      <svg width={W + 40} height={totalH} viewBox={`0 0 ${W + 40} ${totalH}`}>

        {/* Shadow ellipse */}
        <ellipse cx={(W + 40) / 2} cy={totalH - 4} rx={W * 0.48} ry={10} fill="rgba(0,0,0,0.28)" />

        {[0, 1, 2].map((u) => {
          const y = u * (UH + GAP);
          const bodyColor = "#4a5568";  // slate-ish
          const faceColor = "#2d3748";  // darker face
          const topColor  = "#5a6478";  // lighter top edge

          return (
            <g key={u} transform={`translate(20, ${y})`}>
              {/* Top face (slight 3-D perspective) */}
              <rect x={0} y={0} width={W} height={8} rx={4} fill={topColor} />

              {/* Main body */}
              <rect x={0} y={6} width={W} height={UH - 6} rx={6} fill={bodyColor} />

              {/* Front face darker panel (right 60%) */}
              <rect x={W * 0.38} y={6} width={W * 0.62} height={UH - 6} rx={4} fill={faceColor} />

              {/* Vent grid (left side) — 4 columns × 3 rows of holes */}
              {[0, 1, 2, 3].map((col) =>
                [0, 1, 2].map((row) => (
                  <rect
                    key={`v-${col}-${row}`}
                    x={16 + col * 16}
                    y={16 + row * 16}
                    width={9}
                    height={9}
                    rx={2}
                    fill="rgba(0,0,0,0.45)"
                  />
                ))
              )}

              {/* Drive bay slots (middle area) */}
              {[0, 1].map((s) => (
                <rect
                  key={s}
                  x={W * 0.38 + 16}
                  y={18 + s * 22}
                  width={W * 0.38}
                  height={14}
                  rx={4}
                  fill="rgba(0,0,0,0.35)"
                />
              ))}

              {/* LED dots (right side) */}
              {leds[u].map((c, li) => (
                <g key={li}>
                  <circle cx={W - 28} cy={22 + li * 17} r={5} fill={c} />
                  {/* Glow */}
                  <circle cx={W - 28} cy={22 + li * 17} r={9} fill={c} opacity={0.25} />
                </g>
              ))}

              {/* Bottom edge shadow line */}
              <rect x={0} y={UH - 4} width={W} height={4} rx={2} fill="rgba(0,0,0,0.3)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Imposter ─────────────────────────────────────────────────────────────────
const Imposter: React.FC<{ yPos: number; scale: number; opacity: number }> = ({ yPos, scale, opacity }) => (
  <div style={{
    position: "absolute", top: yPos, left: "50%",
    transform: `translateX(-50%) scale(${scale})`, opacity, zIndex: 10,
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
    position: "absolute", left: x, top: y, opacity,
    transform: `scale(${scale})`, pointerEvents: "none", zIndex: 100,
  }}>
    <svg width="45" height="45" viewBox="0 0 32 32" fill="none">
      <path d="M8 4V24.58L13.2 19.38L16.6 27.38L19.4 26.18L16 18.18H23.2L8 4Z"
        fill="white" stroke="black" strokeWidth="2" />
    </svg>
  </div>
);

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const searchIn = spring({ frame, fps, from: 0, to: 1, config: { damping: 12, mass: 0.8 } });

  const cursorOpacity = interpolate(frame, [12, 18, 45, 50], [0, 1, 1, 0]);
  const cursorMove = interpolate(frame, [18, 35], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: Easing.bezier(0.33, 1, 0.68, 1),
  });
  const cursorX = interpolate(cursorMove, [0, 1], [width / 2 + 100, width / 2 + 420]);
  const cursorY = interpolate(cursorMove, [0, 1], [height / 2 + 150, height / 2 + 100]);
  const clickScale = interpolate(frame, [35, 38, 42], [5, 4.8, 5], { extrapolateLeft: "clamp" });

  const layoutShift = spring({ frame: frame - 45, fps, from: 0, to: 1, config: { damping: 15 } });
  const searchBarY = interpolate(layoutShift, [0, 1], [height / 2, height * 0.795]);
  const serverOpacity = interpolate(layoutShift, [0.4, 1], [0, 1]);
  const serverScale = spring({ frame: frame - 48, fps, from: 0, to: 1, config: { damping: 12 } });

  const lineDraw = interpolate(frame, [55, 70], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const lineStartY = height * 0.75;
  const lineEndY = height * 0.22;

  const imposterPop = spring({ frame: frame - 60, fps, from: 0, to: 1.3, config: { damping: 10 } });
  const travelProgress = interpolate(frame, [72, 100], [0, 0.15], {
    extrapolateLeft: "clamp", extrapolateRight: "extend", easing: Easing.linear,
  });
  const imposterY = lineStartY - (lineStartY - lineEndY) * travelProgress;

  const text1Op = interpolate(frame, [5, 15, 45, 50], [0, 1, 1, 0]);
  const text2Op = interpolate(frame, [55, 65], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", fontFamily: FONTS.sans }}>

      <div style={{
        position: "absolute", top: 180, width: "100%", textAlign: "center",
        fontSize: 64, fontWeight: 800, color: COLORS.text, padding: "0 60px",
        opacity: text1Op + text2Op, textShadow: "0 4px 20px rgba(0,0,0,0.2)",
      }}>
        {frame < 50 ? "Every time you click search…" : "you send a request to your server."}
      </div>

      {frame > 55 && (
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <line
            x1={width / 2} y1={lineStartY}
            x2={width / 2} y2={interpolate(lineDraw, [0, 1], [lineStartY, lineEndY])}
            stroke={COLORS.dashedLine} strokeWidth="10" strokeDasharray="25 20" strokeLinecap="round"
          />
        </svg>
      )}

      {/* Server — centered at top */}
      <div style={{
        position: "absolute", top: "8%", left: "50%",
        transform: "translateX(-50%)",
      }}>
        <ServerIcon scale={serverScale} opacity={serverOpacity} />
      </div>

      {frame > 60 && (
        <Imposter
          yPos={imposterY - 100}
          scale={imposterPop}
          opacity={interpolate(frame, [60, 65], [0, 1])}
        />
      )}

      <div style={{
        position: "absolute", top: searchBarY, left: "50%",
        transform: `translate(-50%, -50%) scale(${searchIn})`,
        width: 900, height: 120, backgroundColor: COLORS.searchBar,
        borderRadius: 60, display: "flex", alignItems: "center",
        padding: "0 45px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", zIndex: 20,
      }}>
        <div style={{ fontSize: 42, color: COLORS.searchText, flex: 1, fontWeight: 700 }}>
          Top 5 richest men in the world
        </div>
        <div style={{
          width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center",
          backgroundColor: frame > 35 && frame < 45 ? "rgba(26,115,232,0.1)" : "transparent",
          borderRadius: "50%",
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke={COLORS.accentBlue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} scale={clickScale} />
    </AbsoluteFill>
  );
};