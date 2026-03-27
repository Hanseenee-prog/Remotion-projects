// Scene 5 — "Two properties change that.
//             @starting-style — defines what your card looks like the
//             moment before it appears. Now CSS has a true starting point."
//
// Visual: @starting-style code block types in with a glowing highlight.
// A "moment before" timeline marker animates in.

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

// ─── Code snippet ─────────────────────────────────────────────────────────────
// @starting-style block nested inside .card.visible
const CODE: Array<{ tokens: Array<{ text: string; color: string }>; indent: number; highlight?: boolean }> = [
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
      { text: "opacity", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "1", color: COLORS.number },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    tokens: [
      { text: "transform", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "translateY", color: COLORS.fnName },
      { text: "(", color: COLORS.punctuation },
      { text: "0", color: COLORS.number },
      { text: ");", color: COLORS.punctuation },
    ],
  },
  { indent: 0, tokens: [{ text: "", color: "" }] },
  // @starting-style highlight block
  {
    indent: 1,
    highlight: true,
    tokens: [
      { text: "@starting-style", color: COLORS.atRule },
      { text: " {", color: COLORS.punctuation },
    ],
  },
  {
    indent: 2,
    highlight: true,
    tokens: [
      { text: "opacity", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "0", color: COLORS.number },
      { text: ";", color: COLORS.punctuation },
    ],
  },
  {
    indent: 2,
    highlight: true,
    tokens: [
      { text: "transform", color: COLORS.property },
      { text: ": ", color: COLORS.punctuation },
      { text: "translateY", color: COLORS.fnName },
      { text: "(", color: COLORS.punctuation },
      { text: "24px", color: COLORS.number },
      { text: ");", color: COLORS.punctuation },
    ],
  },
  {
    indent: 1,
    highlight: true,
    tokens: [{ text: "}", color: COLORS.punctuation }],
  },
  { indent: 0, tokens: [{ text: "}", color: COLORS.punctuation }] },
];

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();

  const line1 = "Two properties";
  const line2 = "change that.";
  const tl1 = useTyped(line1, 0, 40, frame);
  const tl2 = useTyped(line2, 14, 40, frame);

  const sub = "@starting-style";
  const ts = useTyped(sub, 30, 40, frame);

  const CHARS_PER_SEC = 70;
  const getCodeProgress = (lineIdx: number) => {
    const lineStart = 32 + lineIdx * 6;
    const lineText = CODE[lineIdx].tokens.map((t) => t.text).join("");
    const chars = Math.max(0, Math.floor(((frame - lineStart) / 30) * CHARS_PER_SEC));
    return Math.min(chars, lineText.length);
  };

  // Glow pulse on @starting-style lines after they appear
  const glowOpacity = interpolate(
    frame % 40,
    [0, 20, 40],
    [0.12, 0.22, 0.12],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // "moment before" callout appears at frame 90
  const momentStyle = fadeUp(frame, 90, 18);

  // Bottom caption
  const cap = "Now CSS has a true starting point.";
  const tc = useTyped(cap, 94, 38, frame);

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
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 14 }}>
        {[
          { text: tl1, start: 0 },
          { text: tl2, start: 10 },
        ].map(({ text, start }, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(frame, start, 16),
              fontFamily: FONTS.display,
              fontSize: 68,
              fontWeight: 800,
              color: COLORS.white,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {text}
          </div>
        ))}
        <div
          style={{
            ...fadeUp(frame, 22, 16),
            fontFamily: FONTS.mono,
            fontSize: 44,
            fontWeight: 600,
            color: COLORS.atRule,
            marginTop: 8,
            letterSpacing: "-0.01em",
          }}
        >
          {ts}
          {frame < 60 && (
            <span
              style={{
                display: "inline-block",
                width: 3,
                height: "0.85em",
                background: COLORS.atRule,
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
          ...fadeUp(frame, 28, 16),
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          borderRadius: 20,
          background: COLORS.codeBg,
          border: "1.5px solid rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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

        {/* Lines */}
        <div style={{ padding: "24px 0", fontFamily: FONTS.mono, fontSize: 23, lineHeight: 1.85 }}>
          {CODE.map((line, lineIdx) => {
            const progress = getCodeProgress(lineIdx);
            let charsLeft = progress;
            const lineText = line.tokens.map((t) => t.text).join("");
            const isTyping = progress > 0 && progress < lineText.length;

            return (
              <div
                key={lineIdx}
                style={{
                  paddingLeft: 28 + line.indent * 24,
                  paddingRight: 28,
                  background: line.highlight
                    ? `rgba(255,123,114,${glowOpacity})`
                    : "transparent",
                  borderLeft: line.highlight
                    ? `3px solid ${COLORS.atRule}88`
                    : "3px solid transparent",
                  transition: "background 0.3s",
                }}
              >
                {line.tokens.map((token, ti) => {
                  if (charsLeft <= 0) return null;
                  const show = token.text.slice(0, charsLeft);
                  charsLeft -= token.text.length;
                  return <T key={ti} color={token.color}>{show}</T>;
                })}
                {isTyping && lineIdx === CODE.findIndex((_, i) => getCodeProgress(i) < CODE[i].tokens.map(t => t.text).join("").length && getCodeProgress(i) > 0) && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 2,
                      height: "0.85em",
                      background: COLORS.accentA,
                      marginLeft: 2,
                      verticalAlign: "middle",
                      opacity: Math.floor(frame / 7) % 2 === 0 ? 1 : 0,
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── "moment before" callout ──────────────────────────── */}
      <div
        style={{
          ...momentStyle,
          marginTop: 30,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 36px",
          borderRadius: 100,
          background: "rgba(255,123,114,0.1)",
          border: `1px solid ${COLORS.atRule}44`,
        }}
      >
        <span style={{ fontSize: 28 }}>⏮</span>
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.atRule,
          }}
        >
          defines the moment before it appears
        </span>
      </div>

      {/* ── Bottom caption ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 50,
          left: SAFE.left + 20,
          right: SAFE.right + 20,
          ...fadeUp(frame, 92, 16),
          fontFamily: FONTS.display,
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.accentA,
          lineHeight: 1.5,
        }}
      >
        {tc}
      </div>
    </AbsoluteFill>
  );
};
