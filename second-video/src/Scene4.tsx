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
const BTN_W   = 420;
const BTN_H   = 130;
const H_GAP   = 24;
const V_GAP   = 120;
const COLS    = 3;
const ROWS    = 5;
const GRID_W  = COLS * BTN_W + (COLS - 1) * H_GAP;
const FIT_SCALE = 960 / GRID_W;

// ─── Card/window constants ────────────────────────────────────────────────────
const WIN_W          = 1040;
const WIN_REST_SCALE = 0.86;
const VIDEO_H        = 1920;
const VIDEO_W        = 1080;
const BOTTOM_PAD     = 200;

const CARD_OFFSETS: { y: number; rotate: number }[] = [
  { y:   0, rotate:  0.0 },
  { y:  22, rotate:  5.5 },
  { y:  44, rotate: -4.2 },
  { y:  66, rotate:  3.8 },
];

const SUCCESS_FRAMES = [65, 69, 73, 77, 81, 85, 89, 93, 96, 100, 104, 108, 112, 116, 120];

const FS_DEFAULT  = 42;
const FS_SHRUNK   = 39;
const FONT_W      = 600;
const WIN_H_DEFAULT = 426;
const WIN_H_FULL    = 507;

// ─── Timeline ─────────────────────────────────────────────────────────────────
const T = {
  cardsExit:     0,
  cardsExitEnd:  22,
  overlayOut:    0,
  overlayOutEnd: 18,

  gridShiftStart: 0,
  gridShiftEnd:   30,

  winIn:         0,
  winInEnd:      28,

  indentStart:   35,
  indentEnd:     48,
  shrinkStart:   35,
  shrinkEnd:     48,

  forEachStart:  48,
  forEachEnd:    62,

  closingStart:  62,
  closingEnd:    75,
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const typeW = (frame: number, start: number, end: number) =>
  interpolate(frame, [start, end], [0, 100], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

// ─── Exiting stacked card ─────────────────────────────────────────────────────
const ExitCard: React.FC<{
  frame:    number;
  fps:      number;
  stackIdx: number;
  btnNum:   number;
}> = ({ frame, fps, stackIdx, btnNum }) => {

  const offset = CARD_OFFSETS[stackIdx];
  const goLeft = stackIdx < 2;

  const exitSpring = spring({
    fps,
    frame: frame - T.cardsExit,
    config: { damping: 22, stiffness: 160, mass: 1.0 },
    durationInFrames: T.cardsExitEnd,
  });

  const exitX   = interpolate(exitSpring, [0, 1],
    [0, goLeft ? -(VIDEO_W + WIN_W) : (VIDEO_W + WIN_W)]
  );
  const exitY   = interpolate(exitSpring, [0, 0.4, 1], [0, -60, 80]);
  const exitRot = interpolate(exitSpring, [0, 1],
    [offset.rotate, offset.rotate + (goLeft ? -18 : 18)]
  );
  const opacity = interpolate(exitSpring, [0, 0.7, 1], [1, 1, 0]);

  const varName = `button${btnNum}`;

  return (
    <div
      style={{
        position:        "absolute",
        left:            "50%",
        top:             `calc(50% + ${offset.y}px)`,
        transform:       `
          translate(calc(-50% + ${exitX}px), calc(-50% + ${exitY}px))
          rotate(${exitRot}deg)
          scale(${WIN_REST_SCALE})
        `,
        transformOrigin: "center center",
        opacity,
        zIndex:          20 + stackIdx,
        width:           WIN_W,
        background:      "#0D1117",
        borderRadius:    16,
        overflow:        "hidden",
        boxShadow:       `0 ${20 + stackIdx * 8}px ${60 + stackIdx * 10}px rgba(0,0,0,${0.7 + stackIdx * 0.06}), 0 0 0 1px rgba(255,255,255,0.08)`,
        fontFamily:      "'JetBrains Mono', monospace",
      }}
    >
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
      <div style={{ padding: "44px 48px 52px", fontSize: FS_DEFAULT, fontWeight: FONT_W, lineHeight: 1.85, color: SYN.plain, display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
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
          <Tok color={SYN.punct}>{"});"}</Tok>
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────
export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Overlay slides down ───────────────────────────────────────────────────
  const overlaySpring = spring({
    fps,
    frame: frame - T.overlayOut,
    config: { damping: 22, stiffness: 140 },
    durationInFrames: T.overlayOutEnd,
  });
  const overlayY = interpolate(overlaySpring, [0, 1], [0, VIDEO_H]);

  // ── Grid shifts up ────────────────────────────────────────────────────────
  const gridShiftSpring = spring({
    fps,
    frame: frame - T.gridShiftStart,
    config: { damping: 18, stiffness: 100, mass: 0.9 },
    durationInFrames: T.gridShiftEnd,
  });
  const gridShiftY = interpolate(gridShiftSpring, [0, 1], [0, -330]);

  // ── Code window slides in from bottom ─────────────────────────────────────
  const winInSpring = spring({
    fps,
    frame: frame - T.winIn,
    config: { damping: 18, stiffness: 130, mass: 0.9 },
    durationInFrames: T.winInEnd - T.winIn,
  });
  const winRestTop = VIDEO_H - BOTTOM_PAD - WIN_H_DEFAULT;
  const winTop     = interpolate(winInSpring, [0, 1], [VIDEO_H + 100, winRestTop]);
  const winOpacity = interpolate(winInSpring, [0, 0.1, 1], [0, 1, 1]);

  // ── Font shrinks on indent ────────────────────────────────────────────────
  const fontSize = interpolate(
    frame,
    [T.shrinkStart, T.shrinkEnd],
    [FS_DEFAULT, FS_SHRUNK],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // ── Indent animates right ─────────────────────────────────────────────────
  const indentP   = interpolate(frame, [T.indentStart, T.indentEnd], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const indentPx  = Math.round(indentP * 82);
  const indent2Px = indentPx + Math.round(FS_SHRUNK * 0.6 * 2);

  // ── Typing widths ─────────────────────────────────────────────────────────
  const forEachW = typeW(frame, T.forEachStart, T.forEachEnd);
  const closingW = typeW(frame, T.closingStart, T.closingEnd);

  const showForEach = frame >= T.forEachStart;
  const showClosing = frame >= T.closingStart;

  // Single cursor — blinks fast to feel like active typing
  const cursorOn   = Math.floor(frame / 5) % 2 === 0;
  const cursorChar = cursorOn ? "▌" : " ";

  // ── Window shifts up as forEach line adds height ──────────────────────────
  const winShiftUp = interpolate(
    frame,
    [T.forEachStart, T.forEachEnd],
    [0, -(WIN_H_FULL - WIN_H_DEFAULT)],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const finalWinTop = winTop + winShiftUp;
  const winLeft     = (VIDEO_W - WIN_W) / 2;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>

      {/* ── Button grid ──────────────────────────────────────────────────── */}
      <div style={{
        transform:       `scale(${FIT_SCALE}) translateY(${gridShiftY / FIT_SCALE}px)`,
        transformOrigin: "center center",
        display:         "flex",
        flexDirection:   "column",
        gap:             V_GAP,
        zIndex:          5,
        opacity:         1,
        pointerEvents:   "none",
      }}>
        {Array.from({ length: ROWS }, (_, row) => (
          <div key={row} style={{ display: "flex", flexDirection: "row", gap: H_GAP }}>
            {Array.from({ length: COLS }, (_, col) => {
              const idx          = row * COLS + col;
              const successFrame = SUCCESS_FRAMES[idx];
              const successSpring = spring({
                fps,
                frame: frame - successFrame,
                config: { damping: 14, stiffness: 320, mass: 0.5 },
                durationInFrames: 12,
              });
              const isSuccess   = frame >= successFrame;
              const borderP     = isSuccess ? Math.min(1, Math.max(0, successSpring)) : 0;
              const borderScale = isSuccess
                ? interpolate(successSpring, [0, 0.3, 1], [0.6, 1.06, 1.0])
                : 0;
              const checkSpring = spring({
                fps,
                frame: frame - (successFrame + 4),
                config: { damping: 10, stiffness: 400, mass: 0.4 },
                durationInFrames: 10,
              });
              const checkScale = isSuccess && frame >= successFrame + 4
                ? Math.min(1.2, Math.max(0, checkSpring))
                : 0;

              return (
                <div key={col} style={{ position: "relative", width: BTN_W, height: BTN_H, flexShrink: 0 }}>
                  <div style={{
                    width: BTN_W, height: BTN_H, borderRadius: 24,
                    backgroundColor: "#FFFFFF",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 46, fontWeight: 700,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#111111", gap: 16,
                    boxShadow: isSuccess
                      ? `0 12px 40px rgba(0,0,0,0.45), 0 0 ${borderP * 20}px rgba(39,201,63,${borderP * 0.35})`
                      : "0 12px 40px rgba(0,0,0,0.45)",
                  }}>
                    Click Me
                    <span style={{ fontSize: 48, lineHeight: 1 }}>😐</span>
                  </div>
                  {isSuccess && (
                    <div style={{
                      position: "absolute", inset: -3, borderRadius: 27,
                      border: "3px solid #27C93F",
                      transform: `scale(${borderScale})`,
                      transformOrigin: "center center",
                      pointerEvents: "none",
                      boxShadow: `0 0 ${borderP * 16}px rgba(39,201,63,0.5)`,
                    }} />
                  )}
                  {isSuccess && (
                    <div style={{
                      position: "absolute", top: -14, right: -14,
                      width: 44, height: 44, borderRadius: "50%",
                      backgroundColor: "#27C93F",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transform: `scale(${checkScale})`,
                      transformOrigin: "center center",
                      boxShadow: "0 4px 12px rgba(39,201,63,0.5)",
                      zIndex: 2, pointerEvents: "none",
                    }}>
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                        <polyline points="4,11 9,16 18,6" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ── Overlay sliding down ─────────────────────────────────────────── */}
      <div style={{
        position: "absolute", left: 0, right: 0,
        top: overlayY, height: VIDEO_H,
        background: "rgba(8,8,8,0.6)",
        zIndex: 6, pointerEvents: "none",
      }} />

      {/* ── 4 stacked cards exiting ───────────────────────────────────────── */}
      {[0, 1, 2, 3].map((i) => (
        <ExitCard key={i} frame={frame} fps={fps} stackIdx={i} btnNum={i + 1} />
      ))}

      {/* ── New code window ───────────────────────────────────────────────── */}
      <div style={{
        position:     "absolute",
        left:         winLeft,
        top:          finalWinTop,
        width:        WIN_W,
        opacity:      winOpacity,
        background:   "#0D1117",
        borderRadius: 16,
        overflow:     "hidden",
        boxShadow:    "0 30px 80px rgba(0,0,0,0.85)",
        border:       "1px solid rgba(255,255,255,0.1)",
        fontFamily:   "'JetBrains Mono', monospace",
        zIndex:       30,
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
        <div style={{
          padding:       "44px 48px 52px",
          fontSize,
          fontWeight:    FONT_W,
          lineHeight:    1.85,
          color:         SYN.plain,
          display:       "flex",
          flexDirection: "column",
          gap:           2,
          overflow:      "hidden",
        }}>

          {/* Line A: buttons.forEach((button) => { — cursor INSIDE clipped div */}
          {showForEach && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${forEachW}%` }}>
              <Tok color={SYN.plain}>buttons.</Tok>
              <Tok color={SYN.method}>forEach</Tok>
              <Tok color={SYN.punct}>((</Tok>
              <Tok color={SYN.ident}>button</Tok>
              <Tok color={SYN.punct}>) </Tok>
              <Tok color={SYN.arrow}>={">"}</Tok>
              <Tok color={SYN.punct}> {"{"}</Tok>
              {forEachW < 100 && (
                <span style={{ color: "#FFFFFF", marginLeft: 2 }}>{cursorChar}</span>
              )}
            </div>
          )}

          {/* Line B: button.addEventListener('click', () => { */}
          <div style={{ whiteSpace: "nowrap", paddingLeft: indentPx }}>
            <Tok color={SYN.plain}>button.</Tok>
            <Tok color={SYN.method}>addEventListener</Tok>
            <Tok color={SYN.punct}>(</Tok>
            <Tok color={SYN.string}>'click'</Tok>
            <Tok color={SYN.punct}>, () </Tok>
            <Tok color={SYN.arrow}>={">"}</Tok>
            <Tok color={SYN.punct}> {"{"}</Tok>
          </div>

          {/* Line C: button.style.backgroundColor = 'red'; */}
          <div style={{ whiteSpace: "nowrap", paddingLeft: indent2Px }}>
            <Tok color={SYN.plain}>button.style.</Tok>
            <Tok color={SYN.method}>backgroundColor</Tok>
            <Tok color={SYN.punct}> </Tok>
            <Tok color={SYN.arrow}>=</Tok>
            <Tok color={SYN.punct}> </Tok>
            <Tok color={SYN.string}>'red'</Tok>
            <Tok color={SYN.punct}>;</Tok>
          </div>

          {/* Line D: }); indented */}
          <div style={{ whiteSpace: "nowrap", paddingLeft: indentPx }}>
            <Tok color={SYN.punct}>{"});"}</Tok>
          </div>

          {/* Line E: }); forEach closing — cursor INSIDE clipped div */}
          {showClosing && (
            <div style={{ overflow: "hidden", whiteSpace: "nowrap", width: `${closingW}%` }}>
              <Tok color={SYN.punct}>{"});"}</Tok>
              {closingW < 100 && (
                <span style={{ color: "#FFFFFF", marginLeft: 2 }}>{cursorChar}</span>
              )}
            </div>
          )}

        </div>
      </div>

    </AbsoluteFill>
  );
};