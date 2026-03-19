import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Inline syntax token ──────────────────────────────────────────────────────
const Tok: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ color }}>{children}</span>
);

const SYN = {
  plain:   "#ABB2BF",
  method:  "#C678DD",  // purple — forEach, addEventListener, backgroundColor
  string:  "#A5D6FF",  // light blue
  ident:   "#D19A66",  // orange — named param e.g. button in forEach((button))
  arrow:   "#E06C75",  // coral — => and =
  punct:   "#ABB2BF",
  cursor:  "#FFFFFF",
};

// ─── Layout constants ─────────────────────────────────────────────────────────
const WIN_W      = 960;
const FONT_SIZE  = 40;
const FONT_W     = 600;
const BOTTOM_PAD = 250;
const VIDEO_H    = 1920;
const VIDEO_W    = 1080;
const WIN_H_EST  = 504;
const CLICK_FRAME = 30;

// ─── Confetti palette ─────────────────────────────────────────────────────────
const COLORS = [
  "#FF5F56", "#FFBD2E", "#27C93F", "#4D9FFF",
  "#C678DD", "#FF9F43", "#FFFFFF", "#A5D6FF", "#FF6B9D",
];

// ─── Seeded random ────────────────────────────────────────────────────────────
const sr = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

// ─── Particle definition ──────────────────────────────────────────────────────
interface Particle {
  id:        number;
  x0:        number;    // launch X
  y0:        number;    // launch Y
  vx:        number;    // px/frame horizontal
  vy:        number;    // px/frame vertical (negative = up)
  gravity:   number;    // px/frame²
  color:     string;
  width:     number;
  height:    number;
  rotation0: number;
  rotSpeed:  number;
  delay:     number;
  life:      number;
  shape:     "rect" | "circle" | "strip";
}

// ─── Cannon generator ─────────────────────────────────────────────────────────
// Launch Y = a little below the button center (button is at 50% of VIDEO_H after move)
// Button center after scale = VIDEO_H * 0.5 = 960px
// "A little below the button" = ~960 + 130 = 1090px from top
const CANNON_Y = VIDEO_H * 0.5 + 160;

const generateParticles = (): Particle[] => {
  const particles: Particle[] = [];
  const total = 90; // 45 per side

  for (let i = 0; i < total; i++) {
    const isLeft = i < total / 2;
    // const localIdx = i % (total / 2);
    const r = (o: number) => sr(i * 19 + o);

    // ── Launch position ──────────────────────────────────────────────────────
    // Left cannon: just off left edge (–20 to 40px from left)
    // Right cannon: just off right edge (VIDEO_W–40 to VIDEO_W+20px)
    const x0 = isLeft
      ? -10 + r(1) * 40           // left edge
      : VIDEO_W - 30 + r(1) * 40; // right edge

    const y0 = CANNON_Y + (r(2) - 0.5) * 80; // ±40px vertical spread at cannon mouth

    // ── Velocity ─────────────────────────────────────────────────────────────
    // Left cannon fires RIGHT and UP: vx positive, vy negative (upward)
    // Right cannon fires LEFT and UP: vx negative, vy negative
    //
    // Angle from horizontal: 55°–85° — steep enough to shoot HIGH
    const angleDeg = 55 + r(3) * 30;                   // 55–85°
    const angleRad = angleDeg * (Math.PI / 180);
    const speed    = 36 + r(4) * 28;                   // 36–64 px/frame — fast!

    const vx = Math.cos(angleRad) * speed * (isLeft ? 1 : -1) * (0.5 + r(5) * 0.8);
    const vy = -Math.sin(angleRad) * speed;             // always upward

    const gravity  = 1.0 + r(6) * 0.7;                 // 1.0–1.7 px/frame²
    const delay    = Math.floor(r(7) * 10);             // 0–9 frame stagger
    const life     = 55 + Math.floor(r(8) * 30);       // 55–85 frames

    const shapes: Array<"rect" | "circle" | "strip"> = ["rect", "rect", "rect", "circle", "strip"];
    const shape  = shapes[Math.floor(r(9) * shapes.length)];
    const width  = shape === "strip" ? 5 + r(10) * 4   : 12 + r(10) * 16;
    const height = shape === "strip" ? 24 + r(11) * 18 : width * (0.35 + r(11) * 0.65);

    particles.push({
      id: i,
      x0, y0, vx, vy, gravity,
      color:     COLORS[Math.floor(r(12) * COLORS.length)],
      width, height,
      rotation0: r(13) * 360,
      rotSpeed:  (r(14) - 0.5) * 20,  // –10 to +10 deg/frame
      delay, life, shape,
    });
  }

  return particles;
};

const PARTICLES = generateParticles();

// ─── Single confetti piece ────────────────────────────────────────────────────
const ConfettiPiece: React.FC<{ p: Particle; elapsed: number }> = ({ p, elapsed }) => {
  const t = elapsed - p.delay;
  if (t <= 0 || t > p.life) return null;

  // Physics
  const x = p.x0 + p.vx * t;
  const y = p.y0 + p.vy * t + 0.5 * p.gravity * t * t;

  // Fade: full for first 65% of life, then fade to 0
  const fadeStart = p.life * 0.65;
  const opacity   = t < fadeStart
    ? 1
    : interpolate(t, [fadeStart, p.life], [1, 0]);

  if (opacity <= 0) return null;

  // Rotation
  const rotation = p.rotation0 + p.rotSpeed * t;

  // Paper flap — oscillates scaleX like a tumbling piece
  const flapFreq = 0.15 + sr(p.id * 5) * 0.12;
  const scaleX   = Math.abs(Math.cos(t * flapFreq)) * 0.8 + 0.2; // never fully flat

  const borderRadius =
    p.shape === "circle" ? "50%" :
    p.shape === "strip"  ? "4px" : "3px";

  return (
    <div
      style={{
        position:        "absolute",
        left:            x,
        top:             y,
        width:           p.width,
        height:          p.height,
        background:      p.color,
        borderRadius,
        opacity,
        transform:       `rotate(${rotation}deg) scaleX(${scaleX})`,
        transformOrigin: "center center",
        pointerEvents:   "none",
      }}
    />
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Code window exits bottom ──────────────────────────────────────────────
  const centeredTop     = VIDEO_H / 2 - WIN_H_EST / 2;
  const targetTop       = VIDEO_H - BOTTOM_PAD - WIN_H_EST;
  const startTranslateY = targetTop - centeredTop;

  const windowExitSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });
  const windowExitY      = interpolate(windowExitSpring, [0, 1], [startTranslateY, startTranslateY + 1200]);

  // ── Button moves to center, scales up ────────────────────────────────────
  const btnMoveSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });
  const btnTopPercent = interpolate(btnMoveSpring, [0, 1], [32, 50]);
  const btnScale      = interpolate(btnMoveSpring, [0, 1], [1, 1.4]);

  // ── Cursor flies in ───────────────────────────────────────────────────────
  const cursorMoveSpring = spring({ frame: frame - 5, fps, config: { damping: 14, stiffness: 100 } });
  const cursorX = interpolate(cursorMoveSpring, [0, 1], [500, 0]);
  const cursorY = interpolate(cursorMoveSpring, [0, 1], [800, 40]);

  const cursorPress      = spring({ frame: frame - CLICK_FRAME, fps, config: { damping: 12, stiffness: 300, mass: 0.5 } });
  const cursorClickScale = interpolate(cursorPress, [0, 0.5, 1], [1, 0.8, 1], { extrapolateRight: "clamp" });

  // ── Color & glow ──────────────────────────────────────────────────────────
  const isClicked    = frame >= CLICK_FRAME;
  const colorSpring  = spring({ frame: frame - CLICK_FRAME, fps, config: { damping: 20, stiffness: 120 } });
  const btnBg        = interpolateColors(colorSpring, [0, 1], ["#FFFFFF", "#E63946"]);
  const btnTextC     = interpolateColors(colorSpring, [0, 1], ["#111111", "#FFFFFF"]);
  const glowOpacity  = interpolate(colorSpring, [0, 1], [0, 0.5]);
  const boxShadow    = `0 24px 60px rgba(0,0,0,0.55), 0 0 80px rgba(230,57,70,${glowOpacity})`;

  // ── Ripple inside button ──────────────────────────────────────────────────
  const rippleSpring  = spring({ frame: frame - CLICK_FRAME, fps, config: { damping: 20, stiffness: 60 } });
  const rippleScale   = interpolate(rippleSpring, [0, 1], [0, 4]);
  const rippleOpacity = interpolate(rippleSpring, [0, 1], [0.6, 0]);

  // ── Confetti elapsed frames ───────────────────────────────────────────────
  const confettiElapsed = frame - CLICK_FRAME;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", background: "transparent" }}>

      {/* ── Confetti — full canvas layer, z above bg, below button ─────────── */}
      {isClicked && (
        <AbsoluteFill style={{ pointerEvents: "none", zIndex: 8 }}>
          {PARTICLES.map((p) => (
            <ConfettiPiece key={p.id} p={p} elapsed={confettiElapsed} />
          ))}
        </AbsoluteFill>
      )}

      {/* ── Code window exiting ───────────────────────────────────────────── */}
      <div
        style={{
          transform:    `translateY(${windowExitY}px)`,
          zIndex:       5,
          width:        WIN_W,
          background:   "#0D1117",
          borderRadius: 16,
          overflow:     "hidden",
          boxShadow:    "0 30px 80px rgba(0,0,0,0.85)",
          border:       "1px solid rgba(255,255,255,0.1)",
          fontFamily:   "'JetBrains Mono', monospace",
          position:     "absolute",
        }}
      >
        <div style={{ height: 96, background: "#161B22", display: "flex", alignItems: "center", padding: "0 32px", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 148, bottom: 0, height: 72, background: "#0D1117", padding: "0 32px", display: "flex", alignItems: "center", gap: 16, borderRadius: "10px 10px 0 0", fontSize: 26, fontWeight: 500, color: "#E6EDF3" }}>
            <div style={{ background: "#F7DF1E", color: "#000", fontWeight: 900, fontSize: 18, width: 32, height: 32, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "0 3px 2px 0", borderRadius: 5, fontFamily: "sans-serif", flexShrink: 0 }}>JS</div>
            scripts.js
          </div>
        </div>
        <div style={{ padding: "44px 36px 52px", fontSize: FONT_SIZE, fontWeight: FONT_W, lineHeight: 1.85, color: SYN.plain, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ whiteSpace: "nowrap" }}>
            <Tok color={SYN.plain}>button.</Tok><Tok color={SYN.method}>addEventListener</Tok><Tok color={SYN.punct}>(</Tok><Tok color={SYN.string}>'click'</Tok><Tok color={SYN.punct}>, () </Tok>
            <Tok color={SYN.arrow}>={">"}</Tok>
            <Tok color={SYN.punct}> {"{"}</Tok>
          </div>
          <div style={{ whiteSpace: "nowrap", paddingLeft: 64 }}>
            <Tok color={SYN.plain}>button.style.</Tok><Tok color={SYN.method}>backgroundColor</Tok><Tok color={SYN.punct}> </Tok><Tok color={SYN.arrow}>=</Tok><Tok color={SYN.punct}> </Tok><Tok color={SYN.string}>'red'</Tok><Tok color={SYN.punct}>;</Tok>
          </div>
          <div style={{ whiteSpace: "nowrap" }}>
            <Tok color={SYN.plain}>{"});"}</Tok>
          </div>
        </div>
      </div>

      {/* ── Button + cursor ───────────────────────────────────────────────── */}
      <div
        style={{
          position:  "absolute",
          top:       `${btnTopPercent}%`,
          transform: `translateY(-50%) scale(${btnScale})`,
          zIndex:    10,
        }}
      >
        <div
          style={{
            backgroundColor: btnBg,
            color:           btnTextC,
            width:           420,
            height:          130,
            borderRadius:    24,
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            gap:             16,
            fontSize:        46,
            fontWeight:      700,
            fontFamily:      "'JetBrains Mono', monospace",
            letterSpacing:   "0.02em",
            boxShadow,
            position:        "relative",
            overflow:        "hidden",
          }}
        >
          {isClicked && (
            <div
              style={{
                position:        "absolute",
                width:           150,
                height:          150,
                backgroundColor: "rgba(255,255,255,0.8)",
                borderRadius:    "50%",
                transform:       `scale(${rippleScale})`,
                opacity:         rippleOpacity,
                pointerEvents:   "none",
                zIndex:          0,
              }}
            />
          )}
          <div style={{ zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            {isClicked ? "Clicked!" : "Click Me"}
            <span style={{ fontSize: 48, lineHeight: 1 }}>{isClicked ? "😎" : "😐"}</span>
          </div>
        </div>

        {/* Finger cursor */}
        <div
          style={{
            position:   "absolute",
            left:       "50%",
            top:        "50%",
            transform:  `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
            zIndex:     20,
            fontSize:   100,
            lineHeight: 1,
            filter:     "drop-shadow(0px 15px 15px rgba(0,0,0,0.4))",
            rotate:     "-10deg",
          }}
        >
          👆
        </div>
      </div>

    </AbsoluteFill>
  );
};