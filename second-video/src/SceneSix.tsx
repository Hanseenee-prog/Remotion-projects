// Scene 6 — "It's delayed, but each key press creates its own timer."
// 234 frames @ 30fps
//
// Fixes:
//   - 4 chars type ("Aven"), CHAR_INTERVAL=38 so they're spread out
//   - 3rd particle (idx 2, "Ave") is mid-journey as card when ZOOM_START hits
//   - NO dark overlay — everything else just dims via opacity
//   - Card zooms to screen center (scale up, move to CX/960), STAYS there till end
//   - Timer starts at ZOOM_START, counts continuously until end of scene
//   - Dots disappear (opacity → 0) when they reach the server (p >= 0.97)
//   - Scene fades out at 215–234

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

// ─── Layout ───────────────────────────────────────────────────────────────────

const CX          = 540;
const SERVER_Y    = 360;
const SEARCH_Y    = 1200;
const LINE_TOP_Y  = SERVER_Y + 90;
const LINE_BOT_Y  = SEARCH_Y - 28;
const LINE_HEIGHT = LINE_BOT_Y - LINE_TOP_Y;
const CANVAS_CY   = 960;   // vertical center of 1920px canvas

// ─── Timing ───────────────────────────────────────────────────────────────────

const WORD           = "Avengers";
const CHARS_TO_TYPE  = 4;    // "Aven" — 4th char launches 3rd into mid-card-zone
const CHAR_INTERVAL  = 38;   // slow enough that only 3-4 fire before pause
const TYPING_START   = 15;
const LAUNCH_DELAY   = 6;
const TRAVEL_FRAMES  = 110;  // total frames to travel full line

// The zoom target: particle idx 2 ("Ave") — it's in card-zone when ZOOM_START hits
// charFrame(2)=15+2*38=91, launchFrame(2)=97, at frame 130 elapsed=33, p=0.30 → just entering card zone ✓
const ZOOM_CHAR_IDX = 2;

// ZOOM_START: when everything freezes and card zooms to center
// At frame 130, particle 2 has p ≈ 0.30 (just became a card) — perfect
const ZOOM_START = 130;

// Zoom-in animation duration
const ZOOM_IN_DUR = 18;

const charFrame   = (i: number) => TYPING_START + i * CHAR_INTERVAL;
const launchFrame = (i: number) => charFrame(i) + LAUNCH_DELAY;

const CARD_COLORS = [
  COLORS.accentB,
];

// ─── Dot → Card thresholds ────────────────────────────────────────────────────

const DOT_TO_CARD = 0.30;
const CARD_TO_DOT = 0.70;

// ─── Keyboard ────────────────────────────────────────────────────────────────

const Keyboard: React.FC = () => (
  <svg width="700" height="140" viewBox="0 0 700 140" fill="none">
    <rect x="0" y="0" width="700" height="90" rx="14"
      fill="#1A1F2E" stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" />
    {[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map((i) => (
      <rect key={`f${i}`} x={10+i*49} y={8} width={40} height={22} rx={5}
        fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.8" />
    ))}
    {[0,1,2,3,4,5,6,7,8,9,10,11,12].map((i) => (
      <rect key={`m${i}`} x={10+i*52} y={36} width={44} height={24} rx={5}
        fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.10)" strokeWidth="0.8" />
    ))}
    {[0,1,2,3,4,5,6,7,8,9,10].map((i) => (
      <rect key={`b${i}`} x={26+i*60} y={66} width={50} height={22} rx={5}
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
  typedText: string; frame: number; active: boolean; scale: number;
}> = ({ typedText, frame, active, scale }) => (
  <div style={{
    width: 700,
    background: "#0D1117",
    border: `2.5px solid ${active ? COLORS.accentB : "rgba(255,255,255,0.14)"}`,
    borderRadius: 20,
    padding: "32px 40px",
    display: "flex", alignItems: "center", gap: 20,
    boxShadow: active ? `0 0 32px ${COLORS.accentB}28` : "none",
    transform: `scale(${scale})`,
    transformOrigin: "center center",
  }}>
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none"
      stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeLinecap="round">
      <circle cx="11" cy="11" r="7" />
      <line x1="16.5" y1="16.5" x2="22" y2="22" />
    </svg>
    <span style={{
      fontFamily: FONTS.mono, fontSize: 44, fontWeight: 700,
      color: COLORS.codeText, letterSpacing: "0.01em", flex: 1,
    }}>
      {typedText}
      <span style={{
        display: "inline-block", width: 3, height: "0.82em",
        background: COLORS.accentB, marginLeft: 4, verticalAlign: "middle",
        opacity: Math.floor(frame / 8) % 2 === 0 ? 1 : 0,
      }} />
    </span>
  </div>
);

// ─── Server ───────────────────────────────────────────────────────────────────

const ServerGraphic: React.FC<{ hitPulse: number }> = ({ hitPulse }) => {
  const scale  = interpolate(hitPulse, [0, 0.1, 1], [1.2, 1.28, 1.2]);
  const jerkY  = interpolate(hitPulse, [0, 0.1, 1], [0, -10, 0]);
  const shakeX = Math.sin(hitPulse * Math.PI * 2) * 5 * hitPulse;
  return (
    <div style={{
      position: "absolute", top: SERVER_Y, left: CX,
      transform: `translate(-50%, -50%) translate(${shakeX}px, ${jerkY}px) scale(${scale})`,
      display: "flex", flexDirection: "column", gap: 10, zIndex: 100,
    }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          width: 240, height: 55, background: "#161B22",
          border: `2px solid ${hitPulse > 0.4 ? COLORS.accentB : "#30363D"}`,
          borderRadius: 14, boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", padding: "0 25px", gap: 14,
        }}>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%",
              background: hitPulse > 0.1 ? COLORS.accentB : "#333" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%",
              background: hitPulse > 0.6 ? COLORS.accentA : "#333" }} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ width: 60, height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4 }} />
        </div>
      ))}
      <div style={{
        textAlign: "center", marginTop: 8,
        fontFamily: FONTS.mono, fontSize: 26, color: COLORS.subtle, fontWeight: 900,
      }}>
        MOVIE SERVER
      </div>
    </div>
  );
};

// ─── GET Card with circular timer ─────────────────────────────────────────────

const GetCard: React.FC<{
  query: string;
  color: string;
  showTimer: boolean;
  timerProgress: number;  // 0→1, fills the arc
}> = ({ query, color, showTimer, timerProgress }) => {
  const R = 28;
  const C = 2 * Math.PI * R;
  // Arc starts empty (full dashoffset) and fills up as timer runs
  const dashOffset = C * (1 - timerProgress);

  return (
    <div style={{
      background: COLORS.codeBg,
      border: `3px solid ${color}`,
      padding: "22px 36px 22px 32px",
      borderRadius: 20,
      fontFamily: FONTS.mono,
      fontSize: 34,
      fontWeight: 700,
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: 0,
      position: "relative",
      minWidth: 300,
      // Extra right padding to make room for the timer in bottom-right
      paddingBottom: showTimer ? 88 : 22,
      boxShadow: `0 8px 40px ${color}30`,
    }}>
      {/* Request text */}
      <div>
        <span style={{ color: COLORS.accentC }}>GET </span>
        <span style={{ color: color }}>"{query}"</span>
      </div>

      {/* Circular timer — bottom-right of card */}
      {showTimer && (
        <div style={{
          position: "absolute",
          bottom: 16, right: 16,
          width: 76, height: 76,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Background track */}
          <svg
            width="76" height="76" viewBox="0 0 76 76"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <circle
              cx="38" cy="38" r={R}
              fill="rgba(255,255,255,0.06)"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="5"
            />
            {/* Animated arc */}
            <circle
              cx="38" cy="38" r={R}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeDasharray={C}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 38 38)"
            />
          </svg>
          {/* Label */}
          <span style={{
            position: "relative",
            fontFamily: FONTS.mono,
            fontSize: 22,
            fontWeight: 800,
            color: color,
            zIndex: 1,
          }}>
            1s
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const SceneSix: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isPaused = frame >= ZOOM_START;

  // ── Typed text — stop typing after CHARS_TO_TYPE ──────────────────────────
  const charsTyped = Math.min(
    WORD.split("").filter((_, i) => i < CHARS_TO_TYPE && frame >= charFrame(i)).length,
    CHARS_TO_TYPE
  );
  const typedText = WORD.slice(0, charsTyped);

  // ── Entrance ─────────────────────────────────────────────────────────────
  const entranceO = clamp(prog(frame, 0, 18) * 3);
  const lineOp    = clamp(prog(frame, 10, 24) * 3);

  // ── Scene fade out ────────────────────────────────────────────────────────
  const sceneFade = interpolate(frame, [215, 234], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Search bar shoot recoil ───────────────────────────────────────────────
  const barScale = Array.from({ length: CHARS_TO_TYPE }).reduce<number>((acc, _, i) => {
    const lf = launchFrame(i);
    const spr = spring({ fps, frame: frame - lf, config: { stiffness: 350, damping: 14 } });
    return Math.max(acc, interpolate(spr, [0, 0.35, 1], [1, 1.08, 1]));
  }, 1);

  // ── Server hit pulse — only while not paused ──────────────────────────────
  const serverHit = Array.from({ length: CHARS_TO_TYPE }).reduce<number>((acc, _, i) => {
    if (isPaused) return acc;
    const hitF = launchFrame(i) + TRAVEL_FRAMES * 0.97;
    const diff = frame - hitF;
    if (diff > 0 && diff < 18) {
      return Math.max(acc, interpolate(diff, [0, 4, 18], [0, 1, 0]));
    }
    return acc;
  }, 0);

  // ── Active flash ──────────────────────────────────────────────────────────
  const lastCharF = charsTyped > 0 ? charFrame(charsTyped - 1) : -999;
  const isActive  = frame - lastCharF < 10 && !isPaused;

  // ── Zoom: card moves from its frozen Y to canvas center, stays there ──────
  // Frozen progress of ZOOM_CHAR_IDX at ZOOM_START
  const zoomLF              = launchFrame(ZOOM_CHAR_IDX);
  const elapsedAtFreeze     = ZOOM_START - zoomLF;
  const rawAtFreeze         = clamp(elapsedAtFreeze / TRAVEL_FRAMES);
  const progressAtFreeze    = easeOut(rawAtFreeze);
  const frozenLineY         = LINE_BOT_Y - progressAtFreeze * LINE_HEIGHT;

  // Zoom animation: ZOOM_START → ZOOM_START+ZOOM_IN_DUR
  const zoomInP = easeOut(prog(frame, ZOOM_START, ZOOM_START + ZOOM_IN_DUR));

  // Once ZOOM_IN_DUR is done, card stays at center for rest of scene
  const cardCenterY = isPaused
    ? interpolate(zoomInP, [0, 1], [frozenLineY, CANVAS_CY])
    : frozenLineY;

  // Card zoom scale: 1 → 2.2, then stays
  const cardZoomScale = isPaused
    ? interpolate(zoomInP, [0, 1], [1, 2.2])
    : 1;

  // ── Dim: everything except zoomed card dims to 0.12 opacity ──────────────
  // No overlay — just each element gets opacity multiplied by dimFactor
  const dimFactor = isPaused
    ? interpolate(zoomInP, [0, 1], [1, 0.4])
    : 1;

  // ── Timer: starts at ZOOM_START, counts to end of visible scene ───────────
  // Maps ZOOM_START → 215 (start of fade) = full 1s timer duration
  const timerProgress = isPaused
    ? clamp(prog(frame, ZOOM_START, 210))
    : 0;
  const showTimer = isPaused;

  // ── Per-particle progress ─────────────────────────────────────────────────
  // Non-zoom particles freeze at ZOOM_START
  // Zoom particle also freezes its position (but we override it to center)

  return (
    <AbsoluteFill style={{ background: "transparent", opacity: sceneFade }}>

      {/* ── Dashed vertical line ────────────────────────────────────────────── */}
      <svg style={{
        position: "absolute", top: 0, left: 0,
        width: 1080, height: 1920, pointerEvents: "none",
        opacity: lineOp * dimFactor, zIndex: 1,
      }} width="1080" height="1920">
        <line
          x1={CX} y1={LINE_TOP_Y} x2={CX} y2={LINE_BOT_Y}
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="6" strokeDasharray="14 11" strokeLinecap="round"
        />
      </svg>

      {/* ── Server ───────────────────────────────────────────────────────────── */}
      <div style={{ opacity: entranceO * dimFactor, zIndex: 90 }}>
        <ServerGraphic hitPulse={serverHit} />
      </div>

      {/* ── Non-zoom particles — freeze at ZOOM_START, dim during pause ──────── */}
      {Array.from({ length: CHARS_TO_TYPE }).map((_, i) => {
        if (i === ZOOM_CHAR_IDX) return null; // rendered separately below

        const lf = launchFrame(i);
        if (frame < lf) return null;

        // Clamp elapsed at ZOOM_START so they freeze
        const elapsed = isPaused
          ? Math.min(frame - lf, ZOOM_START - lf)
          : frame - lf;
        const raw = clamp(elapsed / TRAVEL_FRAMES);
        const p   = easeOut(raw);

        // Dots vanish when they reach the server
        if (p >= 0.97) return null;

        const y     = LINE_BOT_Y - p * LINE_HEIGHT;
        const color = CARD_COLORS[i % CARD_COLORS.length];

        // Dot / card logic
        const isCard = p >= DOT_TO_CARD && p <= CARD_TO_DOT;
        const isDot  = !isCard;

        const cardFadeIn  = clamp((p - DOT_TO_CARD) / 0.06);
        const cardFadeOut = clamp(1 - (p - CARD_TO_DOT) / 0.06);
        const cardVisScale = interpolate(
          easeOutBack(clamp((p - DOT_TO_CARD) / 0.06)), [0, 1], [0.7, 1]
        ) * (isCard ? cardFadeOut : 0);

        return (
          <div key={i} style={{
            position: "absolute",
            left: CX, top: y,
            transform: "translate(-50%, -50%)",
            zIndex: 30,
            opacity: dimFactor,
            pointerEvents: "none",
          }}>
            {isDot && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: color, boxShadow: `0 0 16px ${color}`,
              }} />
            )}
            {isCard && cardVisScale > 0.01 && (
              <div style={{ transform: `scale(${cardVisScale})`, transformOrigin: "center center" }}>
                <GetCard query={WORD.slice(0, i + 1)} color={color} showTimer={false} timerProgress={0} />
              </div>
            )}
          </div>
        );
      })}

      {/* ── ZOOM PARTICLE — always rendered, moves to center on pause ─────────── */}
      {(() => {
        const i   = ZOOM_CHAR_IDX;
        const lf  = launchFrame(i);
        if (frame < lf) return null;

        // Before pause: travel normally. After pause: frozen at its progress
        const elapsed = isPaused
          ? Math.min(frame - lf, ZOOM_START - lf)
          : frame - lf;
        const raw = clamp(elapsed / TRAVEL_FRAMES);
        const p   = easeOut(raw);

        // Vanish if it hits server before pause
        if (!isPaused && p >= 0.97) return null;

        const color = CARD_COLORS[i % CARD_COLORS.length];
        const isCard = p >= DOT_TO_CARD && p <= CARD_TO_DOT;
        const isDot  = !isCard;

        // Position: before pause = on line, after pause = animates to center
        const lineY = LINE_BOT_Y - p * LINE_HEIGHT;
        const finalX = CX;
        const finalY = isPaused ? cardCenterY : lineY;

        // Scale: before pause = normal card scale, after = zoomed
        const normalCardScale = isCard
          ? interpolate(easeOutBack(clamp((p - DOT_TO_CARD) / 0.06)), [0, 1], [0.7, 1])
            * clamp(1 - (p - CARD_TO_DOT) / 0.06)
          : 1;
        const finalScale = isPaused ? cardZoomScale : normalCardScale;

        return (
          <div key="zoom-particle" style={{
            position: "absolute",
            left: finalX, top: finalY,
            transform: `translate(-50%, -50%) scale(${finalScale})`,
            transformOrigin: "center center",
            zIndex: 200,  // always above everything
            pointerEvents: "none",
            willChange: "transform",
          }}>
            {isDot && !isPaused && (
              <div style={{
                width: 24, height: 24, borderRadius: "50%",
                background: color, boxShadow: `0 0 16px ${color}`,
              }} />
            )}
            {(isCard || isPaused) && (
              <GetCard
                query={WORD.slice(0, i + 1)}
                color={color}
                showTimer={showTimer}
                timerProgress={timerProgress}
              />
            )}
          </div>
        );
      })()}

      {/* ── Search bar + keyboard ─────────────────────────────────────────────── */}
      <div style={{
        position: "absolute",
        top: SEARCH_Y, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center",
        opacity: entranceO * dimFactor,
        zIndex: 40,
      }}>
        <SearchBar typedText={typedText} frame={frame} active={isActive} scale={barScale} />
        <div style={{ height: 24 }} />
        <div style={{
          transform: "perspective(700px) rotateX(30deg)",
          transformOrigin: "top center", opacity: 0.95,
        }}>
          <Keyboard />
        </div>
      </div>

    </AbsoluteFill>
  );
};