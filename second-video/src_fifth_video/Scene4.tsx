// Scene 4 — "Here's how we build it — debounce(callback, delay)"
//
// Timeline:
//   0–14   : Headline fades in
//   14–70  : Code window slides in, "function debounce(callback, delay) {" types out
//   70–140 : Settled — full code visible
//   140–170: callback phase — everything dims except "callback", label line + top box in
//   170–200: code restores, then dims except "delay", label line + bottom box in
//   200–237: settled
//   237–245: global fade out

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(Math.max(v, lo), hi);
}
function prog(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}
function fadeUp(frame: number, start: number, dur = 18, dist = 30) {
  const t = clamp((frame - start) / dur);
  const e = easeOut(t);
  return { opacity: e, transform: `translateY(${(1 - e) * dist}px)` };
}
function useTyped(text: string, startF: number, endF: number, frame: number) {
  const p = clamp((frame - startF) / (endF - startF));
  return text.slice(0, Math.floor(p * text.length));
}

// ─── Token ────────────────────────────────────────────────────────────────────
const T: React.FC<{ c: string; children: React.ReactNode }> = ({ c, children }) => (
  <span style={{ color: c, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{children}</span>
);

const FONT = 38;
const LH   = 1.9;
const DIM  = 0.18; // opacity for dimmed tokens

// ─── Code Window (styles unchanged from original) ─────────────────────────────
const CodeWindow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{
    width: 920,
    borderRadius: 18,
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
        background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0",
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
    <div style={{ padding: "32px 44px 40px" }}>{children}</div>
  </div>
);

// ─── Annotation box ───────────────────────────────────────────────────────────
const AnnotationBox: React.FC<{
  name: string;
  nameColor: string;
  desc: string;
  opacity: number;
}> = ({ name, nameColor, desc, opacity }) => (
  <div style={{
    opacity,
    padding: "20px 28px",
    borderRadius: 14,
    background: COLORS.surface,
    border: `2px solid ${nameColor}`, // Changed: Now matches the accent color
    display: "flex",
    alignItems: "center",
    gap: 18,
    width: "auto",
    boxSizing: "border-box" as const,
    boxShadow: opacity > 0.5 ? `0 0 32px rgba(0,0,0,0.4)` : "none",
  }}>
    <span style={{ fontFamily: FONTS.mono, fontSize: 35, fontWeight: 800, color: nameColor, whiteSpace: "nowrap" }}>
      {name}
    </span>
    <span style={{ color: COLORS.subtle, fontSize: 26, flexShrink: 0 }}>—</span>
    <span style={{ fontFamily: FONTS.display, fontSize: 32, color: COLORS.muted, lineHeight: 1.4 }}>
      {desc}
    </span>
  </div>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();

  // ── Global fade-out ────────────────────────────────────────────────────────
  const globalOut = interpolate(frame, [237, 245], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ── Typing ─────────────────────────────────────────────────────────────────
  const LINE = "function debounce(callback, delay) {";
  const line1 = useTyped(LINE, 20, 65, frame);
  const line1Done = line1.length >= LINE.length;
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  // ── Phase timings ──────────────────────────────────────────────────────────
  const cbDimP   = easeOut(prog(frame, 140, 155)) * (1 - easeOut(prog(frame, 185, 200)));
  const cbLineP  = easeOut(prog(frame, 148, 168)); // label line draw
  const cbBoxOp  = easeOut(prog(frame, 152, 168)) * (1 - easeOut(prog(frame, 182, 196)));

  const dlDimP   = easeOut(prog(frame, 200, 215));
  const dlLineP  = easeOut(prog(frame, 208, 228));
  const dlBoxOp  = easeOut(prog(frame, 212, 228));

  // ── Per-token opacity ──────────────────────────────────────────────────────
  const kwOp  = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);
  const cbOp  = interpolate(cbDimP, [0, 1], [1, 1])   * interpolate(dlDimP, [0, 1], [1, DIM]);
  const dlOp  = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, 1]);
  const puncOp = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);
  const braceOp = interpolate(cbDimP, [0, 1], [1, DIM]) * interpolate(dlDimP, [0, 1], [1, DIM]);

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingLeft: SAFE.left + 20,
        paddingRight: SAFE.right + 20,
        opacity: globalOut,
      }}>

        {/* ── Annotation: callback (above code window) ──────────────────────── */}
        <div style={{ position: "absolute", top: -150, width: "90%", display: "flex", flexDirection: "column", alignItems: "flex-start", position: "relative" }}>
          <AnnotationBox
            name="searchMovies()"
            nameColor={COLORS.accentC}
            desc="the function you want to control"
            opacity={cbBoxOp * globalOut}
          />

        </div>

        {/* ── Code window ───────────────────────────────────────────────────── */}
        <div style={{ ...fadeUp(frame, 14, 16), width: "100%", maxWidth: CANVAS.safeWidth, position: "relative" }}>
          <CodeWindow>
            <div style={{ fontFamily: FONTS.mono, fontSize: FONT, fontWeight: 700, lineHeight: LH, whiteSpace: "pre" }}>
              <span style={{ opacity: kwOp }}>
                <T c={COLORS.keyword}>{"function "}</T>
                <T c={COLORS.fnName}>{"debounce"}</T>
              </span>
              <span style={{ opacity: puncOp }}>
                <T c={COLORS.punctuation}>{"("}</T>
              </span>
              
              {line1.length >= 18 && (
                <span style={{ opacity: cbOp }}>
                  <T c={COLORS.value}>{"callback"}</T>
                </span>
              )}
              {line1.length < 18 && line1.length > 9 && (
                <span style={{ opacity: cbOp }}>
                  <T c={COLORS.value}>{line1.slice(9 + 8 + 1)}</T>
                </span>
              )}
              
              {line1.length >= 27 && (
                <span style={{ opacity: puncOp }}>
                  <T c={COLORS.punctuation}>{", "}</T>
                </span>
              )}
              
              {line1.length >= 33 && (
                <span style={{ opacity: dlOp }}>
                  <T c={COLORS.value}>{"delay"}</T>
                </span>
              )}
              {line1.length >= 28 && line1.length < 33 && (
                <span style={{ opacity: dlOp }}>
                  <T c={COLORS.value}>{line1.slice(27)}</T>
                </span>
              )}
              
              {line1.length >= 36 && (
                <span style={{ opacity: braceOp }}>
                  <T c={COLORS.punctuation}>{") {"}</T>
                </span>
              )}
              {line1.length >= 33 && line1.length < 36 && (
                <span style={{ opacity: braceOp }}>
                  <T c={COLORS.punctuation}>{line1.slice(33)}</T>
                </span>
              )}

              {!line1Done && (
                <span style={{
                  display: "inline-block", width: 3, height: "0.82em",
                  background: COLORS.accentA, marginLeft: 3,
                  verticalAlign: "middle", opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>

            {line1Done && (
              <div style={{
                fontFamily: FONTS.mono, fontSize: FONT,
                fontWeight: 700, lineHeight: LH,
                color: COLORS.punctuation,
                opacity: braceOp,
              }}>
                {"}"}
              </div>
            )}
          </CodeWindow>
        </div>

        {/* ── Annotation: delay (below code window) ─────────────────────────── */}
        <div style={{ position: "absolute", bottom: 500, width: "50%" }}>
          <AnnotationBox
            name="1000"
            nameColor={COLORS.accentB}
            desc="how long to wait (in ms)"
            opacity={dlBoxOp * globalOut}
          />
        </div>

        {/* ── Fixed Curved Arrows ───────────────────────────────────────────── */}
        {(cbLineP > 0 || dlLineP > 0) && (
          <svg
            style={{
              position: "absolute",
              top: 0, left: 0,
              width: "100%", height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 1080 1920"
            preserveAspectRatio="none"
          >
            <defs>
              <marker
                id="arrow-cb"
                viewBox="0 0 12 12"
                refX="10" refY="6"
                markerWidth="8" markerHeight="8"
                orient="auto"
              >
                <path
                  d="M1 1 L11 6 L1 11"
                  fill="none"
                  stroke={COLORS.accentC}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>

              <marker
                id="arrow-dl"
                viewBox="0 0 12 12"
                refX="10" refY="6"
                markerWidth="8" markerHeight="8"
                orient="auto"
              >
                <path
                  d="M1 1 L11 6 L1 11"
                  fill="none"
                  stroke={COLORS.accentB}
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </marker>
            </defs>

            {/* Callback Arrow: From Annotation Box Bottom -> "callback" in Code */}
            {cbLineP > 0 && (() => {
              const TOTAL = 400;
              const drawn = cbLineP * TOTAL;
              return (
                <path
                  d="M 400 710 C 400 950, 480 950, 500 965"
                  fill="none"
                  stroke={COLORS.accentC}
                  strokeWidth="4.5"
                  strokeDasharray="9 7"
                  strokeDashoffset={TOTAL - drawn}
                  strokeLinecap="round"
                  markerEnd="url(#arrow-cb)"
                  opacity={cbBoxOp} // Changed: Now tied to the box visibility
                />
              );
            })()}

            {/* Delay Arrow: From Annotation Box Top -> "delay" in Code */}
            {dlLineP > 0 && (() => {
              const TOTAL = 300;
              const drawn = dlLineP * TOTAL;
              return (
                <path
                  d="M 450 1290 C 540 1000, 600 1200, 750 1020"
                  fill="none"
                  stroke={COLORS.accentB}
                  strokeWidth="4.5"
                  strokeDasharray="9 7"
                  strokeDashoffset={TOTAL - drawn}
                  strokeLinecap="round"
                  markerEnd="url(#arrow-dl)"
                  opacity={dlBoxOp} // Changed: Now tied to the box visibility
                />
              );
            })()}
          </svg>
        )}

      </div>
    </AbsoluteFill>
  );
};