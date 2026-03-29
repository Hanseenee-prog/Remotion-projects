// Scene 6 — "transition-behavior: allow-discrete"
//
// Timeline:
//   1–15   : Top Pill badge enters (02 pops pink, text slides right)
//   1–12   : Code window slides UP to center (Bounce + Scale 0.8 -> 1)
//   10–50  : "transition-behavior: allow-discrete;" types under the @starting-style block
//   90–98  : Code window slides out (exit)
//   100–115: Central Toggle pops in
//   115–150: Property cards pop in one-by-one in a circle
//   150–170: White dashed lines draw from center to cards
//   180    : Toggle switch flips (Red/Lock -> Green/Unlock)

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const PINK_ACCENT = "#EC4899";
const RED_STATE = "#EF4444";
const GREEN_STATE = "#22C55E";

const SYNTAX = {
  selector:    COLORS.selector    || "#7EE787",
  property:    COLORS.property    || "#79C0FF",
  value:       COLORS.value       || "#A5D6FF",
  punctuation: COLORS.punctuation || "#C9D1D9",
  atRule:      "#D2A8FF",
  number:      "#FF7B72",
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
    <div style={{
      fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95,
      paddingLeft: indent * 30, whiteSpace: "pre",
    }}>
      {segments.map((seg, i) => {
        const showLength = Math.min(seg.text.length, charsRemaining);
        charsRemaining -= showLength;
        return <span key={i} style={{ color: seg.color }}>{seg.text.substring(0, showLength)}</span>;
      })}
    </div>
  );
};

const TopPill: React.FC<{ opacity: number }> = ({ opacity }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const popSpring = spring({ fps, frame: Math.max(0, frame - 1), config: { damping: 12 }, durationInFrames: 10 });
  const slideSpring = spring({ fps, frame: Math.max(0, frame - 6), config: { damping: 14 }, durationInFrames: 12 });
  const textWidth = interpolate(slideSpring, [0, 1], [0, 370]);

  return (
    <div style={{
      position: "absolute", top: 80, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "stretch", height: 64, zIndex: 50, opacity
    }}>
      <div style={{
        background: PINK_ACCENT, borderRadius: "16px 0 0 16px", padding: "0 28px",
        display: "flex", alignItems: "center", justifyContent: "center",
        transform: `scale(${popSpring})`, transformOrigin: "right center", border: `3px solid ${PINK_ACCENT}`,
      }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 36, fontWeight: 900, color: COLORS.codeBg }}>02</span>
      </div>
      <div style={{
        display: "flex", alignItems: "center", overflow: "hidden", width: textWidth,
        border: `3px solid ${PINK_ACCENT}`, borderLeft: "none", borderRadius: "0 16px 16px 0",
        paddingLeft: interpolate(slideSpring, [0, 1], [0, 18]),
      }}>
        <span style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 800, color: PINK_ACCENT, whiteSpace: "nowrap" }}>
          transition-behavior
        </span>
      </div>
    </div>
  );
};

// ─── Diagram Components ──────────────────────────────────────────────────────

const PropertyCard: React.FC<{ 
    label: string; sub: string; angle: number; radius: number; 
    active: boolean; delay: number; lineProgress: number 
}> = ({ label, sub, angle, radius, active, delay, lineProgress }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - delay, fps, config: { damping: 12 } });
  
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;
  const color = active ? GREEN_STATE : RED_STATE;

  return (
    <>
      <svg style={{ position: "absolute", width: 2000, height: 2000, overflow: "visible", pointerEvents: "none", zIndex: 1 }}>
        <line 
          x1="1000" y1="1000" 
          x2={1000 + x * lineProgress} y2={1000 + y * lineProgress} 
          stroke="white" strokeWidth="6" strokeDasharray="12,14" 
          strokeDashoffset={frame * -1.8} opacity={0.3 * lineProgress} 
        />
      </svg>
      <div style={{
        position: "absolute", left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
        padding: "24px 40px", borderRadius: 24, background: "#161B22",
        border: `4px solid ${color}`, transform: `translate(-50%, -50%) scale(${pop})`,
        textAlign: "center", transition: "border-color 0.4s ease", zIndex: 10,
        width: "fit-content", minWidth: 280, boxShadow: active ? `0 0 40px ${GREEN_STATE}33` : "0 20px 60px rgba(0,0,0,0.5)",
      }}>
        <div style={{ color: SYNTAX.property, fontFamily: FONTS.mono, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{label}</div>
        <div style={{ color: "white", fontFamily: FONTS.mono, fontSize: 26, opacity: 0.5 }}>{sub}</div>
      </div>
    </>
  );
};

// ─── Main Scene ───────────────────────────────────────────────────────────────

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Code Window animations
  const winEntrance = spring({ fps, frame: Math.max(0, frame - 1), config: { damping: 14 }, durationInFrames: 12 });
  const winExit = spring({ fps, frame: Math.max(0, frame - 90), config: { damping: 20 }, durationInFrames: 8 });
  const winOpacity = interpolate(winExit, [0, 1], [1, 0]);
  const winTranslateY = interpolate(winEntrance, [0, 1], [800, 0]) + interpolate(winExit, [0, 1], [0, 300]);

  // Diagram animations
  const togglePop = spring({ frame: frame - 100, fps, config: { damping: 12 } });
  const isUnlocked = frame >= 180;
  const toggleSwitch = spring({ frame: frame - 180, fps, durationInFrames: 10 });
  const toggleColor = isUnlocked ? GREEN_STATE : RED_STATE;

  const PROPERTIES = [
    { label: "display", sub: "none → block" },
    { label: "flex-direction", sub: "row → column" },
    { label: "visibility", sub: "hidden → visible" },
    { label: "position", sub: "absolute → fixed" },
    { label: "overlay", sub: "none → auto" },
    { label: "text-align", sub: "left → right" },
  ];

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", transform: "scale(0.86)" }}>
      <TopPill opacity={winOpacity} />

      {/* ── 1. Code Window (Frames 0-100) ── */}
      {frame < 100 && (
        <div style={{ transform: `translateY(${winTranslateY}px) scale(${interpolate(winEntrance, [0, 1], [0.8, 1])})`, opacity: winOpacity }}>
          <CodeWindow fileType="css">
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95 }}>
                <span style={{ color: SYNTAX.selector }}>.card.show</span> <span style={{ color: SYNTAX.punctuation }}>{"{"}</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
                <span style={{ color: SYNTAX.property }}>display:</span> <span style={{ color: SYNTAX.value }}>block</span><span style={{ color: SYNTAX.punctuation }}>;</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
                <span style={{ color: SYNTAX.property }}>opacity:</span> <span style={{ color: SYNTAX.number }}>1</span><span style={{ color: SYNTAX.punctuation }}>;</span>
              </div>
              <div style={{ height: 38 * 1.5 }} />
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}>
                <span style={{ color: SYNTAX.atRule }}>@starting-style </span><span style={{ color: SYNTAX.punctuation }}>{"{"}</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 60 }}>
                <span style={{ color: SYNTAX.property }}>opacity:</span> <span style={{ color: SYNTAX.number }}>0</span><span style={{ color: SYNTAX.punctuation }}>;</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 60 }}>
                <span style={{ color: SYNTAX.property }}>transform:</span> <span style={{ color: SYNTAX.value }}>scale</span><span style={{ color: SYNTAX.punctuation }}>(</span><span style={{ color: SYNTAX.number }}>0.95</span><span style={{ color: SYNTAX.punctuation }}>);</span>
              </div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, paddingLeft: 30 }}><span style={{ color: SYNTAX.punctuation }}>{"}"}</span></div>
              <div style={{ height: 38 * 1.5 }} />
              <TypedLine 
                segments={[{ text: "transition-behavior", color: SYNTAX.property }, { text: ": ", color: SYNTAX.punctuation }, { text: "allow-discrete", color: SYNTAX.value }, { text: ";", color: SYNTAX.punctuation }]}
                startFrame={10} endFrame={50} indent={1}
              />
              <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, lineHeight: 1.95, color: SYNTAX.punctuation }}>{"}"}</div>
            </div>
          </CodeWindow>
        </div>
      )}

      {/* ── 2. Diagram (Frames 95-255) ── */}
      {frame >= 95 && (
        <div style={{ position: "absolute", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {PROPERTIES.map((p, i) => {
             const lineProgress = interpolate(frame, [145, 170], [0, 1], { extrapolateRight: "clamp" });
             return (
               <PropertyCard 
                 key={p.label} active={isUnlocked} label={p.label} sub={p.sub} 
                 angle={(i * 2 * Math.PI) / 6 - Math.PI / 2} radius={480} // Increased radius to move cards apart
                 delay={115 + i * 6} lineProgress={lineProgress}
               />
             );
          })}

          {/* Central Pill Toggle */}
          <div style={{
            position: "relative", width: 160, height: 80, borderRadius: 40, background: "#161B22",
            border: `5px solid ${toggleColor}`, transform: `scale(${togglePop})`, zIndex: 50,
            transition: "border-color 0.4s ease", boxShadow: `0 0 60px ${toggleColor}33`,
          }}>
            <div style={{
              position: "absolute", top: 6, left: interpolate(toggleSwitch, [0, 1], [6, 84]),
              width: 58, height: 58, borderRadius: "50%", background: toggleColor,
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background-color 0.4s ease",
            }}>
                <div style={{ color: "#0D1117" }}>
                  {isUnlocked ? (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 9.9-1" /></svg>
                  ) : (
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  )}
                </div>
            </div>
          </div>

          <div style={{
              position: "absolute", top: "calc(50% + 110px)", left: "50%", transform: `translateX(-50%) scale(${togglePop})`,
              fontFamily: FONTS.mono, fontSize: 32, color: toggleColor, fontWeight: 900,
              letterSpacing: "0.1em", textAlign: "center", width: 600, transition: "color 0.4s ease"
          }}>
            {isUnlocked ? "ALLOW-DISCRETE: ON" : "ALLOW-DISCRETE: OFF"}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};