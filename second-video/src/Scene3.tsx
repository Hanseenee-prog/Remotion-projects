import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Syntax tokens ────────────────────────────────────────────────────────────
const Tok: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <span style={{ color }}>{children}</span>
);
const SYN = {
  plain:   "#ABB2BF",
  method:  "#C678DD",
  string:  "#A5D6FF",
  ident:   "#D19A66",
  arrow:   "#E06C75",
  punct:   "#ABB2BF",
};

// ─── Grid constants ───────────────────────────────────────────────────────────
const BTN_W      = 420;
const BTN_H      = 130;
const H_GAP      = 24;
const V_GAP      = 120;
const COLS       = 3;
const ROWS       = 5;
const GRID_W     = COLS * BTN_W + (COLS - 1) * H_GAP;
const FIT_SCALE  = 960 / GRID_W;
const CENTER_IDX = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2); // 7

// ─── Code window constants — matching Scene01 exactly ─────────────────────────
const WIN_W        = 1040;
const FONT_SIZE    = 40;
const FONT_W       = 600;
const STACK_COUNT  = 4;
// Final resting scale — 0.82 gives 113px margin each side on 1080px canvas
const WIN_REST_SCALE = 0.82;

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  resetEnd:    8,
  othersIn:    5,
  othersInEnd: 22,
  zoomStart:   10,
  clickFrames: [40, 46, 52, 58, 63, 69, 75] as const,
  blurStart:   75,
  blurEnd:     90,
  stackStart:  90,
  stackGap:    18, // frames between each card landing — slightly longer for drama
} as const;

const stackFrame = (i: number) => T.stackStart + i * T.stackGap;

// ─── Seeded random ────────────────────────────────────────────────────────────
const sr = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const buildRandomSeq = (): number[] => {
  const pool = [0,1,2,3,4,5,6,8,9,10,11,12,13,14];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(sr(i * 7 + 3) * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
};
const RANDOM_SEQ = buildRandomSeq();

const getClickFrame = (idx: number): number => {
  if (idx === CENTER_IDX) return -1;
  const pos = RANDOM_SEQ.indexOf(idx);
  if (pos === -1 || pos >= T.clickFrames.length) return -1;
  return T.clickFrames[pos];
};

// ─── Stacking offsets — each card's resting position in the deck ──────────────
// Like a real hand of cards being tossed on a table:
// each new card lands slightly lower than center so the previous one peeks above
// Alternating slight rotations make it feel hand-placed, not mechanical
const CARD_OFFSETS: { y: number; rotate: number }[] = [
  { y:   0, rotate:  0.0  }, // card 0 — first down, will be pushed
  { y:  22, rotate:  2.2  }, // card 1
  { y:  44, rotate: -1.6  }, // card 2
  { y:  66, rotate:  1.1  }, // card 3 — top card, freshest
];
// y offset: each card sits 22px lower than the one below it
// This means the TOP of the previous card is always visible above the new one

// ─── Grid button ─────────────────────────────────────────────────────────────
const Btn: React.FC<{
  frame: number; fps: number;
  isCenter: boolean;
  centerBg: string; centerText: string; centerLabel: string; centerEmoji: string;
  gridOpacity: number; clickFrame: number;
}> = ({ frame, fps, isCenter, centerBg, centerText, centerLabel, centerEmoji, gridOpacity, clickFrame }) => {

  const isClicked = clickFrame !== -1 && frame >= clickFrame;

  const colorSpring = spring({
    fps, frame: frame - clickFrame,
    config: { damping: 20, stiffness: 140 },
    durationInFrames: 20,
  });
  const colorP = clickFrame === -1 ? 0 : Math.min(1, Math.max(0, colorSpring));

  const popSpring = spring({
    fps, frame: frame - clickFrame,
    config: { damping: 26, stiffness: 600, mass: 0.3 },
    durationInFrames: 10,
  });
  const btnPop = !isClicked ? 1 : interpolate(popSpring, [0, 0.15, 1], [1, 1.09, 1]);

  let bg: string, color: string, label: string, emoji: string;
  if (isCenter) {
    bg = centerBg; color = centerText; label = centerLabel; emoji = centerEmoji;
  } else if (clickFrame !== -1) {
    const r = Math.round(interpolate(colorP, [0, 1], [255, 230]));
    const g = Math.round(interpolate(colorP, [0, 1], [255, 57]));
    const b = Math.round(interpolate(colorP, [0, 1], [255, 70]));
    bg    = `rgb(${r},${g},${b})`;
    color = colorP > 0.4 ? "#FFFFFF" : "#111111";
    label = colorP > 0.5 ? "Clicked!" : "Click Me";
    emoji = colorP > 0.5 ? "😎" : "😐";
  } else {
    bg = "#FFFFFF"; color = "#111111"; label = "Click Me"; emoji = "😐";
  }

  return (
    <div style={{
      width: BTN_W, height: BTN_H, borderRadius: 24, backgroundColor: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      fontSize: 46, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace",
      letterSpacing: "0.02em",
      boxShadow: isClicked
        ? `0 12px 40px rgba(0,0,0,0.45), 0 0 ${28 * colorP}px rgba(230,57,70,${0.4 * colorP})`
        : "0 12px 40px rgba(0,0,0,0.45)",
      opacity: gridOpacity, flexShrink: 0,
      transform: `scale(${btnPop})`, transformOrigin: "center center",
    }}>
      {label}
      <span style={{ fontSize: 48, lineHeight: 1 }}>{emoji}</span>
    </div>
  );
};

// ─── Stacked code window ──────────────────────────────────────────────────────
const StackedCodeWindow: React.FC<{
  frame:    number;
  fps:      number;
  btnNum:   number;   // 1–4
  stackIdx: number;   // 0 = first placed (bottom), 3 = last placed (top)
}> = ({ frame, fps, btnNum, stackIdx }) => {

  const startF  = stackFrame(stackIdx);
  const offset  = CARD_OFFSETS[stackIdx];

  // ── Entrance: card flings in from above-right (like tossed onto a table) ──
  // Principle: Anticipation + Follow Through
  // Starts from slightly above + offset to the side, rotated, then spring-settles
  const entranceSpring = spring({
    fps,
    frame: frame - startF,
    config: {
      damping:   11,   // low-ish = noticeable bounce on landing
      stiffness: 200,
      mass:      0.85,
    },
    durationInFrames: 28,
  });

  // Slide in from above (cards come from top, like dealt from a deck)
  const slideY    = interpolate(entranceSpring, [0, 1], [-520, 0]);
  // Slight lateral toss — alternates side per card
  const slideX    = interpolate(entranceSpring, [0, 1],
    [stackIdx % 2 === 0 ? 120 : -120, 0]
  );
  // Spin into place — starts rotated, settles at final rotation
  const spinFrom  = stackIdx % 2 === 0 ? offset.rotate + 12 : offset.rotate - 12;
  const rotation  = interpolate(entranceSpring, [0, 1], [spinFrom, offset.rotate]);

  // Scale: enters slightly larger (like it's close to camera), settles to rest scale
  const scaleVal  = interpolate(entranceSpring, [0, 1], [1.08, WIN_REST_SCALE]);

  // Opacity: snaps in fast
  const opacity   = interpolate(entranceSpring, [0, 0.08, 1], [0, 1, 1]);

  const varName   = `button${btnNum}`;

  return (
    <div
      style={{
        position:        "absolute",
        left:            "50%",
        // Final Y position includes the per-card offset so cards peek above each other
        top:             `calc(50% + ${offset.y}px)`,
        transform:       `
          translate(calc(-50% + ${slideX}px), calc(-50% + ${slideY}px))
          rotate(${rotation}deg)
          scale(${scaleVal})
        `,
        transformOrigin: "center center",
        opacity,
        // z-index: later cards sit on top of earlier ones
        zIndex:          20 + stackIdx,
        width:           WIN_W,
        background:      "#0D1117",
        borderRadius:    16,
        overflow:        "hidden",
        // Shadow gets stronger on top cards to emphasise depth
        boxShadow:       `0 ${20 + stackIdx * 8}px ${60 + stackIdx * 10}px rgba(0,0,0,${0.7 + stackIdx * 0.06}), 0 0 0 1px rgba(255,255,255,0.08)`,
        fontFamily:      "'JetBrains Mono', monospace",
      }}
    >
      {/* ── Title bar ── */}
      <div style={{
        height: 96, background: "#161B22", display: "flex", alignItems: "center",
        padding: "0 32px", position: "relative",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
            <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          position: "absolute", left: 148, bottom: 0, height: 72,
          background: "#0D1117", padding: "0 32px",
          display: "flex", alignItems: "center", gap: 16,
          borderRadius: "10px 10px 0 0", fontSize: 26, fontWeight: 500, color: "#E6EDF3",
        }}>
          <div style={{
            background: "#F7DF1E", color: "#000", fontWeight: 900, fontSize: 18,
            width: 32, height: 32, display: "flex", alignItems: "flex-end",
            justifyContent: "flex-end", padding: "0 3px 2px 0", borderRadius: 5,
            fontFamily: "sans-serif", flexShrink: 0,
          }}>JS</div>
          scripts.js
        </div>
      </div>

      {/* ── Code body ── */}
      <div style={{
        padding: "44px 48px 52px",
        fontSize: FONT_SIZE,
        fontWeight: FONT_W,
        lineHeight: 1.85,
        color: SYN.plain,
        display: "flex", flexDirection: "column", gap: 2,
        overflow: "hidden",
      }}>
        <div style={{ whiteSpace: "nowrap" }}>
          <Tok color={SYN.plain}>{varName}.</Tok>
          <Tok color={SYN.method}>addEventListener</Tok>
          <Tok color={SYN.punct}>(</Tok>
          <Tok color={SYN.string}>'click'</Tok>
          <Tok color={SYN.punct}>, () </Tok>
          <Tok color={SYN.arrow}>={">"}</Tok>
          <Tok color={SYN.punct}> {"{"}</Tok>
        </div>
        <div style={{ whiteSpace: "nowrap", paddingLeft: 64 }}>
          <Tok color={SYN.plain}>{varName}.style.</Tok>
          <Tok color={SYN.method}>backgroundColor</Tok>
          <Tok color={SYN.punct}> </Tok>
          <Tok color={SYN.arrow}>=</Tok>
          <Tok color={SYN.punct}> </Tok>
          <Tok color={SYN.string}>'red'</Tok>
          <Tok color={SYN.punct}>;</Tok>
        </div>
        <div style={{ whiteSpace: "nowrap" }}>
          <Tok color={SYN.plain}>{"});"}</Tok>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Center button reset: red → white ──────────────────────────────────────
  const resetP = interpolate(frame, [0, T.resetEnd], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const cR = Math.round(interpolate(resetP, [0, 1], [230, 255]));
  const cG = Math.round(interpolate(resetP, [0, 1], [57,  255]));
  const cB = Math.round(interpolate(resetP, [0, 1], [70,  255]));
  const centerBg    = `rgb(${cR},${cG},${cB})`;
  const centerText  = resetP > 0.4 ? "#111111" : "#FFFFFF";
  const centerLabel = resetP > 0.5 ? "Click Me" : "Clicked!";
  const centerEmoji = resetP > 0.5 ? "😐" : "😎";

  // ── Cursor fades out ──────────────────────────────────────────────────────
  const cursorOpacity = interpolate(frame, [0, T.resetEnd], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Other buttons fade in ─────────────────────────────────────────────────
  const getOpacity = (idx: number): number => {
    if (idx === CENTER_IDX) return 1;
    const row     = Math.floor(idx / COLS);
    const stagger = row * 3;
    return interpolate(
      frame,
      [T.othersIn + stagger, T.othersInEnd + stagger],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
    );
  };

  // ── Zoom-out spring ───────────────────────────────────────────────────────
  const zoomSpring = spring({
    fps, frame: frame - T.zoomStart,
    config: { damping: 9, stiffness: 260, mass: 1.2 },
    durationInFrames: 45,
  });
  const containerScale = interpolate(zoomSpring, [0, 1], [1, FIT_SCALE]);

  // ── Blur overlay ──────────────────────────────────────────────────────────
  const blurP = interpolate(frame, [T.blurStart, T.blurEnd], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>

      {/* ── Cursor fading out ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: "50%", top: "50%",
        transform: "translate(calc(-50% + 210px), calc(-50% + 105px))",
        opacity: cursorOpacity, fontSize: 100, lineHeight: 1,
        zIndex: 20, pointerEvents: "none", userSelect: "none",
        filter: "drop-shadow(0px 15px 15px rgba(0,0,0,0.4))",
        rotate: "-10deg",
      }}>👆</div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      <div style={{
        transform:       `scale(${containerScale})`,
        transformOrigin: "center center",
        display:         "flex",
        flexDirection:   "column",
        gap:             V_GAP,
        zIndex:          5,
        filter:          `blur(${blurP * 6}px)`,
        opacity:         interpolate(blurP, [0, 1], [1, 0.3]),
      }}>
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} style={{ display: "flex", flexDirection: "row", gap: H_GAP }}>
            {Array.from({ length: COLS }, (_, col) => {
              const idx      = row * COLS + col;
              const isCenter = idx === CENTER_IDX;
              return (
                <Btn
                  key={idx}
                  frame={frame} fps={fps}
                  isCenter={isCenter}
                  centerBg={centerBg} centerText={centerText}
                  centerLabel={centerLabel} centerEmoji={centerEmoji}
                  gridOpacity={getOpacity(idx)}
                  clickFrame={getClickFrame(idx)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Dark overlay ─────────────────────────────────────────────────── */}
      <AbsoluteFill style={{
        background:    `rgba(8,8,8,${blurP * 0.6})`,
        zIndex:        6,
        pointerEvents: "none",
      }} />

      {/* ── Stacked code windows ─────────────────────────────────────────── */}
      {Array.from({ length: STACK_COUNT }, (_, i) =>
        frame >= stackFrame(i) ? (
          <StackedCodeWindow
            key={i}
            frame={frame}
            fps={fps}
            btnNum={i + 1}
            stackIdx={i}
          />
        ) : null
      )}

    </AbsoluteFill>
  );
};