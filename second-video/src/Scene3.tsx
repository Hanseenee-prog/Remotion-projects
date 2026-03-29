// Scene 3 — "Discrete Values" — revised
//
// Changes from previous version:
//  - Cards slide in from their respective sides (right pair from right, left pair from left)
//    all at the same time, spring over ~10 frames
//  - "display: none" card — no background fill, border only
//  - Bottom row is now "flex-direction": left = row (3 mini-cards horizontal),
//    right = column (3 mini-cards stacked)
//  - Line + X icon removed → replaced with a big skip-next icon between cards
//  - Exit (165–172): cards slide back the way they came
//  - Code window (175–235): shows .card.show { opacity:1; display:block; transition: display 3s ease; }
//  - Blink fires on "transition: display 3s ease;" (NOT display: block), 3 pulses
//  - Code window exits at frame 235

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const RED_ACCENT = "#FF5F57";

// ─── Layout constants ─────────────────────────────────────────────────────────
const CARD_W       = 240;
const CARD_H       = 300;
const SPREAD       = 290;    // horizontal distance from center to each card's center
const VERTICAL_GAP = 290;    // vertical distance from center to each row
const SLIDE_DIST   = 720;    // off-screen start distance

// ─── Easing helpers ───────────────────────────────────────────────────────────
const easeOut3 = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack3 = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp3(val: number, min = 0, max = 1) {
  return Math.min(Math.max(val, min), max);
}
function prog3(frame: number, start: number, end: number) {
  return clamp3((frame - start) / (end - start));
}

// ─── Token system ─────────────────────────────────────────────────────────────
type TT =
  | "selector" | "property" | "value" | "keyword"
  | "fnName"   | "string"   | "comment" | "punctuation"
  | "varName"  | "operator";
interface Token { text: string; type: TT }

function tc(type: TT): string {
  switch (type) {
    case "selector":    return COLORS.selector;
    case "property":    return COLORS.property;
    case "value":       return COLORS.value;
    case "keyword":     return COLORS.keyword;
    case "fnName":      return COLORS.fnName;
    case "string":      return COLORS.string;
    case "comment":     return COLORS.comment;
    case "operator":    return COLORS.keyword;
    case "varName":     return COLORS.codeText;
    case "punctuation": return COLORS.punctuation;
    default:            return COLORS.codeText;
  }
}

// ─── Code line renderer ───────────────────────────────────────────────────────
const CodeLine: React.FC<{
  tokens: Token[];
  highlighted?: boolean;
}> = ({ tokens, highlighted = false }) => (
  <div style={{
    fontFamily: FONTS.mono,
    fontSize: 38,
    fontWeight: 700,
    lineHeight: 1.95,
    whiteSpace: "pre",
    borderRadius: 6,
    padding: "0 8px",
    margin: "0 -8px",
    background: highlighted ? `${RED_ACCENT}28` : "transparent",
    position: "relative",
  }}>
    {highlighted && (
      <div style={{
        position: "absolute",
        left: 0, top: "10%", bottom: "10%",
        width: 4, borderRadius: 2,
        background: RED_ACCENT,
      }} />
    )}
    {tokens.map((tok, i) => (
      <span key={i} style={{ color: tc(tok.type) }}>{tok.text}</span>
    ))}
  </div>
);

// ─── Code Window shell ────────────────────────────────────────────────────────
type FileType = "css" | "js";
const FILE_BADGE: Record<FileType, { bg: string; label: string }> = {
  css: { bg: "#6B4FBB", label: "css" },
  js:  { bg: "#C9A227", label: "js"  },
};
const FILE_NAME: Record<FileType, string> = {
  css: "style.css",
  js:  "script.js",
};
const CodeWindow: React.FC<{
  fileType: FileType;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({ fileType, style, children }) => {
  const badge = FILE_BADGE[fileType];
  const name  = FILE_NAME[fileType];
  return (
    <div style={{
      width: 920,
      borderRadius: 18,
      background: COLORS.codeBg,
      border: "1.5px solid rgba(255,255,255,0.09)",
      overflow: "hidden",
      boxShadow: "0 28px 72px rgba(0,0,0,0.70)",
      ...style,
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
          borderBottom: "none", marginBottom: -1,
        }}>
          <div style={{
            background: badge.bg, borderRadius: 5, padding: "2px 8px",
            fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
            color: "#fff", letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}>
            {badge.label}
          </div>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600,
            color: COLORS.offWhite, letterSpacing: "0.01em",
          }}>
            {name}
          </span>
        </div>
      </div>
      <div style={{ padding: "30px 44px 36px 44px" }}>{children}</div>
    </div>
  );
};

// ─── CSS token lines ──────────────────────────────────────────────────────────
const CSS_LINE_SELECTOR: Token[] = [
  { text: ".card",  type: "selector" },
  { text: ".",      type: "punctuation" },
  { text: "show",   type: "selector" },
  { text: " {",     type: "punctuation" },
];
const CSS_LINE_OPACITY: Token[] = [
  { text: "  opacity", type: "property" },
  { text: ": ",        type: "punctuation" },
  { text: "1",         type: "value" },
  { text: ";",         type: "punctuation" },
];
const CSS_LINE_DISPLAY: Token[] = [
  { text: "  display", type: "property" },
  { text: ": ",        type: "punctuation" },
  { text: "block",     type: "keyword" },
  { text: ";",         type: "punctuation" },
];
// transition: display 3s ease;  ← the blink target
const CSS_LINE_TRANSITION: Token[] = [
  { text: "  transition", type: "property" },
  { text: ": ",           type: "punctuation" },
  { text: "display",      type: "keyword" },
  { text: " 3s",          type: "value" },
  { text: " ease",        type: "value" },
  { text: ";",            type: "punctuation" },
];
const CSS_LINE_CLOSE: Token[] = [{ text: "}", type: "punctuation" }];

// ─── Skip-next icon ───────────────────────────────────────────────────────────
const SkipIcon: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div style={{
    opacity,
    transform: `scale(${scale})`,
    transformOrigin: "center",
    display: "flex", alignItems: "center", justifyContent: "center",
    width: 130, 
    height: 130,
    borderRadius: "50%",
    background: "rgba(255, 255, 255, 0.08)",
    border: "2px solid rgba(255, 255, 255, 0.15)",
  }}>
    <svg width="70" height="70" viewBox="0 0 24 24" fill="rgba(255,255,255,0.80)">
      {/* Left triangle */}
      <polygon points="5,4 15,12 5,20" />
      {/* Right triangle */}
      <polygon points="13,4 23,12 13,20" />
      {/* Vertical bar on right */}
      <rect x="21.5" y="4" width="2.5" height="16" rx="1" />
    </svg>
  </div>
);

// ─── Mini flex demo ───────────────────────────────────────────────────────────
const MiniSquare: React.FC<{ color: string }> = ({ color }) => (
  <div style={{
    width: 34, height: 34, borderRadius: 5,
    background: `${color}90`, border: `2px solid ${color}`,
  }} />
);

const RowDemo: React.FC = () => (
  <div style={{ 
    display: "flex", flexDirection: "row", gap: 7, alignItems: "center", justifyContent: "center",
    background: "#080808", // Distinguishable dark shade
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  }}>
    {[0, 1, 2].map((i) => <MiniSquare key={i} color="#FF9500" />)}
  </div>
);
const ColDemo: React.FC = () => (
  <div style={{ 
    display: "flex", flexDirection: "column", gap: 7, alignItems: "center", justifyContent: "center",
    background: "#080808", // Distinguishable dark shade
    padding: "14px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.05)",
  }}>
    {[0, 1, 2].map((i) => <MiniSquare key={i} color="#FF9500" />)}
  </div>
);

// ─── Card shells ──────────────────────────────────────────────────────────────
// displayNone → no background
const DisplayCard: React.FC<{
  value: "none" | "block";
  accent: string;
  textOpacity: number;
  translateX: number;
}> = ({ value, accent, textOpacity, translateX }) => (
  <div style={{ transform: `translateX(${translateX}px)`, willChange: "transform" }}>
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 24,
      background: value === "none" ? "transparent" : COLORS.codeBg,
      border: `4px solid ${accent}`,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      boxShadow: value === "none" ? "none" : "0 30px 60px rgba(0,0,0,0.5)",
      gap: 10,
    }}>
      <div style={{ opacity: textOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <div style={{ color: COLORS.comment, fontFamily: FONTS.mono, fontSize: 27, fontWeight: 700 }}>
          display:
        </div>
        <div style={{ color: COLORS.offWhite, fontFamily: FONTS.mono, fontSize: 50, fontWeight: 800, lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </div>
  </div>
);

const FlexCard: React.FC<{
  direction: "row" | "column";
  accent: string;
  textOpacity: number;
  translateX: number;
}> = ({ direction, accent, textOpacity, translateX }) => (
  <div style={{ transform: `translateX(${translateX}px)`, willChange: "transform" }}>
    <div style={{
      width: CARD_W, height: CARD_H, borderRadius: 24,
      background: COLORS.codeBg,
      border: `4px solid ${accent}`,
      display: "flex", flexDirection: "column",
      justifyContent: "center", alignItems: "center",
      boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
      gap: 14,
    }}>
      <div style={{ opacity: textOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ color: COLORS.comment, fontFamily: FONTS.mono, fontSize: 22, fontWeight: 700 }}>
          flex-direction:
        </div>
        <div style={{ color: COLORS.offWhite, fontFamily: FONTS.mono, fontSize: 40, fontWeight: 800, lineHeight: 1 }}>
          {direction}
        </div>
        <div style={{ marginTop: 6 }}>
          {direction === "row" ? <RowDemo /> : <ColDemo />}
        </div>
      </div>
    </div>
  </div>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Callout entrance ──────────────────────────────────────────────────────
  const calloutIn = spring({ frame: frame - 5, fps });

  // ── Card slide-in (frames 0–~10, spring settles fast) ────────────────────
  const slideSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 210, mass: 0.75 },
    durationInFrames: 20,
  });
  // Left cards: -SLIDE_DIST → -SPREAD  |  Right cards: +SLIDE_DIST → +SPREAD
  const leftX  = interpolate(slideSpring, [0, 1], [-SLIDE_DIST, -SPREAD]);
  const rightX = interpolate(slideSpring, [0, 1], [ SLIDE_DIST,  SPREAD]);

  // ── Text fade in ─────────────────────────────────────────────────────────
  const textFadeIn = interpolate(frame, [16, 36], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Skip icon entrance ────────────────────────────────────────────────────
  const skipPop = spring({ frame: frame - 30, fps, config: { stiffness: 200, damping: 12 } });
  const skipOpacity = interpolate(frame, [30, 42], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── EXIT (165–172): slide back the way cards came ─────────────────────────
  const exitP     = prog3(frame, 165, 172);
  const exitEased = easeOut3(exitP);
  const isExiting = frame >= 165;

  // During exit, override positions: left goes back to -SLIDE_DIST, right to +SLIDE_DIST
  const finalLeftX  = isExiting
    ? interpolate(exitEased, [0, 1], [-SPREAD, -SLIDE_DIST])
    : leftX;
  const finalRightX = isExiting
    ? interpolate(exitEased, [0, 1], [SPREAD, SLIDE_DIST])
    : rightX;

  const exitGroupOpacity = interpolate(exitEased, [0, 1], [1, 0]);
  const calloutExitOp    = interpolate(frame, [165, 170], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const skipExitOp = interpolate(frame, [165, 169], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Code window (frames 175–235) ─────────────────────────────────────────
  const winInP     = prog3(frame, 175, 183);
  const winScale   = interpolate(easeOutBack3(clamp3(winInP)), [0, 1], [0.36, 1]);
  const winOpacity = interpolate(easeOut3(clamp3(winInP)),     [0, 1], [0, 1]);
  const winVisible = frame >= 175 && frame < 250;

  // Exit at 235
  const winExitP       = prog3(frame, 235, 248);
  const winExitY       = interpolate(easeOut3(winExitP), [0, 1], [0, 120]);
  const winExitOpacity = interpolate(easeOut3(winExitP), [0, 1], [1, 0]);

  // 3 blink pulses on "transition: display 3s ease;"
  // Pulse 1: 190–196  |  Pulse 2: 203–209  |  Pulse 3: 216–222
  const blinkOn =
    (frame >= 190 && frame < 197) ||
    (frame >= 204 && frame < 211) ||
    (frame >= 218 && frame < 225);

  const winFinalOpacity = winVisible
    ? winExitP > 0 ? winOpacity * winExitOpacity : winOpacity
    : 0;
  const winFinalY = winExitP > 0 ? winExitY : 0;

  return (
    <AbsoluteFill style={{ background: "transparent", alignItems: "center", justifyContent: "center" }}>

      {/* ── Discrete values callout ────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: 100,
        padding: "14px 50px",
        borderRadius: 50,
        background: `${RED_ACCENT}15`,
        border: `2px solid ${RED_ACCENT}`,
        opacity: Math.min(Number(calloutIn), calloutExitOp),
        transform: `scale(${calloutIn}) translateY(${interpolate(calloutIn, [0, 1], [20, 0])}px)`,
        zIndex: 20,
      }}>
        <span style={{
          fontFamily: FONTS.display,
          fontSize: 38, fontWeight: 800,
          color: RED_ACCENT, letterSpacing: "0.02em",
        }}>
          Discrete values
        </span>
      </div>

      {/* ── Cards area ─────────────────────────────────────────────────── */}
      <div style={{
        position: "relative",
        width: "100%", height: "100%",
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: isExiting ? exitGroupOpacity : 1,
      }}>

        {/* ── ROW 1 top — display: none / block ────────────────────────── */}
        <div style={{
          position: "absolute",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%",
          transform: `translateY(${-VERTICAL_GAP}px)`,
        }}>
          {/* Skip icon center */}
          <div style={{ position: "absolute", zIndex: 5, opacity: skipOpacity * skipExitOp }}>
            <SkipIcon scale={skipPop} opacity={1} />
          </div>

          {/* Left card: display none — border only */}
          <div style={{ position: "absolute", transform: `translateX(${finalLeftX}px)` }}>
            <DisplayCard value="none" accent={RED_ACCENT} textOpacity={textFadeIn} translateX={0} />
          </div>

          {/* Right card: display block */}
          <div style={{ position: "absolute", transform: `translateX(${finalRightX}px)` }}>
            <DisplayCard value="block" accent={COLORS.selector} textOpacity={textFadeIn} translateX={0} />
          </div>
        </div>

        {/* ── ROW 2 bottom — flex-direction: row / column ──────────────── */}
        <div style={{
          position: "absolute",
          display: "flex", alignItems: "center", justifyContent: "center",
          width: "100%",
          transform: `translateY(${VERTICAL_GAP}px)`,
        }}>
          {/* Skip icon center */}
          <div style={{ position: "absolute", zIndex: 5, opacity: skipOpacity * skipExitOp }}>
            <SkipIcon scale={skipPop} opacity={1} />
          </div>

          {/* Left card: flex-direction row */}
          <div style={{ position: "absolute", transform: `translateX(${finalLeftX}px)` }}>
            <FlexCard direction="row" accent={RED_ACCENT} textOpacity={textFadeIn} translateX={0} />
          </div>

          {/* Right card: flex-direction column */}
          <div style={{ position: "absolute", transform: `translateX(${finalRightX}px)` }}>
            <FlexCard direction="column" accent={COLORS.selector} textOpacity={textFadeIn} translateX={0} />
          </div>
        </div>

      </div>

      {/* ── Code window (175–235) ──────────────────────────────────────── */}
      {winVisible && (
        <div style={{
          position: "absolute",
          opacity: winFinalOpacity,
          transform: `scale(${winInP < 1 ? winScale : 1}) translateY(${winFinalY}px)`,
          transformOrigin: "center center",
          willChange: "transform, opacity",
          zIndex: 30,
        }}>
          <CodeWindow fileType="css">
            <CodeLine tokens={CSS_LINE_SELECTOR} />
            <CodeLine tokens={CSS_LINE_OPACITY} />
            {/* display: block — no highlight */}
            <CodeLine tokens={CSS_LINE_DISPLAY} />
            {/* transition: display 3s ease; — BLINKS */}
            <div style={{ position: "relative", borderRadius: 6, overflow: "hidden" }}>
              <div style={{
                position: "absolute", inset: 0,
                background: `${RED_ACCENT}22`,
                borderLeft: `4px solid ${RED_ACCENT}`,
                opacity: blinkOn ? 1 : 0,
                borderRadius: 6,
                pointerEvents: "none",
              }} />
              <CodeLine tokens={CSS_LINE_TRANSITION} highlighted={blinkOn} />
            </div>
            <CodeLine tokens={CSS_LINE_CLOSE} />
          </CodeWindow>
        </div>
      )}

    </AbsoluteFill>
  );
};