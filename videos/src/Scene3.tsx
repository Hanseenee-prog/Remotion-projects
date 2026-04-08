// Scene 3 — "This is called a race condition.
//            That's why you sometimes see outdated or flickering results."
// Duration: 190 frames @ 30fps
//
// Frames  0–70 : Race standings board (tightened, exits in 5f)
// Frames 76–190: TV enters, zooms in, and flickers search results

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";

const FONTS = { sans: "Inter, system-ui, -apple-system, sans-serif" };

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function prog(f: number, a: number, b: number) { return clamp01((f - a) / (b - a)); }

function formatTimer(frame: number, startFrame: number, stopFrame?: number): string {
  const fps = 30;
  const raw = Math.max(0, (stopFrame !== undefined ? Math.min(frame, stopFrame) : frame) - startFrame);
  const totalMs = Math.floor((raw / fps) * 1000);
  const ms = totalMs % 1000;
  const secs = Math.floor(totalMs / 1000) % 60;
  const mins = Math.floor(totalMs / 60000);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}:${String(ms).padStart(3, "0")}`;
}

const ImposterAvatar: React.FC<{ color: string; backpack: string; size?: number }> = ({
  color, backpack, size = 52,
}) => (
  <svg width={size} height={size * 1.25} viewBox="0 0 80 100">
    <rect x="0" y="30" width="20" height="40" rx="8" fill={backpack} />
    <rect x="15" y="10" width="50" height="80" rx="25" fill={color} />
    <rect x="40" y="25" width="35" height="25" rx="12" fill="#8ab4f8" />
    <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
  </svg>
);

// ─── RaceRow ──────────────────────────────────────────────────────────────────
const RaceRow: React.FC<{
  position: number;
  name: string;
  avatarColor: string;
  avatarBackpack: string;
  timer: string;
  timerStopped: boolean;
  highlight: "green" | "gray" | "none";
  translateY: number;
  opacity: number;
}> = ({ position, name, avatarColor, avatarBackpack, timer, timerStopped, highlight, translateY, opacity }) => {
  const borderColor =
    highlight === "green" ? "rgba(52,211,120,0.8)" :
    highlight === "gray"  ? "rgba(255,255,255,0.1)" :
    "rgba(255,255,255,0.14)";
  const bgColor =
    highlight === "green" ? "rgba(52,211,120,0.09)" : "rgba(255,255,255,0.05)";
  const grayFilter = highlight === "gray" ? "grayscale(1) brightness(0.45)" : "none";

  return (
    <div style={{
      transform: `translateY(${translateY}px)`,
      opacity,
      filter: grayFilter,
      display: "flex", alignItems: "center", gap: 24,
      background: bgColor,
      border: `2.5px solid ${borderColor}`,
      borderRadius: 24, padding: "20px 28px",
      boxShadow: highlight === "green"
        ? "0 0 40px rgba(52,211,120,0.2), 0 8px 32px rgba(0,0,0,0.45)"
        : "0 4px 24px rgba(0,0,0,0.4)",
      backdropFilter: "blur(12px)",
    }}>
      {/* Position badge */}
      <div style={{
        width: 60, height: 60, borderRadius: 16, flexShrink: 0,
        background: position === 1
          ? "linear-gradient(135deg, #ffd700 0%, #ffaa00 100%)"
          : "rgba(255,255,255,0.09)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONTS.sans, fontSize: 30, fontWeight: 900,
        color: position === 1 ? "#1a1200" : "rgba(255,255,255,0.45)",
        boxShadow: position === 1 ? "0 4px 16px rgba(255,215,0,0.35)" : "none",
      }}>
        {position}
      </div>

      {/* Avatar */}
      <div style={{
        width: 72, height: 72, borderRadius: 20, flexShrink: 0,
        background: "rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <ImposterAvatar color={avatarColor} backpack={avatarBackpack} size={46} />
      </div>

      {/* Name + status */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: FONTS.sans, fontSize: 36, fontWeight: 800,
          color: "#fff", letterSpacing: -0.4,
        }}>
          {name}
        </div>
        <div style={{
          fontFamily: FONTS.sans, fontSize: 22, fontWeight: 500, marginTop: 4,
          color: timerStopped ? "rgba(255,255,255,0.35)" : "#00e5ff",
          letterSpacing: 0.2,
        }}>
          {timerStopped ? "✓ responded" : "in flight…"}
        </div>
      </div>

      {/* Timer */}
      <div style={{
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: 32, fontWeight: 700,
        color: timerStopped ? "rgba(255,255,255,0.3)" : "#00e5ff",
        background: "rgba(0,0,0,0.35)",
        borderRadius: 12, padding: "10px 18px",
        letterSpacing: 1.5, minWidth: 160, textAlign: "center" as const,
        textDecoration: timerStopped ? "line-through" : "none",
        opacity: timerStopped ? 0.55 : 1,
      }}>
        {timer}
      </div>
    </div>
  );
};

// ─── Retro TV Component ───────────────────────────────────────────────────────
const RetroTV: React.FC<{ screenContent?: React.ReactNode }> = ({ screenContent }) => (
  <div style={{ position: "relative", width: 800, height: 750 }}>
    <svg width="800" height="750" viewBox="0 0 800 750" fill="none">
      {/* 2 Legs */}
      <line x1="250" y1="530" x2="180" y2="720" stroke="#4a301d" strokeWidth="26" strokeLinecap="round" />
      <line x1="550" y1="530" x2="620" y2="720" stroke="#4a301d" strokeWidth="26" strokeLinecap="round" />

      {/* Antennas - top right */}
      <line x1="600" y1="150" x2="480" y2="20" stroke="#a0a0a0" strokeWidth="6" strokeLinecap="round" />
      <line x1="620" y1="150" x2="720" y2="10" stroke="#a0a0a0" strokeWidth="6" strokeLinecap="round" />
      <circle cx="480" cy="20" r="6" fill="#d0d0d0" />
      <circle cx="720" cy="10" r="6" fill="#d0d0d0" />

      {/* Main Body */}
      <rect x="50" y="150" width="700" height="420" rx="24" fill="#6a462f" />
      {/* Wood top edge highlight */}
      <rect x="50" y="150" width="700" height="20" rx="12" fill="#84593e" />
      {/* Inner frame bezel */}
      <rect x="65" y="165" width="670" height="390" rx="16" fill="#1a1a1a" />

      {/* CRT Screen Frame */}
      <rect x="80" y="180" width="460" height="360" rx="40" fill="#2a2a2a" />

      {/* Right Control Panel */}
      <rect x="560" y="180" width="155" height="360" rx="12" fill="#2a2a2a" />
      {/* Knobs */}
      <circle cx="637" cy="240" r="32" fill="#555" />
      <circle cx="637" cy="240" r="24" fill="#333" />
      <line x1="637" y1="216" x2="637" y2="228" stroke="#ccc" strokeWidth="4" strokeLinecap="round" />

      <circle cx="637" cy="330" r="32" fill="#555" />
      <circle cx="637" cy="330" r="24" fill="#333" />
      <line x1="637" y1="306" x2="637" y2="318" stroke="#ccc" strokeWidth="4" strokeLinecap="round" />

      {/* Speaker Grill */}
      {[...Array(8)].map((_, i) => (
        <rect key={i} x="592" y={400 + i * 14} width="90" height="7" rx="3" fill="#111" />
      ))}
    </svg>

    {/* Screen Content Wrapper */}
    <div style={{
      position: "absolute",
      top: 180, left: 80, width: 460, height: 360,
      borderRadius: 40, overflow: "hidden",
      backgroundColor: "#e0e5e0",
      boxShadow: "inset 0 0 40px rgba(0,0,0,0.6)",
    }}>
      {screenContent}
      
      {/* CRT Glare */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 45%)",
        pointerEvents: "none"
      }}/>
    </div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width } = useVideoConfig();

  // ════════════════════════════════════════════════════════
  // PART 1 — Race standings (frames 0–70)
  // ════════════════════════════════════════════════════════

  const titleP  = easeOut(prog(frame, 0, 16));
  const raceX   = interpolate(titleP, [0, 1], [-340, 0]);
  const condX   = interpolate(titleP, [0, 1], [360, 20]);
  const titleOp = clamp01(prog(frame, 0, 12));

  const tableSpring = spring({ frame: frame - 8, fps, from: 0, to: 1, config: { damping: 13, stiffness: 180 } });
  const tableScale  = interpolate(tableSpring, [0, 1], [0.88, 1]);
  const tableOp     = interpolate(frame, [8, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const REQ2_STOP = 28;
  const REQ1_STOP = 55;
  const timer1 = formatTimer(frame, 8, REQ1_STOP);
  const timer2 = formatTimer(frame, 8, REQ2_STOP);

  const SWAP_START = 34;
  const swapSpring = spring({ frame: frame - SWAP_START, fps, from: 0, to: 1, config: { damping: 18, stiffness: 140 } });
  const swapP  = clamp01(swapSpring);
  const ROW_H  = 116;
  const req2Y  = interpolate(swapP, [0, 1], [0, -ROW_H - 20]);
  const req1Y  = interpolate(swapP, [0, 1], [0, ROW_H + 40]);

  const req1Position = swapP > 0.5 ? 2 : 1;
  const req2Position = swapP > 0.5 ? 1 : 2;

  const HIGHLIGHT_START = 33;
  const applyHighlight  = frame >= HIGHLIGHT_START && swapP > 0.88;
  const req2Highlight: "green" | "gray" | "none" = applyHighlight ? "green" : "none";
  const req1Highlight: "green" | "gray" | "none" = applyHighlight ? "gray"  : "none";

  const row1Pop = spring({ frame: frame - 10, fps, from: 0, to: 1, config: { damping: 12, stiffness: 200 } });
  const row2Pop = spring({ frame: frame - 16, fps, from: 0, to: 1, config: { damping: 12, stiffness: 200 } });

  const part1Out = interpolate(frame, [68, 70], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ════════════════════════════════════════════════════════
  // PART 2 — TV & Flickering UI (frames 76–190)
  // ════════════════════════════════════════════════════════

  const part2Op = interpolate(frame, [76, 84], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // TV Enter & Zoom Math
  const tvEnterP = easeOut(prog(frame, 76, 100));
  const zoomP = easeOut(prog(frame, 110, 130));

  // Scale: Starts at 0.85 to fit screen comfortably, zooms to ~3.2 to fill screen with the CRT
  const tvScale = interpolate(zoomP, [0, 1], [0.85, 2.0]);
  
  // Translation to center the CRT screen when zoomed
  // TV center is (400, 375). CRT center is (310, 360). 
  // Offset needed: dx = 90, dy = 15
  const zoomTranslateX = interpolate(zoomP, [0, 1], [0, 90]);
  const zoomTranslateY = interpolate(zoomP, [0, 1], [0, 15]);
  
  // Entry animation (slides up slightly)
  const enterY = interpolate(tvEnterP, [0, 1], [150, 0]);

  // Flickering UI Logic
  const showResult = frame >= 135;
  let resultText = "";
  let isFlickering = false;

  // Paris -> Flicker -> Berlin -> Flicker -> Rome
  if (frame >= 135 && frame < 151) resultText = "Paris";
  else if (frame >= 151 && frame <= 154) isFlickering = true;
  else if (frame > 154 && frame < 169) resultText = "Berlin";
  else if (frame >= 169 && frame <= 172) isFlickering = true;
  else if (frame > 172) resultText = "Rome";

  // Pseudo-random noise generator for the flicker effect
  const pseudoRandom = (seed: number) => (Math.sin(seed * 12.9898) * 43758.5453) % 1;

  const screenContent = (
    <div style={{ width: "100%", height: "100%", padding: 24, display: "flex", flexDirection: "column", gap: 16, boxSizing: "border-box" }}>
      
      {/* Search Bar */}
      <div style={{
        background: "#fff", borderRadius: 24, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span style={{ fontSize: 22, fontWeight: 500, color: "#222" }}>Capital of France</span>
      </div>

      {/* Result Area */}
      {showResult && !isFlickering && (
        <div style={{
          background: "#fff", borderRadius: 20, flex: 1, padding: 20,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          display: "flex", flexDirection: "column", justifyContent: "center"
        }}>
          <span style={{ fontSize: 18, color: "#666", fontWeight: 500, marginBottom: 8 }}>Top Result</span>
          <span style={{ fontSize: 56, fontWeight: 800, color: "#1a73e8", lineHeight: 1 }}>{resultText}</span>
        </div>
      )}

      {/* Glitch / Static Overlay */}
      {isFlickering && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden" }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} style={{
              height: "5%", width: "100%",
              background: pseudoRandom(frame + i) > 0.5 ? "#222" : "#ccc",
              transform: `translateX(${(pseudoRandom(frame - i) - 0.5) * 30}px)`
            }} />
          ))}
        </div>
      )}
    </div>
  );

  const globalOut = interpolate(frame, [185, 190], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ fontFamily: FONTS.sans, overflow: "hidden" }}>

      <div style={{
        position: "absolute", top: "50%", left: "50%", width: 700, height: 700,
        transform: "translate(-50%, -50%)",
        background: "radial-gradient(circle, rgba(0,229,255,0.05) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ════════════════════ PART 1 — RACE BOARD ════════════════════ */}
      <div style={{ opacity: part1Out * globalOut, position: "relative", top: 500 }}>
        {/* Title */}
        <div style={{
          position: "absolute", top: 80, left: 0, right: 0,
          display: "flex", flexDirection: "column", alignItems: "center",
          opacity: titleOp,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <div style={{
              transform: `translateX(${raceX}px)`,
              fontFamily: FONTS.sans, fontSize: 100, fontWeight: 900,
              color: "#ea4335", letterSpacing: -3, lineHeight: 1,
              textShadow: "0 0 60px rgba(234,67,53,0.4)",
            }}>RACE</div>
            <div style={{
              transform: `translateX(${condX}px)`,
              fontFamily: FONTS.sans, fontSize: 100, fontWeight: 900,
              color: "#ffffff", letterSpacing: -3, lineHeight: 1,
            }}>CONDITIONS</div>
          </div>
          <div style={{
            opacity: tableOp,
            fontFamily: FONTS.sans, fontSize: 30, fontWeight: 600,
            color: "rgba(255,255,255,0.45)", letterSpacing: 3,
            textTransform: "uppercase", marginTop: 12,
          }}>Live Request Monitor</div>
        </div>

        {/* Leaderboard */}
        <div style={{
          position: "absolute", top: 310,
          left: "50%", transform: `translateX(-50%) scale(${tableScale})`,
          width: 1000, opacity: tableOp, transformOrigin: "top center",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 24,
            paddingLeft: 20, paddingRight: 28, paddingBottom: 16,
            borderBottom: "1.5px solid rgba(255,255,255,0.1)", marginBottom: 18,
          }}>
            <div style={{ width: 60, fontFamily: FONTS.sans, fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: 2 }}>POS</div>
            <div style={{ width: 72 }} />
            <div style={{ flex: 1, fontFamily: FONTS.sans, fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: 2 }}>REQUEST</div>
            <div style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.45)", letterSpacing: 2 }}>ELAPSED</div>
          </div>

          <div style={{ position: "relative" }}>
            <div style={{ marginBottom: 14, position: "relative", zIndex: swapP > 0.5 ? 1 : 2 }}>
              <RaceRow position={req1Position} name="Request_1" avatarColor="#ea4335" avatarBackpack="#c5221f" timer={timer1} timerStopped={frame >= REQ1_STOP} highlight={req1Highlight} translateY={req1Y} opacity={row1Pop} />
            </div>
            <div style={{ position: "relative", zIndex: swapP > 0.5 ? 2 : 1 }}>
              <RaceRow position={req2Position} name="Request_2" avatarColor="#00bcd4" avatarBackpack="#0097a7" timer={timer2} timerStopped={frame >= REQ2_STOP} highlight={req2Highlight} translateY={req2Y} opacity={row2Pop} />
            </div>
          </div>

          <div style={{ marginTop: 24, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, opacity: tableOp }}>
            <div style={{
              width: 12, height: 12, borderRadius: "50%",
              background: frame < REQ2_STOP + 6 ? "#ea4335" : "#34d399",
              boxShadow: frame < REQ2_STOP + 6 ? "0 0 0 5px rgba(234,67,53,0.25)" : "0 0 0 5px rgba(52,211,153,0.2)",
            }} />
            <div style={{ fontFamily: FONTS.sans, fontSize: 22, fontWeight: 700, color: frame < REQ2_STOP + 6 ? "#ea4335" : "#34d399", letterSpacing: 1.5 }}>
              {frame < REQ2_STOP + 6 ? "LIVE" : "RACE DECIDED"}
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════ PART 2 — TV + SCREEN UI ════════════════════ */}
      <div style={{ opacity: part2Op * globalOut }}>
        <div style={{
          position: "absolute",
          top: "50%", left: "50%",
          transform: `translate(-50%, -50%) scale(${tvScale}) translate(${zoomTranslateX}px, ${enterY + zoomTranslateY}px)`,
          zIndex: 10,
        }}>
          <RetroTV screenContent={screenContent} />
        </div>
      </div>

    </AbsoluteFill>
  );
};