import React from "react";
import {
  AbsoluteFill,
  Img,
  Img,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const VIDEO_W = 1080;
const VIDEO_H = 1920;
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── Profile image (base64) ───────────────────────────────────────────────────
const PROFILE_IMG = "data:image/jpeg;base64,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FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FAFiiq9FADaKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigCaioaKAJqKhooAmoqGigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooo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";

// ─── Timeline ─────────────────────────────────────────────────────────────────
// Phase 1: pushing cart 0-45
const P1 = {
  pushEnd:   20,
  stepStart: 22,
  stepEnd:   35,
  waveStart: 37,
  fadeStart: 40,
  fadeEnd:   45,
} as const;

// Phase 2: profile card 50-130
const P2 = {
  start:      50,
  cardIn:     50,   // card springs in
  cursorMove: 65,   // cursor starts flying
  clickFrame: 80,   // button clicked
  confettiStart: 80,
  end:        130,
  fadeStart:  122,
  fadeEnd:    130,
} as const;

// ─── Sizes (Phase 1) ──────────────────────────────────────────────────────────
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

const CART_REST_X   = VIDEO_W / 2;
const GROUND_Y      = VIDEO_H / 2 + 260;
const HANDLE_X_REL  = -CART_W / 2 - 16;
const PERSON_STEP_X = CART_REST_X + CART_W / 2 + 90;

// ─── Confetti (Phase 2) ───────────────────────────────────────────────────────
const CONF_COLORS = [
  "#FF5F56","#FFBD2E","#27C93F","#4D9FFF",
  "#C678DD","#FF9F43","#FFFFFF","#A5D6FF","#FF6B9D",
];
const sr = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

interface Particle {
  id: number; x0: number; y0: number; vx: number; vy: number;
  gravity: number; color: string; width: number; height: number;
  rotation0: number; rotSpeed: number; delay: number; life: number;
  shape: "rect" | "circle" | "strip";
}

const CARD_CENTER_Y = VIDEO_H / 2;
const CANNON_Y = CARD_CENTER_Y + 200;

const generateParticles = (): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < 90; i++) {
    const isLeft = i < 45;
    const r = (o: number) => sr(i * 19 + o);
    const x0 = isLeft ? 120 + r(1) * 60 : VIDEO_W - 180 + r(1) * 60;
    const y0 = CANNON_Y + (r(2) - 0.5) * 80;
    const angleDeg = 55 + r(3) * 30;
    const angleRad = angleDeg * (Math.PI / 180);
    const speed = 36 + r(4) * 28;
    const vx = Math.cos(angleRad) * speed * (isLeft ? 1 : -1) * (0.5 + r(5) * 0.8);
    const vy = -Math.sin(angleRad) * speed;
    const shapes: Array<"rect"|"circle"|"strip"> = ["rect","rect","rect","circle","strip"];
    const shape = shapes[Math.floor(r(9) * shapes.length)];
    const width = shape === "strip" ? 5 + r(10) * 4 : 12 + r(10) * 16;
    const height = shape === "strip" ? 24 + r(11) * 18 : width * (0.35 + r(11) * 0.65);
    particles.push({
      id: i, x0, y0, vx, vy,
      gravity: 1.0 + r(6) * 0.7,
      color: CONF_COLORS[Math.floor(r(12) * CONF_COLORS.length)],
      width, height,
      rotation0: r(13) * 360,
      rotSpeed: (r(14) - 0.5) * 20,
      delay: Math.floor(r(7) * 10),
      life: 55 + Math.floor(r(8) * 30),
      shape,
    });
  }
  return particles;
};
const PARTICLES = generateParticles();

const ConfettiPiece: React.FC<{ p: Particle; elapsed: number }> = ({ p, elapsed }) => {
  const t = elapsed - p.delay;
  if (t <= 0 || t > p.life) return null;
  const x = p.x0 + p.vx * t;
  const y = p.y0 + p.vy * t + 0.5 * p.gravity * t * t;
  const fadeStart = p.life * 0.65;
  const opacity = t < fadeStart ? 1 : interpolate(t, [fadeStart, p.life], [1, 0]);
  if (opacity <= 0) return null;
  const rotation = p.rotation0 + p.rotSpeed * t;
  const scaleX = Math.abs(Math.cos(t * (0.15 + sr(p.id * 5) * 0.12))) * 0.8 + 0.2;
  const borderRadius = p.shape === "circle" ? "50%" : p.shape === "strip" ? "4px" : "3px";
  return (
    <div style={{
      position: "absolute", left: x, top: y,
      width: p.width, height: p.height,
      background: p.color, borderRadius, opacity,
      transform: `rotate(${rotation}deg) scaleX(${scaleX})`,
      transformOrigin: "center center", pointerEvents: "none",
    }} />
  );
};

// ─── Cart ─────────────────────────────────────────────────────────────────────
const Cart: React.FC<{ cx: number; groundY: number; opacity: number; wheelRot: number }> = ({ cx, groundY, opacity, wheelRot }) => {
  const bodyTop = -CART_H - WHEEL_R + 8;
  const bodyCY  = bodyTop + CART_H / 2;
  return (
    <g transform={`translate(${cx}, ${groundY})`} opacity={opacity}>
      {[-1, 1].map((side) => {
        const wx = side * (CART_W / 2 - WHEEL_R - 10);
        return (
          <g key={side} transform={`rotate(${wheelRot}, ${wx}, 0)`}>
            <circle cx={wx} cy={0} r={WHEEL_R} fill="#1E293B" />
            <circle cx={wx} cy={0} r={WHEEL_R - 10} fill="#334155" />
            <line x1={wx - WHEEL_R + 8} y1={0} x2={wx + WHEEL_R - 8} y2={0} stroke="#64748B" strokeWidth="3" />
            <line x1={wx} y1={-(WHEEL_R - 8)} x2={wx} y2={WHEEL_R - 8} stroke="#64748B" strokeWidth="3" />
            <circle cx={wx} cy={0} r={5} fill="#94A3B8" />
          </g>
        );
      })}
      <rect x={-CART_W / 2} y={bodyTop} width={CART_W} height={CART_H} rx={14} fill="#1E293B" />
      <rect x={-CART_W / 2 + 8} y={bodyTop + 8} width={CART_W - 16} height={CART_H - 16} rx={9} fill="#0F172A" opacity="0.7" />
      <rect x={-50} y={bodyTop + 14} width={36} height={22} rx={6} fill="#5B4DB5" opacity="0.55" />
      <rect x={-8}  y={bodyTop + 10} width={28} height={28} rx={6} fill="#7060CC" opacity="0.45" />
      <rect x={22}  y={bodyTop + 16} width={22} height={18} rx={5} fill="#4338CA" opacity="0.5" />
      <polyline points={`${-44},${bodyCY - 22} ${-68},${bodyCY} ${-44},${bodyCY + 22}`} stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <line x1={-16} y1={bodyCY - 26} x2={16} y2={bodyCY + 26} stroke="#818CF8" strokeWidth="8" strokeLinecap="round" />
      <polyline points={`${44},${bodyCY - 22} ${68},${bodyCY} ${44},${bodyCY + 22}`} stroke="#7C3AED" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x={-CART_W / 2} y={bodyTop} width={CART_W} height={10} rx={10} fill="#334155" opacity="0.8" />
      <rect x={-CART_W / 2 - 16} y={bodyTop - HANDLE_H} width={18} height={HANDLE_H} rx={9} fill="#475569" />
      <rect x={-CART_W / 2 - 30} y={bodyTop - HANDLE_H} width={36} height={20} rx={10} fill="#64748B" />
    </g>
  );
};

// ─── Character ────────────────────────────────────────────────────────────────
const Character: React.FC<{
  cx: number; groundY: number; lean: number;
  leftArmAngle: number; rightArmAngle: number;
  facingRight: boolean; opacity: number;
}> = ({ cx, groundY, lean, leftArmAngle, rightArmAngle, facingRight, opacity }) => {
  const SKIN = "#FBBF7A"; const SHIRT = "#5B4DB5"; const PANTS = "#2D3A6B"; const SHOE = "#111827";
  const hipY = 0; const bodyBotY = hipY; const bodyTopY = bodyBotY - BODY_H;
  const neckTopY = bodyTopY - NECK_H; const headCY = neckTopY - HEAD_R;
  const sLX = -BODY_W / 2; const sRX = BODY_W / 2; const sY = bodyTopY + 18;
  const sx = facingRight ? 1 : -1;
  return (
    <g transform={`translate(${cx}, ${groundY})`} opacity={opacity}>
      <g transform={`rotate(${lean * sx}, 0, ${bodyBotY - BODY_H / 2})`}>
        <g transform={`scale(${sx}, 1)`}>
          <rect x={-BODY_W / 2 + 6} y={hipY} width={LIMB_W} height={LEG_H} rx={LIMB_W / 2} fill={PANTS} />
          <ellipse cx={-BODY_W / 2 + 6 + LIMB_W / 2} cy={hipY + LEG_H} rx={20} ry={9} fill={SHOE} />
          <rect x={BODY_W / 2 - 6 - LIMB_W} y={hipY} width={LIMB_W} height={LEG_H} rx={LIMB_W / 2} fill={PANTS} />
          <ellipse cx={BODY_W / 2 - 6 - LIMB_W / 2} cy={hipY + LEG_H} rx={20} ry={9} fill={SHOE} />
          <rect x={-BODY_W / 2} y={bodyTopY} width={BODY_W} height={BODY_H} rx={16} fill={SHIRT} />
          <g transform={`rotate(${leftArmAngle}, ${sLX}, ${sY})`}>
            <rect x={sLX - LIMB_W / 2} y={sY} width={LIMB_W} height={ARM_L} rx={LIMB_W / 2} fill={SKIN} />
            <circle cx={sLX} cy={sY + ARM_L} r={LIMB_W / 2 + 2} fill={SKIN} />
          </g>
          <g transform={`rotate(${rightArmAngle}, ${sRX}, ${sY})`}>
            <rect x={sRX - LIMB_W / 2} y={sY} width={LIMB_W} height={ARM_L} rx={LIMB_W / 2} fill={SKIN} />
            <circle cx={sRX} cy={sY + ARM_L} r={LIMB_W / 2 + 2} fill={SKIN} />
          </g>
          <rect x={-10} y={neckTopY} width={20} height={NECK_H + HEAD_R * 0.6} rx={10} fill={SKIN} />
          <circle cx={0} cy={headCY} r={HEAD_R} fill={SKIN} />
          <ellipse cx={0} cy={headCY - HEAD_R + 8} rx={HEAD_R - 2} ry={16} fill="#2D1B00" />
          <circle cx={-15} cy={headCY - 6} r={7} fill="#1a1a2e" />
          <circle cx={15}  cy={headCY - 6} r={7} fill="#1a1a2e" />
          <circle cx={-13} cy={headCY - 9} r={3} fill="#FFF" />
          <circle cx={17}  cy={headCY - 9} r={3} fill="#FFF" />
          <path d={`M -16 ${headCY + 14} Q 0 ${headCY + 30} 16 ${headCY + 14}`} stroke="#1a1a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </g>
  );
};

// ─── Profile Card ─────────────────────────────────────────────────────────────
const CARD_W     = 680;
const CARD_H     = 730;
const AVATAR_R   = 110;
const CARD_X     = (VIDEO_W - CARD_W) / 2;
const CARD_Y_REST = VIDEO_H / 2 - CARD_H / 2;

const ProfileCard: React.FC<{
  cardScale: number; cardOpacity: number;
  isClicked: boolean; colorSpring: number;
  cursorX: number; cursorY: number; cursorClickScale: number;
  rippleScale: number; rippleOpacity: number;
  confettiElapsed: number; showCursor: boolean;
}> = ({ cardScale, cardOpacity, isClicked, colorSpring, cursorX, cursorY, cursorClickScale, rippleScale, rippleOpacity, confettiElapsed, showCursor }) => {

  const btnBg    = interpolateColors(colorSpring, [0, 1], ["#0095F6", "#2A2A2A"]);
  const btnTextC = interpolateColors(colorSpring, [0, 1], ["#FFFFFF", "#AAAAAA"]);
  const btnText  = isClicked ? "Following ✓" : "Follow";
  const glowOp   = interpolate(colorSpring, [0, 1], [0, 0.35]);

  return (
    <div style={{
      position: "absolute",
      left:     CARD_X,
      top:      CARD_Y_REST,
      width:    CARD_W,
      height:   CARD_H,
      opacity:  cardOpacity,
      transform: `scale(${cardScale})`,
      transformOrigin: "center center",
      zIndex: 50,
    }}>
      {/* Card body */}
      <div style={{
        position:     "absolute", inset: 0,
        background:   "#121212",
        borderRadius: 40,
        border:       "1.5px solid rgba(255,255,255,0.08)",
        boxShadow:    `0 40px 120px rgba(0,0,0,0.95), 0 0 60px rgba(0,149,246,${glowOp})`,
        display:      "flex",
        flexDirection:"column",
        alignItems:   "center",
        paddingTop:   60,
        gap:          0,
        overflow:     "hidden",
        zIndex:       10,
      }}>

        {/* ── Instagram story ring + avatar ── */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          {/* Story gradient ring */}
          <div style={{
            width:        (AVATAR_R + 14) * 2,
            height:       (AVATAR_R + 14) * 2,
            borderRadius: "50%",
            background:   "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            padding:      5,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
          }}>
            {/* White gap ring */}
            <div style={{
              width:        (AVATAR_R + 7) * 2,
              height:       (AVATAR_R + 7) * 2,
              borderRadius: "50%",
              background:   "#121212",
              padding:      5,
              display:      "flex",
              alignItems:   "center",
              justifyContent: "center",
            }}>
              {/* Avatar circle — clipped */}
              <div style={{
                width:        AVATAR_R * 2,
                height:       AVATAR_R * 2,
                borderRadius: "50%",
                overflow:     "hidden",
                background:   "#333",
                position:     "relative",
              }}>
                <Img
                  src={staticFile("profile-img.jpg")}
                  style={{
                    width:      "100%",
                    height:     "100%",
                    objectFit:  "cover",
                    objectPosition: "center 38%",
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      46,
          fontWeight:    800,
          color:         "#FFFFFF",
          letterSpacing: "0.01em",
          marginBottom:  10,
        }}>Hanson Emmanuel</div>

        {/* Username */}
        <div style={{
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      34,
          fontWeight:    500,
          color:         "rgba(255,255,255,0.55)",
          marginBottom:  80,
          letterSpacing: "0.02em",
        }}>@hee_codes</div>

        {/* Follow button */}
        <div style={{ position: "relative" }}>
          <div style={{
            backgroundColor: btnBg,
            color:           btnTextC,
            width:           400,
            height:          110,
            borderRadius:    20,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            fontSize:        40,
            fontWeight:      700,
            fontFamily:      "'JetBrains Mono', monospace",
            letterSpacing:   "0.04em",
            boxShadow:       isClicked ? "0 4px 20px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,149,246,0.5)",
            position:        "relative",
            overflow:        "hidden",
            border:          isClicked ? "2px solid rgba(255,255,255,0.08)" : "none",
          }}>
            {isClicked && (
              <div style={{
                position: "absolute", width: 120, height: 120,
                backgroundColor: "rgba(255,255,255,0.7)", borderRadius: "50%",
                transform: `scale(${rippleScale})`, opacity: rippleOpacity,
                pointerEvents: "none", zIndex: 0,
              }} />
            )}
            <span style={{ zIndex: 1 }}>{btnText}</span>
          </div>

          {/* Cursor */}
          {showCursor && (
            <div style={{
              position:   "absolute",
              left:       "50%",
              top:        "50%",
              transform:  `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
              zIndex:     20,
              fontSize:   90,
              lineHeight: 1,
              filter:     "drop-shadow(0px 12px 12px rgba(0,0,0,0.5))",
              rotate:     "-10deg",
            }}>👆</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene10: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══════════════════════════════════════════════════════════════════
  // PHASE 1 — Cart push (0-45)
  // ══════════════════════════════════════════════════════════════════
  const pushP     = clamp(frame / P1.pushEnd);
  const pushEased = 1 - Math.pow(1 - pushP, 2.2);
  const offscreenX = -(CART_W + HEAD_R * 2 + 240);
  const cartX      = interpolate(pushEased, [0, 1], [offscreenX, CART_REST_X]);
  const personPushX = cartX + HANDLE_X_REL - BODY_W / 2 - 8;
  const cartDist   = cartX - offscreenX;
  const wheelRot   = (cartDist / (WHEEL_R * 2 * Math.PI)) * 360;

  const stepSpring = spring({ fps, frame: frame - P1.stepStart, config: { damping: 14, stiffness: 200, mass: 0.75 }, durationInFrames: P1.stepEnd - P1.stepStart });
  const stepP      = frame >= P1.stepStart ? clamp(stepSpring) : 0;
  const personX    = frame < P1.stepStart ? personPushX : interpolate(stepP, [0, 1], [personPushX, PERSON_STEP_X]);
  const lean       = frame < P1.stepStart ? -14 : interpolate(stepP, [0, 1], [-14, 0]);

  const leftArmPush = -70; const rightArmPush = -50;
  const leftArmStep = interpolate(stepP, [0, 1], [leftArmPush, 15]);
  let rightArmAngle: number;
  if (frame < P1.waveStart) {
    rightArmAngle = frame < P1.stepStart ? rightArmPush : interpolate(stepP, [0, 1], [rightArmPush, -30]);
  } else {
    rightArmAngle = -100 + Math.sin((frame - P1.waveStart) * 0.24) * 55;
  }
  const leftArmAngle = frame < P1.stepStart ? leftArmPush : leftArmStep;
  const facingRight  = frame < P1.stepEnd;

  const p1Opacity = interpolate(frame, [P1.fadeStart, P1.fadeEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ══════════════════════════════════════════════════════════════════
  // PHASE 2 — Profile card (50-130)
  // ══════════════════════════════════════════════════════════════════
  const cardInSpring = spring({ fps, frame: frame - P2.cardIn, config: { damping: 14, stiffness: 130, mass: 0.9 }, durationInFrames: 20 });
  const cardScale    = frame >= P2.cardIn ? interpolate(clamp(cardInSpring), [0, 1], [0.7, 1]) : 0.7;
  const cardOpacity  = frame >= P2.cardIn
    ? interpolate(frame, [P2.cardIn, P2.cardIn + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 0;

  const isClicked = frame >= P2.clickFrame;

  const colorSpringVal = spring({ fps, frame: frame - P2.clickFrame, config: { damping: 20, stiffness: 120 } });
  const colorSpring    = clamp(isClicked ? colorSpringVal : 0);

  // Cursor
  const cursorMoveSpring = spring({ fps, frame: frame - P2.cursorMove, config: { damping: 14, stiffness: 100 } });
  const cursorX = interpolate(clamp(cursorMoveSpring), [0, 1], [380, 0]);
  const cursorY = interpolate(clamp(cursorMoveSpring), [0, 1], [600, 40]);
  const cursorPressSpring = spring({ fps, frame: frame - P2.clickFrame, config: { damping: 12, stiffness: 300, mass: 0.5 } });
  const cursorClickScale  = interpolate(cursorPressSpring, [0, 0.5, 1], [1, 0.75, 1], { extrapolateRight: "clamp" });
  const showCursor = frame >= P2.cursorMove && frame < P2.clickFrame + 15;

  // Ripple
  const rippleSpring  = spring({ fps, frame: frame - P2.clickFrame, config: { damping: 20, stiffness: 60 } });
  const rippleScale   = clamp(rippleSpring) * 5;
  const rippleOpacity = interpolate(clamp(rippleSpring), [0, 1], [0.6, 0]);

  const confettiElapsed = frame - P2.confettiStart;

  const p2Opacity = frame >= P2.fadeStart
    ? interpolate(frame, [P2.fadeStart, P2.fadeEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    : 1;

  return (
    <AbsoluteFill>

      {/* ── Phase 1 wrapper ─────────────────────────────────────────── */}
      {frame <= P1.fadeEnd + 2 && (
        <div style={{ opacity: p1Opacity, position: "absolute", inset: 0 }}>
          <svg
            style={{ position: "absolute", left: 0, top: 0, width: VIDEO_W, height: VIDEO_H, overflow: "hidden" }}
            viewBox={`0 0 ${VIDEO_W} ${VIDEO_H}`}
          >
            <ellipse cx={CART_REST_X} cy={GROUND_Y + 16} rx={interpolate(pushEased, [0, 1], [0, 170])} ry={12} fill="rgba(0,0,0,0.18)" opacity={1} />
            <Cart cx={cartX} groundY={GROUND_Y} opacity={1} wheelRot={wheelRot} />
            <Character cx={personX} groundY={GROUND_Y} lean={lean} leftArmAngle={leftArmAngle} rightArmAngle={rightArmAngle} facingRight={facingRight} opacity={1} />
          </svg>
        </div>
      )}

      {/* ── Phase 2 wrapper ─────────────────────────────────────────── */}
      {frame >= P2.start && (
        <div style={{ opacity: p2Opacity, position: "absolute", inset: 0 }}>
          {/* Confetti — above card, full screen */}
          {isClicked && (
            <AbsoluteFill style={{ pointerEvents: "none", zIndex: 200, overflow: "visible" }}>
              {PARTICLES.map((p) => (
                <ConfettiPiece key={p.id} p={p} elapsed={confettiElapsed} />
              ))}
            </AbsoluteFill>
          )}
          <ProfileCard
            cardScale={cardScale}
            cardOpacity={cardOpacity}
            isClicked={isClicked}
            colorSpring={colorSpring}
            cursorX={cursorX}
            cursorY={cursorY}
            cursorClickScale={cursorClickScale}
            rippleScale={rippleScale}
            rippleOpacity={rippleOpacity}
            confettiElapsed={confettiElapsed}
            showCursor={showCursor}
          />
        </div>
      )}

    </AbsoluteFill>
  );
};