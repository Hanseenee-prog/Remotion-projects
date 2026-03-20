import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const VIDEO_W = 1080;
const VIDEO_H = 1920;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  pushEnd:      20,  // cart+person arrive at center
  leaveStart:   22,  // person steps away from cart
  leaveEnd:     34,  // person fully facing viewer
  waveStart:    36,  // continuous wave begins
  fadeStart:    70,
  fadeEnd:      75,
} as const;

// ─── Character dimensions ─────────────────────────────────────────────────────
const HEAD_R     = 36;
const BODY_W     = 52;
const BODY_H     = 72;
const LIMB_W     = 18;   // thickness of arms / legs
const LEG_H      = 64;
const ARM_L      = 56;
const NECK_H     = 8;

// Cart dimensions
const CART_W     = 160;
const CART_H     = 90;
const WHEEL_R    = 22;
const HANDLE_H   = 80;

// Final resting center X of the cart
const CART_REST_X = VIDEO_W / 2;
const CART_REST_Y = VIDEO_H / 2 + 80;

// Person stands to the left of cart handle while pushing
const PERSON_PUSH_X = CART_REST_X - CART_W / 2 - 60;
// After leaving cart, person steps to center
const PERSON_FACE_X = VIDEO_W / 2;
const PERSON_Y      = CART_REST_Y - CART_H - LEG_H - BODY_H - NECK_H - HEAD_R + 10;

// ─── SVG character ────────────────────────────────────────────────────────────
const Character: React.FC<{
  x: number;
  y: number; // baseline (feet level)
  waveAngle: number;   // right arm angle in degrees (0 = down)
  pushAngle: number;   // lean angle while pushing (degrees)
  flip: boolean;       // mirror horizontally
  opacity: number;
}> = ({ x, y, waveAngle, pushAngle, flip, opacity }) => {
  const scaleX = flip ? -1 : 1;
  const totalH = HEAD_R * 2 + NECK_H + BODY_H + LEG_H;

  // Colors
  const SKIN   = "#FBBF7A";
  const SHIRT  = "#5B4DB5";
  const PANTS  = "#2D3A6B";
  const SHOE   = "#1a1a2e";

  // Foot Y
  const footY  = 0;
  // Leg top Y
  const legTopY = footY - LEG_H;
  // Body bottom
  const bodyBotY = legTopY;
  // Body top
  const bodyTopY = bodyBotY - BODY_H;
  // Neck top
  const neckTopY = bodyTopY - NECK_H;
  // Head center
  const headCY   = neckTopY - HEAD_R;

  // Shoulder pivot points
  const shoulderLX = -BODY_W / 2;
  const shoulderRX =  BODY_W / 2;
  const shoulderY  = bodyTopY + 14;

  // Left arm — hangs down, slightly forward (push pose)
  const leftArmAngle = pushAngle !== 0 ? -35 : -10;

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      <g transform={`rotate(${pushAngle}, 0, ${bodyBotY - BODY_H / 2})`}>
        <g transform={`scale(${scaleX}, 1)`}>

          {/* ── Left leg */}
          <rect
            x={-BODY_W / 2 + 4} y={legTopY}
            width={LIMB_W} height={LEG_H}
            rx={LIMB_W / 2} fill={PANTS}
          />
          {/* Left shoe */}
          <ellipse cx={-BODY_W / 2 + 4 + LIMB_W / 2} cy={footY} rx={14} ry={7} fill={SHOE} />

          {/* ── Right leg */}
          <rect
            x={BODY_W / 2 - 4 - LIMB_W} y={legTopY}
            width={LIMB_W} height={LEG_H}
            rx={LIMB_W / 2} fill={PANTS}
          />
          {/* Right shoe */}
          <ellipse cx={BODY_W / 2 - 4 - LIMB_W / 2} cy={footY} rx={14} ry={7} fill={SHOE} />

          {/* ── Body */}
          <rect
            x={-BODY_W / 2} y={bodyTopY}
            width={BODY_W} height={BODY_H}
            rx={12} fill={SHIRT}
          />

          {/* ── Left arm — push arm */}
          <g transform={`rotate(${leftArmAngle}, ${shoulderLX}, ${shoulderY})`}>
            <rect
              x={shoulderLX - LIMB_W / 2} y={shoulderY}
              width={LIMB_W} height={ARM_L}
              rx={LIMB_W / 2} fill={SKIN}
            />
          </g>

          {/* ── Right arm — waving arm */}
          <g transform={`rotate(${waveAngle}, ${shoulderRX}, ${shoulderY})`}>
            <rect
              x={shoulderRX - LIMB_W / 2} y={shoulderY}
              width={LIMB_W} height={ARM_L}
              rx={LIMB_W / 2} fill={SKIN}
            />
            {/* Hand circle at end of arm */}
            <circle
              cx={shoulderRX} cy={shoulderY + ARM_L}
              r={LIMB_W / 2 + 1} fill={SKIN}
            />
          </g>

          {/* Left hand */}
          <g transform={`rotate(${leftArmAngle}, ${shoulderLX}, ${shoulderY})`}>
            <circle
              cx={shoulderLX} cy={shoulderY + ARM_L}
              r={LIMB_W / 2 + 1} fill={SKIN}
            />
          </g>

          {/* ── Neck */}
          <rect
            x={-8} y={neckTopY}
            width={16} height={NECK_H + HEAD_R}
            rx={8} fill={SKIN}
          />

          {/* ── Head */}
          <circle cx={0} cy={headCY} r={HEAD_R} fill={SKIN} />

          {/* Eyes */}
          <circle cx={-11} cy={headCY - 4} r={5} fill="#1a1a2e" />
          <circle cx={11}  cy={headCY - 4} r={5} fill="#1a1a2e" />
          {/* Eye shine */}
          <circle cx={-9}  cy={headCY - 6} r={2} fill="#FFFFFF" />
          <circle cx={13}  cy={headCY - 6} r={2} fill="#FFFFFF" />

          {/* Smile */}
          <path
            d={`M -12 ${headCY + 10} Q 0 ${headCY + 22} 12 ${headCY + 10}`}
            stroke="#1a1a2e" strokeWidth="3" fill="none"
            strokeLinecap="round"
          />

          {/* Hair */}
          <ellipse cx={0} cy={headCY - HEAD_R + 6} rx={HEAD_R - 2} ry={12} fill="#2D1B00" />

        </g>
      </g>
    </g>
  );
};

// ─── Cart SVG ─────────────────────────────────────────────────────────────────
const Cart: React.FC<{ x: number; y: number; opacity: number }> = ({ x, y, opacity }) => {
  const BODY_COLOR  = "#334155";
  const WHEEL_COLOR = "#1E293B";
  const HANDLE_COLOR = "#94A3B8";
  const BASKET_COLOR = "#475569";

  return (
    <g transform={`translate(${x}, ${y})`} opacity={opacity}>
      {/* Wheels */}
      <circle cx={-CART_W / 2 + WHEEL_R + 8} cy={0} r={WHEEL_R} fill={WHEEL_COLOR} />
      <circle cx={-CART_W / 2 + WHEEL_R + 8} cy={0} r={WHEEL_R - 8} fill="#64748B" />
      <circle cx={CART_W / 2 - WHEEL_R - 8}  cy={0} r={WHEEL_R} fill={WHEEL_COLOR} />
      <circle cx={CART_W / 2 - WHEEL_R - 8}  cy={0} r={WHEEL_R - 8} fill="#64748B" />

      {/* Cart body */}
      <rect
        x={-CART_W / 2} y={-CART_H - WHEEL_R + 6}
        width={CART_W} height={CART_H}
        rx={10} fill={BODY_COLOR}
      />

      {/* Basket grid lines */}
      {[-30, 0, 30].map((ox) => (
        <line key={ox}
          x1={ox} y1={-CART_H - WHEEL_R + 10}
          x2={ox} y2={-WHEEL_R + 2}
          stroke={BASKET_COLOR} strokeWidth="2" opacity="0.6"
        />
      ))}

      {/* Handle — extends to the left */}
      <rect
        x={-CART_W / 2 - 12} y={-CART_H - WHEEL_R + 6 - HANDLE_H}
        width={14} height={HANDLE_H}
        rx={7} fill={HANDLE_COLOR}
      />
      {/* Handle grip */}
      <rect
        x={-CART_W / 2 - 24} y={-CART_H - WHEEL_R + 6 - HANDLE_H}
        width={26} height={14}
        rx={7} fill={HANDLE_COLOR}
      />

      {/* Label on cart */}
      <text
        x={0} y={-CART_H / 2 - WHEEL_R + 6 + 6}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily="'JetBrains Mono', monospace"
        fontSize="18" fontWeight="700"
        fill="#94A3B8"
      >cart</text>
    </g>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 1. Push: cart + person slide in from left (0 → 20) ────────────────────
  const pushSpring = spring({
    fps, frame,
    config: { damping: 18, stiffness: 120, mass: 1.1 },
    durationInFrames: T.pushEnd,
  });
  const pushP = clamp(pushSpring);

  // Cart slides from off-screen left to center
  const cartX = interpolate(pushP, [0, 1], [-(CART_W / 2 + 100), CART_REST_X]);
  const cartY = CART_REST_Y;

  // Person travels with cart while pushing
  const personPushX = interpolate(pushP, [0, 1], [-(CART_W / 2 + 100) - 60, PERSON_PUSH_X]);

  // ── 2. Person leaves cart → moves to center + faces viewer (22 → 34) ──────
  const leaveSpring = spring({
    fps, frame: frame - T.leaveStart,
    config: { damping: 14, stiffness: 180, mass: 0.8 },
    durationInFrames: T.leaveEnd - T.leaveStart,
  });
  const leaveP = frame >= T.leaveStart ? clamp(leaveSpring) : 0;

  // Person X: from push position → face center
  const personX = frame < T.leaveStart
    ? personPushX
    : interpolate(leaveP, [0, 1], [PERSON_PUSH_X, PERSON_FACE_X]);

  // Lean: person leans forward while pushing, straightens up
  const pushLean = frame < T.leaveStart
    ? interpolate(pushP, [0, 0.3, 1], [0, -12, -8])
    : interpolate(leaveP, [0, 1], [-8, 0]);

  // Flip: person faces left (toward cart) while pushing, then flips to face viewer
  const facingViewer = frame >= T.leaveEnd;

  // ── 3. Wave arm (36+) ─────────────────────────────────────────────────────
  // While pushing: right arm is down (~10°)
  // After leaving: arm waves between -140° and -60° continuously
  let waveAngle: number;
  if (frame < T.waveStart) {
    // Arm hangs naturally while pushing / stepping away
    waveAngle = frame < T.leaveStart ? 10 : interpolate(leaveP, [0, 1], [10, -20]);
  } else {
    // Smooth sine wave — arm sweeps up and down
    const waveCycle = (frame - T.waveStart) * 0.22;
    waveAngle = -90 + Math.sin(waveCycle) * 50;
  }

  // Push arm angle — reaches forward while pushing
  const pushArmAngle = frame < T.leaveStart
    ? interpolate(pushP, [0, 1], [-10, -55])
    : interpolate(leaveP, [0, 1], [-55, -10]);

  // ── 4. Fade (70 → 75) ─────────────────────────────────────────────────────
  const sceneOpacity = interpolate(frame, [T.fadeStart, T.fadeEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Cart stays on screen after person leaves (fades with scene)
  const cartOpacity = sceneOpacity;
  const personOpacity = sceneOpacity;

  // ── Ground line Y
  const groundY = CART_REST_Y + WHEEL_R + 4;

  return (
    <AbsoluteFill style={{ background: "#060810" }}>
      <svg
        style={{ position: "absolute", left: 0, top: 0, width: VIDEO_W, height: VIDEO_H }}
        viewBox={`0 0 ${VIDEO_W} ${VIDEO_H}`}
      >
        {/* Ground shadow */}
        <ellipse
          cx={VIDEO_W / 2} cy={groundY + 10}
          rx={220} ry={18}
          fill="rgba(0,0,0,0.35)"
          opacity={sceneOpacity}
        />

        {/* Cart */}
        <Cart x={cartX} y={cartY} opacity={cartOpacity} />

        {/* Character */}
        <Character
          x={personX}
          y={groundY}
          waveAngle={waveAngle}
          pushAngle={pushLean}
          flip={!facingViewer}
          opacity={personOpacity}
        />
      </svg>

      {/* Caption */}
      <div style={{
        position:   "absolute",
        bottom:     VIDEO_H / 2 - 260,
        left:       "50%",
        transform:  "translateX(-50%)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize:   36,
        fontWeight: 700,
        color:      "#FFFFFF",
        whiteSpace: "nowrap",
        opacity:    interpolate(frame, [T.leaveEnd, T.leaveEnd + 8], [0, 1], {
          extrapolateLeft: "clamp", extrapolateRight: "clamp",
        }) * sceneOpacity,
        letterSpacing: "0.02em",
      }}>
        and much easier to manage.
      </div>
    </AbsoluteFill>
  );
};