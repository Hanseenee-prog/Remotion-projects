// ─── Safe Zone ────────────────────────────────────────────────────────────────
export const SAFE = {
  top:    60,
  bottom: 160,
  left:   40,
  right:  40,
} as const;

export const CANVAS = {
  width:      1080,
  height:     1920,
  safeWidth:  1000,  // 1080 - 40 - 40
  safeHeight: 1600,  // 1920 - 160 - 160
} as const;

// ─── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  bg:          "#0D0D0D",
  surface:     "rgba(255,255,255,0.05)",
  surfaceHigh: "rgba(255,255,255,0.09)",

  // Borders
  border:     "rgba(255,255,255,0.10)",
  borderHigh: "rgba(255,255,255,0.20)",

  // Accent palette
  accentA: "#7EE787",  // green
  accentB: "#79C0FF",  // blue
  accentC: "#FF7B72",  // red
  accentD: "#D2A8FF",  // purple

  // Text
  white:    "#FFFFFF",
  offWhite: "#E8E8E8",
  muted:    "rgba(255,255,255,0.45)",
  subtle:   "rgba(255,255,255,0.25)",

  // ── GitHub Dark syntax ────────────────────────────────────────────────────
  codeBg:          "#161B22",
  codeBgHighlight: "#1F2937",
  codeText:        "#E6EDF3",
  keyword:         "#FF7B72",   // red     — return, const, function, let
  atRule:          "#FF7B72",   // red     — @ rules
  property:        "#79C0FF",   // blue    — object properties
  value:           "#A5D6FF",   // lt blue — values / identifiers
  selector:        "#7EE787",   // green   — selectors / class names
  string:          "#A5D6FF",   // lt blue — strings
  number:          "#79C0FF",   // blue    — numbers
  comment:         "#8B949E",   // grey    — comments
  punctuation:     "#E6EDF3",   // default
  fnName:          "#D2A8FF",   // purple  — function names
  // ── Extra: bracket / square bracket ──────────────────────────────────────
  bracket:         "#E6EDF3",   // [ ] { }  — same as punctuation
  squareBracket:   "#79C0FF",   // [ ]  — GitHub Dark renders these blue
  // ── Spread / rest operator ────────────────────────────────────────────────
  spread:          "#E6EDF3",   // ...args  — plain punctuation colour
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
  display: "'Syne', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

// ─── Scene durations (frames @ 30 fps) ───────────────────────────────────────
export const DURATIONS = {
  s1: Math.round(5.0 * 30),   // 150f — every-keypress firing demo
  s2: Math.round(7.0 * 30),   // 180f — movie API overload
  s3: Math.round(5.0 * 30),   // 150f — debounce concept intro
  s4: Math.round(7.0 * 30),   // 210f — function signature
  s5: Math.round(7.0 * 30),   // 210f — return fn + ...args
  s6: Math.round(8.0 * 30),   // 240f — setTimeout wrap, still fires each press
  s7: Math.round(8.0 * 30),   // 240f — clearTimeout fix
  s8: Math.round(6.0 * 30),   // 180f — Avengers demo, one call
  s9: Math.round(4.0 * 30),   // 120f — CTA
} as const;

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce((s, d) => s + d, 0);
