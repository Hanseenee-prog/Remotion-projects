import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Constants & Configurations ───────────────────────────────────────────────
const NUM_LISTENERS = 6;
const CIRCLE_RADIUS = 460; 
const CENTER_X = 1080 / 2;
const CENTER_Y = 1920 / 2;

const POP_FRAMES = [25, 5, 35, 12, 28, 18]; 

// ─── SVG Components ───────────────────────────────────────────────────────────

const RadarIcon: React.FC<{ size?: number; color?: string }> = ({ size = 48, color = "#A5D6FF" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20v-8" />
    <path d="M8 12a4 4 0 0 1 8 0" />
    <path d="M5 9a9 9 0 0 1 14 0" />
    <path d="M2 6a14 14 0 0 1 20 0" />
    <circle cx="12" cy="20" r="2" fill={color} />
  </svg>
);

const Speedometer: React.FC<{ scale: number; frame: number }> = ({ scale, frame }) => {
  // Chaotic jitter for the high-usage vibe
  const shake = Math.sin(frame * 1.5) * 8 + Math.cos(frame * 2.3) * 5 + Math.sin(frame * 0.8) * 3;
  const needleAngle = 65 + shake; 
  
  const glowOpacity = interpolate(shake, [-16, 16], [0.3, 0.8]);

  return (
    <div
      style={{
        position: "absolute",
        left: CENTER_X,
        top: CENTER_Y,
        transform: `translate(-50%, -50%) scale(${scale})`,
        width: 260,
        height: 260,
        backgroundColor: "#161B22",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(255, 77, 77, ${glowOpacity})`,
        border: "4px solid #30363D",
        zIndex: 20,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 240 240">
        {/* 1. Background Track (the empty slot) */}
        <path d="M 40 150 A 80 80 0 0 1 200 150" fill="none" stroke="#21262D" strokeWidth="20" strokeLinecap="round" />
        
        {/* 2. Green Zone (Safe) */}
        <path d="M 40 150 A 80 80 0 0 1 85 85" fill="none" stroke="#27C93F" strokeWidth="20" />
        
        {/* 3. Yellow Zone (Warning) */}
        <path d="M 85 85 A 80 80 0 0 1 155 85" fill="none" stroke="#FFBD2E" strokeWidth="20" />
        
        {/* 4. Red Zone (Danger) */}
        <path d="M 155 85 A 80 80 0 0 1 200 150" fill="none" stroke="#FF4D4D" strokeWidth="20" strokeLinecap="round" />
        
        {/* Shaking Needle */}
        <g transform={`rotate(${needleAngle}, 120, 150)`}>
           <polygon points="116,150 124,150 120,50" fill="#FFFFFF" />
           <circle cx="120" cy="150" r="12" fill="#FFFFFF" />
           <circle cx="120" cy="150" r="5" fill="#161B22" />
        </g>
      </svg>
      
      <div style={{ position: "absolute", bottom: 45, color: "#FF4D4D", fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 26, letterSpacing: 1 }}>
        98% RAM
      </div>
    </div>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const speedoEntrance = spring({
    frame: frame - 40,
    fps,
    config: { damping: 10, stiffness: 180, mass: 1.2 },
  });

  return (
    <AbsoluteFill>
      
      {/* ── Flowing Dotted Lines ── */}
      <svg style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1 }}>
        {Array.from({ length: NUM_LISTENERS }).map((_, i) => {
          const angle = i * ((Math.PI * 2) / NUM_LISTENERS) - Math.PI / 2;
          const startX = CENTER_X + CIRCLE_RADIUS * Math.cos(angle);
          const startY = CENTER_Y + CIRCLE_RADIUS * Math.sin(angle);
          
          const lineOpacity = interpolate(frame, [45, 55], [0, 0.6], { extrapolateRight: "clamp" });
          const dashOffset = (frame - 45) * 3; 

          return (
            <line
              key={`line-${i}`}
              x1={startX}
              y1={startY}
              x2={CENTER_X}
              y2={CENTER_Y}
              stroke="#FF4D4D"
              strokeWidth="6"
              strokeDasharray="12 16"
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              opacity={lineOpacity}
            />
          );
        })}
      </svg>

      {/* ── Circular Listener Nodes ── */}
      {Array.from({ length: NUM_LISTENERS }).map((_, i) => {
        const popFrame = POP_FRAMES[i];
        const angle = i * ((Math.PI * 2) / NUM_LISTENERS) - Math.PI / 2; 
        
        const x = CENTER_X + CIRCLE_RADIUS * Math.cos(angle);
        const y = CENTER_Y + CIRCLE_RADIUS * Math.sin(angle);

        const nodeScale = spring({
          frame: frame - popFrame,
          fps,
          config: { damping: 12, stiffness: 200 },
        });

        const isSpiking = frame > 50;
        const pulse = Math.sin(frame * 0.5) * 0.5 + 0.5; 
        const borderColor = isSpiking ? `rgba(255, 77, 77, ${pulse})` : "rgba(255,255,255,0.1)";

        return (
          <div
            key={`node-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              transform: `translate(-50%, -50%) scale(${nodeScale})`,
              width: 180, 
              height: 180,
              backgroundColor: "#161B22",
              borderRadius: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              border: `2px solid ${borderColor}`,
              zIndex: 10,
            }}
          >
            <RadarIcon color={isSpiking ? "#FF4D4D" : "#A5D6FF"} size={76} />
            <div style={{ color: "#ABB2BF", fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600 }}>
              Listener
            </div>
          </div>
        );
      })}

      {/* ── Center Speedometer ── */}
      {speedoEntrance > 0 && (
        <Speedometer scale={speedoEntrance} frame={frame} />
      )}

    </AbsoluteFill>
  );
};