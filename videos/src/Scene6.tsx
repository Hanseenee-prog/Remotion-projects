// Scene 6 — "Change the new object… and the original stays exactly the same."
// 219 frames @ 30fps = 7.3s
//
// Timeline:
//   0–10   : code window slides up from below into center
//   10–60  : code block (mutation + console.logs) fully visible — "Change the new object…"
//   60–90  : terminal output box slides up beneath the code
//   80–100 : original → "London" ✅ fades in with green highlight
//   100–118: clone → "Houston" fades in                          — "…stays exactly the same"
//   128–150: checkmark pill 1 "No shared references" slides up   — "no shared references"
//   160–180: checkmark pill 2 "No data loss" slides up           — "no data loss"
//   180–219: everything settled / hold

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS } from "./tokens";

const C = COLORS;

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function prog(frame: number, start: number, end: number) {
  return clamp01((frame - start) / (end - start));
}
function tok(color: string, text: string) {
  return (
    <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>{text}</span>
  );
}

const FONT = 38;
const LH   = 1.85;

/* ─── Code Window (exact Scene1 style) ─── */
const CodeWindow: React.FC<{
  tabLabel: string;
  tabColor: string;
  fileName: string;
  children: React.ReactNode;
}> = ({ tabLabel, tabColor, fileName, children }) => (
  <div style={{
    width: 950,
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
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0",
        padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "none",
        marginBottom: -1,
      }}>
        <div style={{
          background: tabColor, borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}>
          {tabLabel}
        </div>
        <span style={{
          fontFamily: FONTS.mono, fontSize: 26,
          fontWeight: 600, color: COLORS.offWhite,
        }}>
          {fileName}
        </span>
      </div>
    </div>
    <div style={{ padding: "36px 48px 44px" }}>{children}</div>
  </div>
);

/* ─── Checkmark icon ─── */
const Check: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="18" cy="18" r="18" fill={COLORS.accentA} opacity={0.18} />
    <circle cx="18" cy="18" r="14" fill={COLORS.accentA} opacity={0.22} />
    <path
      d="M10 18.5L15.5 24L26 12"
      stroke={COLORS.accentA}
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ─── Slide-up pill ─── */
const Pill: React.FC<{ opacity: number; y: number; label: string }> = ({ opacity, y, label }) => (
  <div style={{
    opacity,
    transform: `translateY(${y}px)`,
    display: "flex",
    alignItems: "center",
    gap: 18,
    background: `${COLORS.accentA}12`,
    border: `1.5px solid ${COLORS.accentA}40`,
    borderRadius: 16,
    padding: "18px 32px",
    width: 950,
  }}>
    <Check />
    <span style={{
      fontFamily: FONTS.display,
      fontSize: 40,
      fontWeight: 700,
      color: COLORS.accentA,
      letterSpacing: 0.3,
    }}>
      {label}
    </span>
  </div>
);

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();

  // ── WINDOW ENTER ────────────────────────────────────────────
  const winInP  = easeOut(prog(frame, 0, 10));
  const winY    = (1 - winInP) * 260;
  const winOp   = clamp01(prog(frame, 0, 8));

  // ── WINDOW SHIFT UP when terminal appears ────────────────────
  // Terminal slides in at frame 60; window shifts up 80px to make room
  const winShiftP = easeOut(prog(frame, 60, 80));
  const winShiftY = winShiftP * 0;

  const finalWinY = winY + winShiftY;

  // ── TERMINAL BOX slides up from below ───────────────────────
  const termInP  = easeOut(prog(frame, 60, 82));
  const termY    = (1 - termInP) * 280;
  const termOp   = clamp01(prog(frame, 60, 74));

  // ── TERMINAL RESULTS ─────────────────────────────────────────
  // original → "London" — green, with highlight box
  const res1Op        = easeOut(prog(frame, 80, 100));
  const res1HighlightP = easeOut(prog(frame, 84, 106));

  // clone → "Houston"
  const res2Op   = easeOut(prog(frame, 100, 118));
  const res2Scale = 0.88 + easeOut(prog(frame, 100, 112)) * 0.12;

  // ── CHECKMARK PILLS ─────────────────────────────────────────
  const pill1Op = easeOut(prog(frame, 128, 148));
  const pill1Y  = (1 - pill1Op) * 36;

  const pill2Op = easeOut(prog(frame, 160, 180));
  const pill2Y  = (1 - pill2Op) * 36;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 24,
      }}>

        {/* ════ CODE WINDOW ════ */}
        <div style={{
          position: "absolute",
          opacity: winOp,
          transform: `translateY(${finalWinY}px) scale(${0.86 + winInP * 0.14})`,
          transformOrigin: "center center",
          // Shift up from vertical center so terminal fits below
          top: "50%",
          marginTop: -520,
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="clone.js">
            <div style={{
              fontFamily: FONTS.mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH, whiteSpace: "pre",
            }}>

              {/* clone.address.city = "Houston"; */}
              <div>
                {tok(C.codeText,    "clone")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "address")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "city")}
                {tok(C.punctuation, " = ")}
                {tok(C.string,      '"Houston"')}
                {tok(C.punctuation, ";")}
              </div>

              {/* blank line */}
              <div style={{ height: `${FONT * LH}px` }} />

              {/* console.log(original.address.city); */}
              <div>
                {tok(C.fnName,      "console")}
                {tok(C.punctuation, ".")}
                {tok(C.fnName,      "log")}
                {tok(C.punctuation, "(")}
                {tok(C.codeText,    "original")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "address")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "city")}
                {tok(C.punctuation, ");")}
              </div>

              {/* console.log(clone.address.city); */}
              <div>
                {tok(C.fnName,      "console")}
                {tok(C.punctuation, ".")}
                {tok(C.fnName,      "log")}
                {tok(C.punctuation, "(")}
                {tok(C.codeText,    "clone")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "address")}
                {tok(C.punctuation, ".")}
                {tok(C.property,    "city")}
                {tok(C.punctuation, ");")}
              </div>

              {/* ════ TERMINAL OUTPUT BOX ════ */}
              <div style={{
                position: "relative",
                opacity: termOp,
                transform: `translateY(${termY}px)`,
                // top: "50%",
                marginTop: 48,
              }}>
                <div style={{
                  width: "100%",
                  background: "#0A0F14",
                  borderRadius: 18,
                  border: "1px solid rgba(255,255,255,0.08)",
                  padding: "32px 44px",
                  fontFamily: FONTS.mono,
                  fontSize: 42,
                  lineHeight: "68px",
                  boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
                }}>

                  {/* original → "London" — green, with animated highlight box */}
                  <div style={{
                    position: "relative",
                    display: "flex", alignItems: "center", gap: 20,
                    padding: "6px 18px",
                    marginLeft: -18,
                    borderRadius: 10,
                    opacity: res1Op,
                    // Animated green highlight background
                    background: `rgba(34,197,94,${res1HighlightP * 0.14})`,
                    borderLeft: `4px solid rgba(34,197,94,${res1HighlightP})`,
                    transition: "background 0.1s",
                  }}>
                    <span style={{ color: C.comment, fontSize: 34 }}>original →</span>
                    <span style={{ color: "#4ADE80", fontWeight: 700 }}>"London"</span>
                    {/* Soft glow behind the value */}
                    <div style={{
                      position: "absolute",
                      right: 18,
                      opacity: res1HighlightP * 0.7,
                      fontFamily: FONTS.display,
                      fontSize: 28,
                      color: "#4ADE80",
                      fontWeight: 700,
                    }}>
                      unchanged ✓
                    </div>
                  </div>

                  {/* clone → "Houston" */}
                  <div style={{
                    opacity: res2Op,
                    transform: `scale(${res2Scale})`,
                    transformOrigin: "left center",
                    display: "flex", alignItems: "center", gap: 20,
                    padding: "6px 18px",
                    marginLeft: -18,
                    borderRadius: 10,
                  }}>
                    <span style={{ color: C.comment, fontSize: 34 }}>{"clone    →"}</span>
                    <span style={{ color: C.accentA }}>"Houston"</span>
                  </div>

                </div>
              </div>
            </div>
          </CodeWindow>
        </div>

        {/* ════ CHECKMARK PILLS ════ */}
        {/* Positioned below terminal, stacked */}
        <div style={{
          position: "absolute",
          top: "50%",
          marginTop: 340,
          display: "flex",
          flexDirection: "column",
          gap: 20,
          alignItems: "center",
        }}>
          <Pill opacity={pill1Op} y={pill1Y} label="No shared references" />
          <Pill opacity={pill2Op} y={pill2Y} label="No data loss" />
        </div>

      </div>
    </AbsoluteFill>
  );
};