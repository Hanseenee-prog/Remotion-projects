// ─── Safe Zone ────────────────────────────────────────────────────────────────
//
// Instagram Reels overlays approx. values on a 1080×1920 canvas:
//   Top    ~160px  (status bar + back/camera icons)
//   Bottom ~280px  (caption line + comment bar + bottom nav)
//   Right  ~160px  (like/comment/share/save sidebar icons)
//   Left   ~ 40px  (small profile avatar bleeds in at bottom-left)
//
// All animated content must stay within these insets.

export const SAFE = {
  top: 60,
  bottom: 160,
  left: 40,
  right: 40,
} as const;

// Derived usable canvas dimensions (1080 × 1920 composition)
export const CANVAS = {
  width: 1080,
  height: 1920,
  safeWidth: 1080 - 40 - 40, // 1000px
  safeHeight: 1920 - 160 - 160, // 1600px
} as const;

// ─── Colours ──────────────────────────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  bg: "#0D0D0D",
  surface: "rgba(255,255,255,0.05)",
  surfaceHigh: "rgba(255,255,255,0.09)",

  // Borders
  border: "rgba(255,255,255,0.10)",
  borderHigh: "rgba(255,255,255,0.20)",

  // Accent palette
  accentA: "#7EE787", // green  — @starting-style
  accentB: "#79C0FF", // blue   — transition-behavior
  accentC: "#FF7B72", // red    — broken/discrete
  accentD: "#D2A8FF", // purple — keywords

  // Text
  white: "#FFFFFF",
  offWhite: "#E8E8E8",
  muted: "rgba(255,255,255,0.45)",
  subtle: "rgba(255,255,255,0.25)",

  // ── GitHub Dark syntax colours ─────────────────────────────────────────────
  codeBg: "#161B22",       // github dark editor bg
  codeBgHighlight: "#1F2937",
  codeText: "#E6EDF3",     // default text
  keyword: "#FF7B72",      // red     — display, none, block, @starting-style
  atRule: "#FF7B72",       // red     — @ rules
  property: "#79C0FF",     // blue    — CSS properties
  value: "#A5D6FF",        // light blue — property values
  selector: "#7EE787",     // green   — selectors / class names
  string: "#A5D6FF",       // light blue — strings
  number: "#79C0FF",       // blue    — numbers
  comment: "#8B949E",      // grey    — comments
  punctuation: "#E6EDF3",  // default
  fnName: "#D2A8FF",       // purple  — function names / special
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  display: "'Syne', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;

// ─── Scene durations (frames @ 30 fps) ───────────────────────────────────────

export const DURATIONS = {
  s1: Math.round(7.9 * 30),  // 150f — Card pops in broken, "it just pops in"
  s2: Math.round(3.5 * 30),  // 105f — "CSS animates between states"
  s3: Math.round(4.0 * 30),  // 120f — "discrete values, display none→block"
  s4: Math.round(2.5 * 30),  //  75f — "So your animation never runs"
  s5: Math.round(5.0 * 30),  // 150f — "@starting-style" reveal
  s6: Math.round(4.0 * 30),  // 120f — "transition-behavior: allow-discrete"
  s7: Math.round(5.0 * 30),  // 150f — Smooth card, "No JS. No hacks."
  s8: Math.round(2.5 * 30),  //  75f — Follow CTA
} as const;

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce(
  (sum, d) => sum + d,
  0
);
