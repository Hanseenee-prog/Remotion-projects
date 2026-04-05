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
  safeWidth:  1000,
  safeHeight: 1600,
} as const;

// ─── Colours ──────────────────────────────────────────────────────────────────
export const COLORS = {
  bg:          "#0D0D0D",
  surface:     "rgba(255,255,255,0.05)",
  surfaceHigh: "rgba(255,255,255,0.09)",

  border:     "rgba(255,255,255,0.10)",
  borderHigh: "rgba(255,255,255,0.20)",

  accentA: "#7EE787",  // green
  accentB: "#79C0FF",  // blue
  accentC: "#FF7B72",  // red
  accentD: "#D2A8FF",  // purple

  white:    "#FFFFFF",
  offWhite: "#E8E8E8",
  muted:    "rgba(255,255,255,0.45)",
  subtle:   "rgba(255,255,255,0.25)",

  codeBg:          "#161B22",
  codeBgHighlight: "#1F2937",
  codeText:        "#E6EDF3",
  keyword:         "#FF7B72",
  atRule:          "#FF7B72",
  property:        "#79C0FF",
  value:           "#A5D6FF",
  selector:        "#7EE787",
  string:          "#A5D6FF",
  number:          "#79C0FF",
  comment:         "#8B949E",
  punctuation:     "#E6EDF3",
  fnName:          "#D2A8FF",
  bracket:         "#E6EDF3",
  squareBracket:   "#79C0FF",
  spread:          "#E6EDF3",
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONTS = {
  display: "'Syne', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;

// ─── Scene durations (frames @ 30 fps) ───────────────────────────────────────
export const DURATIONS = {
  s1:  Math.round(7.5 * 30),  // 135f — spread clone setup
  s2:  Math.round(5.5 * 30),  // 135f — mutation bug reveal
  s3:  Math.round(4.0 * 30),  // 120f — shallow copy diagram
  s4:  Math.round(4.5 * 30),  // 135f — JSON hack appears
  s5:  Math.round(4.0 * 30),  // 120f — JSON problems: dates, undefined
  s6:  Math.round(3.5 * 30),  // 105f — structuredClone reveal
  s7:  Math.round(4.5 * 30),  // 135f — true deep clone proof
  s8:  Math.round(4.5 * 30),  // 135f — CTA
} as const;

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce((s, d) => s + d, 0);
