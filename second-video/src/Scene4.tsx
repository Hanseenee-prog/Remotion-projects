// Scene 4 — "So your animation never runs."
//
// Visual: A CSS animation keyframe block types in, then a big ❌ / strikethrough
// overlay appears — the animation is crossed out. Dramatic, punchy.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function fadeUp(frame: number, startFrame: number, duration = 18, distance = 28) {
  const t = Math.min(Math.max((frame - startFrame) / duration, 0), 1);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * distance}px)` };
}

function useTyped(text: string, startFrame: number, cps = 38, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return text.slice(0, chars);
}

const T: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.codeText,
}) => <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>;

// ─── Code block lines ─────────────────────────────────────────────────────────
const CODE_LINES: Array<{ tokens: Array<{ text: string; color: string }>; indent: number }> = [
  {
    indent: 0,
    tokens: [
      { text: ".card", color: COLORS.selector },
      { text: " {", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "display", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "none", color: COLORS.keyword },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "animation", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "fadeIn", color: COLORS.value },
      { text: " 0.4s", color: COLORS.number },
      { text: " ease", color: COLORS.value },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 0,
    tokens: [{ text: "}", color: COLORS.punctuation }],
  },
  {
    indent: 0,
    tokens: [{ text: "", color: "" }],
  },
  {
    indent: 0,
    tokens: [
      { text: ".card.visible", color: COLORS.selector },
      { text: " {", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "display", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "block", color: COLORS.value },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 0,
    tokens: [{ text: "}", color: COLORS.punctuation }],
  },
];

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  const headline = "So your animation";
  const headline2 = "never runs.";
  const th1 = useTyped(headline, 0, 42, frame);
  const th2 = useTyped(headline2, 14, 42, frame);

  // Code block types in starting at frame 20
  // Each line = 8 frames apart
  const CHARS_PER_SEC = 80;
  const getCodeProgress = (lineIdx: number) => {
    const lineStart = 20 + lineIdx * 7;
    const lineText = CODE_LINES[lineIdx].tokens.map((t) => t.text).join("");
    const chars = Math.max(0, Math.floor(((frame - lineStart) / 30) * CHARS_PER_SEC));
    return Math.min(chars, lineText.length);
  };

  // Strikethrough line sweeps across at frame 54
  const strikeProgress = interpolate(frame, [54, 64], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "never runs" big label
  const neverRunsStyle = {
    opacity: interpolate(frame, [58, 68], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
    transform: `scale(${interpolate(frame, [58, 68], [0.8, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })})`,
  };

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: SAFE.top + 80,
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
      }}
    >
      {/* ── Headline ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 52 }}>
        {[
          { text: th1, start: 0 },
          { text: th2, start: 10 },
        ].map(({ text, start }, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(frame, start, 16),
              fontFamily: FONTS.display,
              fontSize: 72,
              fontWeight: 800,
              color: i === 1 ? COLORS.accentC : COLORS.white,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        ))}
      </div>

      {/* ── Code block ───────────────────────────────────────── */}
      <div
        style={{
          ...fadeUp(frame, 16, 16),
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          borderRadius: 20,
          background: COLORS.codeBg,
          border: "1.5px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Editor header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {[COLORS.accentC, "#F0C674", COLORS.accentA].map((c, i) => (
            <div
              key={i}
              style={{ width: 12, height: 12, borderRadius: "50%", background: c, opacity: 0.7 }}
            />
          ))}
          <span
            style={{
              fontFamily: FONTS.mono,
              fontSize: 18,
              color: COLORS.comment,
              marginLeft: 8,
            }}
          >
            styles.css
          </span>
        </div>

        {/* Code lines */}
        <div style={{ padding: "24px 28px", fontFamily: FONTS.mono, fontSize: 24, lineHeight: 1.8 }}>
          {CODE_LINES.map((line, lineIdx) => {
            const lineText = line.tokens.map((t) => t.text).join("");
            const progress = getCodeProgress(lineIdx);
            let charsLeft = progress;
            return (
              <div key={lineIdx} style={{ paddingLeft: line.indent * 28 }}>
                {line.tokens.map((token, ti) => {
                  if (charsLeft <= 0) return null;
                  const show = token.text.slice(0, charsLeft);
                  charsLeft -= token.text.length;
                  return (
                    <T key={ti} color={token.color}>
                      {show}
                    </T>
                  );
                })}
              </div>
            );
          })}

          {/* Typing cursor */}
          {frame < 54 && (
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: "0.85em",
                background: COLORS.accentA,
                marginLeft: 2,
                verticalAlign: "middle",
                opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
              }}
            />
          )}
        </div>

        {/* Strikethrough overlay */}
        {strikeProgress > 0 && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              width: `${strikeProgress * 100}%`,
              height: 4,
              background: COLORS.accentC,
              boxShadow: `0 0 16px ${COLORS.accentC}88`,
              transform: "translateY(-50%)",
            }}
          />
        )}

        {/* Red tint overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `rgba(255,123,114,${strikeProgress * 0.08})`,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* ── "Animation never runs" badge ─────────────────────── */}
      <div
        style={{
          ...neverRunsStyle,
          marginTop: 40,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "18px 40px",
          borderRadius: 100,
          background: "rgba(255,123,114,0.12)",
          border: `1.5px solid ${COLORS.accentC}66`,
          boxShadow: `0 0 40px ${COLORS.accentC}22`,
        }}
      >
        <span style={{ fontSize: 32 }}>❌</span>
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 28,
            fontWeight: 700,
            color: COLORS.accentC,
            letterSpacing: "0.02em",
          }}
        >
          animation never runs
        </span>
      </div>
    </AbsoluteFill>
  );
};
