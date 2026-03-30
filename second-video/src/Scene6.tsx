// Scene 6 — "Wrap callback in setTimeout — but it still fires on every keypress"
//
// Visual: setTimeout line types in. Then demo shows it still fires multiple times.
// Each keypress still spawns its own delayed call — overlapping timers.

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
function useTyped(text: string, sf: number, ef: number, frame: number) {
  const p = clamp((frame - sf) / (ef - sf));
  return text.slice(0, Math.floor(p * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);

const FONT = 36;
const LH   = 1.85;

const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920, borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
  }}>
    <div style={{
      display: "flex", alignItems: "center",
      background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      paddingLeft: 24, height: 72,
    }}>
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.codeBg, borderRadius: "8px 8px 0 0",
        padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "none", marginBottom: -1,
      }}>
        <div style={{
          background: "#C9A227", borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" as const,
        }}>js</div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>
          debounce.js
        </span>
      </div>
    </div>
    <div style={{ padding: "28px 44px 36px" }}>{children}</div>
  </div>
);

// Stacked timer visualisation
const TimerPill: React.FC<{ query: string; idx: number; frame: number; startF: number }> = ({
  query, idx, frame, startF,
}) => {
  const age = frame - startF;
  if (age < 0) return null;
  const inP = clamp(age / 8);
  const e   = easeOut(inP);
  // Timer countdown: fires after ~40 frames of delay
  const DELAY_F = 40;
  const fired   = age >= DELAY_F;
  const fillP   = clamp(age / DELAY_F);

  return (
    <div style={{
      opacity: e * (age > 90 ? Math.max(0, 1 - (age - 90) / 20) : 1),
      transform: `translateY(${(1 - e) * 20}px)`,
      padding: "14px 24px",
      borderRadius: 12,
      background: fired ? `${COLORS.accentC}18` : `${COLORS.accentB}10`,
      border: `1.5px solid ${fired ? COLORS.accentC : COLORS.accentB}55`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 10,
    }}>
      <span style={{ fontFamily: FONTS.mono, fontSize: 22, color: COLORS.muted }}>
        setTimeout({`'${query}'`}, 1000)
      </span>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
        {/* Progress bar */}
        <div style={{ width: 80, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${fillP * 100}%`,
            background: fired ? COLORS.accentC : COLORS.accentB,
            borderRadius: 3,
          }} />
        </div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 20, color: fired ? COLORS.accentC : COLORS.muted }}>
          {fired ? "fired ❌" : "waiting…"}
        </span>
      </div>
    </div>
  );
};

const KEYS    = ["A", "v", "e", "n"];
const KEY_INT = 22;
const KEYS_START = 110;

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  const setLine = useTyped("    setTimeout(() => callback(...args), delay);", 18, 60, frame);
  const setDone = setLine.length >= "    setTimeout(() => callback(...args), delay);".length;
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  const keysVisible = Math.min(
    Math.floor(Math.max(frame - KEYS_START, 0) / KEY_INT),
    KEYS.length
  );

  return (
    <AbsoluteFill style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: SAFE.top + 60,
      paddingLeft: SAFE.left + 20,
      paddingRight: SAFE.right + 20,
    }}>

      {/* Headline */}
      <div style={{ width: "100%", maxWidth: CANVAS.safeWidth, marginBottom: 44 }}>
        {[
          { text: "Wrap it in",          start: 0  },
          { text: "setTimeout.",          start: 6  },
        ].map(({ text, start }, i) => (
          <div key={i} style={{
            ...fadeUp(frame, start, 14),
            fontFamily: FONTS.display,
            fontSize: 68,
            fontWeight: 800,
            color: COLORS.white,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}>
            {text}
          </div>
        ))}
      </div>

      {/* Code window */}
      <div style={{ ...fadeUp(frame, 10, 14) }}>
        <CodeWindow>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>function </T>
            <T c={COLORS.fnName}>debounce</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T>
            <T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH }}>
            <T c={COLORS.keyword}>{"  return "}</T>
            <T c={COLORS.keyword}>function</T>
            <T c={COLORS.punctuation}>(</T>
            <T c={COLORS.spread}>...</T>
            <T c={COLORS.value}>args</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>
          {/* setTimeout line — typed */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
            {(() => {
              const chunks = [
                { text: "    ",           color: COLORS.codeText   },
                { text: "setTimeout",     color: COLORS.fnName     },
                { text: "(() => ",        color: COLORS.punctuation },
                { text: "callback",       color: COLORS.fnName     },
                { text: "(",             color: COLORS.punctuation },
                { text: "...",           color: COLORS.spread      },
                { text: "args",          color: COLORS.value       },
                { text: "), ",           color: COLORS.punctuation },
                { text: "delay",         color: COLORS.value       },
                { text: ");",            color: COLORS.punctuation },
              ];
              let left = setLine.length;
              return chunks.map((ch, i) => {
                if (left <= 0) return null;
                const s = ch.text.slice(0, left);
                left -= ch.text.length;
                return <T key={i} c={ch.color}>{s}</T>;
              });
            })()}
            {!setDone && (
              <span style={{
                display: "inline-block", width: 3, height: "0.82em",
                background: COLORS.accentA, marginLeft: 3,
                verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
              }} />
            )}
          </div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>{"  }"}</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation }}>{"}"}</div>
        </CodeWindow>
      </div>

      {/* Problem demo */}
      {frame >= KEYS_START && (
        <div style={{
          ...fadeUp(frame, KEYS_START, 12),
          width: "100%",
          maxWidth: CANVAS.safeWidth,
          marginTop: 36,
        }}>
          <div style={{
            fontFamily: FONTS.mono,
            fontSize: 22,
            color: COLORS.accentC,
            marginBottom: 16,
            letterSpacing: "0.04em",
          }}>
            ⚠️ Still fires on every keypress!
          </div>
          {Array.from({ length: keysVisible }).map((_, i) => (
            <TimerPill
              key={i}
              query={"Aven".slice(0, i + 1)}
              idx={i}
              frame={frame}
              startF={KEYS_START + i * KEY_INT}
            />
          ))}
        </div>
      )}

    </AbsoluteFill>
  );
};
