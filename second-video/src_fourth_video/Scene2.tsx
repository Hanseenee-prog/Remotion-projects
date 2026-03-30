// Scene 2 — Refined Layout
// Total duration: 155 frames

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Constants ────────────────────────────────────────────────────────────────
const RED_ACCENT = "#FF5F57"; // Vibrant Red
const VIBRANT_BLUE = "#38BDF8"; // Punchy Sky Blue

// ─── Typed text helper ────────────────────────────────────────────────────────
function useTyped(text: string, startFrame: number, cps: number, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return text.slice(0, Math.min(chars, text.length));
}

// ─── State Card Component ─────────────────────────────────────────────────────
// cardScale is applied to the OUTER wrapper so the layout anchor (translateX)
// always points to the true visual centre of the card, keeping dots aligned.
const StateCard: React.FC<{
  prop: string;   // e.g. "scale:"
  value: string;  // e.g. "0.5"
  sublabel: string;
  accent: string;
  showText: boolean;
  elementsOpacity: number;
  cardScale?: number;
  zIndex?: number;
}> = ({ prop, value, sublabel, accent, showText, elementsOpacity, cardScale = 1, zIndex = 10 }) => {
  const textOpacity = showText ? elementsOpacity : 0;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      zIndex,
      // Scale the whole thing — layout origin stays at the translateX anchor
      transform: `scale(${cardScale})`,
      transformOrigin: "center center",
    }}>
      <div
        style={{
          width: 220,
          height: 280,
          borderRadius: 20,
          background: COLORS.codeBg,
          border: `3px solid ${accent}`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          boxShadow: `0 24px 48px rgba(0,0,0,0.5)`,
          position: "relative",
          gap: 6,
        }}
      >
        {/* Property label */}
        <div style={{
          opacity: textOpacity,
          fontFamily: FONTS.mono,
          fontSize: 28,
          fontWeight: 700,
          color: COLORS.punctuation,
          transition: "opacity 0.3s ease",
        }}>
          {prop}
        </div>
        {/* Value — bigger than the prop */}
        <div style={{
          opacity: textOpacity,
          fontFamily: FONTS.mono,
          fontSize: 48,
          fontWeight: 800,
          color: COLORS.punctuation,
          transition: "opacity 0.3s ease",
          lineHeight: 1,
        }}>
          {value}
        </div>
      </div>

      <div style={{
        opacity: textOpacity,
        marginTop: 24,
        fontFamily: FONTS.mono,
        fontSize: 28,
        fontWeight: 800,
        color: accent,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        transition: "opacity 0.3s ease",
      }}>
        {sublabel}
      </div>
    </div>
  );
};

// ─── Inline syntax-highlighted token ─────────────────────────────────────────
const T: React.FC<{ children: React.ReactNode; color: string }> = ({ children, color }) => (
  <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Entrances
  const boxesPop = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // 2. Spread Logic
  const moveApart = spring({
    frame: frame - 30,
    fps,
    config: { damping: 20, stiffness: 80 },
  });
  const spread = interpolate(moveApart, [0, 1], [0, 330]);

  // 3. Line Visibility
  const lineOpacity = interpolate(frame, [35, 50], [0, 0.6], { extrapolateRight: "clamp" });
  const lineScale = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: "clamp" });

  // 4. Content Timings
  const textVisible = frame > 85;
  const calloutIn = spring({ frame: frame - 40, fps });

  // 5. In-between callout appears
  const calloutOpacity = interpolate(frame, [40, 60], [0, 1], { extrapolateRight: "clamp" });
  const calloutY = interpolate(frame, [40, 60], [20, 0], { extrapolateRight: "clamp" });

  // 6. Elements Fade Out (Frames 150-155) - Only affects text, dots, and callout
  const elementsFadeOut = interpolate(frame, [150, 155], [1, 0], { extrapolateLeft: "clamp" });

  // 7. FULL SCENE fade-out — last 5 frames (150–155)
  const sceneFadeOut = interpolate(frame, [150, 155], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Typed "transition: scale 3s;" — starts at frame 15, above cards
  const TYPED_TEXT = "transition: scale 3s;";
  const typedStr = useTyped(TYPED_TEXT, 15, 42, frame);
  const typedOpacity = interpolate(frame, [15, 22], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const typedFinalOpacity = typedOpacity * elementsFadeOut;

  // ── Dot values
  const dotValues = [
    { scaleVal: "0.67", timeVal: "1s",   pos: -0.6, delay: 65 },
    { scaleVal: "0.75", timeVal: "1.5s", pos: -0.15,    delay: 70 },
    { scaleVal: "0.83", timeVal: "2s",   pos: 0.3,  delay: 75 },
  ];

  return (
    // ── Master opacity wrapper — fades the entire scene in the last 5 frames
    <AbsoluteFill style={{
      background: "transparent",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      opacity: sceneFadeOut,
    }}>

      {/* ── Typed "transition: scale 3s;" above the cards ── */}
      <div style={{
        opacity: typedFinalOpacity,
        marginBottom: 48,
        fontSize: 44,
        fontWeight: 700,
        letterSpacing: "0.01em",
        lineHeight: 1,
        display: "flex",
        alignItems: "center",
      }}>
        {(() => {
          const tokens: Array<{ text: string; color: string }> = [
            { text: "transition", color: COLORS.property },
            { text: ": ",         color: COLORS.punctuation },
            { text: "scale",      color: COLORS.keyword },
            { text: " 3s",        color: COLORS.value },
            { text: ";",          color: COLORS.punctuation },
          ];
          let charsLeft = typedStr.length;
          return tokens.map((tok, i) => {
            if (charsLeft <= 0) return null;
            const show = tok.text.slice(0, charsLeft);
            charsLeft -= tok.text.length;
            return <T key={i} color={tok.color}>{show}</T>;
          });
        })()}
        {/* Blinking cursor while typing */}
        {typedStr.length < TYPED_TEXT.length && (
          <span style={{
            display: "inline-block",
            width: 3,
            height: "0.82em",
            background: COLORS.accentA,
            marginLeft: 3,
            verticalAlign: "middle",
            opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
          }} />
        )}
      </div>

      {/* ── Visual Timeline Area ── */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        width: "100%",
        height: 400,
      }}>

        {/* The Horizontal Line (Doesn't fade out here) */}
        <div style={{
          position: "absolute",
          width: spread * 2,
          height: 8,
          background: "white",
          opacity: lineOpacity,
          transform: `scaleX(${lineScale})`,
          transformOrigin: "center",
          zIndex: 1,
          borderRadius: 4,
          top: 165,
        }} />

        {/* Left Box — visually small (scale: 0.5) */}
        <div style={{ position: "absolute", transform: `translateX(${-spread}px) scale(${boxesPop})`, zIndex: 10 }}>
          <StateCard
            prop="scale:"
            value="0.5"
            sublabel="before"
            accent={RED_ACCENT}
            showText={textVisible}
            elementsOpacity={elementsFadeOut}
            cardScale={0.5}
          />
        </div>

        {/* Intermediate Dots (Fades out) */}
        <div style={{ opacity: elementsFadeOut }}>
          {dotValues.map((d) => {
            const pop = spring({
              frame: frame - d.delay,
              fps,
              config: { stiffness: 200, damping: 12 },
            });

            return (
              <div key={d.scaleVal} style={{
                position: "absolute",
                transform: `translateX(${spread * d.pos}px) scale(${pop})`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                zIndex: 5,
                top: 165,
                marginTop: -12,
              }}>
                {/* Time label ABOVE the dot — close to it */}
                <div style={{
                  position: "absolute",
                  bottom: 36,
                  fontSize: 28,
                  fontWeight: 700,
                  color: COLORS.offWhite,
                  fontFamily: FONTS.mono,
                  whiteSpace: "nowrap",
                }}>
                  {d.timeVal}
                </div>

                {/* The dot */}
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: VIBRANT_BLUE }} />

                {/* Scale value BELOW the dot */}
                <div style={{
                  position: "absolute",
                  top: 40,
                  fontSize: 28,
                  fontWeight: 800,
                  color: VIBRANT_BLUE,
                  fontFamily: FONTS.mono,
                  whiteSpace: "nowrap",
                }}>
                  {d.scaleVal}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Box — visually bigger (scale: 1.0) */}
        <div style={{ position: "absolute", transform: `translateX(${spread}px) scale(${boxesPop})`, zIndex: 10 }}>
          <StateCard
            prop="scale:"
            value="1.0"
            sublabel="after"
            accent={COLORS.selector}
            showText={textVisible}
            elementsOpacity={elementsFadeOut}
            cardScale={1.0}
          />
        </div>

      </div>

      {/* ── "in-between" Callout (Fades out) ── */}
      <div
        style={{
          marginTop: 60,
          padding: "16px 36px",
          borderRadius: 100,
          background: "rgba(126,231,135,0.08)",
          border: `1px solid ${COLORS.accentA}33`,
          opacity: calloutOpacity * elementsFadeOut,
          transform: `translateY(${calloutY}px)`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 600,
            color: COLORS.accentA,
          }}
        >
          <span
            style={{
              letterSpacing: "0em",
            }}
          >CSS </span> 
          <span style={{
            letterSpacing: "0.02em",
          }}>animates between states</span>
        </span>
      </div>

    </AbsoluteFill>
  );
};