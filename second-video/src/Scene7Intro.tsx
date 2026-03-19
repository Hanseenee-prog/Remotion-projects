import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Version A: Your idea — highlight sweep ───────────────────────────────────
// A bright highlight bar sweeps left→right under/over the text,
// then settles as a permanent underline glow. Text fades in with it.

export const Scene7IntroHighlight: React.FC = () => {
  const frame = useCurrentFrame();
//   const { fps } = useVideoConfig();

  // Text fades in from 0→1 over first 10 frames
  const textOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Highlight bar sweeps from 0% → 100% width over 20 frames
  const sweepWidth = interpolate(frame, [0, 20], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
    easing: (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t, // ease-in-out
  });

  // After sweep completes, the bar fades down to a glow underline
  const barOpacity = interpolate(frame, [18, 28], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const glowOpacity = interpolate(frame, [18, 28], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Text slides up slightly as it fades in — feels lifted
  const textY = interpolate(frame, [0, 14], [30, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>

        {/* Highlight sweep bar — sits behind text */}
        <div style={{
          position:     "absolute",
          left:         0,
          top:          "10%",
          height:       "80%",
          width:        `${sweepWidth}%`,
          background:   "linear-gradient(90deg, rgba(100,140,255,0.0), rgba(100,140,255,0.35), rgba(165,214,255,0.45))",
          borderRadius: 6,
          opacity:      barOpacity,
          zIndex:       0,
          pointerEvents: "none",
        }} />

        {/* Permanent glow underline — fades in as bar fades out */}
        <div style={{
          position:     "absolute",
          left:         0,
          bottom:       -8,
          width:        "100%",
          height:       6,
          background:   "linear-gradient(90deg, #648CFF, #A5D6FF, #648CFF)",
          borderRadius: 3,
          opacity:      glowOpacity,
          boxShadow:    "0 0 18px rgba(100,140,255,0.7)",
          zIndex:       0,
        }} />

        {/* Text */}
        <div style={{
          position:    "relative",
          transform:   `translateY(${textY}px)`,
          opacity:     textOpacity,
          zIndex:      1,
          display:     "flex",
          flexDirection: "column",
          alignItems:  "center",
          gap:         8,
        }}>
          {/* "That's where" — smaller, muted */}
          <span style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      38,
            fontWeight:    500,
            color:         "rgba(171,178,191,0.75)",
            letterSpacing: "0.04em",
          }}>
            That's where
          </span>

          {/* "Event Delegation" — big, bold, glowing */}
          <span style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      86,
            fontWeight:    900,
            color:         "#FFFFFF",
            letterSpacing: "-0.01em",
            lineHeight:    1,
            textShadow:    `0 0 ${glowOpacity * 40}px rgba(100,140,255,${glowOpacity * 0.8})`,
          }}>
            Event Delegation
          </span>

          {/* "comes in." — smaller, muted */}
          <span style={{
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:      38,
            fontWeight:    500,
            color:         "rgba(171,178,191,0.75)",
            letterSpacing: "0.04em",
          }}>
            comes in.
          </span>
        </div>

      </div>
    </AbsoluteFill>
  );
};

// ─── Version B: Word-by-word slam in ─────────────────────────────────────────
// Each word of "Event Delegation" slams in one at a time with a spring pop,
// staggered 6 frames apart. Supporting text fades under it.
// Feels punchy and editorial — like a title card reveal.

const WORDS = ["Event", "Delegation"];
const WORD_DELAY = 7; // frames between each word

export const Scene7IntroPunch: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{
        display:       "flex",
        flexDirection: "column",
        alignItems:    "center",
        gap:           16,
      }}>

        {/* Main words — each pops in separately */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          {WORDS.map((word, i) => {
            const startF = i * WORD_DELAY;

            const wordSpring = spring({
              fps,
              frame: frame - startF,
              config: { damping: 10, stiffness: 300, mass: 0.7 },
              durationInFrames: 14,
            });

            const wordScale   = frame >= startF ? Math.max(0, wordSpring) : 0;
            const wordOpacity = frame >= startF ? Math.min(1, wordSpring * 2) : 0;

            // Each word slams in from slightly below
            const wordY = frame >= startF
              ? interpolate(wordSpring, [0, 1], [40, 0])
              : 40;

            return (
              <div
                key={word}
                style={{
                  transform:       `translateY(${wordY}px) scale(${wordScale})`,
                  transformOrigin: "center bottom",
                  opacity:         wordOpacity,
                }}
              >
                <span style={{
                  fontFamily:    "'JetBrains Mono', monospace",
                  fontSize:      word === "Event" ? 92 : 92,
                  fontWeight:    900,
                  color:         word === "Delegation" ? "#648CFF" : "#FFFFFF",
                  letterSpacing: "-0.02em",
                  lineHeight:    1.05,
                }}>
                  {word}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </AbsoluteFill>
  );
};

// ─── Default export — swap between versions here ──────────────────────────────
// Change to Scene7IntroHighlight to try the other one
export const Scene7Intro: React.FC = () => <Scene7IntroPunch />;