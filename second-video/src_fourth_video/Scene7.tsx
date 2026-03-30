// Scene 7 — "So now… even with display involved, your card can fade in, move, and scale smoothly."
//
// Timeline (210 frames @ 30fps):
//   0–8    : Button springs in
//   8–28   : Cursor slides in from bottom-right (exact Scene 1 coords)
//   28–34  : Cursor presses — button squishes, ripple fires
//   34–40  : Cursor fades out immediately after click
//   34–60  : Button scales (celebration) — No vertical movement
//   34–70  : Card fades in + scales — NO translateY, pure opacity+scale
//   55–130 : Caption rises in word by word
//   70–155 : Hold
//   142–155: Main content fades out
//   165–210: "Check caption for more details." + arrow

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(val: number, min = 0, max = 1) {
  return Math.min(Math.max(val, min), max);
}
function progress(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══ BUTTON spring in — exact Scene 1 config ══════════════════════════════════
  const btnScaleSpring = spring({
    fps,
    frame: Math.max(0, frame - 2),
    config: { damping: 12, stiffness: 140 },
  });

  // ══ CURSOR — exact Scene 1 coordinates ═══════════════════════════════════════
  const CURSOR_REST_X  = 490;
  const CURSOR_REST_Y  = 690;
  const CURSOR_START_X = 900;
  const CURSOR_START_Y = 1400;

  const cursorMoveP = clamp((frame - 8) / (28 - 8));
  const cursorEased = easeOut(cursorMoveP);

  const cursorX = frame >= 28
    ? CURSOR_REST_X
    : CURSOR_START_X + (CURSOR_REST_X - CURSOR_START_X) * cursorEased;
  const cursorY = frame >= 28
    ? CURSOR_REST_Y
    : CURSOR_START_Y + (CURSOR_REST_Y - CURSOR_START_Y) * cursorEased;

  const cursorOpacity = interpolate(frame, [8, 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Click squish on cursor (frames 28–34)
  const clickP = interpolate(frame, [28, 30, 34], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cursorClickScale = interpolate(clickP, [0, 1], [1, 0.8]);

  // Cursor fades out right as click lands (frames 34–40)
  const cursorClickFade = interpolate(frame, [34, 40], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const finalCursorOpacity = cursorOpacity * cursorClickFade;

  // ══ BUTTON CLICK — exact Scene 1 mechanics ════════════════════════════════════
  const btnClickP      = interpolate(frame, [28, 30, 34], [0, 1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const btnClickScale  = interpolate(btnClickP, [0, 1], [1, 0.94]);
  const btnClickOffset = interpolate(btnClickP, [0, 1], [0, 4]);

  const rippleScale   = interpolate(frame, [28, 46], [0, 15], { extrapolateRight: "clamp" });
  const rippleOpacity = interpolate(frame, [28, 46], [0.6, 0], { extrapolateRight: "clamp" });

  // ══ BUTTON SCALE after click (frame 34+) ═══════════════════════════════════
  const btnFloatSpring = spring({
    fps,
    frame: Math.max(0, frame - 34),
    config: { damping: 14, stiffness: 80, mass: 0.9 },
    durationInFrames: 32,
  });
  
  // Fixed: Vertical movement removed (btnFloatY = 0)
  const btnFloatY      = 0; 
  const btnFloatScale  = frame >= 34 ? interpolate(btnFloatSpring, [0, 1], [1, 1.10]) : 1;

  const finalBtnScale = btnScaleSpring * btnClickScale * btnFloatScale;
  const finalBtnY     = btnClickOffset + btnFloatY;

  // ══ CARD — ONLY opacity + scale, NO translateY ════════════════════════════════
  const cardEnterSpring = spring({
    fps,
    frame: Math.max(0, frame - 34),
    config: { damping: 16, stiffness: 85, mass: 1.0 },
    durationInFrames: 40,
  });
  const cardOpacity = interpolate(cardEnterSpring, [0, 1], [0, 1]);
  const cardScale   = interpolate(
    easeOutBack(clamp(cardEnterSpring)),
    [0, 1], [0.88, 1]
  );
  const cardVisible = frame >= 34;

  // ══ MAIN CAPTION ══════════════════════════════════════════════════════════════
  const line1: { word: string; start: number; color?: string }[] = [
    { word: "So",        start: 55 },
    { word: "now…",      start: 59 },
    { word: "even",      start: 63 },
    { word: "with",      start: 67 },
    { word: "display",   start: 71, color: COLORS.accentC },
    { word: "involved,", start: 75 },
  ];
  const line2: { word: string; start: number; color?: string }[] = [
    { word: "your",      start: 79 },
    { word: "card",      start: 83 },
    { word: "can",       start: 87 },
    { word: "fade",      start: 91, color: COLORS.accentA },
    { word: "in,",       start: 94, color: COLORS.accentA },
    { word: "move,",     start: 98, color: COLORS.accentA },
    { word: "and",       start: 102 },
    { word: "scale",     start: 106, color: COLORS.accentA },
    { word: "smoothly.", start: 110, color: COLORS.accentA },
  ];

  const renderWord = (word: string, start: number, color?: string) => {
    const p = progress(frame, start, start + 10);
    const e = easeOutBack(p);
    return (
      <span key={word + start} style={{
        display: "inline-block",
        opacity: clamp(p * 4),
        transform: `translateY(${interpolate(easeOut(p), [0, 1], [24, 0])}px) scale(${interpolate(e, [0, 1], [0.90, 1])})`,
        color: color ?? COLORS.offWhite,
        marginRight: 14,
        willChange: "transform, opacity",
      }}>
        {word}
      </span>
    );
  };

  // ══ MAIN SCENE FADE OUT (frame 142–155) ═══════════════════════════════════════
  const mainFade = interpolate(frame, [142, 155], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ══ "Check caption for more details." (frame 165–210) ════════════════════════
  const captionWords1: { word: string; start: number }[] = [
    { word: "Check",   start: 165 },
    { word: "caption", start: 170 },
  ];
  const captionWords2: { word: string; start: number }[] = [
    { word: "for",      start: 174 },
    { word: "more",     start: 178 },
    { word: "details.", start: 182 },
  ];

  const renderCaptionWord = (word: string, start: number, color?: string) => {
    const p = progress(frame, start, start + 10);
    const e = easeOutBack(p);
    return (
      <span key={word + start} style={{
        display: "inline-block",
        opacity: clamp(p * 4),
        transform: `translateY(${interpolate(easeOut(p), [0, 1], [32, 0])}px) scale(${interpolate(e, [0, 1], [0.85, 1])})`,
        color: color ?? COLORS.white,
        marginRight: 18,
        willChange: "transform, opacity",
      }}>
        {word}
      </span>
    );
  };

  const arrowIn = spring({
    fps,
    frame: Math.max(0, frame - 188),
    config: { damping: 11, stiffness: 180, mass: 0.7 },
    durationInFrames: 16,
  });
  const arrowScale   = interpolate(easeOutBack(clamp(arrowIn)), [0, 1], [0, 1]);
  const arrowOpacity = interpolate(frame, [188, 194], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const arrowBob = frame >= 194
    ? Math.sin(((frame - 194) / 18) * Math.PI) * 9
    : 0;

  const captionBlockFade = interpolate(frame, [200, 210], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
    }}>

      {/* ════ UI SECTION — button + card ════════════════════════════════════════ */}
      <div style={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        top: "40%",
        opacity: mainFade,
      }}>

        {/* BUTTON — exact Scene 1 styles */}
        <div style={{
          position: "relative",
          overflow: "hidden",
          background: "#3c47e3",
          color: "#c5c1c1",
          padding: "24px 48px",
          borderRadius: 15,
          fontFamily: FONTS.mono,
          fontSize: 36,
          fontWeight: 800,
          textTransform: "capitalize",
          letterSpacing: "0.02em",
          boxShadow: `0 ${8 - btnClickOffset}px 0 #3c47e3`,
          transform: `scale(${finalBtnScale}) translateY(${finalBtnY}px)`,
          transformOrigin: "center center",
        }}>
          Toggle Card

          {frame >= 28 && (
            <div style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: 40, height: 40,
              background: "rgba(255,255,255,0.9)",
              borderRadius: "50%",
              transform: `translate(-50%, -50%) scale(${rippleScale})`,
              opacity: rippleOpacity,
              pointerEvents: "none",
            }} />
          )}
        </div>

        {/* CARD — scale + opacity only */}
        {cardVisible && (
          <div style={{
            background: "#0D1117",
            border: "2px solid rgba(255,255,255,0.08)",
            padding: "40px 48px",
            borderRadius: 24,
            marginTop: 120,
            width: 620,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            color: "#E6EDF3",
            fontFamily: "system-ui, -apple-system, sans-serif",
            opacity: cardOpacity,
            transform: `scale(${cardScale})`,
            transformOrigin: "center top",
            willChange: "transform, opacity",
          }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
              <div style={{
                minWidth: 72, height: 72, borderRadius: "50%",
                background: "#6B4FBB",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36,
              }}>
                🪄
              </div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                Animating display: block
              </h2>
            </div>

            <p style={{ fontSize: 27, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 28, marginTop: 0 }}>
              Learn to bridge the gap between none and block states for smooth transitions.
            </p>

            <div style={{ display: "flex" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: 8, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                ✨ <span>CSS Tricks</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════ CURSOR ═════════════════════════════════════════ */}
      {frame >= 8 && frame < 42 && (
        <div style={{
          position: "absolute",
          left: 0, top: 250,
          transform: `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
          opacity: finalCursorOpacity,
          zIndex: 50,
          pointerEvents: "none",
          filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))",
          rotate: "-10deg",
        }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>👆</span>
        </div>
      )}

      {/* ════ END CAPTION ═════════════════ */}
      {frame >= 165 && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: 0, right: 0,
          transform: "translateY(-50%)",
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 12,
          opacity: captionBlockFade,
        }}>
          <div style={{
            display: "flex", justifyContent: "center",
            fontFamily: FONTS.display, fontSize: 80, fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            {captionWords1.map(({ word, start }) => renderCaptionWord(word, start))}
          </div>
          <div style={{
            display: "flex", justifyContent: "center",
            fontFamily: FONTS.display, fontSize: 80, fontWeight: 800,
            letterSpacing: "-0.03em", lineHeight: 1.1,
          }}>
            {captionWords2.map(({ word, start }) =>
              renderCaptionWord(word, start, word === "details." ? COLORS.accentA : undefined)
            )}
          </div>
          <div style={{
            marginTop: 32,
            opacity: arrowOpacity,
            transform: `scale(${arrowScale}) translateY(${arrowBob}px)`,
            transformOrigin: "center top",
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke={COLORS.accentA} strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="4" x2="12" y2="20" />
              <polyline points="6 14 12 20 18 14" />
            </svg>
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};