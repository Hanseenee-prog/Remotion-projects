import React from "react";
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;

function tok(color: string, text: string) {
  return (
    <span style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>
      {text}
    </span>
  );
}

const FONT = 32;
const LH = 1.6;

/* ─── Mini Code Card (No Editor Tab, Includes Terminal) ─── */
const MiniCodeCard: React.FC<{
  code: React.ReactNode;
  output: React.ReactNode;
  description: string;
  scale: number;
}> = ({ code, output, description, scale }) => {
  return (
    <div style={{
      width: 950,
      borderRadius: 18,
      background: C.codeBg,
      border: `1.5px solid ${C.border}`,
      overflow: "hidden",
      boxShadow: "0 20px 50px rgba(0,0,0,0.6)",
      transform: `scale(${scale})`,
      opacity: scale > 0.1 ? 1 : 0,
    }}>
      {/* Slim Title Bar (Traffic Lights Only) */}
      <div style={{
        display: "flex", alignItems: "center",
        background: "#0D1117",
        borderBottom: `1px solid ${C.border}`,
        paddingLeft: 24, height: 50,
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
        </div>
      </div>
      
      {/* Body: Code, Terminal, and Description */}
      <div style={{ padding: "30px 40px" }}>
        {/* Code Line */}
        <div style={{
          fontFamily: FONTS.mono, fontSize: FONT,
          fontWeight: 700, lineHeight: LH,
        }}>
          {code}
        </div>

        {/* Terminal Output */}
        <div style={{
          background: "#0A0F14",
          borderRadius: 10,
          border: `1px solid rgba(255,255,255,0.06)`,
          marginTop: 20,
          padding: "16px 24px",
          fontFamily: FONTS.mono,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <span style={{ color: C.comment }}>{">"}</span>
          {output}
        </div>

        {/* Description Text */}
        <div style={{
          marginTop: 18,
          fontFamily: FONTS.display,
          fontSize: 24,
          color: "rgb(163, 163, 0)", // Red/Warning color for the problem description
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}>
          <span style={{ fontSize: 26, marginBottom: 10 }}>⚠️</span> {description}
        </div>
      </div>
    </div>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ─── TIMING ───────────────────────────────────────────────
  // Cards pop out sequentially. Using springs for a smooth pop effect.
  const card1Scale = spring({ frame, fps, from: 0, to: 1, delay: 10, config: { damping: 16, stiffness: 150 } });
  const card2Scale = spring({ frame, fps, from: 0, to: 1, delay: 50, config: { damping: 16, stiffness: 150 } });
  const card3Scale = spring({ frame, fps, from: 0, to: 1, delay: 90, config: { damping: 16, stiffness: 150 } });

  return (
    <AbsoluteFill style={{ background: "transparent", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: `${SAFE.top}px ${SAFE.left}px`,
        gap: 100, // Space between stacked cards
      }}>

        {/* ════ CARD 1: Dates Break ════ */}
        <MiniCodeCard 
          scale={card1Scale}
          code={
            <>
              {tok(C.fnName, "console")}{tok(C.punctuation, ".")}{tok(C.fnName, "log")}{tok(C.punctuation, "(")}
              {tok(C.keyword, "typeof ")}{tok(C.codeText, "clone")}{tok(C.punctuation, ".")}{tok(C.property, "joined")}
              {tok(C.punctuation, ");")}
            </>
          }
          output={tok(C.string, '"string"')}
          description="It's no longer a Date object! .getFullYear() will fail."
        />

        {/* ════ CARD 2: Undefined Disappears ════ */}
        <MiniCodeCard 
          scale={card2Scale}
          code={
            <>
              {tok(C.fnName, "console")}{tok(C.punctuation, ".")}{tok(C.fnName, "log")}{tok(C.punctuation, "(")}
              {tok(C.string, '"stats"')}{tok(C.keyword, " in ")}{tok(C.codeText, "clone")}
              {tok(C.punctuation, ");")}
            </>
          }
          output={tok(C.accentC, "false")} // Red for false
          description="The 'undefined' key is completely GONE."
        />

        {/* ════ CARD 3: Sets/Maps Empty ════ */}
        <MiniCodeCard 
          scale={card3Scale}
          code={
            <>
              {tok(C.fnName, "console")}{tok(C.punctuation, ".")}{tok(C.fnName, "log")}{tok(C.punctuation, "(")}
              {tok(C.codeText, "clone")}{tok(C.punctuation, ".")}{tok(C.property, "favorites")}
              {tok(C.punctuation, ");")}
            </>
          }
          output={tok(C.punctuation, "{}")}
          description="Sets and Maps turn into empty objects."
        />

      </div>
    </AbsoluteFill>
  );
};