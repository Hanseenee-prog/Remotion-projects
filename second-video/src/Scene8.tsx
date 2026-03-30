// Scene 8 — "Typing 'Avengers' quickly → only ONE API call at the end"
//
// Visual: Search input types fast, single loading spinner then result card appears.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }

const WORD = "Avengers";
const CHAR_INTERVAL = 7;  // fast typing
const TYPE_START    = 30;

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const charsTyped = Math.min(
    Math.floor(Math.max(frame - TYPE_START, 0) / CHAR_INTERVAL),
    WORD.length
  );
  const typedText   = WORD.slice(0, charsTyped);
  const doneTyping  = charsTyped >= WORD.length;

  // Debounce fires 1s (30 frames) after last keystroke
  const DEBOUNCE_FRAME = TYPE_START + WORD.length * CHAR_INTERVAL + 30;
  const loadingStart   = DEBOUNCE_FRAME;
  const resultStart    = DEBOUNCE_FRAME + 25;

  const showLoading = frame >= loadingStart && frame < resultStart;
  const showResult  = frame >= resultStart;

  // Spinner rotation
  const spinnerRot = ((frame - loadingStart) * 12) % 360;

  // Result card springs in
  const resultSpring = spring({
    fps,
    frame: Math.max(0, frame - resultStart),
    config: { damping: 14, stiffness: 160 },
  });
  const resultScale   = interpolate(resultSpring, [0, 1], [0.85, 1]);
  const resultOpacity = interpolate(resultSpring, [0, 1], [0, 1]);

  // "Only 1 call" badge
  const badgeSpring = spring({
    fps,
    frame: Math.max(0, frame - (resultStart + 10)),
    config: { damping: 12, stiffness: 200 },
  });

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: SAFE.top + 80,
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>

      {/* Headline */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 64 }}>
        {[
          { text: "Typing fast?",          start: 0  },
          { text: "Only 1 API call",       start: 8, accent: COLORS.accentA },
          { text: "at the end.",           start: 16 },
        ].map(({ text, start, accent }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: 66,
            fontWeight: 800,
            color: accent ?? COLORS.white,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Search input */}
      <div style={{
        ...fadeUp(frame, 20, 16),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        marginBottom: 36,
      }}>
        <div style={{
          background: COLORS.codeBg,
          border: `2px solid ${doneTyping ? COLORS.accentA : COLORS.accentB}`,
          borderRadius: 16,
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: doneTyping
            ? `0 0 40px ${COLORS.accentA}28`
            : `0 0 24px ${COLORS.accentB}18`,
        }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 40, fontWeight: 700, color: COLORS.codeText }}>
            {typedText}
            {!doneTyping && (
              <span style={{
                display: "inline-block", width: 3, height: "0.82em",
                background: COLORS.accentB, marginLeft: 4,
                verticalAlign: "middle",
                opacity: Math.floor(frame / 6) % 2 === 0 ? 1 : 0,
              }} />
            )}
          </span>
          {doneTyping && (
            <span style={{
              marginLeft: "auto", fontFamily: FONTS.mono,
              fontSize: 22, color: COLORS.accentA,
            }}>
              debounced ✓
            </span>
          )}
        </div>
      </div>

      {/* Loading spinner */}
      {showLoading && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "20px 32px",
          borderRadius: 14,
          background: COLORS.surface,
          marginBottom: 24,
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            border: `4px solid ${COLORS.accentB}33`,
            borderTop: `4px solid ${COLORS.accentB}`,
            transform: `rotate(${spinnerRot}deg)`,
          }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 26, color: COLORS.muted }}>
            GET /movies?q=Avengers
          </span>
        </div>
      )}

      {/* Result card */}
      {showResult && (
        <div style={{
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          opacity: resultOpacity,
          transform: `scale(${resultScale})`,
        }}>
          {/* Single call badge */}
          <div style={{
            transform: `scale(${badgeSpring})`,
            transformOrigin: "center",
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 28px",
            borderRadius: 100,
            background: `${COLORS.accentA}18`,
            border: `2px solid ${COLORS.accentA}66`,
            marginBottom: 24,
            boxShadow: `0 0 30px ${COLORS.accentA}22`,
          }}>
            <span style={{ fontSize: 28 }}>✅</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 28, fontWeight: 700, color: COLORS.accentA }}>
              1 API call total
            </span>
          </div>

          {/* Fake movie result */}
          <div style={{
            background: COLORS.codeBg,
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: 20,
            padding: "32px 36px",
            display: "flex",
            gap: 24,
            alignItems: "flex-start",
          }}>
            <div style={{
              width: 80,
              height: 110,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3B1F6B, #6B4FBB)",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
            }}>
              🦸
            </div>
            <div>
              <div style={{ fontFamily: FONTS.display, fontSize: 34, fontWeight: 800, color: COLORS.white, marginBottom: 8 }}>
                Avengers: Endgame
              </div>
              <div style={{ fontFamily: FONTS.display, fontSize: 24, color: COLORS.muted, marginBottom: 16, lineHeight: 1.5 }}>
                2019 · Action · ⭐ 8.4
              </div>
              <div style={{
                display: "inline-flex",
                padding: "8px 16px",
                borderRadius: 8,
                background: `${COLORS.accentA}18`,
                fontFamily: FONTS.mono,
                fontSize: 20,
                color: COLORS.accentA,
              }}>
                Result from 1 debounced call
              </div>
            </div>
          </div>
        </div>
      )}

    </AbsoluteFill>
  );
};
