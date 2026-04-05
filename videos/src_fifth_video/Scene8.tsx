// Scene 8 — "Debounce Results: Fast Typing → Single API Call → Results"
// Total Duration: 150 Frames
//
// Sequence:
//   0-10    : Initial Fade In
//   10-42   : Fast typing "Avengers" (4 frames per char)
//   42-47   : Small pause
//   47-62   : Loading spinner appears (Single API call simulation)
//   62-75   : Movie cards animate in (Staggered)
//   75-142  : Cards remain visible (Full visibility for ~67 frames)
//   142-150 : Final global fade out

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function fadeUp(frame: number, start: number, dur = 12, dist = 20) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}

const WORD = "Avengers";
const CHAR_INTERVAL = 4; 
const TYPE_START = 10;

const MOVIES = [
  { title: "Avengers: End Game", info: "2019 · Action · ⭐ 8.4" },
  { title: "Avengers: Infinity war", info: "2018 · Action · ⭐ 8.4" },
  { title: "The Avengers", info: "2012 · Action · ⭐ 8.0" },
];

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Typing Logic
  const charsTyped = Math.min(
    Math.floor(Math.max(frame - TYPE_START, 0) / CHAR_INTERVAL),
    WORD.length
  );
  const typedText = WORD.slice(0, charsTyped);
  const doneTyping = charsTyped >= WORD.length;

  // 2. Timing Definitions
  const typingEnd = TYPE_START + (WORD.length * CHAR_INTERVAL);
  const loadingStart = typingEnd + 5;
  const resultStart = loadingStart + 15; 
  const fadeOutStart = 182; 

  const showLoading = frame >= loadingStart && frame < resultStart;
  const showResult = frame >= resultStart;

  // 3. Animation Values
  const spinnerRot = ((frame - loadingStart) * 15) % 360;
  const globalOpacity = interpolate(frame, [fadeOutStart, 190], [1, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center", 
      background: "transparent",
      opacity: globalOpacity,
    }}>

      {/* Search Input Box */}
      <div style={{
        ...fadeUp(frame, 5, 12),
        width: "100%",
        maxWidth: 820,
        marginBottom: 24,
      }}>
        <div style={{
          background: COLORS.codeBg,
          border: `2px solid ${doneTyping ? COLORS.accentA : COLORS.accentB}`,
          borderRadius: 18,
          padding: "24px 36px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: doneTyping
            ? `0 0 40px ${COLORS.accentA}20`
            : `0 0 24px ${COLORS.accentB}10`,
        }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 36, fontWeight: 700, color: COLORS.codeText }}>
            {typedText}
            {!doneTyping && (
              <span style={{
                display: "inline-block", width: 3, height: "0.85em",
                background: COLORS.accentB, marginLeft: 4,
                verticalAlign: "middle",
                opacity: Math.floor(frame / 4) % 2 === 0 ? 1 : 0,
              }} />
            )}
          </span>
          {doneTyping && (
            <span style={{
              marginLeft: "auto", fontFamily: FONTS.mono,
              fontSize: 20, color: COLORS.accentA,
              fontWeight: 600
            }}>
              debounced ✓
            </span>
          )}
        </div>
      </div>

      {/* Loading Status Area (Prevents layout shift) */}
      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
        {showLoading && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "12px 28px",
            borderRadius: 100,
            background: COLORS.surface,
            border: `1px solid rgba(255,255,255,0.1)`
          }}>
            <div style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: `3px solid ${COLORS.accentB}33`,
              borderTop: `3px solid ${COLORS.accentB}`,
              transform: `rotate(${spinnerRot}deg)`,
            }} />
            <span style={{ fontFamily: FONTS.mono, fontSize: 30, color: COLORS.muted }}>
              GET /movies?q=Avengers
            </span>
          </div>
        )}
      </div>

      {/* Movie Results Container */}
      <div style={{ 
        width: "100%", 
        maxWidth: 820, 
        display: "flex", 
        flexDirection: "column", 
        gap: 16 
      }}>
        {showResult && MOVIES.map((movie, i) => {
          const entranceSpring = spring({
            fps,
            frame: frame - (resultStart + i * 4), 
            config: { damping: 14, stiffness: 150 },
          });

          return (
            <div key={i} style={{
              background: COLORS.codeBg,
              border: `1.5px solid ${COLORS.border}`,
              borderRadius: 20,
              padding: "24px 28px",
              display: "flex",
              gap: 24,
              alignItems: "center",
              opacity: entranceSpring,
              transform: `scale(${interpolate(entranceSpring, [0, 1], [0.96, 1])}) translateY(${interpolate(entranceSpring, [0, 1], [15, 0])}px)`,
            }}>
              <div style={{
                width: 60,
                height: 84,
                borderRadius: 10,
                background: "linear-gradient(135deg, #3B1F6B, #6B4FBB)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 32,
                boxShadow: "0 8px 16px rgba(0,0,0,0.3)"
              }}>
                🦸
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontFamily: FONTS.display, 
                  fontSize: 28, 
                  fontWeight: 800, 
                  color: COLORS.white, 
                  marginBottom: 6,
                  letterSpacing: "-0.01em"
                }}>
                  {movie.title}
                </div>
                <div style={{ fontFamily: FONTS.display, fontSize: 20, color: COLORS.muted }}>
                  {movie.info}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};