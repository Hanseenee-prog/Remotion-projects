import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Constants ────────────────────────────────────────────────────────────────
const VIDEO_W = 1080;
const VIDEO_H = 1920;
const WIN_W   = 820;
const WIN_H   = 580;
const WIN_L   = (VIDEO_W - WIN_W) / 2;  // 130 — centered X
const WIN_T   = VIDEO_H / 2 - WIN_H / 2 - 60; // slightly above center

// ─── Gear path generator ──────────────────────────────────────────────────────
function gearPath(cx: number, cy: number, r: number, teeth: number): string {
  const pts: string[] = [];
  const step  = (Math.PI * 2) / teeth;
  const tR    = r * 1.26; // tooth tip radius

  for (let i = 0; i < teeth; i++) {
    const a0 = step * i - step / 2;
    const a1 = a0 + step * 0.3;
    const a2 = a0 + step * 0.7;
    const a3 = a0 + step;

    pts.push(`${cx + r  * Math.cos(a0)},${cy + r  * Math.sin(a0)}`);
    pts.push(`${cx + r  * Math.cos(a1)},${cy + r  * Math.sin(a1)}`);
    pts.push(`${cx + tR * Math.cos(a1)},${cy + tR * Math.sin(a1)}`);
    pts.push(`${cx + tR * Math.cos(a2)},${cy + tR * Math.sin(a2)}`);
    pts.push(`${cx + r  * Math.cos(a2)},${cy + r  * Math.sin(a2)}`);
    pts.push(`${cx + r  * Math.cos(a3)},${cy + r  * Math.sin(a3)}`);
  }
  return `M ${pts.join(" L ")} Z`;
}

// ─── Gear SVG component ───────────────────────────────────────────────────────
const Gear: React.FC<{
  cx: number; cy: number;
  r: number; teeth: number;
  rotDeg: number;
  fill: string;
  popScale: number;
}> = ({ cx, cy, r, teeth, rotDeg, fill, popScale }) => {
  const path   = gearPath(0, 0, r, teeth);
  const innerR = r * 0.36;

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${popScale}) rotate(${rotDeg})`}>
      {/* Shadow */}
      <path d={path} fill="rgba(0,0,0,0.3)" transform="translate(3,5)" />
      {/* Body */}
      <path d={path} fill={fill} />
      {/* Inner ring bevel */}
      <circle r={innerR + 7} fill="none"
        stroke="rgba(0,0,0,0.22)" strokeWidth="5" />
      {/* Hole */}
      <circle r={innerR} fill="rgba(8,10,18,0.88)" />
      {/* Center pin */}
      <circle r={innerR * 0.3} fill={fill} opacity="0.55" />
    </g>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 1. Window slides in from the LEFT side ────────────────────────────────
  // 0–15f: ease-out slide, lands with slight overshoot
  const winSlideSpring = spring({
    fps,
    frame,
    config: { damping: 16, stiffness: 140, mass: 0.9 },
    durationInFrames: 18,
  });
  const winX = interpolate(winSlideSpring, [0, 1], [-(WIN_W + 60), WIN_L]);
  const winOpacity = interpolate(frame, [0, 6], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 2. </> fades + scales in — done by frame 20 ──────────────────────────
  const codeOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const codeScale = interpolate(frame, [8, 20], [0.8, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 3. Main gear — pops in top-right at frame 22 ──────────────────────────
  const g1Spring = spring({
    fps,
    frame: frame - 22,
    config: { damping: 8, stiffness: 260, mass: 0.65 },
    durationInFrames: 18,
  });
  const g1PopScale = Math.max(0, g1Spring);

  // ── 4. Small gear — pops in at frame 32 ──────────────────────────────────
  const g2Spring = spring({
    fps,
    frame: frame - 32,
    config: { damping: 9, stiffness: 240, mass: 0.6 },
    durationInFrames: 15,
  });
  const g2PopScale = Math.max(0, g2Spring);

  // ── Gear rotation — starts spinning from their pop frame ──────────────────
  const g1Rot = Math.max(0, frame - 22) * 1.6;   // 1.6°/frame clockwise
  const g2Rot = -Math.max(0, frame - 32) * 2.4;  // counter-clockwise, faster

  // ── Gear positions (relative to window top-left = 0,0 in SVG space) ──────
  // Main gear: top-right, center overlaps the titlebar top edge
  const G1_CX = WIN_W - 30;   // 790 — right edge of window
  const G1_CY = -10;           // just above titlebar top
  const G1_R  = 88;
  const G1_TEETH = 10;
  const G1_FILL  = "#5B4DB5";

  // Small gear: lower-left, partially inside window
  // Positioned so it doesn't overlap </> — bottom-left corner
  const G2_CX = 80;
  const G2_CY = WIN_H - 60;    // near bottom of window
  const G2_R  = 50;
  const G2_TEETH = 7;
  const G2_FILL  = "#7060CC";

  return (
    <AbsoluteFill>

      {/* ── Main container div ─────────────────────────────────────────────── */}
      <div style={{
        position:        "absolute",
        left:            winX,
        top:             WIN_T,
        width:           WIN_W,
        height:          WIN_H,
        opacity:         winOpacity,
        borderRadius:    20,
        overflow:        "visible", // gears overflow
        boxShadow:       "0 40px 100px rgba(0,0,0,0.85)",
        zIndex:          10,
        transform: `scale(0.65)`,
        transformOrigin: "center center",
      }}>

        {/* ── Window frame (clipped to rounded rect) ── */}
        <div style={{
          width:        WIN_W,
          height:       WIN_H,
          borderRadius: 20,
          overflow:     "hidden",
          background:   "#0D1117",
          border:       "1px solid rgba(255,255,255,0.08)",
          position:     "relative",
        }}>

          {/* ── Title bar — purple like the image ── */}
          <div style={{
            height:     82,
            background: "#5B4DB5",
            display:    "flex",
            alignItems: "center",
            padding:    "0 26px",
            gap:        11,
            flexShrink: 0,
          }}>
            {/* Dots: red, green, yellow — matching image order */}
            {[
              { bg: "#FF5F56", shadow: "rgba(255,95,86,0.5)"  },
              { bg: "#27C93F", shadow: "rgba(39,201,63,0.5)"  },
              { bg: "#FFBD2E", shadow: "rgba(255,189,46,0.5)" },
            ].map((d, i) => (
              <div key={i} style={{
                width:     18, height: 18, borderRadius: "50%",
                background: d.bg,
                boxShadow:  `0 2px 8px ${d.shadow}`,
              }} />
            ))}
          </div>

          {/* ── Window body — dark, centered </> ── */}
          <div style={{
            width:           "100%",
            height:          WIN_H - 82,
            background:      "#0D1117",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
          }}>
            <div style={{
              opacity:         codeOpacity,
              transform:       `scale(${codeScale})`,
              transformOrigin: "center center",
            }}>
              <svg width="280" height="180" viewBox="0 0 280 180" fill="none">
                {/* < — thinner, smaller */}
                <polyline
                  points="72,28 16,90 72,152"
                  stroke="#5B4DB5"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* / */}
                <line
                  x1="178" y1="18" x2="108" y2="162"
                  stroke="#5B4DB5"
                  strokeWidth="22"
                  strokeLinecap="round"
                />
                {/* > — thinner, smaller */}
                <polyline
                  points="208,28 264,90 208,152"
                  stroke="#5B4DB5"
                  strokeWidth="22"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ── Gears — SVG overlay with overflow:visible ── */}
        <svg
          style={{
            position:  "absolute",
            top:       0,
            left:      0,
            overflow:  "visible",
            zIndex:    30,
            pointerEvents: "none",
          }}
          width={WIN_W}
          height={WIN_H}
        >
          {/* Main gear — top-right, partially above titlebar */}
          {frame >= 22 && (
            <Gear
              cx={G1_CX} cy={G1_CY}
              r={G1_R} teeth={G1_TEETH}
              rotDeg={g1Rot}
              fill={G1_FILL}
              popScale={g1PopScale}
            />
          )}

          {/* Small gear — bottom-left corner */}
          {frame >= 32 && (
            <Gear
              cx={G2_CX} cy={G2_CY}
              r={G2_R} teeth={G2_TEETH}
              rotDeg={g2Rot}
              fill={G2_FILL}
              popScale={g2PopScale}
            />
          )}
        </svg>

      </div>

    </AbsoluteFill>
  );
};