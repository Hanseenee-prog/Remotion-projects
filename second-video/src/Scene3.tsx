// Scene 3 — "Discrete Values"
// Total duration: 215 frames
//
// Frames   0–160  : Original scene — unchanged
// Frames 160–170  : Everything exits (cards + callout slide/fade out)
// Frames 180–205  : style.css code window zooms in (same as Scene 1 Window A)
//                   — shows .card.show { opacity: 1; display: block; }
//                   — transition line red-highlight blinks at ~frame 192
// Frames 205–215  : Code window exits (slides down + fades out)

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

// ─── Dimensions (unchanged from original) ────────────────────────────────────
const START_W = 220;
const START_H = 280;
const END_W = 240;
const END_H = 320;
const START_SPREAD = 330;
const END_SPREAD = 280;
const VERTICAL_GAP = 280;

// ─── Easing helpers (needed for code window) ─────────────────────────────────
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

// ─── Token system (copy of Scene 1's — keeps it self-contained) ──────────────
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
const CODE_FONT_SIZE = 38;
const CODE_LINE_HEIGHT = 1.95;

const CodeLine: React.FC<{
  tokens: Token[];
  highlighted?: boolean; // red blink highlight for the transition line
}> = ({ tokens, highlighted = false }) => (
  <div style={{
    fontFamily: FONTS.mono,
    fontSize: CODE_FONT_SIZE,
    fontWeight: 700,
    lineHeight: CODE_LINE_HEIGHT,
    whiteSpace: "pre",
    borderRadius: 6,
    padding: "0 8px",
    margin: "0 -8px",
    background: highlighted ? `${RED_ACCENT}28` : "transparent",
    transition: "background 0.1s",
    position: "relative",
  }}>
    {/* Left accent bar when highlighted */}
    {highlighted && (
      <div style={{
        position: "absolute",
        left: 0,
        top: "10%",
        bottom: "10%",
        width: 4,
        borderRadius: 2,
        background: RED_ACCENT,
      }} />
    )}
    {tokens.map((tok, i) => (
      <span key={i} style={{ color: tc(tok.type) }}>{tok.text}</span>
    ))}
  </div>
);

// ─── Code Window shell (identical to Scene 1) ────────────────────────────────
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
      {/* Title bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        background: "#0D1117",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingLeft: 24,
        height: 72,
      }}>
        <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: COLORS.codeBg,
          borderRadius: "8px 8px 0 0",
          padding: "10px 24px 10px 16px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none",
          marginBottom: -1,
        }}>
          <div style={{
            background: badge.bg,
            borderRadius: 5,
            padding: "2px 8px",
            fontFamily: FONTS.mono,
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}>
            {badge.label}
          </div>
          <span style={{
            fontFamily: FONTS.mono,
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.offWhite,
            letterSpacing: "0.01em",
          }}>
            {name}
          </span>
        </div>
      </div>
      {/* Code body */}
      <div style={{ padding: "30px 44px 36px 44px" }}>
        {children}
      </div>
    </div>
  );
};

// ─── CSS token lines for the snippet ─────────────────────────────────────────
// .card.show {
const CSS_LINE_SELECTOR: Token[] = [
  { text: ".card",  type: "selector"    },
  { text: ".",      type: "punctuation" },
  { text: "show",   type: "selector"    },
  { text: " {",     type: "punctuation" },
];
//   opacity: 1;
const CSS_LINE_OPACITY: Token[] = [
  { text: "  opacity", type: "property"    },
  { text: ": ",        type: "punctuation" },
  { text: "1",         type: "value"       },
  { text: ";",         type: "punctuation" },
];
//   display: block;
const CSS_LINE_DISPLAY: Token[] = [
  { text: "  display", type: "property"    },
  { text: ": ",        type: "punctuation" },
  { text: "block",     type: "keyword"     },
  { text: ";",         type: "punctuation" },
];
// }
const CSS_LINE_CLOSE: Token[] = [
  { text: "}", type: "punctuation" },
];

// ─── Original sub-components (unchanged) ─────────────────────────────────────
const DiscreteCard: React.FC<{
  property: string;
  value: string;
  accent: string;
  textOpacity: number;
  width: number;
  height: number;
}> = ({ property, value, accent, textOpacity, width, height }) => (
  <div style={{
    width,
    height,
    borderRadius: 24,
    background: COLORS.codeBg,
    border: `4px solid ${accent}`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `0 30px 60px rgba(0,0,0,0.6)`,
    zIndex: 100,
  }}>
    <div style={{ opacity: textOpacity, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ color: COLORS.comment, fontFamily: FONTS.mono, fontSize: 32, marginBottom: 12 }}>
        {property}:
      </div>
      <div style={{ color: COLORS.offWhite, fontFamily: FONTS.mono, fontSize: 56, fontWeight: 800 }}>
        {value}
      </div>
    </div>
  </div>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══════════════════════════════════════════════════════════════════════════
  //  ORIGINAL SCENE LOGIC — UNTOUCHED
  // ══════════════════════════════════════════════════════════════════════════

  // 1. Core Transition Spring (Frames 10-45)
  const transition = spring({
    frame: frame - 10,
    fps,
    config: { damping: 16, stiffness: 90 },
  });

  const currentWidth  = interpolate(transition, [0, 1], [START_W, END_W]);
  const currentHeight = interpolate(transition, [0, 1], [START_H, END_H]);
  const currentSpread = interpolate(transition, [0, 1], [START_SPREAD, END_SPREAD]);

  const topY    = interpolate(transition, [0, 1], [0, -VERTICAL_GAP]);
  const bottomY = interpolate(transition, [0, 1], [0,  VERTICAL_GAP]);

  // 2. UI Elements
  const calloutIn        = spring({ frame: frame - 5, fps });
  const textFadeIn       = interpolate(frame, [25, 45], [0, 1]);
  const connectorOpacity = interpolate(frame, [35, 50], [0, 1]);
  const errorPop         = spring({ frame: frame - 50, fps, config: { stiffness: 200, damping: 12 } });

  const BrokenConnector = () => (
    <div style={{
      position: "absolute",
      width: currentSpread * 2,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      opacity: connectorOpacity,
      zIndex: -1,
    }}>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.5)", borderRadius: 4 }} />
      <div style={{ transform: `scale(${errorPop})`, margin: "0 40px" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: RED_ACCENT,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 50px ${RED_ACCENT}88`,
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </div>
      </div>
      <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.5)", borderRadius: 4 }} />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  //  EXIT ANIMATION — Frames 160–170
  // ══════════════════════════════════════════════════════════════════════════

  // Smooth cubic exit for all existing elements
  const exitP = prog3(frame, 160, 170);
  const exitEased = easeOut3(exitP);

  // Cards slide outward and fade
  const exitScale   = interpolate(exitEased, [0, 1], [1, 0.85]);
  const exitOpacity = interpolate(exitEased, [0, 1], [1, 0]);
  const exitTopDrift    = interpolate(exitEased, [0, 1], [0, -60]);
  const exitBottomDrift = interpolate(exitEased, [0, 1], [0,  60]);

  // Callout fades earlier (slightly leads the exit)
  const calloutExitOpacity = interpolate(frame, [160, 167], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ══════════════════════════════════════════════════════════════════════════
  //  CODE WINDOW — Frames 180–205 in, 205–215 out
  // ══════════════════════════════════════════════════════════════════════════

  // Zoom-in entrance (frames 180–187) — easeOutBack for springy overshoot
  const winInP     = prog3(frame, 180, 187);
  const winScale   = interpolate(easeOutBack3(clamp3(winInP)), [0, 1], [0.36, 1]);
  const winOpacity = interpolate(easeOut3(clamp3(winInP)),     [0, 1], [0,    1]);
  const winVisible = frame >= 180 && frame < 240;

  // Exit (frames 205–240) — slides down and fades
  const winExitP       = prog3(frame, 205, 240);
  const winExitY       = interpolate(easeOut3(winExitP), [0, 1], [0, 120]);
  const winExitOpacity = interpolate(easeOut3(winExitP), [0, 1], [1, 0]);

  // Red highlight blink on the `display: block;` line
  // Blinks on/off twice between frames 192–204
  // Pattern: on 192–196, off 196–200, on 200–204
  const blinkOn =
    (frame >= 192 && frame < 197) ||
    (frame >= 200 && frame < 205);
  const highlightOpacity = blinkOn ? 1 : 0;

  // Combine entrance + exit opacity
  const winFinalOpacity = winVisible
    ? winExitP > 0
      ? winOpacity * winExitOpacity
      : winOpacity
    : 0;
  const winFinalY = winExitP > 0 ? winExitY : 0;

  return (
    <AbsoluteFill style={{ background: "transparent", alignItems: "center", justifyContent: "center" }}>

      {/* ══════ ORIGINAL ELEMENTS ══════ */}

      {/* ── Pill-Shaped Callout ── */}
      <div style={{
        position: "absolute",
        top: 100,
        padding: "14px 50px",
        borderRadius: 50,
        background: `${RED_ACCENT}15`,
        border: `2px solid ${RED_ACCENT}`,
        opacity: Math.min(calloutIn, calloutExitOpacity),
        transform: `scale(${calloutIn}) translateY(${interpolate(calloutIn, [0, 1], [20, 0])}px)`,
        zIndex: 20,
      }}>
        <span style={{
          fontFamily: FONTS.display,
          fontSize: 38,
          fontWeight: 800,
          color: RED_ACCENT,
          letterSpacing: "0.02em",
        }}>
          Discrete values
        </span>
      </div>

      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Apply global exit transform + opacity to everything inside
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}>

        {/* ROW 1 (Top: display) */}
        <div style={{
          position: "absolute",
          transform: `translateY(${topY + exitTopDrift}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}>
          <BrokenConnector />
          <div style={{ position: "absolute", transform: `translateX(${-currentSpread}px)` }}>
            <DiscreteCard property="display" value="none"  accent={RED_ACCENT}       textOpacity={textFadeIn} width={currentWidth} height={currentHeight} />
          </div>
          <div style={{ position: "absolute", transform: `translateX(${currentSpread}px)` }}>
            <DiscreteCard property="display" value="block" accent={COLORS.selector}  textOpacity={textFadeIn} width={currentWidth} height={currentHeight} />
          </div>
        </div>

        {/* ROW 2 (Bottom: height) */}
        <div style={{
          position: "absolute",
          transform: `translateY(${bottomY + exitBottomDrift}px)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}>
          <BrokenConnector />
          <div style={{ position: "absolute", transform: `translateX(${-currentSpread}px)` }}>
            <DiscreteCard property="height" value="0"    accent={RED_ACCENT}       textOpacity={textFadeIn} width={currentWidth} height={currentHeight} />
          </div>
          <div style={{ position: "absolute", transform: `translateX(${currentSpread}px)` }}>
            <DiscreteCard property="height" value="auto" accent={COLORS.selector}  textOpacity={textFadeIn} width={currentWidth} height={currentHeight} />
          </div>
        </div>

      </div>

      {/* ══════ CODE WINDOW (frame 180–215) ══════ */}
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
            {/* display: block — the line that gets red-blink highlighted */}
            <div style={{
              position: "relative",
              borderRadius: 6,
              overflow: "hidden",
            }}>
              {/* Red highlight overlay — blinks on/off */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: `${RED_ACCENT}22`,
                borderLeft: `4px solid ${RED_ACCENT}`,
                opacity: highlightOpacity,
                borderRadius: 6,
                pointerEvents: "none",
                transition: "opacity 0.05s",
              }} />
              <CodeLine tokens={CSS_LINE_DISPLAY} highlighted={blinkOn} />
            </div>
            <CodeLine tokens={CSS_LINE_CLOSE} />
          </CodeWindow>
        </div>
      )}

    </AbsoluteFill>
  );
};