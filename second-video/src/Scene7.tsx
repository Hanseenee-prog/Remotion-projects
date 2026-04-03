// Scene 7 — "Check the flag, call callback, turn flag off"
// 240 frames
//
// Types in:
//   if (isAllowed) {
//     callback(...args);
//     isAllowed = false;
//   }
// Then highlights each piece with dimming phases.

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, CANVAS } from "./tokens";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
function clamp(v: number, lo = 0, hi = 1) { return Math.min(Math.max(v, lo), hi); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }
function useTyped(text: string, sf: number, ef: number, frame: number) {
  return text.slice(0, Math.floor(clamp((frame - sf) / (ef - sf)) * text.length));
}

const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);
const FONT = 38;
const LH   = 1.9;
const DIM  = 0.18;

const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920, borderRadius: 18, background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.09)", overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.75)",
  }}>
    <div style={{
      display: "flex", alignItems: "center", background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)", paddingLeft: 24, height: 72,
    }}>
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map(c => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10, background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0", padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none", marginBottom: -1,
      }}>
        <div style={{
          background: "#C9A227", borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em", textTransform: "uppercase" as const,
        }}>js</div>
        <span style={{ fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>throttle.js</span>
      </div>
    </div>
    <div style={{ padding: "32px 44px 40px" }}>{children}</div>
  </div>
);

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();

  const globalOut = interpolate(frame, [228, 240], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // Typing schedule
  const ifText       = "    if (isAllowed) {";
  const callbackText = "      callback(...args);";
  const flagText     = "      isAllowed = false;";
  const closeText    = "    }";

  const typed1 = useTyped(ifText,       10, 38, frame);
  const typed2 = useTyped(callbackText, 42, 72, frame);
  const typed3 = useTyped(flagText,     78, 108, frame);

  const done1 = typed1.length >= ifText.length;
  const done2 = typed2.length >= callbackText.length;
  const done3 = typed3.length >= flagText.length;

  // Highlight phases:
  // Phase A (frame 120–175): highlight "if (isAllowed)" check — dims rest
  // Phase B (frame 175–220): highlight "callback(...args);" — dims rest
  // Phase C (frame 220–240): restore all (global fade takes over)

  const phaseA = easeOut(prog(frame, 120, 134)) * (1 - easeOut(prog(frame, 168, 180)));
  const phaseB = easeOut(prog(frame, 178, 192)) * (1 - easeOut(prog(frame, 216, 228)));
  const phaseC = easeOut(prog(frame, 130, 145)) * (1 - easeOut(prog(frame, 168, 180)));

  const anyHL = phaseA > 0.1 || phaseB > 0.1 || phaseC > 0.1;
  const baseDim = anyHL ? DIM : 1;

  const ifOp       = phaseA > 0.1 ? 1 : baseDim;
  const callbackOp = phaseB > 0.1 ? 1 : baseDim;
  const flagOffOp  = phaseC > 0.1 ? 1 : baseDim;

  return (
    <AbsoluteFill style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "transparent", opacity: globalOut,
    }}>
      <div style={{ width: 920, position: "relative" }}>
        <CodeWindow>
          {/* function throttle(callback, delay) { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>function </T><T c={COLORS.fnName}>throttle</T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.value}>callback</T>
            <T c={COLORS.punctuation}>, </T><T c={COLORS.value}>delay</T>
            <T c={COLORS.punctuation}>) {"{"}</T>
          </div>

          {/* let isAllowed = true; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>  let </T><T c={COLORS.value}>isAllowed</T>
            <T c={COLORS.punctuation}> = </T><T c={COLORS.keyword}>true</T>
            <T c={COLORS.punctuation}>;</T>
          </div>

          {/* return (...args) => { */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, opacity: baseDim }}>
            <T c={COLORS.keyword}>  return </T>
            <T c={COLORS.punctuation}>(</T><T c={COLORS.spread}>...</T>
            <T c={COLORS.value}>args</T><T c={COLORS.punctuation}>) </T>
            <T c={COLORS.keyword}>{"=>"}</T><T c={COLORS.punctuation}>{" {"}</T>
          </div>

          {/* if (isAllowed) { */}
          {frame >= 10 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: ifOp }}>
              {(() => {
                const chunks = [
                  { text: "    ", color: COLORS.codeText },
                  { text: "if ", color: COLORS.keyword },
                  { text: "(", color: COLORS.punctuation },
                  { text: "isAllowed", color: COLORS.value },
                  { text: ") {", color: COLORS.punctuation },
                ];
                let left = typed1.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left); left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!done1 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>
          )}

          {/* callback(...args); */}
          {frame >= 42 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: callbackOp }}>
              {(() => {
                const chunks = [
                  { text: "      ", color: COLORS.codeText },
                  { text: "callback", color: COLORS.fnName },
                  { text: "(", color: COLORS.punctuation },
                  { text: "...", color: "#D2A8FF" },
                  { text: "args", color: COLORS.value },
                  { text: ");", color: COLORS.punctuation },
                ];
                let left = typed2.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left); left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!done2 && done1 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>
          )}

          {/* isAllowed = false; */}
          {frame >= 78 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre", opacity: flagOffOp }}>
              {(() => {
                const chunks = [
                  { text: "      ", color: COLORS.codeText },
                  { text: "isAllowed", color: COLORS.value },
                  { text: " = ", color: COLORS.punctuation },
                  { text: "false", color: COLORS.keyword },
                  { text: ";", color: COLORS.punctuation },
                ];
                let left = typed3.length;
                return chunks.map((ch, i) => {
                  if (left <= 0) return null;
                  const s = ch.text.slice(0, left); left -= ch.text.length;
                  return <T key={i} c={ch.color}>{s}</T>;
                });
              })()}
              {!done3 && done2 && <span style={{ display: "inline-block", width: 3, height: "0.82em", background: COLORS.accentA, marginLeft: 3, verticalAlign: "middle", opacity: cursorBlink ? 1 : 0 }} />}
            </div>
          )}

          {/* } */}
          {done3 && (
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim }}>
              {"    }"}
            </div>
          )}

          {/* }; */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim, paddingLeft: "2ch" }}>
            {"};"}
          </div>
          {/* } */}
          <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, color: COLORS.punctuation, opacity: baseDim }}>
            {"}"}
          </div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};
