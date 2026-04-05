// Scene 2 — "But imagine if every call runs heavy logic…"
// 255 frames total @ 30fps

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS } from "./tokens";
import { ROW_STYLES } from "./Scene1"; // Inheriting the accent styles

function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
const easeOut  = (t: number) => 1 - Math.pow(1 - t, 3);
const easeIn   = (t: number) => t * t * t;
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ── Layout ─────────────────────────────────────────────────────────────────────
const CX = 540;
const CY = 860;   
const CW = 740;
const CH = 520;

// ── Timing ─────────────────────────────────────────────────────────────────────
const SWAP_OUT_START = 110; 
const SWAP_OUT_END   = 130; 
const SWAP_IN_START  = 120; 
const SWAP_IN_END    = 140; 

// Slower stacking scroll, hits roughly ~4 cards max before switching
const phase1Scroll = (frame: number) => clamp(frame / 160); 
const phase2Scroll = (frame: number) => clamp((frame - 110) / 140);

// Drops quickly into red and stays there to match the shaking logic
const getFps = (frame: number) => {
  const p = clamp(frame / 60);
  const base = interpolate(p, [0, 1], [60, 15]);
  const noise = Math.sin(frame * 2.3) * 2;
  return Math.max(8, Math.round(base + noise));
};

// ── Phase 1: Stacking Cards Container ───────────────────────────────────────
const StackingContainer: React.FC<{ sp: number }> = ({ sp }) => {
  // sp goes to ~0.7, meaning offset goes to ~392, letting ~4 cards stack
  const scrollOffset = sp * 560; 

  return (
    <div style={{
      width: CW, height: CH, background: "#0D1117",
      border: "2px solid rgba(255,255,255,0.12)", borderRadius: 22, overflow: "hidden",
      boxShadow: "0 32px 80px rgba(0,0,0,0.55)", position: "relative", display: "flex"
    }}>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {Array.from({ length: 12 }).map((_, i) => {
          const s = ROW_STYLES[i % ROW_STYLES.length];
          const stackedTop = i * 20; 
          const currentTop = Math.max(stackedTop, 40 + i * 140 - scrollOffset);
          
          return (
            <div key={i} style={{
              position: "absolute", top: currentTop, left: "50%", transform: "translateX(-50%)",
              width: CW - 80, height: 120, background: s.bg, border: `1.5px solid ${s.border}`,
              borderRadius: 14, display: "flex", alignItems: "center", paddingLeft: 20, gap: 16,
              zIndex: 12 - i, 
            }}>
              <div style={{ width: 14, height: 14, borderRadius: "50%", background: s.dot, opacity: 0.8 }} />
              <div style={{ width: "40%", height: 16, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
              <div style={{ width: "20%", height: 16, borderRadius: 6, background: "rgba(255,255,255,0.03)", marginLeft: "auto", marginRight: 24 }} />
            </div>
          );
        })}
      </div>
      
      {/* Scrollbar */}
      <div style={{ width: 16, background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.07)", position: "relative", flexShrink: 0 }}>
        <div style={{
          position: "absolute", top: sp * (CH - 80), left: 2, right: 2, height: 60, borderRadius: 5,
          background: "rgba(255,255,255,0.22)",
        }} />
      </div>
    </div>
  );
};

// ── Phase 2: Tracker container ─────────────────────────────────────────────────
const TrackerContainer: React.FC<{ sp: number; frame: number }> = ({ sp, frame }) => {
  const progressPct = Math.round(sp * 100);
  const scrollOffset = sp * 800;

  // offsetHeight constantly shifting slightly to mimic heavy DOM recalculations
  const dynamicOffsetHeight = 2840 + Math.floor(Math.sin(frame * 1.5) * 6);

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        width: CW, height: CH, background: "#0D1117",
        border: "2px solid rgba(255,255,255,0.12)", borderRadius: 22, overflow: "hidden",
        boxShadow: "0 32px 80px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column",
      }}>
        <div style={{ height: 14, background: "rgba(255,255,255,0.06)", flexShrink: 0, position: "relative", zIndex: 10 }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%", width: `${sp * 100}%`,
            background: COLORS.accentA, borderRadius: "0 4px 4px 0",
          }} />
          <div style={{
            position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
            fontFamily: FONTS.mono, fontSize: 16, color: COLORS.white, fontWeight: 700,
          }}>
            {progressPct}%
          </div>
        </div>

        <div style={{ flex: 1, position: "relative", display: "flex" }}>
          <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
             {Array.from({ length: 12 }).map((_, i) => {
               const s = ROW_STYLES[i % ROW_STYLES.length];
               return (
                 <div key={i} style={{
                   position: "absolute", top: 40 + i * 140 - scrollOffset, left: "50%", transform: "translateX(-50%)",
                   width: CW - 80, height: 120, background: s.bg, border: `1.5px solid ${s.border}`,
                   borderRadius: 14, display: "flex", alignItems: "center", paddingLeft: 20, gap: 16,
                 }}>
                   <div style={{ width: 14, height: 14, borderRadius: "50%", background: s.dot, opacity: 0.8 }} />
                   <div style={{ width: "40%", height: 16, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
                 </div>
               )
             })}
          </div>
          {/* Scrollbar */}
          <div style={{ width: 16, background: "rgba(255,255,255,0.04)", borderLeft: "1px solid rgba(255,255,255,0.07)", position: "relative", flexShrink: 0 }}>
            <div style={{
              position: "absolute", top: sp * (CH - 14 - 80), left: 2, right: 2, height: 60, borderRadius: 5,
              background: "rgba(255,255,255,0.22)",
            }} />
          </div>
        </div>
      </div>

      {/* External Readouts updated to show fluctuating values */}
      <div style={{
        position: "absolute", bottom: -90, left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: 30,
      }}>
         <div style={{ background: "rgba(13,17,23,0.9)", padding: "14px 24px", borderRadius: 12, border: `1.5px solid ${COLORS.accentB}55`}}>
           <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted }}>scrollY: </span>
           <span style={{ fontFamily: FONTS.mono, fontSize: 28, color: COLORS.accentB, fontWeight: "bold" }}>{Math.round(sp * 2840)}px</span>
         </div>
         <div style={{ background: "rgba(13,17,23,0.9)", padding: "14px 24px", borderRadius: 12, border: `1.5px solid ${COLORS.muted}55`}}>
           <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted }}>offsetHeight: </span>
           <span style={{ fontFamily: FONTS.mono, fontSize: 28, color: COLORS.white, fontWeight: "bold" }}>{dynamicOffsetHeight}px</span>
         </div>
      </div>
    </div>
  );
};

// ── Scene ──────────────────────────────────────────────────────────────────────
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();

  const sp1 = phase1Scroll(frame);
  const sp2 = phase2Scroll(frame);
  const fps_disp = getFps(frame);
  const isRedZone = fps_disp < 25;
  const fpsColor = fps_disp > 45 ? COLORS.accentA : fps_disp > 25 ? "#F0C674" : COLORS.accentC;
  
  // Moderate shaking effect when in the red zone
  const shakeX = isRedZone ? Math.sin(frame * 2.5) * 3 : 0;

  // Transitions
  const phase1ExitP  = easeIn(prog(frame, SWAP_OUT_START, SWAP_OUT_END));
  const phase1X      = interpolate(phase1ExitP, [0, 1], [0, -(1080 + CW / 2)]);
  const phase1O      = interpolate(phase1ExitP, [0.6, 1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const phase2EnterP = easeOut(prog(frame, SWAP_IN_START, SWAP_IN_END));
  const phase2X      = interpolate(phase2EnterP, [0, 1], [1080 + CW / 2, 0]);
  const phase2O      = interpolate(phase2EnterP, [0, 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const title1O = interpolate(frame, [SWAP_OUT_START-10, SWAP_OUT_START], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const title2O = interpolate(frame, [SWAP_IN_START+5, SWAP_IN_START+15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>

      {/* Titles moved down halfway to container */}
      <div style={{ position: "absolute", top: 400, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 40 }}>
        <div style={{ position: "absolute", opacity: title1O, textAlign: "center" }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 50, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.02em" }}>
            Parallax Pile-up
          </div>
        </div>
        <div style={{ position: "absolute", opacity: title2O, textAlign: "center" }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 50, fontWeight: 800, color: COLORS.white, letterSpacing: "-0.02em" }}>
            Tracking Scroll Position
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute", top: CY, left: CX + phase1X,
        transform: "translate(-50%, -50%)", opacity: phase1O, zIndex: 10,
      }}>
        <StackingContainer sp={sp1} />
      </div>

      <div style={{
        position: "absolute", top: CY, left: CX + phase2X,
        transform: "translate(-50%, -50%)", opacity: phase2O, zIndex: 10,
      }}>
        <TrackerContainer sp={sp2} frame={frame} />
      </div>

      {/* Performance bar moved up */}
      <div style={{
        position: "absolute", bottom: 300, left: "50%",
        transform: `translateX(calc(-50% + ${shakeX}px))`,
        width: 760, zIndex: 30,
      }}>
        <div style={{
          padding: "18px 24px", background: "rgba(13,17,23,0.92)",
          border: `2px solid ${fpsColor}44`, borderRadius: 16, display: "flex", alignItems: "center", gap: 18,
          boxShadow: `0 0 32px ${fpsColor}18`,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: COLORS.white, flexShrink: 0 }}>
            FPS
          </span>
          <div style={{
            flex: 1, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.08)", overflow: "hidden",
          }}>
            <div style={{
              height: "100%", width: `${(fps_disp / 60) * 100}%`,
              background: fpsColor, borderRadius: 7, boxShadow: `0 0 10px ${fpsColor}66`,
            }} />
          </div>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 30, fontWeight: 800, color: fpsColor, minWidth: 90, textAlign: "right",
          }}>
            {fps_disp}
          </span>
        </div>

        {isRedZone && (
          <div style={{
            marginTop: 14, textAlign: "center", fontFamily: FONTS.mono, fontSize: 26,
            fontWeight: 800, color: COLORS.accentC, opacity: 1,
          }}>
            recalculating... 🔴
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};