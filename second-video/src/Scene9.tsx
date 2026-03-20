import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Layout ───────────────────────────────────────────────────────────────────
const VIDEO_W     = 1080;
const VIDEO_H     = 1920;
const PARENT_W    = 780;
const PARENT_H    = 700;
const PARENT_X    = (VIDEO_W - PARENT_W) / 2;
const PARENT_Y    = VIDEO_H / 2 - PARENT_H / 2 - 20;

const BTN_W       = 190;
const BTN_H       = 80;
const BTN_GAP     = 22;
const BTN_TOTAL_W = 3 * BTN_W + 2 * BTN_GAP;
const BTN_TOP     = PARENT_H / 2 + 80 - BTN_H / 2;

const btnLefts = [
  PARENT_W / 2 - BTN_TOTAL_W / 2,
  PARENT_W / 2 - BTN_W / 2,
  PARENT_W / 2 + BTN_TOTAL_W / 2 - BTN_W,
];
const btnTargets = btnLefts.map((l) => ({
  x: PARENT_X + l + BTN_W / 2,
  y: PARENT_Y + BTN_TOP,
}));

const BADGE_SIZE    = 110;
const BADGE_START_X = PARENT_X - BADGE_SIZE * 0.4;
const BADGE_START_Y = PARENT_Y - BADGE_SIZE * 0.4;
const BADGE_END_X   = VIDEO_W / 2 - BADGE_SIZE / 2;
const BADGE_END_Y   = PARENT_Y - BADGE_SIZE - 180;

// ─── Code window layout ───────────────────────────────────────────────────────
const SIDE_MARGIN = 100;                                          // gap from video edges
const WIN_GAP     = 150;                                          // gap between the two windows
const WIN_W       = (VIDEO_W - SIDE_MARGIN * 2 - WIN_GAP) / 2; // ~390 each
const WIN_L_X     = SIDE_MARGIN;
const WIN_R_X     = SIDE_MARGIN + WIN_W + WIN_GAP;
const WIN_TITLE   = 46;

// Left (bad) window: taller
const WIN_L_H     = 500;
// Right (good) window: shorter
const WIN_R_H     = 300;

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  badgeMoveEnd:  22,
  boltStart:     30,
  // Fade-out of parent+lightning: 60-70
  fadeStart:     60,
  fadeEnd:       70,
  // Windows slide in: start at 20% opacity (frame ~64)
  winInStart:    64,
  winInEnd:      80,
  // Icon pops: after windows settle
  iconPop:       82,
  // Windows slide out: 140-154
  winOutStart:   140,
  winOutEnd:     154,
} as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── Lightning helpers ────────────────────────────────────────────────────────
function lightningPath(x1: number, y1: number, x2: number, y2: number, seed: number, segments = 9): string {
  const pts: [number, number][] = [[x1, y1]];
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const px = -dy / len, py = dx / len;
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const r = Math.sin(seed * 9301 + i * 49297 + 233720) * 0.5 + 0.5;
    pts.push([x1 + dx * t + px * (r - 0.5) * 80, y1 + dy * t + py * (r - 0.5) * 80]);
  }
  pts.push([x2, y2]);
  return pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
}
function arrowHead(x1: number, y1: number, x2: number, y2: number, size = 26): string {
  const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
  const ux = dx / len, uy = dy / len, px = -uy, py = ux;
  return `M ${(x2 - ux * size + px * size * 0.55).toFixed(1)} ${(y2 - uy * size + py * size * 0.55).toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} L ${(x2 - ux * size - px * size * 0.55).toFixed(1)} ${(y2 - uy * size - py * size * 0.55).toFixed(1)}`;
}

// ─── Radar icon ───────────────────────────────────────────────────────────────
const RadarIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a14 14 0 0 1 20 0" /><path d="M5 9a9 9 0 0 1 14 0" />
    <path d="M8 12a4 4 0 0 1 8 0" /><path d="M12 12v8" />
    <circle cx="12" cy="20" r="1.8" fill={color} stroke="none" />
  </svg>
);

// ─── Code wireframe rows ──────────────────────────────────────────────────────
// Each row is { indent, segs: widths[] } — segments within a line
const BAD_ROWS = [
  { indent: 0,  segs: [0.45, 0.3] },
  { indent: 1,  segs: [0.55, 0.2, 0.15] },
  { indent: 1,  segs: [0.35, 0.4] },
  { indent: 1,  segs: [0.5, 0.25, 0.1] },
  { indent: 2,  segs: [0.6, 0.2] },
  { indent: 2,  segs: [0.3, 0.45, 0.15] },
  { indent: 2,  segs: [0.55, 0.2] },
  { indent: 2,  segs: [0.4, 0.3] },
  { indent: 1,  segs: [0.25, 0.5] },
  { indent: 1,  segs: [0.65] },
  { indent: 1,  segs: [0.35, 0.25, 0.2] },
  { indent: 2,  segs: [0.5, 0.3] },
  { indent: 2,  segs: [0.4, 0.35] },
  { indent: 1,  segs: [0.2, 0.55] },
  { indent: 0,  segs: [0.15] },
];
const GOOD_ROWS = [
  { indent: 0,  segs: [0.45, 0.3] },
  { indent: 1,  segs: [0.55, 0.2] },
  { indent: 2,  segs: [0.5, 0.25] },
  { indent: 2,  segs: [0.35, 0.4] },
  { indent: 1,  segs: [0.25, 0.3] },
  { indent: 0,  segs: [0.15] },
];

// Row colors cycling — mirrors the screenshot palette
const ROW_COLORS = ["#B39DDB", "#64B5F6", "#90CAF9", "#9E9E9E", "#B39DDB", "#64B5F6"];

const CodeWireframe: React.FC<{
  rows: typeof BAD_ROWS;
  winW: number;
}> = ({ rows, winW }) => {
  const innerW = winW - 32;
  const ROW_H = 18;
  const ROW_GAP = 10;
  const INDENT_W = 18;
  return (
    <div style={{ padding: "18px 16px 16px", display: "flex", flexDirection: "column", gap: ROW_GAP }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: "flex", gap: 8, paddingLeft: row.indent * INDENT_W, alignItems: "center" }}>
          {row.segs.map((w, si) => {
            const colorIdx = (ri + si) % ROW_COLORS.length;
            // First segment on each line gets a colored pill, rest are muted
            const color = si === 0 ? ROW_COLORS[colorIdx] : "rgba(180,180,200,0.28)";
            const segW = Math.round((innerW - row.indent * INDENT_W) * w);
            return (
              <div key={si} style={{
                width:        segW,
                height:       ROW_H,
                borderRadius: ROW_H / 2,
                background:   color,
                opacity:      si === 0 ? 0.85 : 1,
                flexShrink:   0,
              }} />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// ─── Code window component ────────────────────────────────────────────────────
const ICON_SIZE = 52; // diameter of hanging icon badge

const CodeWindow: React.FC<{
  x: number; y: number; w: number; h: number; opacity: number;
  rows: typeof BAD_ROWS;
  isGood: boolean;
  iconScale: number;
}> = ({ x, y, w, h, opacity, rows, isGood, iconScale }) => {
  const accentColor = isGood ? "#27C93F" : "#E63946";
  const accentGlow  = isGood ? "rgba(39,201,63,0.3)" : "rgba(230,57,70,0.3)";
  return (
    <div style={{
      position:     "absolute",
      left:         x,
      top:          y,
      width:        w,
      height:       h,
      opacity,
      borderRadius: 16,
      overflow:     "visible",           // icon hangs outside
      background:   "#0D1117",
      border:       `2px solid ${accentColor}`,
      boxShadow:    `0 24px 70px rgba(0,0,0,0.85), 0 0 24px ${accentGlow}`,
      zIndex:       40,
    }}>
      {/* Clip inner content so code doesn't overflow */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 14, overflow: "hidden" }}>
        {/* Title bar */}
        <div style={{
          height:       WIN_TITLE,
          background:   "#161B22",
          display:      "flex",
          alignItems:   "center",
          padding:      "0 16px",
          gap:          8,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          flexShrink:   0,
        }}>
          {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c }} />
          ))}
        </div>
        {/* Code wireframe body */}
        <CodeWireframe rows={rows} winW={w} />
      </div>

      {/* Icon badge — hangs at bottom-right corner, half outside border */}
      <div style={{
        position:        "absolute",
        right:           -(ICON_SIZE / 2),
        bottom:          -(ICON_SIZE / 2),
        width:           ICON_SIZE,
        height:          ICON_SIZE,
        borderRadius:    "50%",
        background:      isGood ? "rgba(39,201,63,0.18)" : "rgba(230,57,70,0.18)",
        border:          `2.5px solid ${accentColor}`,
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        transform:       `scale(${iconScale})`,
        transformOrigin: "center center",
        boxShadow:       `0 4px 20px ${accentGlow}`,
        zIndex:          50,
        backdropFilter:  "blur(4px)",
      }}>
        {isGood ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4,13 9,18 20,7" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
            stroke={accentColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        )}
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══ Phase 1: badge + bolts (0-59) ════════════════════════════════════════

  const moveSpring = spring({ fps, frame, config: { damping: 14, stiffness: 150, mass: 0.85 }, durationInFrames: T.badgeMoveEnd });
  const moveP  = clamp(moveSpring);
  const badgeX = interpolate(moveP, [0, 1], [BADGE_START_X, BADGE_END_X]);
  const badgeY = interpolate(moveP, [0, 1], [BADGE_START_Y, BADGE_END_Y]);
  const badgeRot = interpolate(moveP, [0, 1], [0, 180]);

  const shakeMag = interpolate(frame, [0, 4, T.badgeMoveEnd, T.boltStart, T.boltStart + 4, T.boltStart + 28, T.fadeStart], [0, 2.5, 2.5, 2.5, 5.5, 3.5, 0], { extrapolateRight: "clamp" });
  const shakeX = Math.sin(frame * 2.1) * shakeMag + Math.sin(frame * 3.7) * shakeMag * 0.35;
  const shakeY = Math.cos(frame * 1.8) * shakeMag * 0.5;

  const boltSrcX = BADGE_END_X + BADGE_SIZE / 2;
  const boltSrcY = BADGE_END_Y + BADGE_SIZE;

  const bolts = btnTargets.map((tgt, i) => {
    const bStart = T.boltStart + i * 3;
    const bEnd   = bStart + 12;
    const drawP  = clamp((frame - bStart) / (bEnd - bStart));
    const ex = interpolate(drawP, [0, 1], [boltSrcX, tgt.x]);
    const ey = interpolate(drawP, [0, 1], [boltSrcY, tgt.y]);
    const mainPath   = lightningPath(boltSrcX, boltSrcY, ex, ey, i + 1);
    const headPath   = arrowHead(boltSrcX, boltSrcY, tgt.x, tgt.y, 28);
    const marchOffset = (frame * 3) % 40;
    const pulseOp = drawP >= 1 ? 0.5 + Math.sin(frame * 0.35 + i * 2.1) * 0.3 : drawP * 0.8;
    const impactP = clamp((frame - bEnd) / 5);
    return { mainPath, headPath, drawP, pulseOp, marchOffset, impactP, bEnd, tgt };
  });

  const boltActive = frame >= T.boltStart;
  const borderGlow = boltActive
    ? `rgba(255,189,46,${0.65 + Math.sin(frame * 0.25) * 0.2})`
    : "rgba(150,150,165,0.4)";

  // ══ Phase 1 → 2 fade (60-70) ═════════════════════════════════════════════
  // Parent + lightning fade from 1 → 0 over frames 60-70
  const phase1Opacity = interpolate(frame, [T.fadeStart, T.fadeEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ══ Phase 2: code windows (64-140) ═══════════════════════════════════════

  // Left window slides from off-screen left → WIN_L_X
  const winInSpringL = spring({
    fps, frame: frame - T.winInStart,
    config: { damping: 15, stiffness: 160, mass: 0.9 },
    durationInFrames: 18,
  });
  const winLx = interpolate(clamp(winInSpringL), [0, 1], [-(WIN_W + 60), WIN_L_X]);

  // Right window slides from off-screen right → WIN_R_X
  const winInSpringR = spring({
    fps, frame: frame - (T.winInStart + 2),
    config: { damping: 15, stiffness: 160, mass: 0.9 },
    durationInFrames: 18,
  });
  const winRx = interpolate(clamp(winInSpringR), [0, 1], [VIDEO_W + 60, WIN_R_X]);

  // Windows opacity fades in with the slide
  const winOpacity = interpolate(frame, [T.winInStart, T.winInStart + 8], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Icon pop springs — LEFT (bad) X icon
  const iconSpringL = spring({
    fps, frame: frame - T.iconPop,
    config: { damping: 7, stiffness: 320, mass: 0.5 },
    durationInFrames: 14,
  });
  const iconScaleL = frame >= T.iconPop ? Math.max(0, iconSpringL) : 0;

  // RIGHT (good) tick icon — slightly staggered
  const iconSpringR = spring({
    fps, frame: frame - (T.iconPop + 4),
    config: { damping: 7, stiffness: 320, mass: 0.5 },
    durationInFrames: 14,
  });
  const iconScaleR = frame >= T.iconPop + 4 ? Math.max(0, iconSpringR) : 0;

  // ══ Phase 2 exit (140-154) ════════════════════════════════════════════════
  const winOutSpringL = spring({
    fps, frame: frame - T.winOutStart,
    config: { damping: 16, stiffness: 180, mass: 0.85 },
    durationInFrames: 14,
  });
  const winOutSpringR = spring({
    fps, frame: frame - (T.winOutStart + 2),
    config: { damping: 16, stiffness: 180, mass: 0.85 },
    durationInFrames: 14,
  });

  // Apply exit offsets on top of resting positions
  const exitOffL = frame >= T.winOutStart
    ? interpolate(clamp(winOutSpringL), [0, 1], [0, -(WIN_W + 120)])
    : 0;
  const exitOffR = frame >= T.winOutStart + 2
    ? interpolate(clamp(winOutSpringR), [0, 1], [0, WIN_W + 120])
    : 0;

  const finalWinLx = winLx + exitOffL;
  const finalWinRx = winRx + exitOffR;

  // Win opacity also fades out on exit
  const winExitOpacity = frame >= T.winOutStart
    ? interpolate(frame, [T.winOutStart + 6, T.winOutEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;
  const finalWinOpacity = winOpacity * winExitOpacity;

  // ── Vertical centering: align both windows to same Y baseline ────────────
  // Left window is taller, so we vertically center both around the same midpoint
  const midY = VIDEO_H / 2 - 40;
  const winLy = midY - WIN_L_H / 2;
  const winRy = midY - WIN_R_H / 2;

  return (
    <AbsoluteFill>

      {/* ══ PHASE 1 ══════════════════════════════════════════════════════════ */}
      <div style={{ opacity: phase1Opacity, pointerEvents: "none" }}>

        {/* SVG lightning */}
        <svg style={{ position: "absolute", left: 0, top: 0, width: VIDEO_W, height: VIDEO_H, zIndex: 20, overflow: "visible" }}
          viewBox={`0 0 ${VIDEO_W} ${VIDEO_H}`}>
          <defs>
            {bolts.map((_, i) => (
              <filter key={i} id={`glow${i}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            ))}
          </defs>
          {bolts.map((b, i) => {
            if (b.drawP <= 0) return null;
            return (
              <g key={i} filter={`url(#glow${i})`} opacity={b.pulseOp}>
                <path d={b.mainPath} fill="none" stroke="rgba(255,220,80,0.25)" strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14 26" strokeDashoffset={-b.marchOffset} />
                <path d={b.mainPath} fill="none" stroke="#FFD700" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14 26" strokeDashoffset={-b.marchOffset} />
                <path d={b.mainPath} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="14 26" strokeDashoffset={-b.marchOffset} />
                {b.drawP >= 1 && (<>
                  <path d={b.headPath} fill="none" stroke="#FFD700" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                  <path d={b.headPath} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </>)}
                {b.impactP > 0 && b.impactP < 1 && (
                  <circle cx={b.tgt.x} cy={b.tgt.y}
                    r={interpolate(b.impactP, [0, 1], [8, 55])}
                    fill="none"
                    stroke={`rgba(255,200,50,${interpolate(b.impactP, [0, 0.3, 1], [0.9, 0.6, 0])})`}
                    strokeWidth={4} />
                )}
              </g>
            );
          })}
        </svg>

        {/* Parent container */}
        <div style={{
          position: "absolute", left: PARENT_X, top: PARENT_Y,
          width: PARENT_W, height: PARENT_H, borderRadius: 28,
          background: "transparent", border: `6px solid ${borderGlow}`,
          zIndex: 10, overflow: "visible",
          boxShadow: boltActive ? "0 0 50px rgba(255,189,46,0.18), inset 0 0 30px rgba(255,189,46,0.04)" : "none",
        }}>
          <div style={{
            position: "absolute", top: -22, left: "50%", transform: "translateX(-50%)",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
            color: "#FFFFFF", letterSpacing: "0.08em",
            background: "rgba(150,150,165,0.18)", border: "1.5px solid rgba(150,150,165,0.45)",
            borderRadius: "100px", padding: "6px 24px", whiteSpace: "nowrap",
          }}>parent</div>
          <div style={{ display: "flex", gap: 60, position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)" }}>
            {[0, 1].map((eye) => (
              <div key={eye} style={{ width: 50, height: 50, borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#1a1a2e", position: "relative", transform: `translate(${Math.sin(frame * 0.08) * 5}px, 5px)` }}>
                  <div style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", opacity: 0.85 }} />
                </div>
              </div>
            ))}
          </div>
          {btnLefts.map((left, i) => {
            const b = bolts[i];
            const impactDecay = clamp((frame - b.bEnd) / 14);
            const btnShakeMag = b.impactP > 0 ? interpolate(impactDecay, [0, 0.15, 1], [0, 6, 0]) : 0;
            const btnShakeX = Math.sin(frame * 4.2 + i) * btnShakeMag;
            const btnShakeY = Math.cos(frame * 5.1 + i) * btnShakeMag * 0.6;
            const flashOp = b.impactP > 0 ? interpolate(impactDecay, [0, 0.2, 1], [1, 0.8, 0]) : 0;
            const glowStr = b.drawP >= 1
              ? `0 0 ${interpolate(impactDecay, [0, 0.3, 1], [40, 22, 10])}px rgba(255,189,46,${interpolate(impactDecay, [0, 0.3, 1], [0.9, 0.55, 0.2])}), 0 6px 20px rgba(0,0,0,0.4)`
              : "0 6px 20px rgba(0,0,0,0.4)";
            const emoji = b.impactP > 0 && impactDecay < 0.5 ? "😵" : "😐";
            return (
              <div key={i} style={{ position: "absolute", left: left + btnShakeX, top: BTN_TOP + btnShakeY, width: BTN_W, height: BTN_H }}>
                <div style={{ width: BTN_W, height: BTN_H, borderRadius: 18, backgroundColor: "#FFFFFF", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", boxShadow: glowStr, border: flashOp > 0 ? `3px solid rgba(255,189,46,${flashOp})` : "3px solid transparent", boxSizing: "border-box" }}>
                  Click Me <span style={{ fontSize: 26 }}>{emoji}</span>
                </div>
                <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "rgba(171,178,191,0.5)", whiteSpace: "nowrap" }}>{`button${i + 1}`}</div>
              </div>
            );
          })}
        </div>

        {/* Badge */}
        <div style={{
          position: "absolute", left: badgeX + shakeX, top: badgeY + shakeY,
          width: BADGE_SIZE, height: BADGE_SIZE, borderRadius: 20,
          background: "rgba(255,189,46,0.15)", border: "2px solid rgba(255,189,46,0.7)",
          boxShadow: `0 8px 28px rgba(0,0,0,0.6), 0 0 ${20 + Math.sin(frame * 0.4) * 8}px rgba(255,189,46,0.3)`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
          zIndex: 30, transform: `rotate(${badgeRot}deg)`, transformOrigin: "center center",
        }}>
          <RadarIcon color="#FFBD2E" size={48} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#FFBD2E", letterSpacing: "0.04em", fontWeight: 700, transform: `rotate(${-badgeRot}deg)`, display: "block" }}>listener</span>
        </div>

      </div>{/* end phase1 opacity wrapper */}

      {/* ══ PHASE 2: Code windows ════════════════════════════════════════════ */}
      {frame >= T.winInStart && (
        <>
          {/* Left — BAD (longer, X icon) */}
          <CodeWindow
            x={finalWinLx} y={winLy}
            w={WIN_W} h={WIN_L_H}
            opacity={finalWinOpacity}
            rows={BAD_ROWS}
            isGood={false}
            iconScale={iconScaleL}
          />
          {/* Right — GOOD (shorter, tick icon) */}
          <CodeWindow
            x={finalWinRx} y={winRy}
            w={WIN_W} h={WIN_R_H}
            opacity={finalWinOpacity}
            rows={GOOD_ROWS}
            isGood={true}
            iconScale={iconScaleR}
          />
        </>
      )}

    </AbsoluteFill>
  );
};