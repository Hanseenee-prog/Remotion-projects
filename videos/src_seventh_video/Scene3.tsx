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
    <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>
      {text}
    </span>
  );
}

const FONT = 38;
const LH = 1.7;
const DIM = 0.2;

const CodeWindow: React.FC<{
  tabLabel: string;
  tabColor: string;
  fileName: string;
  children: React.ReactNode;
}> = ({ tabLabel, tabColor, fileName, children }) => (
  <div style={{
    width: 1000,
    borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.8)",
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
    <div style={{ padding: "40px 48px 48px" }}>{children}</div>
  </div>
);

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();

  // ─── TIMING (Balanced for 120f) ───────────────────────────────
  const winInP = easeOut(prog(frame, 0, 12));
  const winY = (1 - winInP) * 200;
  const winOp = clamp01(prog(frame, 0, 8));

  // Dimming happens as typing starts
  const dimP = easeOut(prog(frame, 45, 55));
  const topBlockOpacity = interpolate(dimP, [0, 1], [1, DIM]);

  const typeStart = 48;
  const typeEnd = 90;
  
  // Script with manual indentation (\u00A0 is a non-breaking space)
  const fullScript = [
    `const clone = JSON.parse(`,
    `\u00A0\u00A0JSON.stringify(original)`,
    `);`
  ];
  
  const totalLength = fullScript.join("\n").length;
  const charsVisible = Math.floor(interpolate(frame, [typeStart, typeEnd], [0, totalLength], { extrapolateRight: "clamp" }));
  const cursorBlink = Math.floor(frame / 6) % 2 === 0;

  const renderTypedLine = (lineIdx: number) => {
    const text = fullScript[lineIdx];
    const prevLinesLength = fullScript.slice(0, lineIdx).join("\n").length + (lineIdx > 0 ? 1 : 0);
    const visibleInThisLine = Math.max(0, Math.min(text.length, charsVisible - prevLinesLength));
    
    if (visibleInThisLine <= 0 && charsVisible < prevLinesLength) return null;

    const visibleText = text.slice(0, visibleInThisLine);
    
    return (
      <div key={lineIdx} style={{ height: FONT * LH, whiteSpace: "pre" }}>
        {visibleText.split(/(\.|\(|\)|const |JSON|parse|stringify|original)/).map((part, i) => {
          let color = C.codeText;
          if (part === "const ") color = C.keyword;
          if (part === "JSON") color = C.property;
          if (part === "parse" || part === "stringify") color = C.fnName;
          if (["(", ")", ".", ";"].includes(part)) color = C.punctuation;
          return <span key={i} style={{ color, fontFamily: FONTS.mono }}>{part}</span>;
        })}
        {/* Typing cursor */}
        {charsVisible >= prevLinesLength && charsVisible < prevLinesLength + text.length && cursorBlink && (
           <span style={{ display: "inline-block", width: 3, height: "0.8em", background: C.accentA, marginLeft: 2, verticalAlign: "middle" }} />
        )}
      </div>
    );
  };

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          opacity: winOp,
          transform: `translateY(${winY}px)`,
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="clone.js">
            
            {/* ════ OBJECT BLOCK (John) ════ */}
            <div style={{
              opacity: topBlockOpacity,
              fontFamily: FONTS.mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH, whiteSpace: "pre",
            }}>
              <div>{tok(C.keyword, "const ")}{tok(C.codeText, "original")}{tok(C.punctuation, " = {")}</div>
              <div>{"  "}{tok(C.property, "name")}{tok(C.punctuation, ": ")}{tok(C.string, '"John"')}{tok(C.punctuation, ",")}</div>
              <div>{"  "}{tok(C.property, "joined")}{tok(C.punctuation, ": ")}{tok(C.keyword, "new ")}{tok(C.fnName, "Date")}{tok(C.punctuation, "(),")}</div>
              <div>{"  "}{tok(C.property, "stats")}{tok(C.punctuation, ": ")}{tok(C.value, "undefined")}{tok(C.punctuation, ",")}</div>
              <div>{"  "}{tok(C.property, "favorites")}{tok(C.punctuation, ": ")}{tok(C.keyword, "new ")}{tok(C.fnName, "Set")}{tok(C.punctuation, "([")}{tok(C.number, "1")}{tok(C.punctuation, ", ")}{tok(C.number, "2")}{tok(C.punctuation, "])")}</div>
              <div>{tok(C.punctuation, "};")}</div>
            </div>

            <div style={{ height: 20 }}></div>

            {/* ════ TYPING BLOCK (3-line clone) ════ */}
            <div style={{
              marginTop: 25,
              fontFamily: FONTS.mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH,
            }}>
              {renderTypedLine(0)}
              {renderTypedLine(1)}
              {renderTypedLine(2)}
            </div>
            
          </CodeWindow>
        </div>
      </div>
    </AbsoluteFill>
  );
};