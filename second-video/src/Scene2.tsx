// Scene 2 — "The API Loop"
//
// Updates:
// - Server: Base scale increased to 1.2 with stronger jerk/shake response.
// - Search Bar Recoil: The bar kicks down whenever a request is "shot".
// - Keyboard: Restored from Scene 1.
// - Paths: Thicker lines, wider horizontal stretches, and dual vertical stubs.
// - 404 Card: Simplified (text only).
// - HUD: Progress bar moved higher, search bar glow reduced.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Path & Layout Coordinates ────────────────────────────────────────────────

const CX = 540;
const SERVER_Y = 380;       
const BOTTOM_H_Y = 1220;    
const SIDE_X_OFFSET = 360;  
const STUB_X_OFFSET = 120;  
const CLIENT_Y = 1400;

const P_SERVER  = { x: CX, y: SERVER_Y };
const P_CLIENT_OUT = { x: CX + STUB_X_OFFSET, y: CLIENT_Y };
const P_CLIENT_IN  = { x: CX - STUB_X_OFFSET, y: CLIENT_Y };

const TOTAL_DIST_HALF = 1600;

function getOutboundPos(p: number) {
  const d = p * TOTAL_DIST_HALF;
  if (d < 180) return { x: CX + STUB_X_OFFSET, y: interpolate(d, [0, 180], [CLIENT_Y, BOTTOM_H_Y]) };
  if (d < 500) return { x: interpolate(d, [180, 500], [CX + STUB_X_OFFSET, CX + SIDE_X_OFFSET]), y: BOTTOM_H_Y };
  if (d < 1340) return { x: CX + SIDE_X_OFFSET, y: interpolate(d, [500, 1340], [BOTTOM_H_Y, SERVER_Y]) };
  return { x: interpolate(d, [1340, 1600], [CX + SIDE_X_OFFSET, CX]), y: SERVER_Y };
}

function getInboundPos(p: number) {
  const d = p * TOTAL_DIST_HALF;
  if (d < 440) return { x: interpolate(d, [0, 440], [CX, CX - SIDE_X_OFFSET]), y: SERVER_Y };
  if (d < 1280) return { x: CX - SIDE_X_OFFSET, y: interpolate(d, [440, 1280], [SERVER_Y, BOTTOM_H_Y]) };
  if (d < 1420) return { x: interpolate(d, [1280, 1420], [CX - SIDE_X_OFFSET, CX - STUB_X_OFFSET]), y: BOTTOM_H_Y };
  return { x: CX - STUB_X_OFFSET, y: interpolate(d, [1420, 1600], [BOTTOM_H_Y, CLIENT_Y]) };
}

// ─── Timing Constants ─────────────────────────────────────────────────────────

const WORD = "Avengers";
const TYPING_START = 15;
const CHAR_INTERVAL = 22; 
const TRAVEL_FRAMES = 140; 

// ─── Components ───────────────────────────────────────────────────────────────

const Keyboard: React.FC = () => (
  <svg width="600" height="120" viewBox="0 0 700 140" fill="none">
    <rect x="0" y="0" width="700" height="90" rx="14" fill="#1A1F2E" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
    {[...Array(14)].map((_, i) => <rect key={`f${i}`} x={10 + i * 49} y={8} width={40} height={22} rx={5} fill="rgba(255,255,255,0.06)" />)}
    {[...Array(13)].map((_, i) => <rect key={`m${i}`} x={10 + i * 52} y={36} width={44} height={24} rx={5} fill="rgba(255,255,255,0.07)" />)}
    <rect x={160} y={92} width={380} height={20} rx={5} fill="rgba(255,255,255,0.10)" />
  </svg>
);

const ServerGraphic: React.FC<{ hitPulse: number }> = ({ hitPulse }) => {
  // Increased base scale and intensified jerk/shake to reflect the larger size
  const scale = interpolate(hitPulse, [0, 0.1, 1], [1.2, 1.25, 1.28]); 
  const jerkY = interpolate(hitPulse, [0, 0.1, 1], [0, -10, 0]);
  const shakeX = Math.sin(hitPulse * Math.PI * 2) * 5 * hitPulse;
  
  return (
    <div style={{
      position: "absolute", top: SERVER_Y, left: CX,
      transform: `translate(-50%, -50%) translate(${shakeX}px, ${jerkY}px) scale(${scale})`,
      display: "flex", flexDirection: "column", gap: 10, zIndex: 100,
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 240, height: 55, background: "#161B22",
          border: `2px solid ${hitPulse > 0.4 ? COLORS.accentB : "#30363D"}`,
          borderRadius: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", padding: "0 25px", gap: 14
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: hitPulse > 0.1 ? COLORS.accentB : "#333" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: hitPulse > 0.6 ? COLORS.accentA : "#333" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 60, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
        </div>
      ))}
      <div style={{ textAlign: "center", marginTop: 8, fontFamily: FONTS.mono, fontSize: 26, color: COLORS.subtle, fontWeight: 900 }}>MOVIE SERVER</div>
    </div>
  );
};

const Particle: React.FC<{ index: number; accumText: string; frame: number }> = ({ index, accumText, frame }) => {
  const startFrame = TYPING_START + index * CHAR_INTERVAL;
  const age = frame - startFrame;
  const globalP = age / TRAVEL_FRAMES;
  if (globalP < 0 || globalP > 1) return null;

  const isRight = globalP <= 0.5;
  const pHalf = isRight ? globalP * 2 : (globalP - 0.5) * 2;
  const pos = isRight ? getOutboundPos(pHalf) : getInboundPos(pHalf);
  const d = pHalf * TOTAL_DIST_HALF;

  let type: "dot" | "req" | "res" = "dot";
  let scale = 1;

  if (isRight && d > 500 && d < 1340) {
    type = "req";
    scale = interpolate(d, [500, 600, 1240, 1340], [0, 1, 1, 0], { extrapolate: "clamp" });
  } else if (!isRight && d > 440 && d < 1280) {
    type = "res";
    scale = interpolate(d, [440, 540, 1180, 1280], [0, 1, 1, 0], { extrapolate: "clamp" });
  }

  const isSuccess = accumText === WORD;
  const color = isRight ? COLORS.accentB : (isSuccess ? COLORS.accentA : COLORS.accentC);

  return (
    <div style={{ position: "absolute", top: pos.y, left: pos.x, transform: "translate(-50%, -50%)", zIndex: 30 }}>
      {type === "dot" ? (
        <div style={{ width: 24, height: 24, borderRadius: "50%", background: color, boxShadow: `0 0 30px ${color}` }} />
      ) : type === "req" ? (
        <div style={{
          background: COLORS.codeBg, border: `3px solid ${COLORS.accentB}`, padding: "16px 28px", borderRadius: 20,
          fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: "white", transform: `scale(${scale})`
        }}>
          GET "{accumText}"
        </div>
      ) : (
        <div style={{
          width: 200, height: 180, background: "#161B22", border: `3px solid ${color}`, borderRadius: 24,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`,
          boxShadow: "0 20px 50px rgba(0,0,0,0.6)"
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 50, color, fontWeight: 900 }}>404</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: "white", marginTop: 4 }}>Not found</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const activeRequests = WORD.split("").filter((_, i) => {
    const age = frame - (TYPING_START + i * CHAR_INTERVAL);
    return age > 0 && age < TRAVEL_FRAMES;
  }).length;

  const serverHit = WORD.split("").reduce((acc, _, i) => {
    const hitFrame = TYPING_START + i * CHAR_INTERVAL + TRAVEL_FRAMES / 2;
    const diff = frame - hitFrame;
    return (diff > 0 && diff < 15) ? Math.max(acc, interpolate(diff, [0, 4, 15], [0, 1, 0])) : acc;
  }, 0);

  // Calculate recoil for search bar (dip down on shoot)
  const recoilY = WORD.split("").reduce((acc, _, i) => {
    const shootFrame = TYPING_START + i * CHAR_INTERVAL;
    const diff = frame - shootFrame;
    const dip = (diff >= 0 && diff < 15) 
      ? interpolate(diff, [0, 3, 15], [0, 25, 0], { extrapolateRight: "clamp" }) 
      : 0;
    return Math.max(acc, dip);
  }, 0);

  const typedText = WORD.slice(0, Math.min(Math.floor(Math.max(frame - TYPING_START, 0) / CHAR_INTERVAL), WORD.length));

  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "transparent" }}>
      
      {/* ── Path Lines ── */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", zIndex: 0 }}>
        <path 
          d={`M ${P_CLIENT_OUT.x} ${CLIENT_Y} V ${BOTTOM_H_Y} H ${CX + SIDE_X_OFFSET} V ${SERVER_Y} H ${CX}`}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" strokeDasharray="15 20" 
        />
        <path 
          d={`M ${CX} ${SERVER_Y} H ${CX - SIDE_X_OFFSET} V ${BOTTOM_H_Y} H ${P_CLIENT_IN.x} V ${CLIENT_Y}`}
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" strokeDasharray="15 20" 
        />
      </svg>

      <ServerGraphic hitPulse={serverHit} />

      {WORD.split("").map((_, i) => (
        <Particle key={i} index={i} accumText={WORD.slice(0, i + 1)} frame={frame} />
      ))}

      {/* ── Client / Search Bar ── */}
      <div style={{ 
        position: "absolute", top: CLIENT_Y, left: CX, 
        transform: `translate(-50%, -50%) translateY(${recoilY}px)`, 
        zIndex: 40, display: "flex", flexDirection: "column", alignItems: "center" 
      }}>
        <div style={{ position: "absolute", top: 0, width: 400, height: 100, background: COLORS.accentC, filter: "blur(50px)", opacity: activeRequests > 3 ? 0.15 : 0, zIndex: -1 }} />
        
        <div style={{ width: 500, background: COLORS.codeBg, border: "3px solid rgba(255,255,255,0.15)", borderRadius: 24, padding: "28px 36px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)" }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 44, fontWeight: 700, color: COLORS.codeText }}>
            {typedText}
            <span style={{ display: "inline-block", width: 4, height: "0.8em", background: COLORS.accentB, marginLeft: 6, opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0 }} />
          </span>
        </div>

        <div style={{ marginTop: 30, transform: "perspective(800px) rotateX(30deg)", opacity: 0.9 }}>
          <Keyboard />
        </div>
      </div>

      {/* ── HUD ── */}
      <div style={{ position: "absolute", bottom: 220, left: "50%", transform: "translateX(-50%)", width: 600, padding: 30, background: "rgba(22, 27, 34, 0.8)", border: "2px solid rgba(255,255,255,0.1)", borderRadius: 24, backdropFilter: "blur(20px)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontFamily: FONTS.mono, fontSize: 26, fontWeight: 700 }}>
          <span style={{ color: "white" }}>App Speed</span>
          <span style={{ color: activeRequests > 3 ? COLORS.accentC : COLORS.accentA }}>
            {activeRequests < 1 ? "OPTIMAL" : activeRequests < 4 ? "LAGGING..." : "CRITICAL 🐢"}
          </span>
        </div>
        <div style={{ width: "100%", height: 16, background: "rgba(255,255,255,0.1)", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${Math.min((activeRequests / 6) * 100, 100)}%`, background: activeRequests > 3 ? COLORS.accentC : COLORS.accentA }} />
        </div>
      </div>

    </AbsoluteFill>
  );
};