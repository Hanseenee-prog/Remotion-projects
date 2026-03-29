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

const BLUE_ACCENT = "#6366F1"; // The Blue

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

// ─── Custom Typed Line Component with Syntax Support ──────────────────────────

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

  const translateY = interpolate(windowEntrance, [0, 1], [800, 0]) + 
                     interpolate(windowExit, [0, 1], [0, 200]);
                     
  const scale = interpolate(windowEntrance, [0, 1], [0.8, 1]) * interpolate(windowExit, [0, 1], [1, 0.9]);

  const opacity = interpolate(windowExit, [0, 1], [1, 0]);

  return (
    <AbsoluteFill
      style={{
        background: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <TopPill />

      <div style={{ 
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity 
      }}>
        <CodeWindow fileType="css">
          
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            
            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95 }}>
              <span style={{ color: SYNTAX.selector }}>.card.show</span>{" "}
              <span style={{ color: SYNTAX.punctuation }}>{"{"}</span>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
              <span style={{ color: SYNTAX.property }}>display:</span>{" "}
              <span style={{ color: SYNTAX.value }}>block</span>
              <span style={{ color: SYNTAX.punctuation }}>;</span>
            </div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
              <span style={{ color: SYNTAX.property }}>opacity:</span>{" "}
              <span style={{ color: SYNTAX.number }}>1</span>
              <span style={{ color: SYNTAX.punctuation }}>;</span>
            </div>
            {/* Empty line between declaration and opacity: 0 */}
            <div style={{ height: 38 * 1.95 }} />

            <TypedLine 
              segments={[
                { text: "@starting-style ", color: SYNTAX.atRule },
                { text: "{", color: SYNTAX.punctuation }
              ]}
              startFrame={10} 
              endFrame={20} 
              indent={1} 
            />
            
            <TypedLine 
              segments={[
                { text: "opacity", color: SYNTAX.property },
                { text: ": ", color: SYNTAX.punctuation },
                { text: "0", color: SYNTAX.number },
                { text: ";", color: SYNTAX.punctuation }
              ]}
              startFrame={45} 
              endFrame={65} 
              indent={2} 
            />
            
            <TypedLine 
              segments={[
                { text: "transform", color: SYNTAX.property },
                { text: ": ", color: SYNTAX.punctuation },
                { text: "scale", color: SYNTAX.value },
                { text: "(", color: SYNTAX.punctuation },
                { text: "0.95", color: SYNTAX.number },
                { text: ")", color: SYNTAX.punctuation },
                { text: ";", color: SYNTAX.punctuation }
              ]}
              startFrame={65} 
              endFrame={95} 
              indent={2} 
            />
            
            <TypedLine 
              segments={[{ text: "}", color: SYNTAX.punctuation }]}
              startFrame={18} 
              endFrame={20} 
              indent={1} 
            />

            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, color: SYNTAX.punctuation }}>
              {"}"}
            </div>

          </div>
        </CodeWindow>
      </div>
    </AbsoluteFill>
  );
};