import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const display = FONTS.display;
const mono = FONTS.mono;

// ─── canvas dimensions used for arrow math ───────────────────────────────────
// Remotion default portrait: 1080 × 1920
const CW = 1080;
const CH = 1920;

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

// ─── Straight arrow drawn inside a full-canvas SVG overlay ───────────────────
// x1,y1 = start  x2,y2 = end  (absolute canvas px)
// prog 0→1 draws the line via strokeDashoffset
const StraightArrow: React.FC<{
  x1: number; y1: number;
  x2: number; y2: number;
  prog: number;
  color: string;
  strokeWidth?: number;
  arrowSize?: number;
}> = ({ x1, y1, x2, y2, prog, color, strokeWidth = 4, arrowSize = 14 }) => {
  const dx   = x2 - x1;
  const dy   = y2 - y1;
  const len  = Math.sqrt(dx * dx + dy * dy);
  const ux   = dx / len; // unit x
  const uy   = dy / len; // unit y

  // arrow tip is at (x2, y2); shorten line so it doesn't overlap the head
  const tipX = x2;
  const tipY = y2;
  const tailX = x1;
  const tailY = y1;

  // arrowhead: equilateral-ish triangle pointing in direction (ux, uy)
  const perp = arrowSize * 0.55;
  const back = arrowSize;
  const p1 = `${tipX},${tipY}`;
  const p2 = `${tipX - back * ux + perp * uy},${tipY - back * uy - perp * ux}`;
  const p3 = `${tipX - back * ux - perp * uy},${tipY - back * uy + perp * ux}`;

  // dashoffset trick: length of line minus arrowhead base
  const drawLen  = len - back + 2;
  const dashOffset = drawLen * (1 - prog);
  const headOp   = interpolate(prog, [0.75, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <g>
      <line
        x1={tailX} y1={tailY}
        x2={tipX - back * ux} y2={tipY - back * uy}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={drawLen}
        strokeDashoffset={dashOffset}
      />
      <polygon
        points={`${p1} ${p2} ${p3}`}
        fill={color}
        opacity={headOp}
      />
    </g>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // --- GLOBAL HEADER ---
  const headerOp = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });
  const headerY  = interpolate(frame, [0, 15], [20, 0], { extrapolateRight: "clamp" });

  // ==========================================
  // SEQUENCE 1: The Box Clone
  // ==========================================
  const seq1Op = interpolate(frame, [92, 100], [1, 0], { extrapolateRight: "clamp" });

  const box1Entrance   = spring({ frame, fps, from: 0, to: 1, delay: 3,  config: { damping: 14 } });
  const shootProgress  = spring({ frame, fps, from: 0, to: 1, delay: 45, config: { damping: 12, mass: 0.8 } });

  const baseScale          = 2.2;
  const box1RecoilScale    = interpolate(shootProgress, [0, 0.15, 0.5, 1], [1, 0.85, 1.05, 1]);
  const box1Scale          = box1RecoilScale * box1Entrance * baseScale;
  const box1X              = interpolate(shootProgress, [0, 0.15, 1], [0, -350, -300]);
  const box1Rotate         = interpolate(shootProgress, [0, 0.15, 0.6, 1], [0, -12, 4, 0]);
  const box2Scale          = interpolate(shootProgress, [0, 0.5, 1], [0.1, 1.1, 1]) * baseScale;
  const box2X              = interpolate(shootProgress, [0, 0.2, 1], [0, 350, 300]);
  const box2Op             = interpolate(shootProgress, [0, 0.1], [0, 1], { extrapolateRight: "clamp" });

  const seq1ArrowProg = interpolate(frame, [60, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const seq1LabelOp   = interpolate(frame, [60, 65], [0, 1], { extrapolateRight: "clamp" });

  // ==========================================
  // SEQUENCE 2: Nested Refs Diagram
  // ==========================================
  const seq2Op    = interpolate(frame, [95, 105],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subTextOp = interpolate(frame, [95, 105],  [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subTextY  = interpolate(frame, [95, 105],  [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const topBoxLeftScale  = spring({ frame, fps, from: 0, to: 1, delay: 100, config: { damping: 12, mass: 0.8 } });
  const topBoxRightScale = spring({ frame, fps, from: 0, to: 1, delay: 105, config: { damping: 12, mass: 0.8 } });
  const bottomBoxScale   = spring({ frame, fps, from: 0, to: 1, delay: 110, config: { damping: 12, mass: 0.8 } });

  const seq2ArrowProg = interpolate(frame, [115, 130], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Arrow coordinate math ──────────────────────────────────────────────────
  // The sequence-2 div has `position: absolute, inset: 0` inside the parent
  // which is `position: absolute, top:50%, left:50%, translate(-50%,-50%)`.
  // That parent is full canvas (width/height 100%) but offset by SAFE padding.
  // The boxes are positioned with `top` and `left` % values on that parent.
  //
  // Box width = 380px.  Box top-left box: top="35%", left="50%", translateX(-240px)
  // We work in the coordinate space of the full 1080×1920 canvas.
  //
  // SAFE.left and SAFE.top are the padding values — typically 0 or small.
  // For safety we treat usable width = CW, height = CH.
  //
  // Top boxes are at top: 35% of CH = 672px (their centre-Y after translate(-50%,-50%)).
  // Box rendered height ≈ label(~38px) + box(~120px) ≈ 158px total.
  // Centre of top row  → Y = 0.35 * CH = 672
  // Bottom of top row  → Y = 672 + 79   = 751  (half of 158)
  // Arrow start Y      → 751px  (bottom edge of top boxes)
  //
  // Top of bottom card → top: 68% of CH = 1305, translate(-50%) so centre Y = 1305
  // Box height ~120px, so top edge ≈ 1305 - 60 = 1245 — but label above adds ~38px
  // Arrow end Y        → 1245px  (top edge of bottom box card)
  //
  // Horizontal centres:
  //   Left box  X = CW/2 - 240 = 540 - 240 = 300
  //   Right box X = CW/2 + 240 = 540 + 240 = 780
  //   Bottom box X = CW/2 = 540

  const LBX  = CW / 2 - 260;  // 300 — left box  centre-X
  const RBX  = CW / 2 + 240;  // 780 — right box centre-X
  const BBX  = CW / 2;        // 540 — bottom box centre-X

  const ARROW_Y1 = 0.35 * CH + 150;   // ~751  — bottom of top boxes
  const ARROW_Y2 = 0.68 * CH - 100;   // ~1232 — top edge of bottom box (before label)

  const boxStyle = (color: string): React.CSSProperties => ({
    border: `2px solid ${color}`,
    backgroundColor: "#0d1117",
    borderRadius: 16,
    padding: "24px 32px",
    fontFamily: mono,
    fontSize: 38,
    color: C.codeText,
    lineHeight: 1.6,
    width: 380,
    boxShadow: `0 14px 40px rgba(0,0,0,0.5), inset 0 0 20px ${color}15`,
    boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = {
    fontFamily: display,
    fontSize: 40,
    color: C.muted,
    marginBottom: 16,
    letterSpacing: 0.5,
    textAlign: "center",
    fontWeight: 700
  };

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px`, overflow: "hidden" }}>

      {/* GLOBAL HEADER */}
      <div style={{
        opacity: headerOp,
        transform: `translateY(${headerY}px)`,
        width: "95%", textAlign: "center",
        marginTop: 140, position: "absolute", zIndex: 10,
      }}>
        <div style={{ fontFamily: display, fontSize: 64, fontWeight: 800, color: C.white, textTransform: "Capitalize", letterSpacing: 2 }}>
          Shallow Copy
        </div>
        <div style={{ opacity: subTextOp, transform: `translateY(${subTextY}px)`, marginTop: 16 }}>
          <span style={{ fontFamily: display, fontSize: 42, color: C.accentC, fontWeight: 700 }}>
            Nested objects are still shared.
          </span>
        </div>
      </div>

      {/* FULL-CANVAS PARENT */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%", height: "100%",
      }}>

        {/* ══════════════════════════════════════════
            SEQUENCE 1 — isometric box clone
        ══════════════════════════════════════════ */}
        <div style={{ opacity: seq1Op, position: "absolute", inset: 0 }}>

          {/* original box */}
          <div style={{
            position: "absolute", top: "45%", left: "50%",
            transform: `translate(-50%, -50%) translateX(${box1X}px)`,
          }}>
            <div style={{ transform: `rotate(${box1Rotate}deg)` }}>
              <IsometricBox filled={true} scale={box1Scale} />
            </div>
            <div style={{
              position: "absolute", bottom: -100, left: "50%",
              transform: "translateX(-50%)",
              opacity: seq1LabelOp,
              fontFamily: display, fontSize: 40, color: C.muted,
              textAlign: "center", fontWeight: 700, whiteSpace: "nowrap",
            }}>
              original
            </div>
          </div>

          {/* clone box */}
          <div style={{
            position: "absolute", top: "45%", left: "50%",
            transform: `translate(-50%, -50%) translateX(${box2X}px)`,
            opacity: box2Op,
          }}>
            <IsometricBox filled={false} scale={box2Scale} />
            <div style={{
              position: "absolute", bottom: -100, left: "50%",
              transform: "translateX(-50%)",
              opacity: seq1LabelOp,
              fontFamily: display, fontSize: 40, color: C.muted,
              textAlign: "center", fontWeight: 700, whiteSpace: "nowrap",
            }}>
              clone
            </div>
          </div>

          {/* seq1 horizontal arrow — kept exactly as original */}
          <svg style={{
            position: "absolute", top: "47.5%", left: "61%",
            transform: "translate(-50%, -50%)",
            overflow: "visible",
            opacity: seq1ArrowProg,
          }} width={450} height={100}>
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
              <polygon points="180,0 130,-20 130,20" fill={C.accentC} />
            )}
          </svg>
        </div>

        {/* ══════════════════════════════════════════
            SEQUENCE 2 — nested ref diagram
        ══════════════════════════════════════════ */}
        <div style={{ opacity: seq2Op, position: "absolute", inset: 0 }}>

          {/* original card — top-left */}
          <div style={{
            position: "absolute", top: "35%", left: "50%",
            transform: `translate(-50%, -50%) translateX(-240px) scale(${topBoxLeftScale})`,
          }}>
            <div style={labelStyle}>original</div>
            <div style={boxStyle(C.accentA)}>
              <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span></div>
              <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
            </div>
          </div>

          {/* clone card — top-right */}
          <div style={{
            position: "absolute", top: "35%", left: "50%",
            transform: `translate(-50%, -50%) translateX(240px) scale(${topBoxRightScale})`,
          }}>
            <div style={labelStyle}>clone</div>
            <div style={boxStyle(C.accentB)}>
              <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"Alice"</span></div>
              <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.accentC }}>→ ref</span></div>
            </div>
          </div>

          {/* shared address card — bottom centre */}
          <div style={{
            position: "absolute", top: "68%", left: "50%",
            transform: `translate(-50%, -50%) scale(${bottomBoxScale})`,
          }}>
            <div style={{ ...boxStyle(C.accentC), width: 420 }}>
              <div>
                <span style={{ color: C.property }}>city</span>:{" "}
                <span style={{ color: C.string }}>"Houston"</span>
                {/* <span style={{ fontSize: 24, float: "right" }}>⚠️</span> */}
              </div>
            </div>
            <div style={{ ...labelStyle, color: C.accentC, fontWeight: 500, }}>address (shared object)</div>
          </div>

          {/* ── ARROWS: full-canvas SVG overlay ─────────────────────────────────
              Coordinates are in canvas-space (0,0) = top-left of the full canvas.
              The parent div is translate(-50%,-50%) from top:50% left:50%,
              so inside here 0,0 is already the canvas top-left. We use
              position absolute inset:0 + pointer-events:none so the SVG
              sits cleanly over everything without affecting layout.
          ────────────────────────────────────────────────────────────────── */}
          <svg style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "100%",
            overflow: "visible",
            pointerEvents: "none",
          }}>
            {/* Left box → bottom box */}
            <StraightArrow
              x1={LBX}   y1={ARROW_Y1}
              x2={BBX}   y2={ARROW_Y2}
              prog={seq2ArrowProg}
              color={C.accentC}
              strokeWidth={5}
              arrowSize={18}
            />

            {/* Right box → bottom box */}
            <StraightArrow
              x1={RBX}   y1={ARROW_Y1}
              x2={BBX}   y2={ARROW_Y2}
              prog={seq2ArrowProg}
              color={C.accentC}
              strokeWidth={5}
              arrowSize={18}
            />
          </svg>
        </div>

      </div>
    </AbsoluteFill>
  );
};