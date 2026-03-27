// Scene 2 — Refined Layout
// Total duration: 155 frames

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Constants ────────────────────────────────────────────────────────────────
const RED_ACCENT = "#FF5F57"; // Vibrant Red
const VIBRANT_BLUE = "#38BDF8"; // Punchy Sky Blue

// ─── State Card Component ─────────────────────────────────────────────────────
const StateCard: React.FC<{
  label: string;
  sublabel: string;
  accent: string;
  showText: boolean;
  zIndex?: number;
}> = ({ label, sublabel, accent, showText, zIndex = 10 }) => (
  <div style={{ 
    display: "flex", 
    flexDirection: "column", 
    alignItems: "center",
    zIndex // Higher zIndex keeps cards above the line
  }}>
    <div
      style={{
        width: 220,
        height: 280,
        borderRadius: 20,
        background: COLORS.codeBg,
        border: `3px solid ${accent}`,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: `0 24px 48px rgba(0,0,0,0.5)`,
        position: "relative",
      }}
    >
      <div style={{
        opacity: showText ? 1 : 0,
        fontFamily: FONTS.mono,
        fontSize: 32,
        fontWeight: 700,
        color: COLORS.offWhite,
        transition: "opacity 0.3s ease",
      }}>
        {label}
      </div>
    </div>

    <div style={{
      opacity: showText ? 1 : 0,
      marginTop: 24,
      fontFamily: FONTS.mono,
      fontSize: 28,
      fontWeight: 800,
      color: accent,
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      transition: "opacity 0.3s ease",
    }}>
      {sublabel}
    </div>
  </div>
);

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrances
  const boxesPop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // 2. Spread Logic (Reduced from 380 to 290 for a tighter look)
  const moveApart = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const spread = interpolate(moveApart, [0, 1], [0, 330]); 

  // 3. Line Visibility (Fades in as they move apart)
  const lineOpacity = interpolate(frame, [35, 50], [0, 0.6], { extrapolateRight: "clamp" });
  const lineScale = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" });

  // 4. Content Timings
  const textVisible = frame > 85;
  const calloutIn = spring({ frame: frame - 40, fps });


  // 5. In-between callout appears (40-60)
  const calloutOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const calloutY = interpolate(frame, [40, 60], [20, 0], { extrapolateRight: "clamp" });

  // 5. Global Exit
  const exitOpacity = interpolate(frame, [150, 155], [1, 0], { extrapolateLeft: "clamp" });

  const dotValues = [
    { val: "0.25", pos: -0.4, delay: 65 },
    { val: "0.50", pos: 0, delay: 70 },
    { val: "0.75", pos: 0.4, delay: 75 },
  ];

  return (
    <AbsoluteFill style={{
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity: exitOpacity,
    }}>
      
      {/* ── Visual Timeline Area ── */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        position: "relative", 
        width: "100%",
        height: 400 
      }}>
        
        {/* The Horizontal Line (Centered vertically behind cards) */}
        <div style={{ 
          position: "absolute", 
          width: spread * 2,
          height: 8, 
          background: "white",
          opacity: lineOpacity,
          transform: `scaleX(${lineScale})`,
          transformOrigin: "center",
          zIndex: 1, // Lower than cards
          borderRadius: 4,
          top: 165, // Calculated to be at the vertical center of the 280px tall cards
        }} />

        {/* Left Box: Before (Red Theme) */}
        <div style={{ position: "absolute", transform: `translateX(${-spread}px) scale(${boxesPop})`, zIndex: 10 }}>
          <StateCard 
            label="opacity: 0" 
            sublabel="before" 
            accent={RED_ACCENT} 
            showText={textVisible}
          />
        </div>

        {/* Intermediate Dots (Vibrant Blue, No subtext) */}
        {dotValues.map((d) => {
          const pop = spring({
            frame: frame - d.delay,
            fps,
            config: { stiffness: 200, damping: 12 },
          });

          return (
            <div key={d.val} style={{ 
              position: "absolute", 
              transform: `translateX(${spread * d.pos}px) scale(${pop})`,
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center",
              zIndex: 5,
              top: 165, // Aligned with the line
              marginTop: -12, // Offset half the dot size to center on line
            }}>
              {/* Value Number Only */}
              <div style={{ 
                position: "absolute", 
                bottom: 40,
                fontSize: 34, 
                fontWeight: 800, 
                color: VIBRANT_BLUE, 
                fontFamily: FONTS.mono 
              }}>
                {d.val}
              </div>
              
              {/* Larger Blue Dot */}
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: VIBRANT_BLUE }} />
            </div>
          );
        })}

        {/* Right Box: After (Green Theme) */}
        <div style={{ position: "absolute", transform: `translateX(${spread}px) scale(${boxesPop})`, zIndex: 10 }}>
          <StateCard 
            label="opacity: 1" 
            sublabel="after" 
            accent={COLORS.selector} 
            showText={textVisible}
          />
        </div>

      </div>

      {/* ── "in-between" Callout ── */}
      <div
        style={{
          marginTop: 60,
          padding: "16px 36px",
          borderRadius: 100,
          background: "rgba(126,231,135,0.08)",
          border: `1px solid ${COLORS.accentA}33`,
          opacity: calloutOpacity,
          transform: `translateY(${calloutY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.accentA,
            letterSpacing: "0.02em",
          }}
        >
          CSS animates between states
        </span>
      </div>

    </AbsoluteFill>
  );
};