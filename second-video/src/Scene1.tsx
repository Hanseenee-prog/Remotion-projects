// Scene 1 — "You're calling a function every single time you type… and that's fine"
//
// Visual: A fake search input. Each character of "Avengers" types in one by one.
// Every keystroke fires a pulse/flash on a "function called" indicator.
// Counter ticks up. Label: "onInput fires every keystroke"

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}

const WORD = "Avengers";
// Each char appears every 12 frames starting at frame 30
const CHAR_INTERVAL = 12;
const TYPING_START  = 30;

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  // How many chars have been typed
  const charsTyped = Math.min(
    Math.floor(Math.max(frame - TYPING_START, 0) / CHAR_INTERVAL),
    WORD.length
  );
  const typedText = WORD.slice(0, charsTyped);

  // Flash on each new character
  const lastCharFrame = TYPING_START + charsTyped * CHAR_INTERVAL;
  const flashAge = frame - lastCharFrame;
  const flashOpacity = charsTyped > 0
    ? Math.max(0, 1 - flashAge / 8)
    : 0;

  // Pill flash
  const pillFlash = flashOpacity;

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: SAFE.top + 120,
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>

      {/* Headline */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 80 }}>
        {[
          { text: "You're calling a function",  start: 0  },
          { text: "every time you type.",        start: 8  },
          { text: "And that's fine…",            start: 16 },
        ].map(({ text, start }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: i === 2 ? 52 : 64,
            fontWeight: 800,
            color: i === 2 ? COLORS.muted : COLORS.white,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Search input mock */}
      <div style={{
        ...fadeUp(frame, 20, 18),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        marginBottom: 40,
      }}>
        {/* Input label */}
        <div style={{
          fontFamily: FONTS.mono,
          fontSize: 22,
          color: COLORS.comment,
          marginBottom: 12,
          letterSpacing: "0.04em",
        }}>
          input.addEventListener('input', searchMovies)
        </div>

        {/* Input box */}
        <div style={{
          background: COLORS.codeBg,
          border: `2px solid ${charsTyped > 0 ? COLORS.accentB : COLORS.border}`,
          borderRadius: 16,
          padding: "28px 36px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: charsTyped > 0
            ? `0 0 32px ${COLORS.accentB}22`
            : "none",
        }}>
          <span style={{ fontSize: 32 }}>🔍</span>
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 40,
            fontWeight: 700,
            color: COLORS.codeText,
            letterSpacing: "0.01em",
            minWidth: 20,
          }}>
            {typedText}
            {/* blinking cursor */}
            <span style={{
              display: "inline-block",
              width: 3,
              height: "0.82em",
              background: COLORS.accentB,
              marginLeft: 4,
              verticalAlign: "middle",
              opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
            }} />
          </span>
        </div>
      </div>

      {/* "Function called" flash indicator */}
      <div style={{
        ...fadeUp(frame, 28, 14),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}>
        {/* Pill that flashes on each keystroke */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "22px 32px",
          borderRadius: 16,
          background: `rgba(121,192,255,${0.06 + pillFlash * 0.14})`,
          border: `2px solid rgba(121,192,255,${0.2 + pillFlash * 0.6})`,
          boxShadow: pillFlash > 0.1 ? `0 0 40px ${COLORS.accentB}44` : "none",
        }}>
          <div style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: COLORS.accentB,
            opacity: 0.4 + pillFlash * 0.6,
            boxShadow: `0 0 12px ${COLORS.accentB}`,
          }} />
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 30,
            fontWeight: 700,
            color: COLORS.accentB,
          }}>
            searchMovies() called
          </span>
          {/* Call count */}
          <span style={{
            marginLeft: "auto",
            fontFamily: FONTS.mono,
            fontSize: 28,
            fontWeight: 800,
            color: charsTyped > 0 ? COLORS.accentC : COLORS.subtle,
          }}>
            ×{charsTyped}
          </span>
        </div>

        {/* Each call stack — one row per char typed */}
        {Array.from({ length: charsTyped }).map((_, i) => {
          const charFrame = TYPING_START + (i + 1) * CHAR_INTERVAL;
          const age = frame - charFrame;
          const rowOpacity = Math.min(Math.max(age / 6, 0), 1) *
            (age > 40 ? Math.max(0, 1 - (age - 40) / 20) : 1);
          return (
            <div key={i} style={{
              opacity: rowOpacity,
              display: "flex",
              alignItems: "center",
              gap: 16,
              paddingLeft: 12,
            }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: COLORS.accentC,
                opacity: 0.7,
                flexShrink: 0,
              }} />
              <span style={{
                fontFamily: FONTS.mono,
                fontSize: 24,
                color: COLORS.muted,
              }}>
                key '{WORD[i]}' → searchMovies('{WORD.slice(0, i + 1)}')
              </span>
            </div>
          );
        })}
      </div>

    </AbsoluteFill>
  );
};
