// Scene 2 — "But imagine hitting a movie API for each letter… your app slows down fast"
//
// Visual: API endpoint URL, rapid fire requests shown as stacked cards/pills,
// a latency/slowness meter grows red. Keyboard input shown at top.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = Math.min(Math.max((frame - start) / dur, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }

const LETTERS = ["A", "v", "e", "n", "g", "e", "r", "s"];
const CALL_INTERVAL = 15; // frames between each call appearing
const CALLS_START   = 20;

// Each API request pill
const ApiPill: React.FC<{ letter: string; query: string; index: number; frame: number; startF: number }> = ({
  letter, query, index, frame, startF,
}) => {
  const age = frame - startF;
  const inP = clamp(age / 10);
  const e   = easeOut(inP);

  // Pills drift up slowly and fade after a while
  const driftY  = age * 0.6;
  const opacity = e * (age > 80 ? Math.max(0, 1 - (age - 80) / 30) : 1);

  const hue = index * 22; // spread colours across the spectrum
  const col = `hsl(${200 + hue}, 80%, 65%)`;

  return (
    <div style={{
      position: "absolute",
      left: "50%",
      top: "50%",
      transform: `translate(-50%, ${-driftY - index * 70}px) scale(${e})`,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 28px",
      borderRadius: 12,
      background: COLORS.codeBg,
      border: `1.5px solid rgba(255,255,255,0.12)`,
      whiteSpace: "nowrap",
      width: 700,
    }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.accentC }}>GET</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.muted }}>/movies?q=</span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 24, color: COLORS.accentB, fontWeight: 700 }}>
        {query}
      </span>
      {/* Spinner */}
      <span style={{ marginLeft: "auto", fontSize: 22, opacity: 0.7 }}>⏳</span>
    </div>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const callsVisible = Math.min(
    Math.floor(Math.max(frame - CALLS_START, 0) / CALL_INTERVAL),
    LETTERS.length
  );

  // Slowdown meter (grows as calls accumulate)
  const meterFill = clamp(callsVisible / LETTERS.length);
  const meterColor = meterFill < 0.5 ? COLORS.accentA : meterFill < 0.75 ? "#F0C674" : COLORS.accentC;

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
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 60 }}>
        {[
          { text: "Every letter hits",     start: 0  },
          { text: "the movie API.",        start: 8  },
          { text: "Your app slows down.",  start: 16, accent: true },
        ].map(({ text, start, accent }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 16),
            fontFamily: FONTS.display,
            fontSize: 64,
            fontWeight: 800,
            color: accent ? COLORS.accentC : COLORS.white,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* API calls container */}
      <div style={{
        ...fadeUp(frame, 16, 16),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
        position: "relative",
        height: 520,
        marginBottom: 48,
      }}>
        {Array.from({ length: callsVisible }).map((_, i) => {
          const startF = CALLS_START + i * CALL_INTERVAL;
          return (
            <ApiPill
              key={i}
              letter={LETTERS[i]}
              query={"Avengers".slice(0, i + 1)}
              index={callsVisible - 1 - i}
              frame={frame}
              startF={startF}
            />
          );
        })}

        {callsVisible === 0 && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontFamily: FONTS.mono,
            fontSize: 26,
            color: COLORS.subtle,
          }}>
            start typing to see API calls…
          </div>
        )}
      </div>

      {/* Slowness meter */}
      <div style={{
        ...fadeUp(frame, 18, 14),
        width: "100%",
        maxWidth: CANVAS.safeWidth,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 10,
          fontFamily: FONTS.mono,
          fontSize: 24,
          color: COLORS.muted,
        }}>
          <span>App speed</span>
          <span style={{ color: meterColor }}>
            {callsVisible === 0 ? "normal" : callsVisible < 4 ? "slowing…" : callsVisible < 7 ? "slow 🐢" : "very slow 🔴"}
          </span>
        </div>
        <div style={{
          width: "100%",
          height: 18,
          borderRadius: 9,
          background: COLORS.surface,
          overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${meterFill * 100}%`,
            background: meterColor,
            borderRadius: 9,
            boxShadow: `0 0 16px ${meterColor}88`,
          }} />
        </div>
        <div style={{
          marginTop: 16,
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.accentC,
          opacity: callsVisible >= 6 ? 1 : 0,
          textAlign: "center",
        }}>
          {callsVisible} API calls for 1 search!
        </div>
      </div>

    </AbsoluteFill>
  );
};
