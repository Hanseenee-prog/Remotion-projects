// Scene 5 — "@starting-style"
//
// Timeline:
//   1–15   : Top Pill badge enters (01 pops blue, text slides right)
//   1–12   : Code window slides UP to center (Bounce + Scale 0.8 -> 1)
//   10–20  : "@starting-style {" types out
//   45–65  : "opacity: 0;" types out (Starts at frame 45)
//   65–95  : "transform: scale(0.95);" types out
//   150-160: Code window scales down, fades out, and slides DOWN

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Constants & Palette ──────────────────────────────────────────────────────

const BLUE_ACCENT = "#6366F1"; 

const SYNTAX = {
  selector: COLORS.selector || "#7EE787", 
  property: COLORS.property || "#79C0FF", 
  value: COLORS.value || "#A5D6FF",    
  punctuation: COLORS.punctuation || "#C9D1D9",
  atRule: "#D2A8FF",                     
  number: "#FF7B72",                     
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(Math.max(v, lo), hi);
}

// ─── Code Window Shell ────────────────────────────────────────────────────────

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
      boxShadow: "0 40px 100px rgba(0,0,0,0.8)",
      ...style,
    }}>
      <div style={{
        display: "flex", alignItems: "center",
        background: "#0D1117",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingLeft: 24, height: 72,
      }}>
        <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 18, height: 18, borderRadius: "50%", background: c }} />
          ))}
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: COLORS.codeBg,
          borderRadius: "8px 8px 0 0",
          padding: "10px 24px 10px 16px",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none", marginBottom: -1,
        }}>
          <div style={{
            background: badge.bg, borderRadius: 5, padding: "2px 8px",
            fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
            color: "#fff", letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          }}>
            {badge.label}
          </div>
          <span style={{
            fontFamily: FONTS.mono, fontSize: 26, fontWeight: 600,
            color: COLORS.offWhite, letterSpacing: "0.01em",
          }}>
            {name}
          </span>
        </div>
      </div>
      <div style={{ padding: "30px 44px 36px 44px" }}>{children}</div>
    </div>
  );
};

// ─── Custom Typed Line Component ──────────────────────────────────────────────

const TypedLine: React.FC<{
  segments: { text: string; color: string }[];
  startFrame: number;
  endFrame: number;
  indent?: number;
}> = ({ segments, startFrame, endFrame, indent = 0 }) => {
  const frame = useCurrentFrame();
  const fullText = segments.map(s => s.text).join("");
  
  const progress = clamp((frame - startFrame) / (endFrame - startFrame));
  const totalCharsToShow = Math.floor(progress * fullText.length);

  if (totalCharsToShow === 0 && frame < startFrame) {
    return <div style={{ height: 38 * 1.95 }} />; 
  }

  let charsRemaining = totalCharsToShow;

  return (
    <div
      style={{
        fontFamily: FONTS.mono,
        fontSize: 38,
        fontWeight: 700,
        lineHeight: 1.95,
        paddingLeft: indent * 30,
        whiteSpace: "pre",
      }}
    >
      {segments.map((seg, i) => {
        const showLength = Math.min(seg.text.length, charsRemaining);
        charsRemaining -= showLength;
        return (
          <span key={i} style={{ color: seg.color }}>
            {seg.text.substring(0, showLength)}
          </span>
        );
      })}
    </div>
  );
};

// ─── Top Pill Component ───────────────────────────────────────────────────────

const TopPill: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const popSpring = spring({
    fps,
    frame: Math.max(0, frame - 1),
    config: { damping: 12, stiffness: 200 },
    durationInFrames: 10,
  });

  const slideSpring = spring({
    fps,
    frame: Math.max(0, frame - 6),
    config: { damping: 14, stiffness: 180 },
    durationInFrames: 12,
  });

  const textWidth = interpolate(slideSpring, [0, 1], [0, 310]);

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "stretch",
        height: 64,
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: BLUE_ACCENT,
          borderRadius: "16px 0 0 16px",
          padding: "0 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${popSpring})`,
          transformOrigin: "right center",
          border: `3px solid ${BLUE_ACCENT}`,
          zIndex: 2,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 36,
            fontWeight: 900,
            color: COLORS.codeBg,
            letterSpacing: "-0.02em",
          }}
        >
          01
        </span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
          width: textWidth,
          border: `3px solid ${BLUE_ACCENT}`,
          borderLeft: "none", 
          borderRadius: "0 16px 16px 0",
          paddingLeft: interpolate(slideSpring, [0, 1], [0, 18]),
          opacity: slideSpring > 0 ? 1 : 0,
        }}
      >
        <span
          style={{
            fontFamily: FONTS.mono,
            fontSize: 32,
            fontWeight: 800,
            color: BLUE_ACCENT,
            whiteSpace: "nowrap",
          }}
        >
          @starting-style
        </span>
      </div>
    </div>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowEntrance = spring({
    fps,
    frame: Math.max(0, frame - 1),
    config: { damping: 14, stiffness: 180 },
    durationInFrames: 12,
  });

  const windowExit = spring({
    fps,
    frame: Math.max(0, frame - 150),
    config: { damping: 20, stiffness: 200 },
    durationInFrames: 10,
  });

  const entranceY = frame <= 20 ? interpolate(windowEntrance, [0, 1], [800, 0]) : 0;
  const translateY = entranceY + interpolate(windowExit, [0, 1], [0, 200]);
  const scale = interpolate(windowEntrance, [0, 1], [0.8, 1]) * interpolate(windowExit, [0, 1], [1, 0.9]);
  const opacity = interpolate(windowExit, [0, 1], [1, 0]);

  // ── Phase 2: diagram animation (frames 160–252) ──────────────────────────
  
  const phaseInP = Math.min(Math.max((frame - 160) / 8, 0), 1);
  const phaseInEased = 1 - Math.pow(1 - phaseInP, 3);
  const travelP = Math.min(Math.max((frame - 170) / 50, 0), 1);
  const travelEased = 1 - Math.pow(1 - travelP, 3);
  const phaseOutP = Math.min(Math.max((frame - 244) / 8, 0), 1);
  const phaseOutOpacity = 1 - phaseOutP;

  // Geometry
  const LINE_X        = -280; // Repositioned line to the left
  const LINE_TOP_Y    = -260; 
  const LINE_BOTTOM_Y =  260; 
  const LINE_HEIGHT   = LINE_BOTTOM_Y - LINE_TOP_Y;
  const CARD_X        = 80;   // Repositioned card to the right of the line

  const cardTravelY  = LINE_BOTTOM_Y - travelEased * LINE_HEIGHT;
  const cardScale    = interpolate(travelEased, [0, 1], [0.88, 1.0]);
  const cardOpacity  = interpolate(travelEased, [0, 1], [0.35, 1.0]);

  const showPhase2 = frame >= 160;

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", }}>
      <TopPill />

      {/* ── Code window (frames 0–160) ── */}
      {frame < 160 && (
        <div style={{ transform: `translateY(${translateY}px) scale(${scale})`, opacity }}>
          <CodeWindow fileType="css">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95 }}>
                <span style={{ color: SYNTAX.selector }}>.card.show</span>{" "}
                <span style={{ color: SYNTAX.punctuation }}>{"{"}</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
                <span style={{ color: SYNTAX.property }}>display:</span> <span style={{ color: SYNTAX.value }}>block</span><span style={{ color: SYNTAX.punctuation }}>;</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
                <span style={{ color: SYNTAX.property }}>opacity:</span> <span style={{ color: SYNTAX.number }}>1</span><span style={{ color: SYNTAX.punctuation }}>;</span>
              </div>
              <div style={{ height: 38 * 1.95 }} />
              <div style={{ borderRadius: 10, background: "rgba(99, 102, 241, 0.10)", border: "1px solid rgba(99,102,241,0.25)", padding: "4px 10px", margin: "0 -10px" }}>
                <TypedLine segments={[{ text: "@starting-style ", color: SYNTAX.atRule }, { text: "{", color: SYNTAX.punctuation }]} startFrame={10} endFrame={20} indent={1} />
                <TypedLine segments={[{ text: "opacity", color: SYNTAX.property }, { text: ": ", color: SYNTAX.punctuation }, { text: "0", color: SYNTAX.number }, { text: ";", color: SYNTAX.punctuation }]} startFrame={45} endFrame={65} indent={2} />
                <TypedLine segments={[{ text: "transform", color: SYNTAX.property }, { text: ": ", color: SYNTAX.punctuation }, { text: "scale", color: SYNTAX.value }, { text: "(", color: SYNTAX.punctuation }, { text: "0.95", color: SYNTAX.number }, { text: ")", color: SYNTAX.punctuation }, { text: ";", color: SYNTAX.punctuation }]} startFrame={65} endFrame={95} indent={2} />
                <TypedLine segments={[{ text: "}", color: SYNTAX.punctuation }]} startFrame={18} endFrame={20} indent={1} />
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, color: SYNTAX.punctuation }}>{"}"}</div>
            </div>
          </CodeWindow>
        </div>
      )}

      {/* ── Phase 2: vertical timeline + travelling card (frames 160–252) ── */}
      {showPhase2 && (
        <div style={{ position: "absolute", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", opacity: phaseInEased * phaseOutOpacity,  position: "relative", left: 70  }}>
          
          {/* ── Thicker Vertical dashed line (Left) ── */}
          <div style={{
            position: "absolute",
            transform: `translateX(${LINE_X}px)`,
            width: 6, // Thicker line
            height: LINE_HEIGHT * phaseInEased,
            background: "repeating-linear-gradient(to bottom, rgba(255,255,255,0.4) 0px, rgba(255,255,255,0.4) 15px, transparent 15px, transparent 30px)",
            borderRadius: 3,
            top: "50%",
            marginTop: LINE_TOP_Y,
          }} />

          {/* ── Top & Bottom Checkpoint Dots ── */}
          <div style={{ position: "absolute", transform: `translate(${LINE_X + 14}px, ${LINE_TOP_Y + 20}px) translate(-50%, -50%)`, width: 30, height: 30, borderRadius: "50%", background: BLUE_ACCENT, boxShadow: `0 0 15px ${BLUE_ACCENT}` }} />
          <div style={{ position: "absolute", transform: `translate(${LINE_X + 14}px, ${LINE_BOTTOM_Y}px) translate(-50%, -50%)`, width: 30, height: 30, borderRadius: "50%", background: BLUE_ACCENT, boxShadow: `0 0 15px ${BLUE_ACCENT}` }} />

          {/* ── Top state labels (Before the line) ── */}
          <div style={{ 
            position: "absolute", 
            transform: `translate(${LINE_X - 40}px, ${LINE_BOTTOM_Y - 450}px) translateY(-50%)`, 
            right: "50%",
            border: `2px solid ${BLUE_ACCENT}`,
            borderRadius: 12,
            padding: "16px 24px",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 6
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>opacity: 1</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>scale(1)</div>
          </div>

          {/* ── Bottom state labels (Before the line) ── */}
          <div style={{ 
            position: "absolute", 
            transform: `translate(${LINE_X - 40}px, ${LINE_BOTTOM_Y + 50}px) translateY(-50%)`, 
            right: "50%",
            border: `2px solid ${BLUE_ACCENT}`,
            borderRadius: 12,
            padding: "16px 24px",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 6
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>opacity: 0</div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: "rgba(255,255,255,0.9)", whiteSpace: "nowrap" }}>scale(0.95)</div>
          </div>

          {/* ── Cable Car Pivot Link ── */}
          <div style={{ position: "absolute", transform: `translate(${LINE_X}px, ${cardTravelY}px)`, opacity: cardOpacity }}>
            {/* Roller Dot on Line */}
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: BLUE_ACCENT, boxShadow: `0 0 15px ${BLUE_ACCENT}`, position: "absolute", top: -8, left: -5 }} />
            {/* Horizontal Connecting Arm */}
            <div style={{ width: CARD_X + 20, height: 4, background: `linear-gradient(90deg, ${BLUE_ACCENT}, transparent)`, position: "absolute", top: -2, left: 0 }} />
          </div>

          {/* ── Travelling card (Internal Styles Untouched) ── */}
          <div style={{
            position: "absolute",
            transform: `translate(${LINE_X + CARD_X + 280}px, ${cardTravelY}px) scale(${cardScale})`, // 280 offset centers the card relative to pivot
            opacity: cardOpacity * phaseInEased,
            width: 560,
          }}>
            {/* CARD UI: IDENTICAL TO ORIGINAL */}
            <div style={{
              background: "#0D1117",
              border: "2px solid rgba(255,255,255,0.08)",
              padding: "40px 48px",
              borderRadius: 24,
              width: "100%",
              boxSizing: "border-box" as const,
              boxShadow: "0 40px 80px rgba(0,0,0,0.6)",
              color: "#E6EDF3",
              fontFamily: "system-ui, -apple-system, sans-serif",
            }}>
              <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 24 }}>
                <div style={{ minWidth: 72, height: 72, borderRadius: "50%", background: "#6B4FBB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🪄</div>
                <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, lineHeight: 1.3, letterSpacing: "-0.02em" }}>Animating display: block</h2>
              </div>
              <p style={{ fontSize: 27, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 28, marginTop: 0 }}>Learn to bridge the gap between none and block states for smooth transitions.</p>
              <div style={{ display: "flex" }}>
                <div style={{ background: "rgba(255,255,255,0.1)", padding: "10px 18px", borderRadius: 8, fontSize: 19, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>✨ <span>CSS Tricks</span></div>
              </div>
            </div>
          </div>

        </div>
      )}
    </AbsoluteFill>
  );
};