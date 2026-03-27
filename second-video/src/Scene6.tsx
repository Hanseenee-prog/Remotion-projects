// Scene 6 — "transition-behavior: allow-discrete — it tells CSS to transition
//             discrete properties like display instead of just switching them."
//
// Visual: Code block with transition-behavior typed in with a blue glow highlight.
// A before/after split shows display: none → block with an animated gradient
// transition bar to illustrate "it transitions now."

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

const CODE: Array<{
  tokens: Array<{ text: string; color: string }>;
  indent: number;
  highlight?: boolean;
}> = [
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
    indent: 1,
    tokens: [
      { text: "transition", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "all", color: COLORS.value },
      { text: " 0.4s", color: COLORS.number },
      { text: " ease", color: COLORS.value },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    highlight: true,
    tokens: [
      { text: "transition-behavior", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "allow-discrete", color: COLORS.accentB },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 0,
    tokens: [{ text: "}", color: COLORS.punctuation }],
  },
];

// ─── Display transition bar ───────────────────────────────────────────────────
const DisplayTransitionBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.keyword }}>
        display: none
      </span>
      <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.value }}>
        display: block
      </span>
    </div>
    <div
      style={{
        width: "100%",
        height: 16,
        borderRadius: 8,
        background: "rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Gradient fill */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${COLORS.accentC}, ${COLORS.accentB})`,
          borderRadius: 8,
          boxShadow: `0 0 16px ${COLORS.accentB}66`,
          transition: "none",
        }}
      />
    </div>
    <div style={{ textAlign: "center" }}>
      <span
        style={{
          fontFamily: FONTS.display,
          fontSize: 20,
          color: COLORS.accentB,
          opacity: progress > 0.1 ? 1 : 0,
        }}
      >
        {progress < 0.98 ? "transitioning…" : "✓ transitioned"}
      </span>
    </div>
  </div>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  const line1 = "transition-behavior:";
  const line2 = "allow-discrete";
  const tl1 = useTyped(line1, 0, 36, frame);
  const tl2 = useTyped(line2, 20, 36, frame);

  const CHARS_PER_SEC = 68;
  const getCodeProgress = (lineIdx: number) => {
    const lineStart = 28 + lineIdx * 7;
    const lineText = CODE[lineIdx].tokens.map((t) => t.text).join("");
    const chars = Math.max(0, Math.floor(((frame - lineStart) / 30) * CHARS_PER_SEC));
    return Math.min(chars, lineText.length);
  };

  // Glow on highlighted line
  const highlightGlow = interpolate(
    frame % 40,
    [0, 20, 40],
    [0.1, 0.22, 0.1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Transition bar animates in after code is done
  const barStyle = fadeUp(frame, 75, 20);
  const barProgress = interpolate(frame, [82, 110], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Bottom caption
  const cap1 = "Tells CSS to transition discrete";
  const cap2 = "properties — not just switch them.";
  const tc1 = useTyped(cap1, 76, 38, frame);
  const tc2 = useTyped(cap2, 95, 38, frame);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: SAFE.top + 70,
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
      }}
    >
      {/* ── Headline ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 44 }}>
        <div
          style={{
            ...fadeUp(frame, 0, 16),
            fontFamily: FONTS.display,
            fontSize: 60,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {tl1}
        </div>
        <div
          style={{
            ...fadeUp(frame, 12, 16),
            fontFamily: FONTS.mono,
            fontSize: 54,
            fontWeight: 700,
            color: COLORS.accentB,
            lineHeight: 1.15,
            letterSpacing: "-0.01em",
          }}
        >
          {tl2}
          {frame < 55 && (
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: "0.85em",
                background: COLORS.accentB,
                marginLeft: 3,
                verticalAlign: "middle",
                opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
              }}
            />
          )}
        </div>
      </div>

      {/* ── Code block ───────────────────────────────────────── */}
      <div
        style={{
          ...fadeUp(frame, 24, 16),
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          borderRadius: 20,
          background: COLORS.codeBg,
          border: "1.5px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
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
          <span style={{ fontFamily: FONTS.mono, fontSize: 18, color: COLORS.comment, marginLeft: 8 }}>
            styles.css
          </span>
        </div>

        <div style={{ padding: "24px 0", fontFamily: FONTS.mono, fontSize: 23, lineHeight: 1.85 }}>
          {CODE.map((line, lineIdx) => {
            const progress = getCodeProgress(lineIdx);
            let charsLeft = progress;
            return (
              <div
                key={lineIdx}
                style={{
                  paddingLeft: 28 + line.indent * 24,
                  paddingRight: 28,
                  background: line.highlight
                    ? `rgba(121,192,255,${highlightGlow})`
                    : "transparent",
                  borderLeft: line.highlight
                    ? `3px solid ${COLORS.accentB}88`
                    : "3px solid transparent",
                }}
              >
                {line.tokens.map((token, ti) => {
                  if (charsLeft <= 0) return null;
                  const show = token.text.slice(0, charsLeft);
                  charsLeft -= token.text.length;
                  return <T key={ti} color={token.color}>{show}</T>;
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Transition bar demo ───────────────────────────────── */}
      <div
        style={{
          ...barStyle,
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          marginTop: 36,
          padding: "28px 32px",
          borderRadius: 18,
          background: "rgba(255,255,255,0.04)",
          border: `1px solid rgba(121,192,255,0.15)`,
        }}
      >
        <DisplayTransitionBar progress={barProgress} />
      </div>

      {/* ── Bottom captions ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 50,
          left: SAFE.left + 20,
          right: SAFE.right + 20,
        }}
      >
        {[{ text: tc1, start: 76 }, { text: tc2, start: 95 }].map(({ text, start }, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(frame, start, 14),
              fontFamily: FONTS.display,
              fontSize: 34,
              fontWeight: 500,
              color: COLORS.muted,
              lineHeight: 1.5,
            }}
          >
            {text}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
