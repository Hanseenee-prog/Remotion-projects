import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Layout constants ─────────────────────────────────────────────────────────
const VIDEO_W = 1080;
const VIDEO_H = 1920;

// Parent container — taller, transparent bg
const PARENT_W = 700;
const PARENT_H = 700;
const PARENT_X = (VIDEO_W - PARENT_W) / 2;
const PARENT_Y = VIDEO_H / 2 - PARENT_H / 2 - 20;

// Button — Scene 2 style, offset from center downward
const BTN_W = 300;
const BTN_H = 88;
const BTN_X = PARENT_X + PARENT_W / 2;
const BTN_Y = PARENT_Y + PARENT_H / 2 + 80;  // offset below center

// Cursor start — bottom-right
const CURSOR_START_X = VIDEO_W * 0.78;
const CURSOR_START_Y = VIDEO_H * 0.72;

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  cursorMove:  25,
  click:       52,
  pulseStart:  55,
  bubbleStart: 68,
  parentReact: 95,
  textAppear:  108,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const prog  = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══════════════════════════════════════════════════════════════
  // 1. CURSOR
  // ══════════════════════════════════════════════════════════════
  const cursorSpring = spring({
    fps, frame: frame - T.cursorMove,
    config: { damping: 18, stiffness: 90, mass: 1.0 },
    durationInFrames: 30,
  });
  const cursorX = interpolate(cursorSpring, [0, 1], [CURSOR_START_X, BTN_X - 20]);
  const cursorY = interpolate(cursorSpring, [0, 1], [CURSOR_START_Y, BTN_Y + 20]);

  const clickPressSpring = spring({
    fps, frame: frame - T.click,
    config: { damping: 12, stiffness: 400, mass: 0.4 },
    durationInFrames: 12,
  });
  const cursorScale   = frame >= T.click ? interpolate(clickPressSpring, [0, 0.3, 1], [1, 0.75, 1]) : 1;
  const cursorOpacity = interpolate(frame, [T.bubbleStart, T.bubbleStart + 12], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ══════════════════════════════════════════════════════════════
  // 2. BUTTON — Scene 2 style (white → #E63946 red)
  // ══════════════════════════════════════════════════════════════
  const isClicked   = frame >= T.click;
  const colorSpring = spring({
    fps, frame: frame - T.click,
    config: { damping: 20, stiffness: 120 },
  });
  const btnBg    = interpolateColors(colorSpring, [0, 1], ["#FFFFFF", "#E63946"]);
  const btnTextC = interpolateColors(colorSpring, [0, 1], ["#111111", "#FFFFFF"]);
  const glowOpacity = interpolate(colorSpring, [0, 1], [0, 0.5]);

  // Squash & Stretch on click
  const btnClickSpring = spring({
    fps, frame: frame - T.click,
    config: { damping: 8, stiffness: 500, mass: 0.3 },
    durationInFrames: 14,
  });
  const btnScaleX = frame >= T.click ? interpolate(btnClickSpring, [0, 0.2, 1], [1, 1.12, 1]) : 1;
  const btnScaleY = frame >= T.click ? interpolate(btnClickSpring, [0, 0.2, 1], [1, 0.88, 1]) : 1;

  // Ripple inside button
  const rippleSpring  = spring({ fps, frame: frame - T.click, config: { damping: 20, stiffness: 60 } });
  const rippleScale   = interpolate(rippleSpring, [0, 1], [0, 4]);
  const rippleOpacity = interpolate(rippleSpring, [0, 1], [0.6, 0]);

  // ══════════════════════════════════════════════════════════════
  // 3. PULSE RINGS — use button red color
  // ══════════════════════════════════════════════════════════════
  const p1 = prog(frame, T.pulseStart, T.pulseStart + 28);
  const p1Scale   = interpolate(p1, [0, 1], [0.2, 3.2]);
  const p1Opacity = interpolate(p1, [0, 0.1, 1], [0, 0.65, 0]);

  const p2 = prog(frame, T.pulseStart + 8, T.pulseStart + 34);
  const p2Scale   = interpolate(p2, [0, 1], [0.2, 2.6]);
  const p2Opacity = interpolate(p2, [0, 0.1, 1], [0, 0.45, 0]);

  // ══════════════════════════════════════════════════════════════
  // 4. BUBBLE TRAVELING UP — red color matching button
  // ══════════════════════════════════════════════════════════════
  const bubbleP = prog(frame, T.bubbleStart, T.parentReact - 5);
  const bubbleY = interpolate(bubbleP, [0, 1],
    [BTN_Y - BTN_H / 2, PARENT_Y + PARENT_H / 2]
  );
  const bubbleOpacity = frame < T.bubbleStart ? 0
    : frame > T.parentReact ? 0
    : interpolate(bubbleP, [0, 0.08, 0.85, 1], [0, 1, 1, 0]);
  const bubbleScale = interpolate(bubbleP, [0, 0.5, 1], [0.6, 1.1, 0.8]);

  // Trail dots — red
  const trailDots = Array.from({ length: 6 }, (_, i) => {
    const trailP = Math.max(0, bubbleP - i * 0.12);
    const dotY   = interpolate(trailP, [0, 1], [BTN_Y - BTN_H / 2, PARENT_Y + PARENT_H / 2]);
    const dotOp  = frame < T.bubbleStart ? 0
      : frame > T.parentReact ? 0
      : bubbleOpacity * (1 - i * 0.16);
    return { y: dotY, opacity: dotOp, size: 12 - i * 1.4 };
  });

  // ══════════════════════════════════════════════════════════════
  // 5. PARENT REACTION
  // ══════════════════════════════════════════════════════════════
  const parentBounceSpring = spring({
    fps, frame: frame - T.parentReact,
    config: { damping: 7, stiffness: 220, mass: 0.9 },
    durationInFrames: 35,
  });
  const parentScale = frame >= T.parentReact
    ? interpolate(parentBounceSpring, [0, 0.4, 1], [1, 1.055, 1])
    : 1;

  // Border: gray → red (matching the event color) → then stays red
  const borderColorP = prog(frame, T.parentReact, T.parentReact + 14);
  const borderColor  = frame >= T.parentReact
    ? `rgba(230,57,70,${0.5 + borderColorP * 0.5})`
    : "rgba(150,150,165,0.4)";
  const parentGlow = frame >= T.parentReact
    ? `0 0 ${borderColorP * 44}px rgba(230,57,70,${borderColorP * 0.4})`
    : "none";

  // ══════════════════════════════════════════════════════════════
  // 6. EYES
  // ══════════════════════════════════════════════════════════════
  const eyeSpring = spring({
    fps, frame: frame - T.parentReact,
    config: { damping: 9, stiffness: 280, mass: 0.5 },
    durationInFrames: 18,
  });
  const eyeScale   = frame >= T.parentReact ? Math.max(0, eyeSpring) : 0;
  const eyeOpacity = frame >= T.parentReact ? Math.min(1, eyeSpring * 3) : 0;

  // Blink every 22 frames — gives ~3 blinks in remaining 66 frames
  const eyeElapsed = Math.max(0, frame - (T.parentReact + 20));
  const blinkCycle = eyeElapsed % 22;
  const isBlinking = blinkCycle > 17;
  const eyeScaleY  = isBlinking
    ? interpolate(blinkCycle, [17, 19, 22], [1, 0.06, 1])
    : 1;

  // Pupils look down (checking body) — shift downward after first blink settles
  // Also a subtle side-to-side look: left then right
  const lookElapsed = Math.max(0, frame - (T.parentReact + 28));
  // Down-look: pupils shift down ~6px
  const pupilDownShift = 5;
  // Side look: oscillates left/right slowly
  const pupilSideShift = Math.sin(lookElapsed * 0.08) * 5;

  // ══════════════════════════════════════════════════════════════
  // 7. TEXT
  // ══════════════════════════════════════════════════════════════
  const textSpring = spring({
    fps, frame: frame - T.textAppear,
    config: { damping: 10, stiffness: 260, mass: 0.6 },
    durationInFrames: 16,
  });
  const textScale   = frame >= T.textAppear ? Math.max(0, textSpring) : 0;
  const textOpacity = frame >= T.textAppear ? Math.min(1, textSpring * 2.5) : 0;

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <AbsoluteFill>

      {/* ── Trail dots — red ─────────────────────────────────────────────── */}
      {trailDots.map((dot, i) => (
        <div key={i} style={{
          position:      "absolute",
          left:          BTN_X - dot.size / 2,
          top:           dot.y - dot.size / 2,
          width:         dot.size,
          height:        dot.size,
          borderRadius:  "50%",
          background:    "#E63946",
          opacity:       dot.opacity,
          pointerEvents: "none",
          zIndex:        12,
          boxShadow:     `0 0 ${dot.size * 1.5}px rgba(230,57,70,0.7)`,
        }} />
      ))}

      {/* ── Traveling bubble orb — red ───────────────────────────────────── */}
      {frame >= T.bubbleStart && (
        <div style={{
          position:      "absolute",
          left:          BTN_X - 28,
          top:           bubbleY - 28,
          width:         56,
          height:        56,
          borderRadius:  "50%",
          background:    "radial-gradient(circle, #FF8A8A 0%, #E63946 55%, transparent 100%)",
          opacity:       bubbleOpacity,
          transform:     `scale(${bubbleScale})`,
          transformOrigin: "center center",
          zIndex:        13,
          boxShadow:     "0 0 24px rgba(230,57,70,0.9), 0 0 50px rgba(230,57,70,0.4)",
          pointerEvents: "none",
        }} />
      )}

      {/* ── Parent container — transparent bg, gray border → red ─────────── */}
      <div style={{
        position:        "absolute",
        left:            PARENT_X,
        top:             PARENT_Y,
        width:           PARENT_W,
        height:          PARENT_H,
        borderRadius:    28,
        background:      "transparent",
        border:          `3px solid ${borderColor}`,
        boxShadow:       parentGlow !== "none" ? parentGlow : "none",
        transform:       `scale(${parentScale})`,
        transformOrigin: "center center",
        zIndex:          10,
        display:         "flex",
        flexDirection:   "column",
        alignItems:      "center",
        justifyContent:  "flex-start",
        padding:         "24px 32px 0",
        overflow:        "visible",
      }}>

        {/* Parent label — pill badge sitting on the top border */}
        <div style={{
          position:      "absolute",
          top:           -22,
          left:          "50%",
          transform:     "translateX(-50%)",
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      22,
          fontWeight:    700,
          color:         "#FFFFFF",
          letterSpacing: "0.08em",
          background:    "rgba(150,150,165,0.18)",
          border:        "1.5px solid rgba(150,150,165,0.45)",
          borderRadius:  "100px",
          padding:       "6px 24px",
          backdropFilter:"blur(8px)",
          whiteSpace:    "nowrap",
        }}>
          parent
        </div>

        {/* ── Eyes ── */}
        <div style={{
          display:         "flex",
          gap:             60,
          marginTop:       12,
          transform:       `scale(${eyeScale})`,
          transformOrigin: "center center",
          opacity:         eyeOpacity,
        }}>
          {[0, 1].map((eye) => (
            <div key={eye} style={{
              width:           50,
              height:          50,
              borderRadius:    "50%",
              background:      "#FFFFFF",
              display:         "flex",
              alignItems:      "center",
              justifyContent:  "center",
              boxShadow:       "0 2px 10px rgba(0,0,0,0.5)",
              transform:       `scaleY(${eyeScaleY})`,
              transformOrigin: "center center",
              overflow:        "hidden",
            }}>
              {/* Pupil — shifts to look side/down */}
              <div style={{
                width:        22,
                height:       22,
                borderRadius: "50%",
                background:   "#1a1a2e",
                position:     "relative",
                // Side look: left eye and right eye shift same direction
                transform:    `translate(${pupilSideShift}px, ${pupilDownShift}px)`,
                transition:   "none",
              }}>
                {/* Highlight */}
                <div style={{
                  position:     "absolute",
                  top:          3, right: 3,
                  width:        7, height: 7,
                  borderRadius: "50%",
                  background:   "#FFFFFF",
                  opacity:      0.85,
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── "Who clicked that?" ── */}
        <div style={{
          marginTop:       24,
          transform:       `scale(${textScale})`,
          transformOrigin: "center center",
          opacity:         textOpacity,
          fontFamily:      "'JetBrains Mono', monospace",
          fontSize:        32,
          fontWeight:      700,
          color:           "#FFFFFF",
          letterSpacing:   "0.01em",
          textAlign:       "center",
          lineHeight:      1.3,
        }}>
          👉 "Who clicked that?"
        </div>

      </div>

      {/* ── Button — Scene 2 style ────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        left:     BTN_X - BTN_W / 2,
        top:      BTN_Y - BTN_H / 2,
        width:    BTN_W,
        height:   BTN_H,
        zIndex:   15,
      }}>
        {/* Pulse rings — red */}
        {frame >= T.pulseStart && (
          <>
            <div style={{
              position:      "absolute", inset: 0,
              borderRadius:  24,
              background:    "transparent",
              border:        "2.5px solid #E63946",
              transform:     `scale(${p1Scale})`,
              opacity:       p1Opacity,
              transformOrigin: "center center",
              pointerEvents: "none",
            }} />
            <div style={{
              position:      "absolute", inset: 0,
              borderRadius:  24,
              background:    "transparent",
              border:        "2px solid #E63946",
              transform:     `scale(${p2Scale})`,
              opacity:       p2Opacity,
              transformOrigin: "center center",
              pointerEvents: "none",
            }} />
          </>
        )}

        {/* Button body — Scene 2 exact style */}
        <div style={{
          width:           BTN_W,
          height:          BTN_H,
          borderRadius:    24,
          backgroundColor: btnBg,
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "center",
          gap:             16,
          fontSize:        32,
          fontWeight:      700,
          fontFamily:      "'JetBrains Mono', monospace",
          color:           btnTextC,
          letterSpacing:   "0.02em",
          transform:       `scaleX(${btnScaleX}) scaleY(${btnScaleY})`,
          transformOrigin: "center center",
          boxShadow:       `0 24px 60px rgba(0,0,0,0.55), 0 0 80px rgba(230,57,70,${glowOpacity})`,
          position:        "relative",
          overflow:        "hidden",
          zIndex:          2,
        }}>
          {/* Ripple inside button */}
          {isClicked && (
            <div style={{
              position:        "absolute",
              width:           150, height: 150,
              backgroundColor: "rgba(255,255,255,0.8)",
              borderRadius:    "50%",
              transform:       `scale(${rippleScale})`,
              opacity:         rippleOpacity,
              pointerEvents:   "none",
              zIndex:          0,
            }} />
          )}
          <div style={{ zIndex: 1, display: "flex", alignItems: "center", gap: 16 }}>
            {isClicked ? "Clicked!" : "Click Me"}
            <span style={{ fontSize: 36, lineHeight: 1 }}>
              {isClicked ? "😎" : "😐"}
            </span>
          </div>
        </div>

        {/* child element label */}
        <div style={{
          position:      "absolute",
          bottom:        -34,
          left:          "50%",
          transform:     "translateX(-50%)",
          fontFamily:    "'JetBrains Mono', monospace",
          fontSize:      18,
          fontWeight:    600,
          color:         "rgba(171,178,191,0.55)",
          letterSpacing: "0.06em",
          whiteSpace:    "nowrap",
        }}>
          child element
        </div>
      </div>

      {/* ── Finger cursor ────────────────────────────────────────────────── */}
      {frame >= T.cursorMove && (
        <div style={{
          position:        "absolute",
          left:            cursorX,
          top:             cursorY,
          fontSize:        96,
          lineHeight:      1,
          transform:       `scale(${cursorScale})`,
          transformOrigin: "center top",
          opacity:         cursorOpacity,
          zIndex:          25,
          pointerEvents:   "none",
          filter:          "drop-shadow(0px 12px 20px rgba(0,0,0,0.5))",
          rotate:          "-10deg",
        }}>
          👆
        </div>
      )}

    </AbsoluteFill>
  );
};