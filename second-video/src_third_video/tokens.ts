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
  top:    60,
  bottom: 160,
  left:    40,
  right:  40,
} as const;

// Derived usable canvas dimensions (1080 × 1920 composition)
export const CANVAS = {
  width:  1080,
  height: 1920,
  safeWidth:  1080 - 40 - 40,  // 1000px
  safeHeight: 1920 - 160 - 160, // 1600px
} as const;


// ─── Colours ──────────────────────────────────────────────────────────────────

export const COLORS = {
  // Backgrounds
  bg:          "#0D0D0D",
  surface:     "rgba(255,255,255,0.05)",
  surfaceHigh: "rgba(255,255,255,0.09)",

  // Borders
  border:      "rgba(255,255,255,0.10)",
  borderHigh:  "rgba(255,255,255,0.20)",

  // Rocket / accent palette
  rocketA:     "#FF6B35",   // warm orange  — setTimeout (async)
  rocketB:     "#3BCEAC",   // teal/mint    — normal function (sync)

  // Text
  white:       "#FFFFFF",
  offWhite:    "#E8E8E8",
  muted:       "rgba(255,255,255,0.45)",
  subtle:      "rgba(255,255,255,0.25)",

  // Code editor colours (Catppuccin-ish)
  codeBg:      "#1E1E2E",
  codeText:    "#CDD6F4",
  keyword:     "#CBA6F7",   // purple  — setTimeout, function
  fnName:      "#89B4FA",   // blue    — function names
  number:      "#FAB387",   // peach   — 0
  string:      "#A6E3A1",   // green   — strings
  comment:     "#6C7086",   // overlay — // comments
  punctuation: "#CDD6F4",   // default
} as const;


// ─── Typography ───────────────────────────────────────────────────────────────

export const FONTS = {
  display: "'Syne', sans-serif",
  mono:    "'JetBrains Mono', monospace",
} as const;


// ─── Scene durations (frames @ 30 fps) ───────────────────────────────────────

export const DURATIONS = {
  s1: Math.round(6.5 * 30),  // 135f — Introduce Rocket A & B
  s2: Math.round(4.0 * 30),  // 120f — The question
  s3: Math.round(3.0 * 30),  //  90f — Dramatic launch pause
  s4: Math.round(5.0 * 30),  // 150f — JS is single-threaded
  s5: Math.round(3.0 * 30),  //  90f — The event loop
  s6: Math.round(5.5 * 30),  // 165f — setTimeout is async
  s7: Math.round(7 * 30),  // 135f — The reveal
  s8: Math.round(2.5 * 30),  //  75f — Follow CTA
} as const;

export const TOTAL_FRAMES = Object.values(DURATIONS).reduce(
  (sum, d) => sum + d,
  0
); // 960f = 32s
