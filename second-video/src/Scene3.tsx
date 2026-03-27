// Scene 3 — "But some properties don't have an in-between. For example…
//             From display none… to block, or from height 0… to auto.
//             They're discrete values — they switch, they don't transition."
//
// Visual: Two code snippet pairs side by side, each with a ❌ "switches" indicator.
// A "discrete" label pill appears at the bottom.

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
} from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function fadeUp(frame: number, startFrame: number, duration = 18, distance = 28) {
  const t = Math.min(Math.max((frame - startFrame) / duration, 0), 1);
  const e = easeOut(t);
  return {
    opacity: e,
    transform: `translateY(${(1 - e) * distance}px)`,
  };
}

function useTyped(text: string, startFrame: number, cps = 40, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return text.slice(0, chars);
}

// ─── Code Token ───────────────────────────────────────────────────────────────
const T: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = COLORS.codeText,
}) => (
  <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>
    {children}
  </span>
);

// ─── Discrete Pair Card ───────────────────────────────────────────────────────
const DiscretePair: React.FC<{
  fromProp: React.ReactNode;
  fromVal: React.ReactNode;
  toProp: React.ReactNode;
  toVal: React.ReactNode;
  label: string;
  frameStyle: React.CSSProperties;
  switchFrame: number;
  currentFrame: number;
}> = ({ fromProp, fromVal, toProp, toVal, label, frameStyle, switchFrame, currentFrame }) => {
  const switched = currentFrame >= switchFrame;

  return (
    <div
      style={{
        ...frameStyle,
        width: 440,
        borderRadius: 20,
        background: COLORS.codeBg,
        border: `1.5px solid rgba(255,255,255,0.08)`,
        overflow: "hidden",
      }}
    >
      {/* Header bar */}
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
          {label}
        </span>
      </div>

      {/* Code rows */}
      <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* From */}
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 10,
            background: switched ? "rgba(255,123,114,0.06)" : "rgba(255,123,114,0.12)",
            border: `1px solid ${switched ? "rgba(255,123,114,0.15)" : "rgba(255,123,114,0.35)"}`,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontFamily: FONTS.mono, fontSize: 22 }}>
            {fromProp}
            <T color={COLORS.punctuation}>: </T>
            {fromVal}
            <T color={COLORS.punctuation}>;</T>
          </span>
        </div>

        {/* Switch indicator */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <div
            style={{
              height: 2,
              flex: 1,
              background: switched ? `${COLORS.accentC}88` : "rgba(255,255,255,0.08)",
              transition: "background 0.2s",
            }}
          />
          <span
            style={{
              fontFamily: FONTS.display,
              fontSize: 18,
              fontWeight: 600,
              color: switched ? COLORS.accentC : COLORS.subtle,
              letterSpacing: "0.04em",
            }}
          >
            {switched ? "⚡ switches" : "→"}
          </span>
          <div
            style={{
              height: 2,
              flex: 1,
              background: switched ? `${COLORS.accentC}88` : "rgba(255,255,255,0.08)",
            }}
          />
        </div>

        {/* To */}
        <div
          style={{
            padding: "14px 20px",
            borderRadius: 10,
            background: switched ? "rgba(255,123,114,0.12)" : "rgba(255,123,114,0.06)",
            border: `1px solid ${switched ? "rgba(255,123,114,0.35)" : "rgba(255,123,114,0.15)"}`,
          }}
        >
          <span style={{ fontFamily: FONTS.mono, fontSize: 22 }}>
            {toProp}
            <T color={COLORS.punctuation}>: </T>
            {toVal}
            <T color={COLORS.punctuation}>;</T>
          </span>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  const line1 = "But some properties";
  const line2 = "don't have an in-between.";
  const tl1 = useTyped(line1, 0, 38, frame);
  const tl2 = useTyped(line2, 16, 38, frame);

  const subLine = "For example…";
  const ts = useTyped(subLine, 32, 38, frame);

  // Cards appear
  const card1Style = fadeUp(frame, 36, 20);
  const card2Style = fadeUp(frame, 48, 20);

  // "discrete" label
  const discreteStyle = fadeUp(frame, 80, 16);

  // bottom caption
  const capLine = "They switch — they don't transition.";
  const tc = useTyped(capLine, 82, 40, frame);

  return (
    <AbsoluteFill
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: SAFE.top + 60,
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
      }}
    >
      {/* ── Headline ─────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 50 }}>
        {[
          { text: tl1, start: 0 },
          { text: tl2, start: 10 },
        ].map(({ text, start }, i) => (
          <div
            key={i}
            style={{
              ...fadeUp(frame, start, 16),
              fontFamily: FONTS.display,
              fontSize: 64,
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
            ...fadeUp(frame, 26, 14),
            fontFamily: FONTS.display,
            fontSize: 48,
            fontWeight: 500,
            color: COLORS.muted,
            marginTop: 6,
          }}
        >
          {ts}
        </div>
      </div>

      {/* ── Code pair cards ──────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <DiscretePair
          label="display"
          fromProp={<T color={COLORS.property}>display</T>}
          fromVal={<T color={COLORS.keyword}>none</T>}
          toProp={<T color={COLORS.property}>display</T>}
          toVal={<T color={COLORS.value}>block</T>}
          frameStyle={card1Style}
          switchFrame={60}
          currentFrame={frame}
        />
        <DiscretePair
          label="height"
          fromProp={<T color={COLORS.property}>height</T>}
          fromVal={<T color={COLORS.number}>0</T>}
          toProp={<T color={COLORS.property}>height</T>}
          toVal={<T color={COLORS.keyword}>auto</T>}
          frameStyle={card2Style}
          switchFrame={72}
          currentFrame={frame}
        />
      </div>

      {/* ── "Discrete values" pill ───────────────────────────── */}
      <div
        style={{
          ...discreteStyle,
          marginTop: 36,
          padding: "14px 34px",
          borderRadius: 100,
          background: "rgba(255,123,114,0.1)",
          border: `1px solid ${COLORS.accentC}44`,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.display,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.accentC,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Discrete values
        </span>
      </div>

      {/* ── Bottom caption ───────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          bottom: SAFE.bottom + 50,
          left: SAFE.left + 20,
          right: SAFE.right + 20,
          ...fadeUp(frame, 80, 16),
          fontFamily: FONTS.display,
          fontSize: 36,
          fontWeight: 500,
          color: COLORS.muted,
          lineHeight: 1.5,
        }}
      >
        {tc}
      </div>
    </AbsoluteFill>
  );
};
