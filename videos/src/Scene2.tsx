import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const display = FONTS.display;
const mono = FONTS.mono;

const IsometricBox: React.FC<{ filled: boolean; scale?: number }> = ({ filled, scale = 1 }) => (
  <div style={{ transform: `scale(${scale})`, display: "flex", justifyContent: "center" }}>
    <svg width="200" height="200" viewBox="0 0 200 200">
      <polygon points="100,50 150,25 190,45 140,70" fill={C.surfaceHigh} />
      <polygon points="100,50 50,25 10,45 60,70" fill={C.surfaceHigh} />
      <polygon points="60,70 100,90 140,70 100,50" fill="#080808" />
      {filled && (
        <g transform="translate(0, -15)">
          <rect x="70" y="55" width="30" height="30" fill={C.accentC} rx="6" transform="rotate(-15 85 70)" />
          <circle cx="120" cy="65" r="18" fill={C.accentB} />
          <polygon points="85,90 105,65 125,90" fill={C.accentA} />
        </g>
      )}
      <polygon points="60,70 100,90 100,150 60,130" fill={C.codeBgHighlight} stroke={C.borderHigh} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="100,90 140,70 140,130 100,150" fill={C.codeBg} stroke={C.border} strokeWidth="2" strokeLinejoin="round" />
      <polygon points="60,70 100,90 50,115 10,95" fill={C.surfaceHigh} stroke={C.border} strokeWidth="1" />
      <polygon points="100,90 140,70 190,95 150,115" fill={C.surfaceHigh} stroke={C.border} strokeWidth="1" />
    </svg>
  </div>
);

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- GLOBAL HEADER ---
  const headerOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  // ==========================================
  // SEQUENCE 1: The Box Clone
  // ==========================================
  const seq1Op = interpolate(frame, [92, 100], [1, 0], { extrapolateRight: "clamp" });
  
  const box1Entrance = spring({ frame, fps, from: 0, to: 1, delay: 3, config: { damping: 14 } });
  const shootProgress = spring({ frame, fps, from: 0, to: 1, delay: 45, config: { damping: 12, mass: 0.8 } });
  
  const baseScale = 2.2; 
  const box1RecoilScale = interpolate(shootProgress, [0, 0.15, 0.5, 1], [1, 0.85, 1.05, 1]);
  const box1Scale = box1RecoilScale * box1Entrance * baseScale;
  
  const box1X = interpolate(shootProgress, [0, 0.15, 1], [0, -350, -300]);
  const box1Rotate = interpolate(shootProgress, [0, 0.15, 0.6, 1], [0, -12, 4, 0]);
  
  const box2Scale = interpolate(shootProgress, [0, 0.5, 1], [0.1, 1.1, 1]) * baseScale;
  const box2X = interpolate(shootProgress, [0, 0.2, 1], [0, 350, 300]);
  const box2Op = interpolate(shootProgress, [0, 0.1], [0, 1], { extrapolateRight: "clamp" });

  // ARROW LOGIC: Starts at frame 85 (post-settlement)
  const seq1ArrowProg = interpolate(frame, [60, 65], [0, 1], { 
    extrapolateLeft: "clamp", 
    extrapolateRight: "clamp" 
  });
  const seq1LabelOp = interpolate(frame, [60, 65], [0, 1], { extrapolateRight: "clamp" });

  // ==========================================
  // SEQUENCE 2: Nested Refs Diagram
  // ==========================================
  const seq2Op = interpolate(frame, [95, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subTextOp = interpolate(frame, [95, 105], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subTextY = interpolate(frame, [95, 105], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const topBoxLeftScale = spring({ frame, fps, from: 0, to: 1, delay: 100, config: { damping: 12, mass: 0.8 } });
  const topBoxRightScale = spring({ frame, fps, from: 0, to: 1, delay: 105, config: { damping: 12, mass: 0.8 } });
  const bottomBoxScale = spring({ frame, fps, from: 0, to: 1, delay: 110, config: { damping: 12, mass: 0.8 } });
  
  const seq2ArrowProg = interpolate(frame, [115, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const boxStyle = (color: string): React.CSSProperties => ({
    border: `2px solid ${color}`,
    backgroundColor: "#0d1117", 
    borderRadius: 16,
    padding: "24px 32px",
    fontFamily: mono,
    fontSize: 28,
    color: C.codeText,
    lineHeight: 1.6,
    width: 380,
    boxShadow: `0 14px 40px rgba(0,0,0,0.5), inset 0 0 20px ${color}15`,
    boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: display,
    fontSize: 28,
    color: C.muted,
    marginBottom: 6,
    letterSpacing: 0.5,
    textAlign: "center",
  };

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px`, overflow: "hidden" }}>
      <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, width: "100%", textAlign: "center", marginTop: 40, position: "absolute", zIndex: 10 }}>
        <div style={{ fontFamily: display, fontSize: 64, fontWeight: 800, color: C.white, textTransform: "uppercase", letterSpacing: 2 }}>
          Shallow Copy
        </div>
        <div style={{ opacity: subTextOp, transform: `translateY(${subTextY}px)`, marginTop: 16 }}>
          <span style={{ fontFamily: display, fontSize: 42, color: C.accentC, fontWeight: 700 }}>
            Nested objects are still shared.
          </span>
        </div>
      </div>

      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "100%", height: "100%" }}>
        
        {/* SEQUENCE 1 */}
        <div style={{ opacity: seq1Op, position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", top: "45%", left: "50%", transform: `translate(-50%, -50%) translateX(${box1X}px)` }}>
            <div style={{ transform: `rotate(${box1Rotate}deg)` }}>
              <IsometricBox filled={true} scale={box1Scale} />
            </div>
            <div style={{ position: "absolute", bottom: -100, left: "50%", transform: "translateX(-50%)", opacity: seq1LabelOp, fontFamily: mono, fontSize: 40, color: C.muted, textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>
              original
            </div>
          </div>

          <div style={{ position: "absolute", top: "45%", left: "50%", transform: `translate(-50%, -50%) translateX(${box2X}px)`, opacity: box2Op }}>
            <IsometricBox filled={false} scale={box2Scale} />
            <div style={{ position: "absolute", bottom: -100, left: "50%", transform: "translateX(-50%)", opacity: seq1LabelOp, fontFamily: mono, fontSize: 40, color: C.muted, textAlign: "center", fontWeight: 700, whiteSpace: "nowrap" }}>
              clone
            </div>
          </div>

          {/* Arrow SVG with opacity clamp to prevent start-frame flash */}
          <svg style={{ position: "absolute", top: "47.5%", left: "61%", transform: "translate(-50%, -50%)", overflow: "visible", opacity: seq1ArrowProg }} width={450} height={100}>
            <path
              d="M 50,0 L 150,0"
              fill="none"
              stroke={C.accentC}
              strokeWidth={10}
              strokeDasharray={300}
              strokeDashoffset={300 * (1 - seq1ArrowProg)}
              strokeLinecap="round"
            />
            {seq1ArrowProg > 0.9 && (
              <polygon
                points="180,0 130,-20 130,20"
                fill={C.accentC}
              />
            )}
          </svg>
        </div>

        {/* SEQUENCE 2 */}
        <div style={{ opacity: seq2Op, position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", top: "35%", left: "50%", transform: `translate(-50%, -50%) translateX(-240px) scale(${topBoxLeftScale})` }}>
            <div style={labelStyle}>original</div>
            <div style={boxStyle(C.accentA)}>
              <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span></div>
              <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
            </div>
          </div>

          <div style={{ position: "absolute", top: "35%", left: "50%", transform: `translate(-50%, -50%) translateX(240px) scale(${topBoxRightScale})` }}>
            <div style={labelStyle}>clone</div>
            <div style={boxStyle(C.accentB)}>
              <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span></div>
              <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
            </div>
          </div>

          <div style={{ position: "absolute", top: "68%", left: "50%", transform: `translate(-50%, -50%) scale(${bottomBoxScale})` }}>
            <div style={{ ...labelStyle, color: C.accentC }}>address (shared object)</div>
            <div style={{ ...boxStyle(C.accentC), width: 420 }}>
              <div><span style={{ color: C.property }}>city</span>: <span style={{ color: C.string }}>"Houston"</span> <span style={{ fontSize: 24, float: "right" }}>⚠️</span></div>
            </div>
          </div>

          <svg style={{ position: "absolute", top: "35%", left: "80%", transform: "translate(-50%, -50%)", overflow: "visible" }} width={600} height={400}>
            <path
              d="M -240,110 C -240,200 -50,200 -50,260"
              fill="none"
              stroke={C.accentC}
              strokeWidth={4}
              strokeDasharray={300}
              strokeDashoffset={300 * (1 - seq2ArrowProg)}
              strokeLinecap="round"
            />
            {seq2ArrowProg > 0.8 && (
              <polygon points="-50,265 -58,245 -42,245" fill={C.accentC} opacity={interpolate(seq2ArrowProg, [0.8, 1], [0, 1])} />
            )}

            <path
              d="M 240,110 C 240,200 50,200 50,260"
              fill="none"
              stroke={C.accentC}
              strokeWidth={4}
              strokeDasharray={300}
              strokeDashoffset={300 * (1 - seq2ArrowProg)}
              strokeLinecap="round"
            />
            {seq2ArrowProg > 0.8 && (
              <polygon points="50,265 42,245 58,245" fill={C.accentC} opacity={interpolate(seq2ArrowProg, [0.8, 1], [0, 1])} />
            )}
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};