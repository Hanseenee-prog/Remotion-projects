// Scene 1 — "You're calling a function every single time you type… and that's fine"
//
// Key mechanics:
//   • Each character appears in the search bar FIRST
//   • Then, LAUNCH_DELAY frames later, its insertText box starts rising
//   • All 5 labels can be in-flight at the same time (independent timers)
//   • The label turns into a dot at 60% of the journey
//   • When it reaches the top, the letter tile pops in
//   • Gap between search bar and keyboard, taller search bar

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeOutBack = (t: number) => {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
function clamp(v: number, lo = 0, hi = 1) { return Math.min(hi, Math.max(lo, v)); }
function prog(frame: number, s: number, e: number) { return clamp((frame - s) / (e - s)); }

// ─── Constants ────────────────────────────────────────────────────────────────

const WORD          = "Hello";
// Tightened to make the 4th box show and 5th in flight before fade
const CHAR_INTERVAL = 22; 
const TYPING_START  = 25;

// After the char appears, wait this many frames before the label starts rising
const LAUNCH_DELAY  = 8;

// Tightened travel speed so boxes appear faster
const TRAVEL_FRAMES = 38;

// DOT_THRESHOLD: at this fraction of the journey, label → dot
const DOT_THRESHOLD = 0.60;

// Layout
const TILE_ROW_Y  = 300;
const SEARCH_Y    = 1080;        // search bar top Y

const LINE_TOP_Y  = TILE_ROW_Y + 190;
const LINE_BOT_Y  = SEARCH_Y - 30;
const LINE_HEIGHT = LINE_BOT_Y - LINE_TOP_Y;
const LINE_X      = 540;

const TILE_SIZE = 124;
const TILE_GAP  = 18;

const TILE_COLORS = [
  COLORS.accentA,  // H
  COLORS.accentB,  // e
  COLORS.accentC,  // l
  COLORS.accentD,  // l
  COLORS.accentA,  // o
];

const charFrame   = (i: number) => TYPING_START + i * CHAR_INTERVAL;
const launchFrame = (i: number) => charFrame(i) + LAUNCH_DELAY;
const arriveFrame = (i: number) => launchFrame(i) + TRAVEL_FRAMES;

// ─── Keyboard ────────────────────────────────────────────────────────────────

const Keyboard: React.FC = () => (
  <svg width="700" height="140" viewBox="0 0 700 140" fill="none">
    <rect x="0" y="0" width="700" height="90" rx="14"
      fill="#1A1F2E" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map((i) => (
      <rect key={`f${i}`} x={10 + i * 49} y={8} width={40} height={22} rx={5}
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
    ))}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
      <rect key={`m${i}`} x={10 + i * 52} y={36} width={44} height={24} rx={5}
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
    ))}
    {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
      <rect key={`b${i}`} x={26 + i * 60} y={66} width={50} height={22} rx={5}
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
    ))}
    <rect x={160} y={92} width={380} height={20} rx={5}
      fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.14)" strokeWidth="0.9" />
    <rect x={210} y={116} width={280} height={20} rx={6}
      fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.8" />
  </svg>
);

// ─── Search bar ───────────────────────────────────────────────────────────────

const SearchBar: React.FC<{ 
  typedText: string; 
  frame: number; 
  active: boolean;
  scale: number;
}> = ({
  typedText, frame, active, scale
}) => (
  <div style={{
    width: 700,
    background: "#0D1117",
    border: `2.5px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.14)"}`,
    borderRadius: 20,
    padding: "32px 40px",
    display: "flex",
    alignItems: "center",
    gap: 20,
    boxShadow: active ? `0 0 32px ${COLORS.accentB}28` : "none",
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }}>
    <span style={{ fontSize: 38, lineHeight: 1, opacity: 0.85 }}>💬</span>
    <span style={{
      fontFamily: FONTS.mono,
      fontSize: 44,
      fontWeight: 700,
      color: COLORS.codeText,
      letterSpacing: "0.01em",
      flex: 1,
    }}>
      {typedText}
      <span style={{
        display: "inline-block",
        width: 3,
        height: "0.82em",
        background: COLORS.accentB,
        marginLeft: 4,
        verticalAlign: "middle",
        opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
      }} />
    </span>
  </div>
);

// ─── Letter tile ──────────────────────────────────────────────────────────────

const LetterTile: React.FC<{
  letter: string;
  enterProgress: number;
  color: string;
}> = ({ letter, enterProgress, color }) => {
  const s = interpolate(easeOutBack(clamp(enterProgress)), [0, 1], [0, 1]);
  const o = clamp(enterProgress * 3);
  return (
    <div style={{
      width: TILE_SIZE, height: TILE_SIZE,
      borderRadius: 20,
      background: COLORS.codeBg,
      border: `3px solid ${color}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: o,
      transform: `scale(${s})`,
      transformOrigin: "center bottom",
      boxShadow: `0 4px 28px ${color}30`,
    }}>
      <span style={{
        fontFamily: FONTS.mono, fontSize: 56, fontWeight: 800, color,
      }}>
        {letter}
      </span>
    </div>
  );
};

// ─── Travelling label ────────────────────────────────────────────────────────

const TravellingCall: React.FC<{
  arg: string;
  progress: number;
  color: string;
}> = ({ arg, progress, color }) => {
  const isBeyond = progress >= DOT_THRESHOLD;

  const labelOpacity = isBeyond
    ? clamp(1 - (progress - DOT_THRESHOLD) / 0.07)
    : clamp(progress / 0.12);

  const dotOpacity = isBeyond
    ? clamp((progress - DOT_THRESHOLD) / 0.07) * clamp(1 - (progress - 0.93) / 0.07)
    : 0;

  const y = LINE_BOT_Y - progress * LINE_HEIGHT;

  return (
    <div style={{
      position: "absolute",
      left: LINE_X, top: y,
      transform: "translate(-50%, -50%)",
      pointerEvents: "none",
      zIndex: 10,
    }}>
      <div style={{
        opacity: labelOpacity,
        transform: "translateX(-50%)",
        marginLeft: "50%",
        whiteSpace: "nowrap",
        background: `${color}18`,
        border: `2px solid ${color}80`,
        borderRadius: 12,
        padding: "10px 22px",
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
      }}>
        <div style={{
          width: 10, height: 10,
          borderRadius: "50%",
          background: color,
          marginRight: 12, flexShrink: 0,
          boxShadow: `0 0 8px ${color}`,
        }} />
        <span style={{
          fontFamily: FONTS.mono, fontSize: 30, fontWeight: 700,
          letterSpacing: "0.01em",
        }}>
          <span style={{ color: COLORS.fnName }}>insertText</span>
          <span style={{ color: COLORS.punctuation }}>(</span>
          <span style={{ color: COLORS.string }}>"</span>
          <span style={{ color: COLORS.value }}>{arg}</span>
          <span style={{ color: COLORS.string }}>"</span>
          <span style={{ color: COLORS.punctuation }}>)</span>
        </span>
      </div>

      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 20, height: 20, borderRadius: "50%",
        background: color,
        opacity: dotOpacity,
        boxShadow: `0 0 14px ${color}`,
      }} />
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Search bar logic
  const charsTyped = WORD.split("").filter((_, i) => frame >= charFrame(i)).length;
  const typedText  = WORD.slice(0, charsTyped);

  // Entrance
  const entranceP = prog(frame, 0, 20);
  const entranceY = interpolate(easeOut(entranceP), [0, 1], [60, 0]);
  const entranceO = clamp(entranceP * 3);

  // Fade out timing: 4 tiles shown (arrive @ 137), 5th in flight (arrives @ 159)
  // Scene fades out between 145 and 160
  const sceneFade = interpolate(frame, [145, 160], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // Search Bar "Shooting" recoil
  const barScale = WORD.split("").reduce((acc, _, i) => {
    const launch = launchFrame(i);
    const spr = spring({
      fps,
      frame: frame - launch,
      config: { stiffness: 350, damping: 14 },
    });
    // Bar jumps slightly (1.08x) when shooting and snaps back
    const s = interpolate(spr, [0, 0.35, 1], [1, 1.08, 1]);
    return Math.max(acc, s);
  }, 1);

  // Tile appearance: Trigger spring exactly when label arrives at the top
  const tileEnterSprings = WORD.split("").map((_, i) => {
    // Ensures the pop happens exactly when the dot finishes its travel
    const popFrame = Math.max(0, frame + 8 - arriveFrame(i * 0.9));
    return spring({
      fps,
      frame: popFrame,
      config: { damping: 11, stiffness: 220, mass: 0.6 },
    });
  });

  // Travelling logic
  const labelProgresses = WORD.split("").map((_, i) => {
    if (frame < launchFrame(i)) return -1;
    const elapsed = frame - launchFrame(i);
    const raw = clamp(elapsed / TRAVEL_FRAMES);
    if (raw >= 1) return -1; 
    return easeOut(raw);
  });

  const lineOpacity = prog(frame, 18, 30);
  const lastCharFrame = charsTyped > 0 ? charFrame(charsTyped - 1) : -999;
  const isActive = frame - lastCharFrame < 12;

  const totalTileW  = WORD.length * TILE_SIZE + (WORD.length - 1) * TILE_GAP;
  const tileRowLeft = (1080 - totalTileW) / 2;

  return (
    <AbsoluteFill style={{ background: "transparent", opacity: sceneFade }}>

      <svg
        style={{
          position: "absolute", top: 0, left: 0,
          width: 1080, height: 1920,
          pointerEvents: "none", opacity: lineOpacity,
        }}
        width="1080" height="1920"
      >
        <line
          x1={LINE_X} y1={LINE_TOP_Y}
          x2={LINE_X} y2={LINE_BOT_Y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="6"
          strokeDasharray="14 11"
          strokeLinecap="round"
        />
      </svg>

      {/* Tiles at top */}
      <div style={{
        position: "absolute",
        top: TILE_ROW_Y,
        left: tileRowLeft,
        display: "flex",
        gap: TILE_GAP,
      }}>
        {WORD.split("").map((letter, i) => (
          <LetterTile
            key={i}
            letter={letter}
            enterProgress={tileEnterSprings[i]}
            color={TILE_COLORS[i]}
          />
        ))}
      </div>

      {/* Travelling labels */}
      {WORD.split("").map((_, i) => {
        const p = labelProgresses[i];
        if (p < 0) return null;
        return (
          <TravellingCall
            key={i}
            arg={WORD.slice(0, i + 1)}
            progress={p}
            color={TILE_COLORS[i]}
          />
        );
      })}

      {/* Bottom control center */}
      <div style={{
        position: "absolute",
        top: SEARCH_Y,
        left: 0, right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: entranceO,
        transform: `translateY(${entranceY}px)`,
      }}>
        <SearchBar 
          typedText={typedText} 
          frame={frame} 
          active={isActive} 
          scale={barScale}
        />

        <div style={{ height: 24 }} />

        <div style={{
          transform: "perspective(700px) rotateX(30deg)",
          transformOrigin: "top center",
          opacity: 0.95,
        }}>
          <Keyboard />
        </div>
      </div>

    </AbsoluteFill>
  );
};