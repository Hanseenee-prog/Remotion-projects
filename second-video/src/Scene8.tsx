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
  plain:  "#ABB2BF",
  method: "#C678DD",
  string: "#A5D6FF",
  arrow:  "#E06C75",
  punct:  "#ABB2BF",
  ident:  "#D19A66",
  kw:     "#56B6C2",
};

// ─── Layout ───────────────────────────────────────────────────────────────────
const VIDEO_W      = 1080;
const VIDEO_H      = 1920;
const PARENT_W0    = 700;
const PARENT_W1    = 780;
const PARENT_H     = 700;
const PARENT_Y0    = VIDEO_H / 2 - PARENT_H / 2 - 20; // 590
const PARENT_MOVE_UP = 330;
const PARENT_Y1    = PARENT_Y0 - PARENT_MOVE_UP;        // 260

const BTN_W        = 190;
const BTN_H        = 80;
const BTN_GAP      = 22;
const BTN_TOTAL_W  = 3 * BTN_W + 2 * BTN_GAP;

const WIN_W        = 960;
const WIN_H_SMALL  = 380;  // 3-line window (initial)
const WIN_H_FULL   = 530;  // 5-line window (full code)
const BOTTOM_PAD   = 200;
const WIN_REST_TOP = VIDEO_H - BOTTOM_PAD - WIN_H_SMALL; // 1340
const WIN_CENTER_Y = VIDEO_H / 2 - WIN_H_FULL / 2;       // 695
const WIN_LEFT     = (VIDEO_W - WIN_W) / 2;               // 60

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  resetEnd:     15,
  moveEnd:      45,
  badgeStart:   55,
  // Overlay + code window rises to center
  overlayIn:    80,
  overlayEnd:   90,
  winRiseStart: 80,
  winRiseEnd:   92,
  // Paste: new lines appear with highlight 93-103
  pasteStart:   93,
  pasteEnd:     103,
  // Hold 103-160, then return
  returnStart:  160,
  returnEnd:    180,
} as const;

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const prog  = (f: number, a: number, b: number) => clamp((f - a) / (b - a));

// ─── Radar icon ───────────────────────────────────────────────────────────────
const RadarIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6a14 14 0 0 1 20 0" />
    <path d="M5 9a9 9 0 0 1 14 0" />
    <path d="M8 12a4 4 0 0 1 8 0" />
    <path d="M12 12v8" />
    <circle cx="12" cy="20" r="1.8" fill={color} stroke="none" />
  </svg>
);

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ══════════════════════════════════════════════════════
  // PHASE 1 — 0-45: parent rises, buttons split, win in
  // ══════════════════════════════════════════════════════
  const resetP      = prog(frame, 0, T.resetEnd);
  const btnBg       = `rgb(${Math.round(interpolate(resetP,[0,1],[230,255]))},${Math.round(interpolate(resetP,[0,1],[57,255]))},${Math.round(interpolate(resetP,[0,1],[70,255]))})`;
  const btnTextC    = resetP > 0.4 ? "#111111" : "#FFFFFF";
  const btnLabel    = resetP > 0.5 ? "Click Me" : "Clicked!";
  const btnEmoji    = resetP > 0.5 ? "😐" : "😎";
  const textOpacity = interpolate(frame, [0, 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Border: red → gray during reset, then back to full opacity during overlay phase
  const borderResetP  = prog(frame, 0, T.resetEnd);
  const returnOpacity = interpolate(frame, [T.returnStart, T.returnEnd], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const borderAlpha   = frame >= T.returnStart ? returnOpacity : interpolate(borderResetP, [0, 1], [1, 0.4]);
  const borderR       = Math.round(interpolate(borderResetP, [0, 1], [230, 150]));
  const borderG       = Math.round(interpolate(borderResetP, [0, 1], [57,  150]));
  const borderB       = Math.round(interpolate(borderResetP, [0, 1], [70,  165]));
  const borderColor   = `rgba(${borderR},${borderG},${borderB},${borderAlpha})`;

  const moveSpring = spring({ fps, frame, config: { damping: 18, stiffness: 100, mass: 1.0 }, durationInFrames: T.moveEnd });
  const moveP      = Math.min(1, moveSpring); // 0→1: center → top position

  // Parent returns to center alongside the code window exit
  const parentReturnSpring = spring({ fps, frame: frame - T.returnStart, config: { damping: 18, stiffness: 100, mass: 1.0 }, durationInFrames: 22 });
  const returnP            = frame >= T.returnStart ? Math.min(1, parentReturnSpring) : 0;

  const parentY = frame >= T.returnStart
    ? interpolate(returnP, [0, 1], [PARENT_Y1, PARENT_Y0])
    : interpolate(moveP,   [0, 1], [PARENT_Y0, PARENT_Y1]);

  const parentW = frame >= T.returnStart
    ? interpolate(returnP, [0, 1], [PARENT_W1, PARENT_W0])
    : interpolate(moveP,   [0, 1], [PARENT_W0, PARENT_W1]);

  const parentX    = (VIDEO_W - parentW) / 2;

  const btnSideSpring = spring({ fps, frame: frame - 8, config: { damping: 14, stiffness: 130, mass: 0.8 }, durationInFrames: 32 });
  const sideP         = Math.max(0, btnSideSpring);
  const ctrBtnX       = parentW / 2 - BTN_W / 2;
  const leftBtnLeft   = interpolate(sideP, [0, 1], [ctrBtnX, parentW / 2 - BTN_TOTAL_W / 2]);
  const midBtnLeft    = parentW / 2 - BTN_W / 2;
  const rightBtnLeft  = interpolate(sideP, [0, 1], [ctrBtnX, parentW / 2 + BTN_TOTAL_W / 2 - BTN_W]);
  const sideOpacity   = interpolate(sideP, [0, 0.15, 1], [0, 1, 1]);
  const BTN_TOP       = PARENT_H / 2 + 80 - BTN_H / 2;

  // ══════════════════════════════════════════════════════
  // CODE WINDOW POSITION — 3 phases
  // ══════════════════════════════════════════════════════
  // Phase A: slides in from bottom (0-45) → rests at WIN_REST_TOP
  const winInSpring = spring({ fps, frame: frame - 5, config: { damping: 18, stiffness: 100, mass: 1.0 }, durationInFrames: T.moveEnd });
  const winRestPos  = interpolate(winInSpring, [0, 1], [VIDEO_H + 100, WIN_REST_TOP]);

  // Phase B: rises to center (80-92)
  const winRiseSpring = spring({ fps, frame: frame - T.winRiseStart, config: { damping: 16, stiffness: 130, mass: 0.85 }, durationInFrames: 14 });
  const winRisePos    = interpolate(winRiseSpring, [0, 1], [WIN_REST_TOP, WIN_CENTER_Y]);

  // Phase C: returns to bottom (160-180)
  const winReturnSpring = spring({ fps, frame: frame - T.returnStart, config: { damping: 18, stiffness: 100, mass: 1.0 }, durationInFrames: 22 });
  const winReturnPos    = interpolate(winReturnSpring, [0, 1], [WIN_CENTER_Y, VIDEO_H + 100]);

  // Pick which position applies
  let winTop: number;
  if (frame < T.winRiseStart) {
    winTop = winRestPos;
  } else if (frame < T.returnStart) {
    winTop = winRisePos;
  } else {
    winTop = winReturnPos;
  }

  const winOpacity = interpolate(winInSpring, [0, 0.08, 1], [0, 1, 1]);

  // ══════════════════════════════════════════════════════
  // EYES
  // ══════════════════════════════════════════════════════
  const blinkCycle = frame % 22;
  const isBlinking = blinkCycle > 17;
  const eyeScaleY  = isBlinking ? interpolate(blinkCycle, [17, 19, 22], [1, 0.06, 1]) : 1;
  const pupilSide  = Math.sin(frame * 0.08) * 5;

  // ══════════════════════════════════════════════════════
  // PHASE 2 — BADGE (55+)
  // ══════════════════════════════════════════════════════
  const badgeSpring   = spring({ fps, frame: frame - T.badgeStart, config: { damping: 9, stiffness: 280, mass: 0.6 }, durationInFrames: 14 });
  const badgeScale    = frame >= T.badgeStart ? Math.max(0, badgeSpring) : 0;
  const badgeOpacity  = frame >= T.badgeStart ? Math.min(1, badgeSpring * 3) : 0;
  const BADGE_SIZE    = 110;
  const badgeAbsX     = parentX - BADGE_SIZE * 0.4;
  const badgeAbsY     = parentY - BADGE_SIZE * 0.4;

  // ══════════════════════════════════════════════════════
  // PHASE 3 — OVERLAY (80-180)
  // ══════════════════════════════════════════════════════
  const overlayIn  = interpolate(frame, [T.overlayIn, T.overlayEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const overlayOut = interpolate(frame, [T.returnStart, T.returnEnd], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const overlayOp  = frame < T.returnStart ? overlayIn : overlayOut;

  // ══════════════════════════════════════════════════════
  // PHASE 3 — PASTE EFFECT (93-103)
  // ══════════════════════════════════════════════════════
  // New lines: "e" param, if-block (3 lines)
  // Line timing: staggered within 93-103
  // Line A: "(e) =>" replaces "() =>"   → already on screen, just highlight
  // Line B: "  if (e.target.classList.contains('btn')) {" → frame 93
  // Line C: "    e.target.style.backgroundColor = 'red';" → frame 96
  // Line D: "  }" → frame 100
  // Lines paste in — highlight fades in then out over ~8 frames each

  // Typewriter: each line types quickly, staggered
  // Line B: frame 93-97 (4 frames), Line C: 97-101, Line D: 101-103
  const typeW = (start: number, end: number) =>
    interpolate(frame, [start, end], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const lineBW = typeW(T.pasteStart,     T.pasteStart + 4);
  const lineCW = typeW(T.pasteStart + 4, T.pasteStart + 8);
  const lineDW = typeW(T.pasteStart + 8, T.pasteStart + 10);

  const showLineB = frame >= T.pasteStart;
  const showLineC = frame >= T.pasteStart + 4;
  const showLineD = frame >= T.pasteStart + 8;

  // Cursor blink — fast for typing feel
  const cursorOn   = Math.floor(frame / 4) % 2 === 0;
  const cursorChar = cursorOn ? "▌" : " ";
  const typingB    = frame >= T.pasteStart     && frame < T.pasteStart + 4;
  const typingC    = frame >= T.pasteStart + 4 && frame < T.pasteStart + 8;
  const typingD    = frame >= T.pasteStart + 8 && frame < T.pasteStart + 10;

  // Show full code once paste starts
  const showFullCode   = frame >= T.pasteStart;

  return (
    <AbsoluteFill>

      {/* ── Overlay ──────────────────────────────────────────────────────── */}
      {overlayOp > 0 && (
        <AbsoluteFill style={{
          background:    `rgba(6,8,16,${overlayOp * 0.72})`,
          zIndex:        18,
          pointerEvents: "none",
        }} />
      )}

      {/* ── Parent container ─────────────────────────────────────────────── */}
      <div style={{
        position:        "absolute",
        left:            parentX,
        top:             parentY,
        width:           parentW,
        height:          PARENT_H,
        borderRadius:    28,
        background:      "transparent",
        border:          `6px solid ${borderColor}`,
        zIndex:          10,
        overflow:        "visible",
      }}>
        {/* Parent pill label */}
        <div style={{
          position:      "absolute", top: -22, left: "50%",
          transform:     "translateX(-50%)",
          fontFamily:    "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
          color:         "#FFFFFF", letterSpacing: "0.08em",
          background:    "rgba(150,150,165,0.18)", border: "1.5px solid rgba(150,150,165,0.45)",
          borderRadius:  "100px", padding: "6px 24px", whiteSpace: "nowrap",
        }}>parent</div>

        {/* Eyes */}
        <div style={{ display: "flex", gap: 60, position: "absolute", top: 40, left: "50%", transform: "translateX(-50%)" }}>
          {[0, 1].map((eye) => (
            <div key={eye} style={{
              width: 50, height: 50, borderRadius: "50%", background: "#FFFFFF",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
              transform: `scaleY(${eyeScaleY})`, transformOrigin: "center center", overflow: "hidden",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", background: "#1a1a2e", position: "relative",
                transform: `translate(${pupilSide}px, 5px)`,
              }}>
                <div style={{ position: "absolute", top: 3, right: 3, width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", opacity: 0.85 }} />
              </div>
            </div>
          ))}
        </div>

        {/* "Who clicked that?" fading out */}
        <div style={{
          position: "absolute", top: 130, left: "50%", transform: "translateX(-50%)",
          opacity: textOpacity, fontFamily: "'JetBrains Mono', monospace",
          fontSize: 30, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", pointerEvents: "none",
        }}>👉 "Who clicked that?"</div>

        {/* 3 buttons */}
        {/* Left */}
        <div style={{ position: "absolute", left: leftBtnLeft, top: BTN_TOP, width: BTN_W, height: BTN_H, opacity: sideOpacity }}>
          <div style={{ width: BTN_W, height: BTN_H, borderRadius: 18, backgroundColor: "#FFFFFF", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
            Click Me <span style={{ fontSize: 26 }}>😐</span>
          </div>
          <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "rgba(171,178,191,0.5)", whiteSpace: "nowrap" }}>button1</div>
        </div>
        {/* Center */}
        <div style={{ position: "absolute", left: midBtnLeft, top: BTN_TOP, width: BTN_W, height: BTN_H }}>
          <div style={{ width: BTN_W, height: BTN_H, borderRadius: 18, backgroundColor: btnBg, color: btnTextC, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
            {btnLabel} <span style={{ fontSize: 26 }}>{btnEmoji}</span>
          </div>
          <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "rgba(171,178,191,0.5)", whiteSpace: "nowrap" }}>button2</div>
        </div>
        {/* Right */}
        <div style={{ position: "absolute", left: rightBtnLeft, top: BTN_TOP, width: BTN_W, height: BTN_H, opacity: sideOpacity }}>
          <div style={{ width: BTN_W, height: BTN_H, borderRadius: 18, backgroundColor: "#FFFFFF", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 24, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", boxShadow: "0 6px 20px rgba(0,0,0,0.4)" }}>
            Click Me <span style={{ fontSize: 26 }}>😐</span>
          </div>
          <div style={{ position: "absolute", bottom: -26, left: "50%", transform: "translateX(-50%)", fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "rgba(171,178,191,0.5)", whiteSpace: "nowrap" }}>button3</div>
        </div>
      </div>

      {/* ── Code window ──────────────────────────────────────────────────── */}
      <div style={{
        position:     "absolute",
        left:         WIN_LEFT,
        top:          winTop,
        width:        WIN_W,
        opacity:      winOpacity,
        background:   "#0D1117",
        borderRadius: 16,
        overflow:     "hidden",
        boxShadow:    frame >= T.winRiseStart && frame < T.returnEnd
          ? "0 30px 100px rgba(0,0,0,0.95), 0 0 0 1px rgba(86,182,194,0.15)"
          : "0 30px 80px rgba(0,0,0,0.85)",
        border:       "1px solid rgba(255,255,255,0.1)",
        fontFamily:   "'JetBrains Mono', monospace",
        zIndex:       22,
      }}>
        {/* Title bar */}
        <div style={{ height: 96, background: "#161B22", display: "flex", alignItems: "center", padding: "0 32px", position: "relative", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
              <div key={c} style={{ width: 20, height: 20, borderRadius: "50%", background: c }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: 148, bottom: 0, height: 72, background: "#0D1117", padding: "0 32px", display: "flex", alignItems: "center", gap: 16, borderRadius: "10px 10px 0 0", fontSize: 26, fontWeight: 500, color: "#E6EDF3" }}>
            <div style={{ background: "#F7DF1E", color: "#000", fontWeight: 900, fontSize: 18, width: 32, height: 32, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: "0 3px 2px 0", borderRadius: 5, fontFamily: "sans-serif", flexShrink: 0 }}>JS</div>
            scripts.js
          </div>
        </div>

        {/* Code body */}
        <div style={{ padding: "36px 48px 44px", fontSize: 34, fontWeight: 700, lineHeight: 1.85, color: SYN.plain, display: "flex", flexDirection: "column", gap: 0, overflow: "hidden" }}>

          {/* Line 1: parent.addEventListener('click', (e) => { */}
          <div style={{ whiteSpace: "nowrap", position: "relative" }}>
            <Tok color={SYN.ident}>parent</Tok>
            <Tok color={SYN.punct}>.</Tok>
            <Tok color={SYN.method}>addEventListener</Tok>
            <Tok color={SYN.punct}>(</Tok>
            <span style={{ background: frame < T.winRiseStart ? "rgba(165,214,255,0.18)" : "transparent", borderRadius: 4, padding: "1px 2px" }}>
              <Tok color={SYN.string}>"click"</Tok>
            </span>
            <Tok color={SYN.punct}>, (</Tok>
            {/* 'e' param — shown always but highlighted on paste */}
            <Tok color={SYN.ident}>e</Tok>
            <Tok color={SYN.punct}>) </Tok>
            <Tok color={SYN.arrow}>={">"}</Tok>
            <Tok color={SYN.punct}> {"{"}</Tok>
          </div>

          {/* Pasted lines — typewriter width reveal */}
          {showLineB && (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 40, whiteSpace: "nowrap" }}>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${lineBW}%` }}>
                <Tok color={SYN.kw}>if</Tok>
                <Tok color={SYN.punct}> (</Tok>
                <Tok color={SYN.ident}>e</Tok>
                <Tok color={SYN.punct}>.</Tok>
                <Tok color={SYN.plain}>target.</Tok>
                <Tok color={SYN.method}>classList</Tok>
                <Tok color={SYN.punct}>.</Tok>
                <Tok color={SYN.method}>contains</Tok>
                <Tok color={SYN.punct}>(</Tok>
                <Tok color={SYN.string}>"btn"</Tok>
                <Tok color={SYN.punct}>)) {"{"}</Tok>
              </div>
              {typingB && <span style={{ color: "#FFFFFF", marginLeft: 2 }}>{cursorChar}</span>}
            </div>
          )}

          {showLineC && (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 80, whiteSpace: "nowrap" }}>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${lineCW}%` }}>
                <Tok color={SYN.ident}>e</Tok>
                <Tok color={SYN.punct}>.</Tok>
                <Tok color={SYN.plain}>target.style.</Tok>
                <Tok color={SYN.method}>backgroundColor</Tok>
                <Tok color={SYN.punct}> </Tok>
                <Tok color={SYN.arrow}>=</Tok>
                <Tok color={SYN.punct}> </Tok>
                <Tok color={SYN.string}>"red"</Tok>
                <Tok color={SYN.punct}>;</Tok>
              </div>
              {typingC && <span style={{ color: "#FFFFFF", marginLeft: 2 }}>{cursorChar}</span>}
            </div>
          )}

          {showLineD && (
            <div style={{ display: "flex", alignItems: "center", paddingLeft: 40, whiteSpace: "nowrap" }}>
              <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${lineDW}%` }}>
                <Tok color={SYN.punct}>{"}"}</Tok>
              </div>
              {typingD && <span style={{ color: "#FFFFFF", marginLeft: 2 }}>{cursorChar}</span>}
            </div>
          )}

          {/* Empty body when not pasting yet */}
          {!showFullCode && <div style={{ height: "1.85em" }} />}

          {/* Closing line */}
          <div style={{ whiteSpace: "nowrap" }}>
            <Tok color={SYN.punct}>{"});"}</Tok>
          </div>
        </div>
      </div>

      {/* ── Listener badge ───────────────────────────────────────────────── */}
      {frame >= T.badgeStart && (
        <div style={{
          position:        "absolute",
          left:            badgeAbsX,
          top:             badgeAbsY,
          transform:       `scale(${badgeScale})`,
          transformOrigin: "center center",
          opacity:         badgeOpacity,
          zIndex:          15,
          width:           BADGE_SIZE, height: BADGE_SIZE,
          borderRadius:    20,
          background:      "rgba(255,189,46,0.15)",
          border:          "2px solid rgba(255,189,46,0.7)",
          boxShadow:       "0 8px 28px rgba(0,0,0,0.6), 0 0 20px rgba(255,189,46,0.25)",
          display:         "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          <RadarIcon color="#FFBD2E" size={48} />
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#FFBD2E", letterSpacing: "0.04em", fontWeight: 700 }}>
            listener
          </span>
        </div>
      )}

    </AbsoluteFill>
  );
};