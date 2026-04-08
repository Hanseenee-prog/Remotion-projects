// Scene 4 — AbortController code walkthrough
// 495 frames (16.5s) @ 30fps
//
// PHASES (shifted 30f earlier vs original, dim ramp = 6f):
//   A   0– 10f  "use AbortController" → title + gamepad springs in
//   B  10– 50f  title floats up to persistent header
//   C  50– 85f  code window slides in (all lines visible, no dim)
//   D  85–155f  "create a controller" → dim all except new-controller lines
//   F 155–225f  "new request" → dim all except fetch block; signal line extra-dim inside fetch
//   G 225–295f  "check if exists" → dim all except if(controller){…}
//   H 295–360f  "abort the previous" → dim all except cancel-comment + abort()
//   I 360–420f  "create new controller" → same as D
//   J 420–457f  "attach signal" → dim all except signal block
//   K 457–465f  global fade out

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

const C = COLORS;
const FONT = 34;
const LH = 1.75;
const DIM = 0.15; // dimmed line opacity
const FULL = 1;   // bright line opacity

// ─── Helpers ─────────────────────────────────────────────────────────────────
function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t: number) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
function prog(frame: number, start: number, end: number) {
  return clamp01((frame - start) / (end - start));
}
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

// ─── tok helper ──────────────────────────────────────────────────────────────
function tok(color: string, text: string, key?: string | number) {
  return (
    <span key={key} style={{ color, fontFamily: FONTS.mono, whiteSpace: "pre" }}>
      {text}
    </span>
  );
}

// ─── CodeWindow — exact styles from Scene3 ───────────────────────────────────
const CodeWindow: React.FC<{
  tabLabel: string;
  tabColor: string;
  fileName: string;
  children: React.ReactNode;
}> = ({ tabLabel, tabColor, fileName, children }) => (
  <div style={{
    width: 1000,
    borderRadius: 18,
    background: COLORS.codeBg,
    border: "1.5px solid rgba(255,255,255,0.12)",
    overflow: "hidden",
    boxShadow: "0 28px 72px rgba(0,0,0,0.8)",
  }}>
    {/* Title bar */}
    <div style={{
      display: "flex", alignItems: "center",
      background: "#0D1117",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      paddingLeft: 24, height: 72,
    }}>
      <div style={{ display: "flex", gap: 10, marginRight: 28 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => (
          <div key={col} style={{ width: 18, height: 18, borderRadius: "50%", background: col }} />
        ))}
      </div>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        background: COLORS.codeBg,
        borderRadius: "8px 8px 0 0",
        padding: "10px 24px 10px 16px",
        border: "1px solid rgba(255,255,255,0.08)",
        borderBottom: "none",
        marginBottom: -1,
      }}>
        <div style={{
          background: tabColor, borderRadius: 5, padding: "2px 8px",
          fontFamily: FONTS.mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}>
          {tabLabel}
        </div>
        <span style={{
          fontFamily: FONTS.mono, fontSize: 26,
          fontWeight: 600, color: COLORS.offWhite,
        }}>
          {fileName}
        </span>
      </div>
    </div>
    {/* Body */}
    <div style={{ padding: "40px 48px 48px" }}>{children}</div>
  </div>
);

// ─── Line component — single code line with opacity ──────────────────────────
const Line: React.FC<{ op: number; children: React.ReactNode }> = ({ op, children }) => (
  <div style={{
    opacity: op,
    lineHeight: LH,
    transition: "opacity 0.1s",
    whiteSpace: "pre",
    fontFamily: FONTS.mono,
    fontSize: FONT,
    fontWeight: 700,
    minHeight: FONT * LH,
  }}>
    {children}
  </div>
);

// ─── Gamepad SVG ─────────────────────────────────────────────────────────────
const GamepadSVG: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size * 0.65} viewBox="0 0 200 130" fill="none">
    {/* Body */}
    <path d="M30 40 Q20 20 50 20 L150 20 Q180 20 170 40 L160 100 Q155 120 130 115 L110 105 Q100 100 90 105 L70 115 Q45 120 40 100 Z"
      fill="#2a2d30" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
    {/* D-pad vertical */}
    <rect x="55" y="52" width="14" height="40" rx="4" fill="rgba(255,255,255,0.25)" />
    {/* D-pad horizontal */}
    <rect x="42" y="64" width="40" height="14" rx="4" fill="rgba(255,255,255,0.25)" />
    {/* ABXY buttons */}
    <circle cx="138" cy="58" r="8" fill="#ea4335" opacity={0.9} />   {/* B */}
    <circle cx="155" cy="72" r="8" fill="#34a853" opacity={0.9} />   {/* A */}
    <circle cx="122" cy="72" r="8" fill="#4285f4" opacity={0.9} />   {/* X */}
    <circle cx="138" cy="86" r="8" fill="#fbbc04" opacity={0.9} />   {/* Y */}
    {/* Center button */}
    <circle cx="100" cy="68" r="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    <circle cx="100" cy="68" r="5" fill="rgba(255,255,255,0.2)" />
    {/* Left stick */}
    <circle cx="78" cy="90" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    {/* Right stick */}
    <circle cx="122" cy="90" r="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
    {/* Shoulder bumpers */}
    <path d="M40 38 Q50 28 70 30 L70 40 Q55 38 40 48 Z" fill="rgba(255,255,255,0.1)" />
    <path d="M160 38 Q150 28 130 30 L130 40 Q145 38 160 48 Z" fill="rgba(255,255,255,0.1)" />
  </svg>
);

// ─── Cyan Among-Us imposter ───────────────────────────────────────────────────
const CyanImposter: React.FC<{ size: number; opacity: number; label?: string }> = ({ size, opacity, label }) => (
  <div style={{ opacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
    {label && (
      <div style={{
        fontFamily: FONTS.mono, fontSize: 28, fontWeight: 800,
        color: "#00bcd4",
        background: "rgba(0,188,212,0.15)",
        border: "1.5px solid rgba(0,188,212,0.4)",
        borderRadius: 20, padding: "6px 20px",
      }}>
        {label}
      </div>
    )}
    <svg width={size} height={size * 1.25} viewBox="0 0 80 100">
      <rect x="0" y="30" width="20" height="40" rx="8" fill="#0097a7" />
      <rect x="15" y="10" width="50" height="80" rx="25" fill="#00bcd4" />
      <rect x="40" y="25" width="35" height="25" rx="12" fill="#8ab4f8" />
      <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
    </svg>
  </div>
);

// ─── Gun SVG ─────────────────────────────────────────────────────────────────
const GunSVG: React.FC<{ size: number; muzzleFlash: boolean }> = ({ size, muzzleFlash }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 200 120" fill="none">
    {/* Barrel */}
    <rect x="10" y="44" width="130" height="22" rx="6" fill="#555" />
    {/* Body */}
    <rect x="60" y="40" width="80" height="55" rx="8" fill="#444" />
    {/* Grip */}
    <path d="M100 90 Q98 110 88 118 Q82 122 80 118 L85 90 Z" fill="#3a3a3a" />
    {/* Trigger guard */}
    <path d="M90 82 Q95 100 110 100 Q120 100 118 82" fill="none" stroke="#555" strokeWidth="5" />
    {/* Trigger */}
    <rect x="98" y="76" width="6" height="16" rx="2" fill="#666" />
    {/* Sight */}
    <rect x="120" y="36" width="10" height="8" rx="2" fill="#666" />
    {/* Muzzle flash */}
    {muzzleFlash && (
      <g>
        <circle cx="10" cy="55" r="18" fill="rgba(255,200,50,0.85)" />
        <circle cx="10" cy="55" r="10" fill="rgba(255,240,180,0.95)" />
        {[0,60,120,180,240,300].map((a, i) => (
          <line key={i}
            x1={10} y1={55}
            x2={10 + Math.cos(a * Math.PI / 180) * 28}
            y2={55 + Math.sin(a * Math.PI / 180) * 28}
            stroke="rgba(255,200,50,0.7)" strokeWidth="3" strokeLinecap="round"
          />
        ))}
      </g>
    )}
  </svg>
);

// ─── Main Scene ───────────────────────────────────────────────────────────────
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ══════════════════════════════════════════════════════════════
  // PHASE A  0–40f  —  Title + gamepad spring in
  // ══════════════════════════════════════════════════════════════
  const titleInSpring = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 160 } });
  const titleInOp = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const gamepadInSpring = spring({ frame: frame - 12, fps, from: 0, to: 1, config: { damping: 12, stiffness: 140 } });
  const gamepadInOp = interpolate(frame, [12, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Gamepad fades out as title moves up (frame 10–25)
  const gamepadOutOp = interpolate(frame, [10, 25], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const gamepadOp = gamepadInOp * gamepadOutOp;

  // ══════════════════════════════════════════════════════════════
  // PHASE B  10–50f  —  Title floats up to persistent header
  // ══════════════════════════════════════════════════════════════
  const titleMoveP = easeInOut(prog(frame, 12, 48));
  const TITLE_CENTER_Y = height / 2 - 140;
  const TITLE_HEADER_Y = 80;
  const titleY = lerp(TITLE_CENTER_Y, TITLE_HEADER_Y, titleMoveP);
  const titleFontSize = lerp(88, 56, titleMoveP);
  const headerOp = Math.min(titleInOp, 1);

  // ══════════════════════════════════════════════════════════════
  // PHASE C  50–85f  —  Code window slides in
  // ══════════════════════════════════════════════════════════════
  const winInP = easeOut(prog(frame, 52, 82));
  const winSlideY = lerp(120, 0, winInP);
  const winOp = clamp01(prog(frame, 52, 66));

  // Code window stays visible for entire rest of scene (no gun interlude)
  const codeWinOp = winOp;

  // ══════════════════════════════════════════════════════════════
  // DIM LOGIC — named opacity per "logical line group"
  // ══════════════════════════════════════════════════════════════

  // Dim ramp: 6 frames to snap to target, then hold
  // Phase boundaries shifted 30f earlier vs original

  type Phase = "none" | "D" | "F" | "G" | "H" | "I" | "J";

  const phase: Phase =
    frame <  85 ? "none" :
    frame < 155 ? "D" :
    frame < 225 ? "F" :
    frame < 295 ? "G" :
    frame < 360 ? "H" :
    frame < 420 ? "I" :
    frame < 457 ? "J" :
    "none";

  // Ramp 6 frames into each phase from FULL → target
  function lineOp(line: "L1" | "L2" | "L3" | "L4" | "L5" | "L6" | "L7" | "L8" | "L9" | "L10" | "L11" | "L12" | "L13" | "L14" | "L15" | "L16") {

    // Map phase → which lines are BRIGHT (everything else = DIM)
    // L1  = let controller;
    // L2  = function handleSearch(query) {
    // L3  = (blank line)
    // L4  = // Cancel previous request
    // L5  = if (controller) {
    // L6  =   controller.abort();
    // L7  = }
    // L8  = (blank line)
    // L9  = // New controller for new request
    // L10 = controller = new AbortController();
    // L11 = (blank line)
    // L12 = // New request
    // L13 = fetch(`/api/search?q=${query}`, {
    // L14 =   signal: controller.signal
    // L15 = })
    // L16 =   .then chain lines (treated as one group)

    const brightSets: Record<Phase, Set<typeof line>> = {
      none: new Set(["L1","L2","L3","L4","L5","L6","L7","L8","L9","L10","L11","L12","L13","L14","L15","L16"]),
      D: new Set(["L9","L10"]),
      F: new Set(["L12","L13","L15","L16"]),  // L14 (signal) extra-dim inside fetch block
      G: new Set(["L5","L7"]),
      H: new Set(["L4","L6"]),
      I: new Set(["L9","L10"]),
      J: new Set(["L14"]),
    };

    const isBright = brightSets[phase].has(line);
    const target = isBright ? FULL : DIM;

    // Signal line extra-dim in phase F
    if (phase === "F" && line === "L14") return DIM * 1;

    const phaseStart: Record<Phase, number> = {
      none: 0, D: 85, F: 155, G: 225, H: 295, I: 360, J: 420,
    };
    const ps = phaseStart[phase];
    if (phase === "none") return FULL;
    // 6-frame ramp into the phase, then hold at target
    const ramp = clamp01((frame - ps) / 6);
    return lerp(FULL, target, easeOut(ramp));
  }

  // ══════════════════════════════════════════════════════════════
  // GLOBAL FADE OUT  457–465f
  // ══════════════════════════════════════════════════════════════
  const globalOp = interpolate(frame, [485, 495], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ─── Code line renderers ────────────────────────────────────────────────────
  const sp = (n: number) => "\u00A0".repeat(n); // non-breaking spaces for indent

  return (
    <AbsoluteFill style={{ opacity: globalOp }}>

      {/* ── PERSISTENT HEADER — AbortController ── */}
      <div style={{
        position: "absolute",
        left: 0,
        top: titleY,
        width: "100%",
        textAlign: "center",
        opacity: headerOp,
        zIndex: 100,
        pointerEvents: "none",
      }}>
        {/* Pill container */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 16,
          background: "rgba(121,192,255,0.10)",
          border: "1.5px solid rgba(121,192,255,0.3)",
          borderRadius: 60,
          padding: "10px 36px",
        }}>
          <span style={{
            fontFamily: FONTS.display,
            fontSize: titleFontSize,
            fontWeight: 900,
            color: C.accentB,
            letterSpacing: -1,
            lineHeight: 1,
          }}>
            AbortController
          </span>
        </div>
      </div>

      {/* ── GAMEPAD (Phase A only) ── */}
      <div style={{
        position: "absolute",
        top: TITLE_CENTER_Y + 110,
        left: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: gamepadOp * (frame < 40 ? 1 : 1),
        transform: `scale(${0.5 + gamepadInSpring * 0.5})`,
        zIndex: 50,
      }}>
        <div style={{
          fontFamily: FONTS.display,
          fontSize: 28,
          color: C.muted,
          marginBottom: 20,
          letterSpacing: 1,
        }}>
          
        </div>
        <GamepadSVG size={260} />
      </div>

      {/* ── CODE WINDOW ── */}
      <div style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: frame >= 48 ? 180 : 0,
      }}>
        <div style={{
          opacity: codeWinOp,
          transform: `translateY(${winSlideY}px)`,
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="controller.js">

            {/* L1  let controller; */}
            <Line op={lineOp("L1")}>
              {tok(C.keyword, "let ")}
              {tok(C.codeText, "controller")}
              {tok(C.punctuation, ";")}
            </Line>

            {/* L2  function handleSearch(query) { */}
            <Line op={lineOp("L2")}>
              {tok(C.keyword, "function ")}
              {tok(C.fnName, "handleSearch")}
              {tok(C.punctuation, "(")}
              {tok(C.codeText, "query")}
              {tok(C.punctuation, ") {")}
            </Line>

            {/* L3  blank */}
            <Line op={lineOp("L3")}>{" "}</Line>

            {/* L4  // Cancel previous request */}
            <Line op={lineOp("L4")}>
              {sp(2)}{tok(C.comment, "// Cancel previous request")}
            </Line>

            {/* L5  if (controller) { */}
            <Line op={lineOp("L5")}>
              {sp(2)}{tok(C.keyword, "if")}
              {tok(C.punctuation, " (")}
              {tok(C.codeText, "controller")}
              {tok(C.punctuation, ") {")}
            </Line>

            {/* L6  controller.abort(); */}
            <Line op={lineOp("L6")}>
              {sp(4)}{tok(C.codeText, "controller")}
              {tok(C.punctuation, ".")}
              {tok(C.fnName, "abort")}
              {tok(C.punctuation, "();")}
            </Line>

            {/* L7  } */}
            <Line op={lineOp("L7")}>
              {sp(2)}{tok(C.punctuation, "}")}
            </Line>

            {/* L8  blank */}
            <Line op={lineOp("L8")}>{" "}</Line>

            {/* L9  // New controller for new request */}
            <Line op={lineOp("L9")}>
              {sp(2)}{tok(C.comment, "// New controller for new request")}
            </Line>

            {/* L10  controller = new AbortController(); */}
            <Line op={lineOp("L10")}>
              {sp(2)}{tok(C.codeText, "controller")}
              {tok(C.punctuation, " = ")}
              {tok(C.keyword, "new ")}
              {tok(C.fnName, "AbortController")}
              {tok(C.punctuation, "();")}
            </Line>

            {/* L11  blank */}
            <Line op={lineOp("L11")}>{" "}</Line>

            {/* L12  // New request */}
            <Line op={lineOp("L12")}>
              {sp(2)}{tok(C.comment, "// New request")}
            </Line>

            {/* L13  fetch(`/api/search?q=${query}`, { */}
            <Line op={lineOp("L13")}>
              {sp(2)}{tok(C.fnName, "fetch")}
              {tok(C.punctuation, "(`")}
              {tok(C.string, "/api/search?q=")}
              {tok(C.punctuation, "${")}
              {tok(C.codeText, "query")}
              {tok(C.punctuation, "}`,")}
              {tok(C.punctuation, " {")}
            </Line>

            {/* L14  signal: controller.signal  (extra-dim in phase F) */}
            <Line op={lineOp("L14")}>
              {sp(4)}{tok(C.property, "signal")}
              {tok(C.punctuation, ": ")}
              {tok(C.codeText, "controller")}
              {tok(C.punctuation, ".")}
              {tok(C.property, "signal")}
            </Line>

            {/* L15  }) */}
            <Line op={lineOp("L15")}>
              {sp(2)}{tok(C.punctuation, "})")}
            </Line>

            {/* L16  .then chain */}
            <Line op={lineOp("L16")}>
              {sp(4)}{tok(C.punctuation, ".")}
              {tok(C.fnName, "then")}
              {tok(C.punctuation, "(")}
              {tok(C.codeText, "res")}
              {tok(C.punctuation, " => ")}
              {tok(C.codeText, "res")}
              {tok(C.punctuation, ".")}
              {tok(C.fnName, "json")}
              {tok(C.punctuation, "())")}
            </Line>
            <Line op={lineOp("L16")}>
              {sp(4)}{tok(C.punctuation, ".")}
              {tok(C.fnName, "then")}
              {tok(C.punctuation, "(")}
              {tok(C.codeText, "data")}
              {tok(C.punctuation, " => {")}
            </Line>
            <Line op={lineOp("L16")}>
              {sp(6)}{tok(C.fnName, "updateUI")}
              {/* {tok(C.punctuation, ".")} */}
              {/* {tok(C.fnName, "log")} */}
              {tok(C.punctuation, "(")}
              {tok(C.codeText, "data")}
              {tok(C.punctuation, ");")}
            </Line>
            <Line op={lineOp("L16")}>
              {sp(4)}{tok(C.punctuation, "});")}
            </Line>
            <Line op={lineOp("L16")}>
              {sp(4)}{tok(C.punctuation, ".")}
              {tok(C.fnName, "catch")}
              {tok(C.punctuation, "(() => {});")}
              {sp(2)}{tok(C.comment, "// silences the error")}
            </Line>


            {/* closing brace of function */}
            <Line op={lineOp("L2")}>
              {tok(C.punctuation, "}")}
            </Line>

          </CodeWindow>
        </div>
      </div>

    </AbsoluteFill>
  );
};