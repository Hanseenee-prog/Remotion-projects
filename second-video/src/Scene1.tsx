import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Inline syntax token ──────────────────────────────────────────────────────
const Tok: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ color }}>{children}</span>
);

// ─── Syntax palette ───────────────────────────────────────────────────────────
const SYN = {
  plain:   "#ABB2BF",
  method:  "#C678DD",  // purple — forEach, addEventListener, backgroundColor
  string:  "#A5D6FF",  // light blue
  ident:   "#D19A66",  // orange — named param e.g. button in forEach((button))
  arrow:   "#E06C75",  // coral — => and =
  punct:   "#ABB2BF",
  cursor:  "#FFFFFF",
};

// ─── Layout constants ─────────────────────────────────────────────────────────
// font 56px — big and visible. Each line div has overflow:hidden so
// the width-reveal typewriter still works even though text is wider than the window.
const WIN_W      = 1040;
const FONT_SIZE  = 43;
const FONT_W     = 600;   // bold
const BOTTOM_PAD = 250;
const VIDEO_H    = 1920;
// titlebar 96 + padding (44+52) + 3 lines × (56×1.85≈104px) = 96+96+312 = 504
const WIN_H_EST  = 504;

// Typing frame ranges
const TYPE1_START = 10;
const TYPE1_END   = 38;
const TYPE3_START = 38;
const TYPE3_END   = 44;
const TYPE2_START = 75;
const TYPE2_END   = 112;

export const Scene01Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 1. Window: slide in from top, scale up ────────────────────────────────
  const entranceY     = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const windowY       = interpolate(entranceY, [0, 1], [-900, 0]);

  const entranceScale = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const windowScale   = interpolate(entranceScale, [0, 1], [0.6, 1]);

  // ── 2. Window shifts down — bottom lands at VIDEO_H − BOTTOM_PAD ─────────
  const centeredTop  = VIDEO_H / 2 - WIN_H_EST / 2;
  const targetTop    = VIDEO_H - BOTTOM_PAD - WIN_H_EST;
  const shiftAmount  = targetTop - centeredTop;

  const shiftSpring  = spring({ frame: frame - 45, fps, config: { damping: 14, stiffness: 90 } });
  const windowShift  = interpolate(shiftSpring, [0, 1], [0, shiftAmount]);
  const finalWindowY = windowY + windowShift;

  // ── 3. Button: exaggerated pop-in ─────────────────────────────────────────
  const btnEntrance   = spring({ frame: frame - 55, fps, config: { damping: 8, mass: 0.8, stiffness: 150 } });
  const finalBtnScale = btnEntrance;
  const btnOpacity    = btnEntrance > 0.01 ? 1 : 0;

  // ── 4. Typewriter — width interpolation ───────────────────────────────────
  const typeLine1 = interpolate(frame, [TYPE1_START, TYPE1_END], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const typeLine3 = interpolate(frame, [TYPE3_START, TYPE3_END], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const typeLine2 = interpolate(frame, [TYPE2_START, TYPE2_END], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 5. Cursor — blinks every 8 frames while actively typing ──────────────
  const cursorOn   = Math.floor(frame / 8) % 2 === 0;
  const cursorChar = cursorOn ? "▌" : " ";

  const showCursor1 = frame >= TYPE1_START && frame < TYPE1_END;
  const showCursor3 = frame >= TYPE3_START && frame < TYPE3_END;
  const showCursor2 = frame >= TYPE2_START && frame < TYPE2_END;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>

      {/* ── Button — lower on screen, bigger, neutral emoji ─────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "32%",   // moved down from 24%
          transform: `scale(${finalBtnScale})`,
          opacity: btnOpacity,
          zIndex: 10,
        }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            color: "#111111",
            width: 420,
            height: 130,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontSize: 46,
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.02em",
            boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          }}
        >
          Click Me
          <span style={{ fontSize: 48, lineHeight: 1 }}>😐</span>
        </div>
      </div>

      {/* ── Code Window ───────────────────────────────────────────────────── */}
      <div
        style={{
          transform: `translateY(${finalWindowY}px) scale(${windowScale})`,
          zIndex: 5,
          width: WIN_W,
          background: "#0D1117",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >

        {/* ── Title bar ── */}
        <div
          style={{
            height: 96,
            background: "#161B22",
            display: "flex",
            alignItems: "center",
            padding: "0 32px",
            position: "relative",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Traffic light dots */}
          <div style={{ display: "flex", gap: 12 }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
              <div
                key={c}
                style={{ width: 20, height: 20, borderRadius: "50%", background: c }}
              />
            ))}
          </div>

          {/* Editor tab */}
          <div
            style={{
              position: "absolute",
              left: 148,
              bottom: 0,
              height: 72,
              background: "#0D1117",
              padding: "0 32px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              borderRadius: "10px 10px 0 0",
              fontSize: 26,
              fontWeight: 500,
              color: "#E6EDF3",
            }}
          >
            {/* JS badge */}
            <div
              style={{
                background: "#F7DF1E",
                color: "#000",
                fontWeight: 900,
                fontSize: 18,
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                padding: "0 3px 2px 0",
                borderRadius: 5,
                fontFamily: "sans-serif",
                flexShrink: 0,
              }}
            >
              JS
            </div>
            scripts.js
          </div>
        </div>

        {/* ── Code body — overflow hidden so large text doesn't bleed ── */}
        <div
          style={{
            padding: "44px 48px 52px",
            fontSize: FONT_SIZE,
            fontWeight: FONT_W,
            lineHeight: 1.85,
            color: SYN.plain,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            overflow: "hidden",
          }}
        >

          {/* Line 1: button.addEventListener('click', () => { */}
          <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
            <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${typeLine1}%` }}>
              <Tok color={SYN.plain}>button.</Tok>
              <Tok color={SYN.method}>addEventListener</Tok>
              <Tok color={SYN.punct}>(</Tok>
              <Tok color={SYN.string}>'click'</Tok>
              <Tok color={SYN.punct}>, () </Tok>
              <Tok color={SYN.arrow}>={">"}</Tok>
              <Tok color={SYN.punct}> {"{"}</Tok>
            </div>
            {showCursor1 && (
              <span style={{ color: SYN.cursor, fontWeight: 400, marginLeft: 2 }}>
                {cursorChar}
              </span>
            )}
          </div>

          {/* Line 2: button.style.backgroundColor = 'red'; */}
          {frame >= TYPE2_START && (
            <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap", paddingLeft: 64 }}>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${typeLine2}%` }}>
                <Tok color={SYN.plain}>button.style.</Tok>
                <Tok color={SYN.method}>backgroundColor</Tok>
                <Tok color={SYN.punct}> </Tok>
                <Tok color={SYN.arrow}>=</Tok>
                <Tok color={SYN.punct}> </Tok>
                <Tok color={SYN.string}>'red'</Tok>
                <Tok color={SYN.punct}>;</Tok>
              </div>
              {showCursor2 && (
                <span style={{ color: SYN.cursor, fontWeight: 400, marginLeft: 2 }}>
                  {cursorChar}
                </span>
              )}
            </div>
          )}

          {/* Line 3: }); */}
          {frame >= TYPE3_START && (
            <div style={{ display: "flex", alignItems: "center", whiteSpace: "nowrap" }}>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${typeLine3}%` }}>
                <Tok color={SYN.plain}>{"});"}</Tok>
              </div>
              {showCursor3 && (
                <span style={{ color: SYN.cursor, fontWeight: 400, marginLeft: 2 }}>
                  {cursorChar}
                </span>
              )}
            </div>
          )}

        </div>
      </div>

    </AbsoluteFill>
  );
};