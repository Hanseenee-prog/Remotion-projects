// Scene 5 — "Now, every time a new request is sent… the previous one is completely cancelled.
//            No outdated responses. No race conditions.
//            If your app has search, filters, or repeated actions… you need this."
// Duration: 420 frames @ 30fps  |  1080 × 1920

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const FONTS = { sans: "Inter, system-ui, -apple-system, sans-serif" };

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function prog(f: number, a: number, b: number) { return clamp01((f - a) / (b - a)); }

// ─────────────────────────────────────────────────────────────────────────────
// SERVER — flat stacked (matches Scene1)
// ─────────────────────────────────────────────────────────────────────────────
const ServerIcon: React.FC<{ scale: number; opacity: number; glow?: number; borderGreen?: boolean }> = ({
  scale, opacity, glow = 0, borderGreen = false,
}) => {
  const W = 340; const UH = 78; const GAP = 10;
  const totalH = 3 * UH + 2 * GAP + 28;
  const leds = [
    ["#3ec66a", "#3ec66a", "#ea4335"],
    ["#3ec66a", "#fbbc04", "#3ec66a"],
    ["#3ec66a", "#3ec66a", "#3ec66a"],
  ];
  return (
    <div style={{
      transform: `scale(${scale})`, opacity,
      transformOrigin: "top center",
      filter: borderGreen
        ? "drop-shadow(0 24px 40px rgba(0,0,0,0.55)) drop-shadow(0 0 24px rgba(52,211,153,0.7))"
        : "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
      position: "relative",
      border: borderGreen ? "3px solid rgba(52,211,153,0.85)" : "3px solid transparent",
      borderRadius: 12,
      transition: "border-color 0.1s",
    }}>
      {/* Success glow ring */}
      {glow > 0 && (
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          width: 500, height: 500,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(circle, rgba(52,211,153,${glow * 0.5}) 0%, transparent 70%)`,
          pointerEvents: "none", zIndex: -1,
        }} />
      )}
      <svg width={W + 40} height={totalH} viewBox={`0 0 ${W + 40} ${totalH}`}>
        <ellipse cx={(W + 40) / 2} cy={totalH - 4} rx={W * 0.48} ry={10} fill="rgba(0,0,0,0.28)" />
        {[0, 1, 2].map((u) => {
          const y = u * (UH + GAP);
          return (
            <g key={u} transform={`translate(20, ${y})`}>
              <rect x={0} y={0} width={W} height={8} rx={4} fill="#5a6478" />
              <rect x={0} y={6} width={W} height={UH - 6} rx={6} fill="#4a5568" />
              <rect x={W * 0.38} y={6} width={W * 0.62} height={UH - 6} rx={4} fill="#2d3748" />
              {[0,1,2,3].map((col) => [0,1,2].map((row) => (
                <rect key={`${col}-${row}`} x={16 + col * 16} y={16 + row * 16}
                  width={9} height={9} rx={2} fill="rgba(0,0,0,0.45)" />
              )))}
              {[0, 1].map((s) => (
                <rect key={s} x={W * 0.38 + 16} y={18 + s * 22}
                  width={W * 0.38} height={14} rx={4} fill="rgba(0,0,0,0.35)" />
              ))}
              {leds[u].map((c, li) => (
                <g key={li}>
                  <circle cx={W - 28} cy={22 + li * 17} r={5} fill={c} />
                  <circle cx={W - 28} cy={22 + li * 17} r={9} fill={c} opacity={0.25} />
                </g>
              ))}
              <rect x={0} y={UH - 4} width={W} height={4} rx={2} fill="rgba(0,0,0,0.3)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CANNON — proper artillery with real side wheels + recoiling barrel
// The barrel points straight up. Wheels are large circles on each side.
// ─────────────────────────────────────────────────────────────────────────────
const Cannon: React.FC<{ recoil: number }> = ({ recoil }) => {
  const barrelPush = recoil;

  // Wheel SVG — reused for both sides, bronze/wood spoked artillery wheel
  const Wheel = () => (
    <svg width="150" height="150" viewBox="0 0 150 150">
      {/* Shadow under wheel */}
      <ellipse cx="75" cy="144" rx="58" ry="7" fill="rgba(0,0,0,0.35)" />
      {/* Outer tyre — dark iron */}
      <circle cx="75" cy="75" r="68" fill="#1c1008" stroke="#3a2808" strokeWidth="5" />
      {/* Tyre inner edge */}
      <circle cx="75" cy="75" r="60" fill="none" stroke="#4a3510" strokeWidth="3" />
      {/* Wooden rim — warm brown */}
      <circle cx="75" cy="75" r="55" fill="#7a4a18" stroke="#5c3410" strokeWidth="2" />
      {/* Tread blocks on outer tyre */}
      {Array.from({ length: 16 }).map((_, i) => {
        const ang = (i / 16) * Math.PI * 2;
        const x1 = 75 + Math.cos(ang) * 57; const y1 = 75 + Math.sin(ang) * 57;
        const x2 = 75 + Math.cos(ang) * 67; const y2 = 75 + Math.sin(ang) * 67;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2e1c04" strokeWidth="5" strokeLinecap="round" />;
      })}
      {/* Wooden spokes — 8 spokes, warm oak color */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const ix = 75 + Math.cos(ang) * 18; const iy = 75 + Math.sin(ang) * 18;
        const ox = 75 + Math.cos(ang) * 53; const oy = 75 + Math.sin(ang) * 53;
        return (
          <line key={i} x1={ix} y1={iy} x2={ox} y2={oy}
            stroke="#c8821a" strokeWidth="7" strokeLinecap="round"
            style={{ filter: "drop-shadow(1px 2px 3px rgba(0,0,0,0.5))" }} />
        );
      })}
      {/* Spoke highlight */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const ix = 75 + Math.cos(ang) * 20; const iy = 75 + Math.sin(ang) * 20;
        const ox = 75 + Math.cos(ang) * 50; const oy = 75 + Math.sin(ang) * 50;
        return <line key={i} x1={ix} y1={iy} x2={ox} y2={oy}
          stroke="rgba(255,190,80,0.25)" strokeWidth="3" strokeLinecap="round" />;
      })}
      {/* Hub plate — iron */}
      <circle cx="75" cy="75" r="20" fill="#2a1e0e" stroke="#5a4020" strokeWidth="3" />
      <circle cx="75" cy="75" r="13" fill="#3c2a10" />
      {/* Hub bolts */}
      {Array.from({ length: 6 }).map((_, i) => {
        const ang = (i / 6) * Math.PI * 2;
        return <circle key={i} cx={75 + Math.cos(ang) * 10} cy={75 + Math.sin(ang) * 10}
          r={3} fill="#888" stroke="#444" strokeWidth="1" />;
      })}
      {/* Center axle cap */}
      <circle cx="75" cy="75" r="6" fill="#aaa" stroke="#666" strokeWidth="1.5" />
    </svg>
  );

  return (
    <div style={{
      width: 380, height: 340,
      scale: 1.4,
      position: "relative",
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      {/* ── Left wheel — sits flush at bottom ── */}
      <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 2 }}>
        <Wheel />
      </div>

      {/* ── Right wheel ── */}
      <div style={{ position: "absolute", right: 0, bottom: 0, zIndex: 2 }}>
        <Wheel />
      </div>

      {/* ── Axle — spans between wheel hubs ── */}
      <div style={{
        position: "absolute", bottom: 68, left: 72, right: 72, height: 18,
        background: "linear-gradient(to bottom, #999, #444, #888)",
        borderRadius: 9, zIndex: 1,
        boxShadow: "0 4px 12px rgba(0,0,0,0.6)",
      }} />

      {/* ── Barrel (points straight up, recoils downward) ── */}
      <div style={{
        position: "absolute",
        bottom: 88 - barrelPush,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        transition: "none",
      }}>
        {/* Muzzle crown */}
        <div style={{
          width: 74, height: 18, margin: "0 auto",
          background: "linear-gradient(to bottom, #aaa, #666)",
          borderRadius: "10px 10px 0 0",
          border: "2px solid #333",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.4)",
        }} />
        {/* Main barrel tube */}
        <div style={{
          width: 66, height: 150, margin: "0 auto",
          background: "linear-gradient(to right, #1a1a1a 0%, #5a5a5a 35%, #8a8a8a 50%, #5a5a5a 65%, #1a1a1a 100%)",
          borderRadius: "2px 2px 0 0",
          border: "2px solid #0a0a0a",
          boxShadow: "inset 0 0 16px rgba(0,0,0,0.5), 0 -10px 30px rgba(0,0,0,0.5)",
        }} />
        {/* Reinforcement bands */}
        {[18, 55, 95, 130].map((y) => (
          <div key={y} style={{
            position: "absolute", top: 18 + y, left: "50%",
            transform: "translateX(-50%)",
            width: 78, height: 13,
            background: "linear-gradient(to bottom, #bbb 0%, #666 50%, #bbb 100%)",
            borderRadius: 5,
            border: "1.5px solid #222",
            boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
          }} />
        ))}
      </div>

      {/* ── Cannon body / turret ── */}
      <div style={{
        position: "absolute", bottom: 52,
        left: "50%", transform: "translateX(-50%)",
        width: 148, height: 118,
        background: "radial-gradient(ellipse at 38% 32%, #686868 0%, #2e2e2e 55%, #111 100%)",
        borderRadius: "52% 52% 38% 38%",
        border: "3px solid #0a0a0a",
        boxShadow: "0 16px 48px rgba(0,0,0,0.8), inset 0 2px 10px rgba(255,255,255,0.08)",
        zIndex: 3,
      }} />

      {/* ── Carriage / base platform ── */}
      <div style={{
        position: "absolute", bottom: 24,
        left: "50%", transform: "translateX(-50%)",
        width: 200, height: 44,
        background: "linear-gradient(to bottom, #6b4a1a, #3a2408)",
        borderRadius: "10px 10px 16px 16px",
        border: "2px solid #1a0e04",
        boxShadow: "0 10px 28px rgba(0,0,0,0.7)",
        zIndex: 2,
      }} />
      {/* Carriage detail lines */}
      <div style={{
        position: "absolute", bottom: 36,
        left: "50%", transform: "translateX(-50%)",
        width: 186, height: 3,
        background: "rgba(0,0,0,0.4)",
        borderRadius: 2, zIndex: 3,
      }} />

      {/* ── Ground shadow ── */}
      <div style={{
        position: "absolute", bottom: -8,
        left: "50%", transform: "translateX(-50%)",
        width: 340, height: 20,
        background: "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)",
        borderRadius: "50%", zIndex: 0,
      }} />

      {/* ── Muzzle flash on shoot ── */}
      {barrelPush > 30 && (
        <div style={{
          position: "absolute", bottom: 88 - barrelPush + 168,
          left: "50%", transform: "translateX(-50%)",
          width: 56, height: 56,
          background: "radial-gradient(circle, #fff 0%, #ffcc00 40%, transparent 75%)",
          borderRadius: "50%",
          opacity: clamp01(1 - (barrelPush - 30) / 20),
          zIndex: 10,
        }} />
      )}
    </div>
  );
};



// ─────────────────────────────────────────────────────────────────────────────
// IMPOSTER
// ─────────────────────────────────────────────────────────────────────────────
const ImposterAvatar: React.FC<{
  color: string; backpack: string; size?: number; grayscale?: boolean;
}> = ({ color, backpack, size = 96, grayscale = false }) => (
  <svg
    width={size * 1.3} height={size * 1.3 * 1.25} viewBox="0 0 80 100"
    style={{
      filter: grayscale
        ? "grayscale(1) brightness(0.5) drop-shadow(0 10px 20px rgba(0,0,0,0.6))"
        : "drop-shadow(0 12px 24px rgba(0,0,0,0.5))",
    }}
  >
    <rect x="0" y="30" width="20" height="40" rx="8" fill={backpack} />
    <rect x="15" y="10" width="50" height="80" rx="25" fill={color} />
    <rect x="40" y="25" width="35" height="25" rx="12" fill="#8ab4f8" />
    <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
// RADAR BEAM — triangle fan pointing upward, pans via CSS rotation
// Exact approach from reference file
// ─────────────────────────────────────────────────────────────────────────────
const Radar: React.FC<{ sweepAngle: number; opacity: number; lockFlash?: boolean }> = ({
  sweepAngle, opacity, lockFlash = false,
}) => {
  const beamColor = lockFlash ? "rgba(255, 60, 60, 0.9)" : "rgba(255, 255, 255, 0.5)";
  const width = lockFlash ? 60 : 260;
  return (
    <div style={{
      position: "absolute",
      top: 10,
      left: "50%",
      width: 0,
      height: 0,
      opacity,
      transform: `translateX(-50%) rotate(${sweepAngle}deg)`,
      transformOrigin: "0 0",
      zIndex: -1,
      pointerEvents: "none",
    }}>
      <svg
        width="700" height="900"
        viewBox="-350 -900 700 900"
        style={{ position: "absolute", left: -350, bottom: 0 }}
      >
        <defs>
          <radialGradient id="radarFanGrad" cx="50%" cy="100%" r="100%">
            <stop offset="0%" stopColor={beamColor} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <polygon
          points={`0,0 ${-width},-900 ${width},-900`}
          fill="url(#radarFanGrad)"
        />
      </svg>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPLOSION — enhanced burst with ring + particles + shockwave
// ─────────────────────────────────────────────────────────────────────────────
const Explosion: React.FC<{ active: boolean; frame: number; color: string }> = ({
  active, frame, color,
}) => {
  if (!active || frame < 0) return null;
  const p = easeOut(clamp01(frame / 24));
  if (p >= 1) return null;

  const innerP = clamp01(frame / 10);

  return (
    <div style={{ position: "absolute", top: "50%", left: "50%", width: 0, height: 0, zIndex: 30 }}>
      {/* Shockwave ring */}
      <div style={{
        position: "absolute",
        width: p * 260, height: p * 260,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: `4px solid ${color}`,
        opacity: (1 - p) * 0.7,
      }} />
      {/* Secondary ring */}
      <div style={{
        position: "absolute",
        width: p * 160, height: p * 160,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        border: `6px solid rgba(255,255,255,${(1 - p) * 0.5})`,
        opacity: 1 - p,
      }} />
      {/* Core flash */}
      <div style={{
        position: "absolute",
        width: (1 - innerP) * 100, height: (1 - innerP) * 100,
        background: `radial-gradient(circle, #fff 0%, ${color} 50%, transparent 80%)`,
        borderRadius: "50%",
        transform: "translate(-50%, -50%)",
        opacity: (1 - innerP) * 0.95,
        boxShadow: `0 0 60px 20px ${color}`,
      }} />
      {/* Particles */}
      {Array.from({ length: 18 }).map((_, i) => {
        const ang  = (i / 18) * Math.PI * 2;
        const dist = p * (100 + (i % 3) * 40);
        const x = Math.cos(ang) * dist;
        const y = Math.sin(ang) * dist;
        const sz = (1 - p) * (10 + (i % 4) * 6);
        return (
          <div key={i} style={{
            position: "absolute",
            left: x, top: y,
            width: sz, height: sz,
            background: i % 3 === 0 ? "#fff" : color,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 1 - p,
            boxShadow: `0 0 8px ${color}`,
          }} />
        );
      })}
      {/* Debris streaks */}
      {Array.from({ length: 8 }).map((_, i) => {
        const ang = (i / 8) * Math.PI * 2;
        const len = p * 80;
        return (
          <div key={`d${i}`} style={{
            position: "absolute",
            width: 3, height: len,
            background: `linear-gradient(to bottom, ${color}, transparent)`,
            left: Math.cos(ang) * p * 50,
            top: Math.sin(ang) * p * 50,
            transform: `translate(-50%, -50%) rotate(${ang * (180 / Math.PI) + 90}deg)`,
            opacity: 1 - p,
          }} />
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING ICON CIRCLE (for Part 2)
// ─────────────────────────────────────────────────────────────────────────────
const IconCircle: React.FC<{
  opacity: number; scale: number; floatY: number; label: string; children: React.ReactNode;
}> = ({ opacity, scale, floatY, label, children }) => (
  <div style={{
    display: "flex", flexDirection: "column", alignItems: "center", gap: 20,
    opacity, transform: `scale(${scale}) translateY(${floatY}px)`,
  }}>
    <div style={{
      width: 280, height: 280, borderRadius: "50%",
      background: "rgba(255,255,255,0.06)",
      border: "2px solid rgba(255,255,255,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.12)",
      backdropFilter: "blur(20px)",
    }}>
      {children}
    </div>
    <div style={{
      fontFamily: FONTS.sans, fontSize: 40, fontWeight: 800,
      color: "rgba(255,255,255,0.75)", letterSpacing: 1,
    }}>
      {label}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// SPIN WHEEL
// ─────────────────────────────────────────────────────────────────────────────
const SpinWheel: React.FC<{ rotation: number; opacity: number; scale: number }> = ({
  rotation, opacity, scale,
}) => {
  const R = 150;
  const segments = [
    { color: "#ea4335", label: "Search" },
    { color: "#fbbc04", label: "Filter" },
    { color: "#34a853", label: "Fetch" },
    { color: "#4285f4", label: "Query" },
    { color: "#9c27b0", label: "Load" },
    { color: "#ff7043", label: "Sort" },
    { color: "#00bcd4", label: "Find" },
    { color: "#8bc34a", label: "Scan" },
  ];
  const N = segments.length;
  const sliceAngle = (2 * Math.PI) / N;

  return (
    <div style={{ opacity, transform: `scale(${scale})`, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", width: R * 2 + 20, height: R * 2 + 20 }}>
        <svg
          width={R * 2 + 20} height={R * 2 + 20}
          style={{ transform: `rotate(${rotation}deg)`, transformOrigin: "center" }}
        >
          {segments.map((seg, i) => {
            const startA = i * sliceAngle - Math.PI / 2;
            const endA   = startA + sliceAngle;
            const cx = R + 10; const cy = R + 10;
            const x1 = cx + R * Math.cos(startA); const y1 = cy + R * Math.sin(startA);
            const x2 = cx + R * Math.cos(endA);   const y2 = cy + R * Math.sin(endA);
            const midA = startA + sliceAngle / 2;
            const tx = cx + (R * 0.68) * Math.cos(midA);
            const ty = cy + (R * 0.68) * Math.sin(midA);
            return (
              <g key={i}>
                <path
                  d={`M ${cx},${cy} L ${x1},${y1} A ${R},${R} 0 0,1 ${x2},${y2} Z`}
                  fill={seg.color}
                  stroke="#000" strokeWidth="2"
                />
                <text
                  x={tx} y={ty}
                  fill="#fff" fontSize="18" fontWeight="800"
                  fontFamily={FONTS.sans}
                  textAnchor="middle" dominantBaseline="middle"
                  transform={`rotate(${((i * 360) / N) + 360 / N / 2}, ${tx}, ${ty})`}
                >
                  {seg.label}
                </text>
              </g>
            );
          })}
          {/* Outer ring */}
          <circle cx={R + 10} cy={R + 10} r={R} fill="none" stroke="#fff" strokeWidth="5" />
          {/* Pin dots at segment edges */}
          {segments.map((_, i) => {
            const a = i * sliceAngle - Math.PI / 2;
            return (
              <circle key={`p${i}`}
                cx={(R + 10) + R * Math.cos(a)} cy={(R + 10) + R * Math.sin(a)}
                r={6} fill="#fff" />
            );
          })}
        </svg>

        {/* Center hub */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 80, height: 80, borderRadius: "50%",
          background: "#0d1117",
          border: "4px solid #fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 24px rgba(0,0,0,0.8)",
          zIndex: 10,
        }}>
          <div style={{
            fontFamily: FONTS.sans, fontSize: 15, fontWeight: 800,
            color: "#fff", textAlign: "center", lineHeight: 1.2,
          }}>
            search
          </div>
        </div>

        {/* Arrow pointer */}
        <div style={{
          position: "absolute", top: -18, left: "50%",
          transform: "translateX(-50%)",
          width: 0, height: 0,
          borderLeft: "16px solid transparent",
          borderRight: "16px solid transparent",
          borderTop: "32px solid #fff",
          zIndex: 20,
          filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
        }} />
      </div>

      <div style={{
        fontFamily: FONTS.sans, fontSize: 32, fontWeight: 700,
        color: "rgba(255,255,255,0.75)", letterSpacing: 1,
      }}>
        repeated actions
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Layout anchors ──────────────────────────────────────────────────────────
  const SERVER_TOP = 160;
  const CANNON_TOP = 1460;

  // ── Shot timing — exactly matching reference pattern ────────────────────────
  // Shot 1 (red):   T=30,  dies at 110 (before reaching server)
  // Shot 2 (cyan):  T=80,  dies at 170 (before reaching server)
  // Shot 3 (green): T=140, arrives at server at 280, then fades
  const T_SHOT_1  = 30;  const T_DEATH_1  = 110;
  const T_SHOT_2  = 80;  const T_DEATH_2  = 170;
  const T_SHOT_3  = 140; const T_ARRIVE_3 = 280;

  // ── Server entrance ─────────────────────────────────────────────────────────
  const serverSpring = spring({ frame: frame - 0, fps, config: { damping: 14, stiffness: 120 } });
  const serverOp = clamp01(prog(frame, 0, 12));
  const pulse3 = spring({ frame: frame - T_ARRIVE_3, fps, config: { damping: 10 } });
  const serverGlow = interpolate(pulse3, [0, 0.5, 1], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const serverBorderGreen = frame >= T_ARRIVE_3;

  // ── Cannon recoil ───────────────────────────────────────────────────────────
  const getRecoil = (t: number) => t < 0 ? 0 : interpolate(t, [0, 3, 20], [0, 52, 0], { extrapolateRight: "clamp" });
  const currentRecoil = getRecoil(frame - T_SHOT_1) + getRecoil(frame - T_SHOT_2) + getRecoil(frame - T_SHOT_3);

  // ── Imposter 1 (Red) ────────────────────────────────────────────────────────
  // Travels cannon→server over 180f. Freezes at its position when killed.
  const y1Live = interpolate(frame, [T_SHOT_1, T_SHOT_1 + 180], [CANNON_TOP, SERVER_TOP], { extrapolateRight: "clamp" });
  // Freeze y1 at the kill frame position
  const y1Kill = interpolate(T_DEATH_1, [T_SHOT_1, T_SHOT_1 + 180], [CANNON_TOP, SERVER_TOP], { extrapolateRight: "clamp" });
  const y1 = frame < T_DEATH_1 ? y1Live : y1Kill;
  const alive1 = frame < T_DEATH_1;

  // ── Imposter 2 (Cyan) ───────────────────────────────────────────────────────
  const y2Live = interpolate(frame, [T_SHOT_2, T_SHOT_2 + 180], [CANNON_TOP, SERVER_TOP], { extrapolateRight: "clamp" });
  const y2Kill = interpolate(T_DEATH_2, [T_SHOT_2, T_SHOT_2 + 180], [CANNON_TOP, SERVER_TOP], { extrapolateRight: "clamp" });
  const y2 = frame < T_DEATH_2 ? y2Live : y2Kill;
  const alive2 = frame >= T_SHOT_2 && frame < T_DEATH_2;

  // Radar 2 — pans left→right then snaps to zero (locked on imp1)
  const r2InStart = T_SHOT_2 + 10;  // starts scanning shortly after firing
  const r2InEnd   = T_SHOT_2 + 15;
  const r2OutSt   = T_DEATH_1 - 2;  // locks just before kill
  const r2OutEnd  = T_DEATH_1;
  const radarOp2 = interpolate(frame,
    [r2InStart, r2InEnd, r2OutSt, r2OutEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  // Pan: center → hard left → hard right → center (locked)
  const radarAngle2 = interpolate(frame,
    [r2InEnd, r2InEnd + 5, r2OutSt - 5, r2OutSt],
    [0, -45, 45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const radarLock2 = frame >= r2OutSt && frame <= r2OutEnd;

  // ── Imposter 3 (Green) ──────────────────────────────────────────────────────
  const y3 = interpolate(frame, [T_SHOT_3, T_ARRIVE_3], [CANNON_TOP, SERVER_TOP + 200], { extrapolateRight: "clamp" });
  const alive3 = frame >= T_SHOT_3;
  // Green fades as it reaches server
  const green3Op = frame >= T_SHOT_3
    ? (frame > T_ARRIVE_3
        ? interpolate(frame, [T_ARRIVE_3, T_ARRIVE_3 + 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
        : 1)
    : 0;

  // Radar 3 — same pan pattern, locks on imp2
  const r3InStart = T_SHOT_3 + 10;
  const r3InEnd   = T_SHOT_3 + 15;
  const r3OutSt   = T_DEATH_2 - 2;
  const r3OutEnd  = T_DEATH_2;
  const radarOp3 = interpolate(frame,
    [r3InStart, r3InEnd, r3OutSt, r3OutEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const radarAngle3 = interpolate(frame,
    [r3InEnd, r3InEnd + 5, r3OutSt - 5, r3OutSt],
    [0, -45, 45, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const radarLock3 = frame >= r3OutSt && frame <= r3OutEnd;

  // ── Part 1 fade-out ─────────────────────────────────────────────────────────
  const part1Out = interpolate(frame, [T_ARRIVE_3 + 6, T_ARRIVE_3 + 16], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Part 2: icon showcase (frames 251–420) ──────────────────────────────────
  const part2Op = clamp01(prog(frame, 297, 310));

  // Search icon
  const searchScale = spring({ frame: frame - 258, fps, config: { damping: 12, stiffness: 160 } });
  const searchOp    = clamp01(prog(frame, 258, 272));
  const searchFloat = Math.sin(((frame - 258) / 30) * Math.PI * 2) * 8;

  // Filter icon
  const filterScale = spring({ frame: frame - 295, fps, config: { damping: 12, stiffness: 160 } });
  const filterOp    = clamp01(prog(frame, 295, 310));
  const filterFloat = Math.sin(((frame - 295) / 30) * Math.PI * 2 + Math.PI) * 8; // opposite phase

  // Spin wheel
  const wheelScale  = spring({ frame: frame - 338, fps, config: { damping: 13, stiffness: 120 } });
  const wheelOp     = clamp01(prog(frame, 338, 354));
  const wheelRot    = ((frame - 338) / 30) * 360 * 1.4; // spins 1.4 turns/second

  // Global fade-out (last 5 frames)
  const globalOut = interpolate(frame, [415, 420], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden", fontFamily: FONTS.sans }}>

      {/* ══════════════════════════════════════════════════════
          PART 1 — CANNON SEQUENCE (frames 0–250)
      ══════════════════════════════════════════════════════ */}
      <div style={{ opacity: part1Out * globalOut, position: "absolute", inset: 0 }}>

        {/* Server */}
        <div style={{
          position: "absolute", top: SERVER_TOP, left: "50%",
          transform: "translateX(-50%)", zIndex: 10,
        }}>
          <ServerIcon scale={serverSpring} opacity={serverOp} glow={serverGlow} borderGreen={serverBorderGreen} />
        </div>

        {/* Cannon */}
        <div style={{
          position: "absolute", top: CANNON_TOP, left: "50%",
          transform: "translate(-50%, -50%)", zIndex: 20,
        }}>
          <Cannon recoil={currentRecoil} />
        </div>

        {/* ── IMPOSTER 1 (Red) ── */}
        {frame >= T_SHOT_1 && (
          <div style={{
            position: "absolute", left: "50%", top: y1,
            transform: "translate(-50%, -50%)", zIndex: 5,
          }}>
            {alive1 && <ImposterAvatar color="#ea4335" backpack="#c5221f" />}
            <Explosion active={frame >= T_DEATH_1} frame={frame - T_DEATH_1} color="#ea4335" />
          </div>
        )}

        {/* ── IMPOSTER 2 (Cyan) ── */}
        {frame >= T_SHOT_2 && (
          <div style={{
            position: "absolute", left: "50%", top: y2,
            transform: "translate(-50%, -50%)", zIndex: 6,
          }}>
            {alive2 && (
              <>
                <Radar sweepAngle={radarAngle2} opacity={radarOp2} lockFlash={radarLock2} />
                <ImposterAvatar color="#00bcd4" backpack="#0097a7" />
              </>
            )}
            <Explosion active={frame >= T_DEATH_2} frame={frame - T_DEATH_2} color="#00bcd4" />
          </div>
        )}

        {/* ── IMPOSTER 3 (Green) ── */}
        {alive3 && (
          <div style={{
            position: "absolute", left: "50%", top: y3,
            transform: "translate(-50%, -50%)", zIndex: 7,
            opacity: green3Op,
          }}>
            <Radar sweepAngle={radarAngle3} opacity={radarOp3} lockFlash={radarLock3} />
            <ImposterAvatar color="#34d399" backpack="#0f766e" />
          </div>
        )}

        {/* Server success glow */}
        {frame >= T_ARRIVE_3 && (
          <div style={{
            position: "absolute", top: SERVER_TOP + 100, left: "50%",
            width: 600, height: 400,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(52,211,153,0.35) 0%, transparent 70%)",
            pointerEvents: "none",
            opacity: serverGlow,
          }} />
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          PART 2 — ICON SHOWCASE (frames 251–420)
      ══════════════════════════════════════════════════════ */}
      <div style={{ opacity: part2Op * globalOut, position: "absolute", inset: 0 }}>

        {/* Top two icons side by side */}
        <div style={{
          position: "absolute",
          top: "30%",
          left: 0, right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          gap: 250,
        }}>

          {/* ── Search icon ── */}
          <IconCircle
            opacity={searchOp}
            scale={searchScale}
            floatY={searchFloat}
            label="search"
          >
            <svg width="130" height="130" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </IconCircle>

          {/* ── Filter icon ── */}
          <IconCircle
            opacity={filterOp}
            scale={filterScale}
            floatY={filterFloat}
            label="filters"
          >
            <svg width="130" height="130" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.0" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </IconCircle>
        </div>

        {/* ── Spin wheel — centred below the two icons ── */}
        <div style={{
          position: "absolute",
          top: "56%",
          left: 0, right: 0,
          display: "flex",
          justifyContent: "center",
          scale: 1.5
        }}>
          <SpinWheel
            rotation={wheelRot}
            opacity={wheelOp}
            scale={wheelScale}
          />
        </div>
      </div>

    </AbsoluteFill>
  );
};