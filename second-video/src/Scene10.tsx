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
  pushEnd:   20,  // cart+person reach center
  stepStart: 22,  // person steps out
  stepEnd:   35,  // fully turned, facing viewer
  waveStart: 37,  // wave begins
  fadeStart: 70,
  fadeEnd:   75,
} as const;

// ─── Sizes ────────────────────────────────────────────────────────────────────
const HEAD_R   = 66;
const BODY_W   = 96;
const BODY_H   = 132;
const LIMB_W   = 32;
const LEG_H    = 118;
const ARM_L    = 100;
const NECK_H   = 12;

const CART_W   = 290;
const CART_H   = 158;
const WHEEL_R  = 40;
const HANDLE_H = 134;

const CART_REST_X  = VIDEO_W / 2;
const GROUND_Y     = VIDEO_H / 2 + 260;
const HANDLE_X_REL = -CART_W / 2 - 16;
const PERSON_STEP_X = CART_REST_X + CART_W / 2 + 90;

// ─── Cart (with </> icon + subtle contents) ───────────────────────────────────
const Cart: React.FC<{
  cx: number;
  groundY: number;
  opacity: number;
  wheelRot: number;
}> = ({ cx, groundY, opacity, wheelRot }) => {
  const bodyTop = -CART_H - WHEEL_R + 8;
  const bodyCY  = bodyTop + CART_H / 2;

  return (
    <g transform={`translate(${cx}, ${groundY})`} opacity={opacity}>

      {/* Wheels — rotate as cart moves */}
      {[-1, 1].map((side) => {
        const wx = side * (CART_W / 2 - WHEEL_R - 10);
        return (
          <g key={side} transform={`rotate(${wheelRot}, ${wx}, 0)`}>
            <circle cx={wx} cy={0} r={WHEEL_R}      fill="#1E293B" />
            <circle cx={wx} cy={0} r={WHEEL_R - 10} fill="#334155" />
            {/* Spoke cross */}
            <line x1={wx - WHEEL_R + 8} y1={0} x2={wx + WHEEL_R - 8} y2={0} stroke="#64748B" strokeWidth="3" />
            <line x1={wx} y1={-(WHEEL_R - 8)} x2={wx} y2={WHEEL_R - 8} stroke="#64748B" strokeWidth="3" />
            <circle cx={wx} cy={0} r={5} fill="#94A3B8" />
          </g>
        );
      })}

      {/* Cart body */}
      <rect x={-CART_W / 2} y={bodyTop}
        width={CART_W} height={CART_H} rx={14} fill="#1E293B" />

      {/* Inner fill — slightly lighter, gives a 3-d inset feel */}
      <rect x={-CART_W / 2 + 8} y={bodyTop + 8}
        width={CART_W - 16} height={CART_H - 16} rx={9}
        fill="#0F172A" opacity="0.7" />

      {/* Subtle "contents" — a few stacked rounded rectangles peeking above the cart top */}
      {/* These sit inside the cart body, slightly raised */}
      <rect x={-50} y={bodyTop + 14} width={36} height={22} rx={6}
        fill="#5B4DB5" opacity="0.55" />
      <rect x={-8}  y={bodyTop + 10} width={28} height={28} rx={6}
        fill="#7060CC" opacity="0.45" />
      <rect x={22}  y={bodyTop + 16} width={22} height={18} rx={5}
        fill="#4338CA" opacity="0.5" />

      {/* </> icon centered on cart body */}
      {/* < */}
      <polyline
        points={`${-44},${bodyCY - 22} ${-68},${bodyCY} ${-44},${bodyCY + 22}`}
        stroke="#7C3AED" strokeWidth="8"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />
      {/* / */}
      <line
        x1={-16} y1={bodyCY - 26}
        x2={16}  y2={bodyCY + 26}
        stroke="#818CF8" strokeWidth="8"
        strokeLinecap="round"
      />
      {/* > */}
      <polyline
        points={`${44},${bodyCY - 22} ${68},${bodyCY} ${44},${bodyCY + 22}`}
        stroke="#7C3AED" strokeWidth="8"
        strokeLinecap="round" strokeLinejoin="round"
        fill="none"
      />

      {/* Cart rim / top edge highlight */}
      <rect x={-CART_W / 2} y={bodyTop}
        width={CART_W} height={10} rx={10}
        fill="#334155" opacity="0.8" />

      {/* Handle — vertical post on LEFT */}
      <rect x={-CART_W / 2 - 16} y={bodyTop - HANDLE_H}
        width={18} height={HANDLE_H} rx={9} fill="#475569" />
      {/* Grip bar */}
      <rect x={-CART_W / 2 - 30} y={bodyTop - HANDLE_H}
        width={36} height={20} rx={10} fill="#64748B" />
    </g>
  );
};

// ─── Character ────────────────────────────────────────────────────────────────
const Character: React.FC<{
  cx: number;
  groundY: number;
  lean: number;
  leftArmAngle: number;
  rightArmAngle: number;
  facingRight: boolean;
  opacity: number;
}> = ({ cx, groundY, lean, leftArmAngle, rightArmAngle, facingRight, opacity }) => {

  const SKIN  = "#FBBF7A";
  const SHIRT = "#5B4DB5";
  const PANTS = "#2D3A6B";
  const SHOE  = "#111827";

  const hipY     = 0;
  const bodyBotY = hipY;
  const bodyTopY = bodyBotY - BODY_H;
  const neckTopY = bodyTopY - NECK_H;
  const headCY   = neckTopY - HEAD_R;

  const sLX = -BODY_W / 2;
  const sRX =  BODY_W / 2;
  const sY  = bodyTopY + 18;

  const sx = facingRight ? 1 : -1;

  return (
    <g transform={`translate(${cx}, ${groundY})`} opacity={opacity}>
      <g transform={`rotate(${lean * sx}, 0, ${bodyBotY - BODY_H / 2})`}>
        <g transform={`scale(${sx}, 1)`}>

          {/* ── Left leg — straight */}
          <rect x={-BODY_W / 2 + 6} y={hipY}
            width={LIMB_W} height={LEG_H} rx={LIMB_W / 2} fill={PANTS} />
          <ellipse cx={-BODY_W / 2 + 6 + LIMB_W / 2} cy={hipY + LEG_H} rx={20} ry={9} fill={SHOE} />

          {/* ── Right leg — straight */}
          <rect x={BODY_W / 2 - 6 - LIMB_W} y={hipY}
            width={LIMB_W} height={LEG_H} rx={LIMB_W / 2} fill={PANTS} />
          <ellipse cx={BODY_W / 2 - 6 - LIMB_W / 2} cy={hipY + LEG_H} rx={20} ry={9} fill={SHOE} />

          {/* ── Body */}
          <rect x={-BODY_W / 2} y={bodyTopY} width={BODY_W} height={BODY_H} rx={16} fill={SHIRT} />

          {/* ── Left arm */}
          <g transform={`rotate(${leftArmAngle}, ${sLX}, ${sY})`}>
            <rect x={sLX - LIMB_W / 2} y={sY} width={LIMB_W} height={ARM_L} rx={LIMB_W / 2} fill={SKIN} />
            <circle cx={sLX} cy={sY + ARM_L} r={LIMB_W / 2 + 2} fill={SKIN} />
          </g>

          {/* ── Right arm */}
          <g transform={`rotate(${rightArmAngle}, ${sRX}, ${sY})`}>
            <rect x={sRX - LIMB_W / 2} y={sY} width={LIMB_W} height={ARM_L} rx={LIMB_W / 2} fill={SKIN} />
            <circle cx={sRX} cy={sY + ARM_L} r={LIMB_W / 2 + 2} fill={SKIN} />
          </g>

          {/* ── Neck */}
          <rect x={-10} y={neckTopY} width={20} height={NECK_H + HEAD_R * 0.6} rx={10} fill={SKIN} />

          {/* ── Head */}
          <circle cx={0} cy={headCY} r={HEAD_R} fill={SKIN} />

          {/* Hair */}
          <ellipse cx={0} cy={headCY - HEAD_R + 8} rx={HEAD_R - 2} ry={16} fill="#2D1B00" />

          {/* Eyes */}
          <circle cx={-15} cy={headCY - 6} r={7} fill="#1a1a2e" />
          <circle cx={ 15} cy={headCY - 6} r={7} fill="#1a1a2e" />
          <circle cx={-13} cy={headCY - 9} r={3} fill="#FFF" />
          <circle cx={ 17} cy={headCY - 9} r={3} fill="#FFF" />

          {/* Smile */}
          <path d={`M -16 ${headCY + 14} Q 0 ${headCY + 30} 16 ${headCY + 14}`}
            stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />

        </g>
      </g>
    </g>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase 1: Push (0 → 20) — steady walk into screen ─────────────────────
  const pushP    = clamp(frame / T.pushEnd);
  const pushEased = 1 - Math.pow(1 - pushP, 2.2);

  const offscreenX = -(CART_W + HEAD_R * 2 + 240);
  const cartX     = interpolate(pushEased, [0, 1], [offscreenX, CART_REST_X]);
  const personPushX = cartX + HANDLE_X_REL - BODY_W / 2 - 8;

  // Wheel rotation: proportional to distance traveled
  const cartDist = cartX - offscreenX;
  const wheelRot = (cartDist / (WHEEL_R * 2 * Math.PI)) * 360;

  // ── Phase 2: Step away (22 → 35) ─────────────────────────────────────────
  const stepSpring = spring({
    fps, frame: frame - T.stepStart,
    config: { damping: 14, stiffness: 200, mass: 0.75 },
    durationInFrames: T.stepEnd - T.stepStart,
  });
  const stepP   = frame >= T.stepStart ? clamp(stepSpring) : 0;
  const personX = frame < T.stepStart
    ? personPushX
    : interpolate(stepP, [0, 1], [personPushX, PERSON_STEP_X]);

  // ── Lean ──────────────────────────────────────────────────────────────────
  const lean = frame < T.stepStart
    ? -14
    : interpolate(stepP, [0, 1], [-14, 0]);

  // ── Arms ──────────────────────────────────────────────────────────────────
  const leftArmPush  = -70;
  const rightArmPush = -50;

  const leftArmStep = interpolate(stepP, [0, 1], [leftArmPush, 15]);

  let rightArmAngle: number;
  if (frame < T.waveStart) {
    rightArmAngle = frame < T.stepStart
      ? rightArmPush
      : interpolate(stepP, [0, 1], [rightArmPush, -30]);
  } else {
    const waveCycle = (frame - T.waveStart) * 0.24;
    rightArmAngle = -100 + Math.sin(waveCycle) * 55;
  }

  const leftArmAngle = frame < T.stepStart ? leftArmPush : leftArmStep;

  // ── Facing ────────────────────────────────────────────────────────────────
  const facingRight = frame < T.stepEnd;

  // ── Fade ──────────────────────────────────────────────────────────────────
  const opacity = interpolate(frame, [T.fadeStart, T.fadeEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <svg
        style={{ position: "absolute", left: 0, top: 0, width: VIDEO_W, height: VIDEO_H, overflow: "hidden" }}
        viewBox={`0 0 ${VIDEO_W} ${VIDEO_H}`}
      >
        {/* Ground shadow — grows as cart arrives */}
        <ellipse
          cx={CART_REST_X} cy={GROUND_Y + 16}
          rx={interpolate(pushEased, [0, 1], [0, 170])} ry={12}
          fill="rgba(0,0,0,0.18)" opacity={opacity}
        />

        {/* Cart */}
        <Cart cx={cartX} groundY={GROUND_Y} opacity={opacity} wheelRot={wheelRot} />

        {/* Character */}
        <Character
          cx={personX}
          groundY={GROUND_Y}
          lean={lean}
          leftArmAngle={leftArmAngle}
          rightArmAngle={rightArmAngle}
          facingRight={facingRight}
          opacity={opacity}
        />
      </svg>
    </AbsoluteFill>
  );
};