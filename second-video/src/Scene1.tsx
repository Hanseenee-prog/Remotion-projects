// Scene 1 — Revised
// Frame  0–20  : Code window A zooms out from center, already showing ".card.show { opacity: 1; }"
// Frame 20–50  : "display: block;" types into code window A
// Frame 55–65  : Code window A springs upward to make room
// Frame 65–80  : Code window B slides up from below, pre-written "btn.onclick = () => { };"
//                "card.classList.toggle("show");" types inside it from frame 70
// Frame 90-98  : Code windows exit (A up, B down), Button springs into the center
// Frame 100-110: Cursor moves in and clicks the button
// Frame 110+   : Card appears instantly (simulating display: none -> block)
// Frame 170-175: Everything fades out
// Frame 175-185: New styles.css window slides in with .card { display:none; opacity:0; transition:... }
// Frame 185-215: Yellow highlighter sweeps over "transition: opacity 0.4s ease;" line
//                (others reduce opacity, highlight text stays full opacity)
// Frame 215-220: Highlighter fades out, opacity returns to normal
// Frame 230-235: Code window slides out of scene

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Easing helpers ───────────────────────────────────────────────────────────

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

function clamp(val: number, min = 0, max = 1) {
  return Math.min(Math.max(val, min), max);
}
function progress(frame: number, start: number, end: number) {
  return clamp((frame - start) / (end - start));
}

// ─── Typed text ───────────────────────────────────────────────────────────────
function useTyped(text: string, startFrame: number, cps: number, frame: number) {
  const chars = Math.max(0, Math.floor(((frame - startFrame) / 30) * cps));
  return Math.min(chars, text.length);
}

// ─── Token system ─────────────────────────────────────────────────────────────
type TT =
  | "selector"
  | "property"
  | "value"
  | "keyword"
  | "fnName"
  | "string"
  | "comment"
  | "punctuation"
  | "varName"
  | "operator";

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
const CODE_FONT_SIZE = 40;
const CODE_LINE_HEIGHT = 2.00;

const CodeLine: React.FC<{ tokens: Token[]; typedChars?: number; showCursor?: boolean; cursorBlink?: boolean }> = ({
  tokens,
  typedChars,
  showCursor = false,
  cursorBlink = false,
}) => {
  const isTyping = typedChars !== undefined;

  let rendered: React.ReactNode[];

  if (isTyping) {
    let remaining = typedChars!;
    rendered = [];
    for (let i = 0; i < tokens.length; i++) {
      if (remaining <= 0) break;
      const slice = tokens[i].text.slice(0, remaining);
      remaining -= tokens[i].text.length;
      rendered.push(
        <span key={i} style={{ color: tc(tokens[i].type) }}>{slice}</span>
      );
    }
  } else {
    rendered = tokens.map((tok, i) => (
      <span key={i} style={{ color: tc(tok.type) }}>{tok.text}</span>
    ));
  }

  return (
    <div style={{
      fontFamily: FONTS.mono,
      fontSize: CODE_FONT_SIZE,
      fontWeight: 700,
      lineHeight: CODE_LINE_HEIGHT,
      whiteSpace: "pre",
    }}>
      {rendered}
      {showCursor && (
        <span style={{
          display: "inline-block",
          width: 3,
          height: "0.82em",
          background: COLORS.accentA,
          marginLeft: 3,
          verticalAlign: "middle",
          opacity: cursorBlink ? 1 : 0,
        }} />
      )}
    </div>
  );
};

// ─── Code Window ─────────────────────────────────────────────────────────────
type FileType = "css" | "js";

const FILE_BADGE: Record<FileType, { bg: string; label: string }> = {
  css: { bg: "#6B4FBB", label: "css" },
  js:  { bg: "#bd9307", label: "js"  },
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
            textTransform: "uppercase",
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

      <div style={{ padding: "30px 44px 36px 44px" }}>
        {children}
      </div>
    </div>
  );
};

// ─── Token definitions ────────────────────────────────────────────────────────
const CSS_LINE_SELECTOR: Token[] = [
  { text: ".card",  type: "selector"    },
  { text: ".",      type: "punctuation" },
  { text: "show",   type: "selector"    },
  { text: " {",     type: "punctuation" },
];

const CSS_LINE_OPACITY: Token[] = [
  { text: "  opacity", type: "property"    },
  { text: ": ",        type: "punctuation" },
  { text: "1",         type: "value"       },
  { text: ";",         type: "punctuation" },
];

const CSS_LINE_DISPLAY: Token[] = [
  { text: "  display", type: "property"    },
  { text: ": ",        type: "punctuation" },
  { text: "block",     type: "keyword"     },
  { text: ";",         type: "punctuation" },
];

const CSS_LINE_CLOSE: Token[] = [
  { text: "}", type: "punctuation" },
];

const JS_LINE_BTN: Token[] = [
  { text: "btn",      type: "varName"     },
  { text: ".",        type: "punctuation" },
  { text: "onclick",  type: "property"    },
  { text: " ",        type: "punctuation" },
  { text: "=",        type: "operator"    },
  { text: " ",        type: "punctuation" },
  { text: "()",       type: "punctuation" },
  { text: " ",        type: "punctuation" },
  { text: "=>",       type: "operator"    },
  { text: " {",       type: "punctuation" },
];

const JS_LINE_TOGGLE: Token[] = [
  { text: "  card",        type: "varName"     },
  { text: ".",             type: "punctuation" },
  { text: "classList",     type: "property"    },
  { text: ".",             type: "punctuation" },
  { text: "toggle",        type: "fnName"      },
  { text: "(",             type: "punctuation" },
  { text: '"show"',        type: "string"      },
  { text: ");",            type: "punctuation" },
];

const JS_LINE_CLOSE: Token[] = [
  { text: "};", type: "punctuation" },
];

// ─── New CSS window token definitions (frame 175+) ────────────────────────────
const CSS2_SELECTOR: Token[] = [
  { text: ".card", type: "selector" },
  { text: " {",    type: "punctuation" },
];

const CSS2_DISPLAY: Token[] = [
  { text: "  display", type: "property" },
  { text: ": ",        type: "punctuation" },
  { text: "none",      type: "keyword" },
  { text: ";",         type: "punctuation" },
];

const CSS2_OPACITY: Token[] = [
  { text: "  opacity", type: "property" },
  { text: ": ",        type: "punctuation" },
  { text: "0",         type: "value" },
  { text: ";",         type: "punctuation" },
];

const CSS2_TRANSITION: Token[] = [
  { text: "  transition", type: "property" },
  { text: ": ",           type: "punctuation" },
  { text: "opacity",      type: "keyword" },
  { text: " 0.4s",        type: "value" },
  { text: " ease",        type: "value" },
  { text: ";",            type: "punctuation" },
];

const CSS2_CLOSE: Token[] = [
  { text: "}", type: "punctuation" },
];

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Window A zoom-in (frame 0–20)
  const zoomP = progress(frame, 0, 20);
  const zoomScale = interpolate(easeOutBack(clamp(zoomP)), [0, 1], [0.36, 1]);

  // ── display: block; types in (frame 20–50)
  const DISPLAY_FULL_LEN = "  display: block;".length;
  const displayChars = useTyped("  display: block;", 20, 34, frame);
  const displayDone  = displayChars >= DISPLAY_FULL_LEN;
  const cursorBlink  = Math.floor(frame / 7) % 2 === 0;

  // ── Window A moves up (frame 55–65)
  const moveUpSpring = spring({
    fps,
    frame: Math.max(0, frame - 55),
    config: { damping: 14, stiffness: 160, mass: 0.8 },
    durationInFrames: 20,
  });

  // ── Window A Exits Up (frame 90-98)
  const exitASpring = spring({
    fps,
    frame: Math.max(0, frame - 90),
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  let winAOffset = frame >= 55 ? interpolate(moveUpSpring, [0, 1], [0, -270]) : 0;
  if (frame >= 90) {
    winAOffset = interpolate(exitASpring, [0, 1], [-270, -1500]);
  }

  // ── Window B slides up (frame 65–80)
  const slideBSpring = spring({
    fps,
    frame: Math.max(0, frame - 65),
    config: { damping: 13, stiffness: 140, mass: 0.9 },
    durationInFrames: 22,
  });

  // ── Window B Exits Down (frame 90-98)
  const exitBSpring = spring({
    fps,
    frame: Math.max(0, frame - 90),
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  const winBVisible  = frame >= 65;
  const winBRestY    = 270;

  let winBOffset = winBVisible
    ? interpolate(slideBSpring, [0, 1], [winBRestY + 280, winBRestY])
    : winBRestY + 280;

  if (frame >= 90) {
    winBOffset = interpolate(exitBSpring, [0, 1], [winBRestY, 1500]);
  }

  const winBOpacity = winBVisible
    ? interpolate(easeOut(progress(frame, 65, 76)), [0, 1], [0, 1])
    : 0;

  // ── toggle types in (frame 70–88)
  const TOGGLE_FULL_LEN = '  card.classList.toggle("show");'.length;
  const toggleChars = useTyped('  card.classList.toggle("show");', 70, 63, frame);
  const toggleDone  = toggleChars >= TOGGLE_FULL_LEN;
  const tCursorBlink = Math.floor(frame / 7) % 2 === 0;

  // ── UI Button Appears (frame 90-98)
  const btnScaleSpring = spring({
    fps,
    frame: Math.max(0, frame - 92),
    config: { damping: 12, stiffness: 140 },
  });

  // ── Cursor Movement & Click (frame 100-112)
  //
  // Cursor is now an independent AbsoluteFill-level element.
  // Coordinates are in canvas space (1080×1920).
  // Button sits at top:40% ≈ y=768, horizontally centered at x=540.
  // Rest position: just above button center (finger tip points down).
  const CURSOR_REST_X = 490;   // a little left of center so finger tip hits button
  const CURSOR_REST_Y = 690;   // above the button top edge
  const CURSOR_START_X = 900;  // comes in from bottom-right
  const CURSOR_START_Y = 1400;

  const cursorMoveP = clamp((frame - 100) / (108 - 100));
  const cursorEased = easeOut(cursorMoveP);

  // Hard-lock at rest once arrived — no easing overshoot possible
  const cursorX = frame >= 108
    ? CURSOR_REST_X
    : CURSOR_START_X + (CURSOR_REST_X - CURSOR_START_X) * cursorEased;

  const cursorY = frame >= 108
    ? CURSOR_REST_Y
    : CURSOR_START_Y + (CURSOR_REST_Y - CURSOR_START_Y) * cursorEased;

  const cursorOpacity = interpolate(frame, [100, 102], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Click press — scale the emoji down briefly
  const clickP = interpolate(frame, [108, 110, 112], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const cursorClickScale = interpolate(clickP, [0, 1], [1, 0.8]);

  // Button click scale / press — driven by its own spring, independent of cursor
  const btnClickP = interpolate(frame, [108, 110, 112], [0, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const btnClickScale  = interpolate(btnClickP, [0, 1], [1, 0.94]);
  const btnClickOffset = interpolate(btnClickP, [0, 1], [0, 4]);
  const finalBtnScale  = btnScaleSpring * btnClickScale;
  const rippleScale   = interpolate(frame, [108, 120], [0, 15], { extrapolateRight: "clamp" });
  const rippleOpacity = interpolate(frame, [108, 120], [0.6, 0], { extrapolateRight: "clamp" });

  // ── Card Visibility toggle (frame 110)
  const isCardVisible = frame >= 110;

  // ────────────────────────────────────────────────────────────────────────────
  // NEW PHASE — frame 170+
  // ────────────────────────────────────────────────────────────────────────────

  // ── Everything fades out (frame 170–175)
  const uiFadeOut = interpolate(frame, [170, 175], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const uiVisible = frame < 175;

  // ── New CSS window slides in from bottom (frame 175–185)
  const cssWin2SlideSpring = spring({
    fps,
    frame: Math.max(0, frame - 175),
    config: { damping: 14, stiffness: 130, mass: 0.85 },
    durationInFrames: 18,
  });
  const cssWin2SlideY = interpolate(cssWin2SlideSpring, [0, 1], [120, 0]);
  const cssWin2Opacity = interpolate(progress(frame, 175, 183), [0, 1], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const showCssWin2 = frame >= 175 && frame < 236;

  // Non-highlighted lines dim while transition line stays full opacity, restore after
  let nonHighlightDim: number;
  if (frame < 190) {
    nonHighlightDim = 1;
  } else if (frame < 205) {
    nonHighlightDim = interpolate(frame, [190, 197], [1, 0.22], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  } else if (frame < 215) {
    nonHighlightDim = 0.22;
  } else {
    nonHighlightDim = interpolate(frame, [215, 222], [0.22, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  }

  // ── CSS window slides out down (frame 230–235)
  const cssWin2ExitSpring = spring({
    fps,
    frame: Math.max(0, frame - 230),
    config: { damping: 14, stiffness: 160, mass: 0.8 },
    durationInFrames: 12,
  });
  const cssWin2ExitY = frame >= 230
    ? interpolate(cssWin2ExitSpring, [0, 1], [0, 200])
    : 0;
  const cssWin2ExitOpacity = frame >= 230
    ? interpolate(cssWin2ExitSpring, [0, 1], [1, 0])
    : 1;

  const cssWin2Transform      = `translateY(${cssWin2SlideY + cssWin2ExitY}px)`;
  const cssWin2FinalOpacity   = cssWin2Opacity * cssWin2ExitOpacity;

  return (
    <AbsoluteFill style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "transparent",
    }}>

      {/* ── Window A (style.css) ─────────────────────────────────────── */}
      {uiVisible && (
        <div style={{
          position: "absolute",
          transform: `scale(${zoomScale}) translateY(${winAOffset / zoomScale}px)`,
          opacity: uiFadeOut,
          transformOrigin: "center center",
          willChange: "transform, opacity",
          ...(zoomP >= 1 && {
            transform: `translateY(${winAOffset}px)`,
          }),
        }}>
          <CodeWindow fileType="css">
            <CodeLine tokens={CSS_LINE_SELECTOR} />
            <CodeLine tokens={CSS_LINE_OPACITY} />
            {frame >= 20 && (
              <CodeLine
                tokens={CSS_LINE_DISPLAY}
                typedChars={displayChars}
                showCursor={!displayDone}
                cursorBlink={cursorBlink}
              />
            )}
            <CodeLine tokens={CSS_LINE_CLOSE} />
          </CodeWindow>
        </div>
      )}

      {/* ── Window B (script.js) ─────────────────────────────────────── */}
      {winBVisible && uiVisible && (
        <div style={{
          position: "absolute",
          transform: `translateY(${winBOffset}px)`,
          opacity: winBOpacity * uiFadeOut,
          willChange: "transform, opacity",
        }}>
          <CodeWindow fileType="js">
            <CodeLine tokens={JS_LINE_BTN} />
            <CodeLine
              tokens={JS_LINE_TOGGLE}
              typedChars={toggleChars}
              showCursor={!toggleDone}
              cursorBlink={tCursorBlink}
            />
            <CodeLine tokens={JS_LINE_CLOSE} />
          </CodeWindow>
        </div>
      )}

      {/* ── UI Section (Button, Card, Cursor) ────────────────────────── */}
      {frame >= 90 && frame < 175 && (
        <div style={{
          position: "absolute",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          top: "40%",
          opacity: uiFadeOut,
        }}>

          {/* Action Button */}
          <div style={{
            position: "relative",
            overflow: "hidden",
            background: "#3c47e3",
            color: "#c5c1c1",
            padding: "24px 48px",
            borderRadius: 15,
            fontFamily: FONTS.mono,
            fontSize: 36,
            fontWeight: 800,
            textTransform: "capitalize",
            letterSpacing: "0.02em",
            boxShadow: `0 ${8 - btnClickOffset}px 0 #3c47e3`,
            transform: `scale(${finalBtnScale}) translateY(${btnClickOffset}px)`,
            transformOrigin: "center center",
          }}>
            Toggle Card

            {frame >= 108 && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 40,
                height: 40,
                background: "rgba(255, 255, 255, 0.9)",
                borderRadius: "50%",
                transform: `translate(-50%, -50%) scale(${rippleScale})`,
                opacity: rippleOpacity,
                pointerEvents: "none",
              }} />
            )}
          </div>

          {/* Result Card (Simulating display: block — instant, no animation) */}
          <div style={{
            background: "#0D1117",
            border: "2px solid rgba(255,255,255,0.08)",
            padding: "40px 48px",
            borderRadius: 24,
            marginTop: 120,
            display: isCardVisible ? "block" : "none",
            width: 620,
            boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
            color: "#E6EDF3",
            fontFamily: "system-ui, -apple-system, sans-serif",
            transform: "scale(1.2)",
          }}>
            <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
              <div style={{
                minWidth: 72,
                height: 72,
                borderRadius: "50%",
                background: "#6B4FBB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
              }}>
                🪄
              </div>
              <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>
                Animating display: block
              </h2>
            </div>

            <p style={{ fontSize: 27, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 28, marginTop: 0 }}>
              Learn to bridge the gap between none and block states for smooth transitions.
            </p>

            <div style={{ display: "flex" }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: 8, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                ✨ <span>CSS Tricks</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── Finger cursor — independent, not tied to button ─────────────── */}
      {frame >= 100 && frame < 175 && (
        <div style={{
          position: "absolute",
          left: 0,
          top: 250,
          transform: `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
          opacity: cursorOpacity * uiFadeOut,
          zIndex: 50,
          pointerEvents: "none",
          filter: "drop-shadow(0px 8px 12px rgba(0,0,0,0.5))",
          rotate: "-10deg",
        }}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>👆</span>
        </div>
      )}

      {/* ── New CSS window (frame 175–235) ───────────────────────────── */}
      {showCssWin2 && (
        <div style={{
          position: "absolute",
          transform: cssWin2Transform,
          opacity: cssWin2FinalOpacity,
          willChange: "transform, opacity",
        }}>
          <CodeWindow fileType="css">

            {/* Lines that dim when the highlighter is active */}
            <div style={{ opacity: nonHighlightDim }}>
              <CodeLine tokens={CSS2_SELECTOR} />
              <CodeLine tokens={CSS2_DISPLAY} />
              <CodeLine tokens={CSS2_OPACITY} />
            </div>

            {/* Transition line — always full opacity while other lines dim */}
            <div style={{ position: "relative" }}>
              <CodeLine tokens={CSS2_TRANSITION} />
            </div>

            {/* Closing brace dims too */}
            <div style={{ opacity: nonHighlightDim }}>
              <CodeLine tokens={CSS2_CLOSE} />
            </div>

          </CodeWindow>
        </div>
      )}

    </AbsoluteFill>
  );
};