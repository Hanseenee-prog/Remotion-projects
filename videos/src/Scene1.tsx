// Scene 1 — "The spread operator... shallow copy problem"
// 225 frames total
//
// Timeline:
//   0–12   : label slides + fades in
//   12–32  : label holds
//   32–46  : label fades out
//   36–62  : code window 1 scales up from bottom into center
//   64–80  : settled — all code visible
//   80–90  : everything EXCEPT clone line dims (fast, 10 frames)
//   96–140 : mutation line types in; clone line + all others dim during typing
//   140–160: window 1 exits completely (fade + fly up)
//   155–183: console window scales up from bottom into center
//   182–198: original → "Houston" 😱 appears
//   198–213: clone → "Houston" ✅ appears
//   213–225: red pulse intensifies

import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { COLORS, FONTS, SAFE, CANVAS } from "./tokens";

const C = COLORS;

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function prog(frame: number, start: number, end: number) {
  return clamp01((frame - start) / (end - start));
}

function tok(color: string, text: string) {
  return (
    <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>
      {text}
    </span>
  );
}

const FONT = 38;
const LH   = 1.9;
const DIM  = 0.15;

/* ─── Scene4-style Code Window with editor tab ─── */
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
    {/* Title bar */}
    <div style={{
      display: "flex", alignItems: "center",
      background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      paddingLeft: 24, height: 72,
    }}>
      {/* Traffic lights */}
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
        ))}
      </div>
      {/* Active editor tab */}
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
    {/* Code body */}
    <div style={{ padding: "36px 48px 44px" }}>{children}</div>
  </div>
);

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();

  // ── LABEL ──────────────────────────────────────────────────
  const labelIn  = easeOut(prog(frame, 0, 12));
  const labelOut = easeOut(prog(frame, 28, 36));
  const labelOp  = clamp01(labelIn - labelOut);
  const labelY   = (1 - labelIn) * 38;

  // ── WINDOW 1 ENTER ──────────────────────────────────────────
  const w1InP   = easeOut(prog(frame, 32, 44));
  const w1InY   = (1 - w1InP) * 500;
  const w1InOp  = clamp01(prog(frame, 32, 38));
  const w1Scale = 0.86 + w1InP * 0.14;

  // ── DIM OTHER LINES (fast, 10f) ─────────────────────────────
  const dimFast      = easeOut(prog(frame, 50, 57));
  const otherLineOp  = interpolate(dimFast, [0, 1], [1, DIM]);

  // ── MUTATION TYPING ─────────────────────────────────────────
  const mutFull   = `clone.address.city = "Houston";`;
  const totalChars = mutFull.length;
  const mutCount  = interpolate(frame, [96, 120], [0, totalChars], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const mutLineOp    = easeOut(prog(frame, 96, 106));
  const charsVisible = Math.floor(mutCount);
  // Clone line dims when mutation starts typing
  const cloneLineDim = interpolate(easeOut(prog(frame, 96, 105)), [0, 1], [1, DIM]);

  // ── WINDOW 1 EXIT ───────────────────────────────────────────
  const w1ExitP  = easeOut(prog(frame, 140, 150));
  const w1ExitOp = 1 - w1ExitP;
  const w1ExitY  = w1ExitP * -140;

  const w1FinalOp = w1InOp * w1ExitOp;
  const w1FinalY  = w1InY + w1ExitY;

  // ── WINDOW 2 ENTER ──────────────────────────────────────────
  const w2InP   = easeOut(prog(frame, 145, 163));
  const w2InY   = (1 - w2InP) * 500;
  const w2InOp  = clamp01(prog(frame, 155, 160));
  const w2Scale = 0.88 + w2InP * 0.12;

  // ── TERMINAL OUTPUT ─────────────────────────────────────────
  const res1Op   = easeOut(prog(frame, 172, 185));
  const res2Op   = easeOut(prog(frame, 185, 193));
  const bugPulse = easeOut(prog(frame, 213, 225));
  const bugScale = 0.86 + easeOut(prog(frame, 185, 193)) * 0.14;

  const cursorBlink = Math.floor(frame / 6) % 2 === 0;

  const mutTokens: Array<{ text: string; color: string }> = [
    { text: "clone",      color: C.codeText   },
    { text: ".",          color: C.punctuation },
    { text: "address",    color: C.property   },
    { text: ".",          color: C.punctuation },
    { text: "city",       color: C.property   },
    { text: " = ",        color: C.punctuation },
    { text: '"Houston"',  color: C.string     },
    { text: ";",          color: C.punctuation },
  ];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>

        {/* ════ LABEL ════ */}
        <div style={{
          position: "absolute",
          opacity: labelOp,
          transform: `translateY(${labelY}px)`,
          // Full-width so text-align center works across both lines
          width: "100%",
          textAlign: "center",
        }}>
          {/* Line 1: "The spread operator" */}
          <div style={{
            fontFamily: FONTS.display,
            fontSize: 72,
            fontWeight: 800,
            color: C.white,
            lineHeight: 1.2,
          }}>
            The{" "}
            <span style={{ color: C.accentA }}>
              spread operator
            </span>
          </div>

          {/* Line 2: "..." — centered under the line above */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginTop: 12,
          }}>
            <span style={{
              fontFamily: FONTS.display,
              fontSize: 72,
              fontWeight: 800,
              color: C.accentC,
              letterSpacing: 8,
              background: `${C.accentC}1A`,
              borderRadius: 14,
              padding: "2px 36px",
              lineHeight: 1.2,
            }}>
              ...
            </span>
          </div>
        </div>

        {/* ════ WINDOW 1 — object + clone + mutation ════ */}
        <div style={{
          position: "absolute",
          opacity: w1FinalOp,
          transform: `translateY(${w1FinalY}px) scale(${w1Scale})`,
          transformOrigin: "center center",
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="clone.js">
            <div style={{
              fontFamily: FONTS.mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH, whiteSpace: "pre",
            }}>

              {/* const original = { */}
              <div style={{ opacity: otherLineOp }}>
                {tok(C.keyword,      "const ")}
                {tok(C.codeText,     "original")}
                {tok(C.punctuation,  " = {")}
              </div>

              {/*   name: "Alice", */}
              <div style={{ opacity: otherLineOp }}>
                {"  "}
                {tok(C.property,    "name")}
                {tok(C.punctuation, ": ")}
                {tok(C.string,      '"Alice"')}
                {tok(C.punctuation, ",")}
              </div>

              {/*   address: { city: "London" } */}
              <div style={{ opacity: otherLineOp }}>
                {"  "}
                {tok(C.property,    "address")}
                {tok(C.punctuation, ": { ")}
                {tok(C.property,    "city")}
                {tok(C.punctuation, ": ")}
                {tok(C.string,      '"London"')}
                {tok(C.punctuation, " }")}
              </div>

              {/* } */}
              <div style={{ opacity: otherLineOp }}>
                {tok(C.punctuation, "}")}
              </div>

              {/* blank line */}
              <div style={{ height: `${FONT * LH}px` }} />

              {/* const clone = { ...original }; */}
              <div style={{ opacity: cloneLineDim }}>
                {tok(C.keyword,     "const ")}
                {tok(C.codeText,    "clone")}
                {tok(C.punctuation, " = { ")}
                {tok(C.punctuation, "...")}
                {tok(C.codeText,    "original")}
                {tok(C.punctuation, " };")}
              </div>

              {/* clone.address.city = "Houston" — typed */}
              <div style={{
                opacity: mutLineOp,
                display: "flex", alignItems: "center",
                height: `${FONT * LH}px`,
              }}>
                {(() => {
                  let cursor = 0;
                  return mutTokens.map((t, i) => {
                    const start = cursor;
                    cursor += t.text.length;
                    const visible = Math.max(0, Math.min(t.text.length, charsVisible - start));
                    if (visible <= 0) return null;
                    return (
                      <span key={i} style={{
                        color: t.color,
                        fontFamily: FONTS.mono,
                        whiteSpace: "pre",
                      }}>
                        {t.text.slice(0, visible)}
                      </span>
                    );
                  });
                })()}
                {/* blinking caret */}
                {charsVisible > 0 && charsVisible < totalChars && (
                  <span style={{
                    display: "inline-block",
                    width: 3, height: "0.82em",
                    background: C.accentA,
                    marginLeft: 3,
                    verticalAlign: "middle",
                    opacity: cursorBlink ? 1 : 0,
                  }} />
                )}
              </div>

            </div>
          </CodeWindow>
        </div>

        {/* ════ WINDOW 2 — console.log + terminal output ════ */}
        <div style={{
          position: "absolute",
          opacity: w2InOp,
          transform: `translateY(${w2InY}px) scale(${w2Scale})`,
          transformOrigin: "center center",
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="clone.js">

            {/* console.log lines */}
            <div style={{
              fontFamily: FONTS.mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH,
              whiteSpace: "pre", marginBottom: 32,
            }}>
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
            </div>

            {/* Terminal output */}
            <div style={{
              background: "#0A0F14",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              marginTop: 80,
              padding: "34px 36px",
              fontFamily: FONTS.mono,
              fontSize: 45,
              lineHeight: "70px",
            }}>
              {/* original → "Houston" 😱 */}
              <div style={{
                opacity: res1Op,
                display: "flex", alignItems: "center", gap: 18,
                background: `rgba(255,123,114,${res1Op * 0.12})`,
                borderLeft: `4px solid rgba(255,123,114,${res1Op})`,
                padding: "6px 16px", marginLeft: -16,
                borderRadius: 8,
              }}>
                <span style={{ color: C.comment, fontSize: 38 }}>original →</span>
                <span style={{ color: C.accentC }}>"Houston"</span>
              </div>

              {/* clone → "Houston" ✅ */}
              <div style={{
                opacity: res2Op,
                transform: `scale(${bugScale})`,
                display: "flex", alignItems: "center", gap: 18,
                padding: "6px 16px", marginLeft: -16,
                borderRadius: 8,
              }}>
                <span style={{ color: C.comment, fontSize: 38 }}>clone{"\u00A0\u00A0\u00A0\u00A0"}→</span>
                <span style={{ color: C.accentA }}>"Houston"</span>
              </div>
            </div>

          </CodeWindow>
        </div>

      </div>
    </AbsoluteFill>
  );
};