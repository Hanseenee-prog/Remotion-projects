// Scene 5 — "So instead, use structuredClone(). Now you get a true deep clone."
// 120 frames total
//
// Timeline:
//   0–12   : code window slides up into center
//   12–45  : full code block visible
//   45–55  : object block dims fast
//   48–88  : "const clone = structuredClone(original);" types in
//   88–105 : code window exits (fly up + fade)
//   95–108 : "Deep Copy" header fades in
//   100–112: original box + clone box spring in side by side
//   108–120: arrows draw down from each label box to its own isometric box

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
} from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

// ── Canvas dims ──────────────────────────────────────────────
const CW = 1080;
const CH = 1920;

function clamp01(v: number) { return Math.min(1, Math.max(0, v)); }
function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }
function prog(frame: number, start: number, end: number) {
  return clamp01((frame - start) / (end - start));
}
function tok(color: string, text: string) {
  return (
    <span style={{ color, fontFamily: mono, whiteSpace: "pre" }}>{text}</span>
  );
}

const FONT = 38;
const LH   = 1.7;
const DIM  = 0.15;

// ── Same CodeWindow as Scene3/Scene1 ─────────────────────────
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
        borderBottom: "none",
        marginBottom: -1,
      }}>
        <div style={{
          background: tabColor, borderRadius: 5, padding: "2px 8px",
          fontFamily: mono, fontSize: 20, fontWeight: 800,
          color: "#fff", letterSpacing: "0.04em",
          textTransform: "uppercase" as const,
        }}>
          {tabLabel}
        </div>
        <span style={{ fontFamily: mono, fontSize: 26, fontWeight: 600, color: COLORS.offWhite }}>
          {fileName}
        </span>
      </div>
    </div>
    <div style={{ padding: "40px 48px 48px" }}>{children}</div>
  </div>
);

// ── Exact IsometricBox from Scene2 ───────────────────────────
const IsometricBox: React.FC<{ scale?: number }> = ({ scale = 1 }) => (
  <div style={{ transform: `scale(${scale})`, display: "flex", justifyContent: "center" }}>
    <svg width="200" height="200" viewBox="0 0 200 200">
      {/* Top face */}
      <polygon points="100,50 150,25 190,45 140,70" fill={C.surfaceHigh} />
      <polygon points="100,50 50,25 10,45 60,70"  fill={C.surfaceHigh} />
      <polygon points="60,70 100,90 140,70 100,50" fill="#080808" />
      {/* Content items on top */}
      <g transform="translate(0, -15)">
        <rect x="70" y="55" width="30" height="30" fill={C.accentC} rx="6" transform="rotate(-15 85 70)" />
        <circle cx="120" cy="65" r="18" fill={C.accentB} />
        <polygon points="85,90 105,65 125,90" fill={C.accentA} />
      </g>
      {/* Left face */}
      <polygon
        points="60,70 100,90 100,150 60,130"
        fill={C.codeBgHighlight}
        stroke={C.borderHigh}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Right face */}
      <polygon
        points="100,90 140,70 140,130 100,150"
        fill={C.codeBg}
        stroke={C.border}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Side extensions */}
      <polygon points="60,70 100,90 50,115 10,95"   fill={C.surfaceHigh} stroke={C.border} strokeWidth="1" />
      <polygon points="100,90 140,70 190,95 150,115" fill={C.surfaceHigh} stroke={C.border} strokeWidth="1" />
    </svg>
  </div>
);

// ── Straight animated arrow (same as Scene2) ─────────────────
const StraightArrow: React.FC<{
  x1: number; y1: number;
  x2: number; y2: number;
  progress: number;
  color: string;
}> = ({ x1, y1, x2, y2, progress, color }) => {
  const dx  = x2 - x1;
  const dy  = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const ux  = dx / len;
  const uy  = dy / len;

  const arrowSize = 18;
  const perp      = arrowSize * 0.55;
  const tipX      = x2;
  const tipY      = y2;

  const p1 = `${tipX},${tipY}`;
  const p2 = `${tipX - arrowSize * ux + perp * uy},${tipY - arrowSize * uy - perp * ux}`;
  const p3 = `${tipX - arrowSize * ux - perp * uy},${tipY - arrowSize * uy + perp * ux}`;

  const drawLen    = len - arrowSize + 2;
  const dashOffset = drawLen * (1 - progress);
  const headOp     = interpolate(progress, [0.75, 1], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <g>
      <line
        x1={x1} y1={y1}
        x2={tipX - arrowSize * ux} y2={tipY - arrowSize * uy}
        stroke={color} strokeWidth={5} strokeLinecap="round"
        strokeDasharray={drawLen} strokeDashoffset={dashOffset}
      />
      <polygon points={`${p1} ${p2} ${p3}`} fill={color} opacity={headOp} />
    </g>
  );
};

// ─────────────────────────────────────────────────────────────
// LAYOUT CONSTANTS for the deep copy diagram
// ─────────────────────────────────────────────────────────────
// Two cards sit at top: 38% of CH, horizontally offset ±240px from center
// Each card has a label (~44px) + code box (~120px) above its isometric box
// Isometric boxes sit at top: 66% of CH, same ±240px offsets
//
// Arrow: from bottom of code box down to top of isometric box
//   Arrow start Y ≈ 0.38 * CH + 100 = 830 (below code box)
//   Arrow end Y   ≈ 0.66 * CH - 110 = 1156 (above iso box, accounting for the svg top offset)
//
// Left column  X = CW/2 - 240 = 300
// Right column X = CW/2 + 240 = 780

const LEFT_X   = CW / 2 - 240;  // 300
const RIGHT_X  = CW / 2 + 240;  // 780
const ARROW_Y1 = 0.43 * CH;     // ~768 — bottom of code card area
const ARROW_Y2 = 0.55 * CH;     // ~1210 — top of iso box area

const boxStyle = (color: string): React.CSSProperties => ({
  border: `2px solid ${color}`,
  backgroundColor: "#0d1117",
  borderRadius: 16,
  padding: "22px 28px",
  fontFamily: mono,
  fontSize: 36,
  color: C.codeText,
  lineHeight: 1.6,
  width: 420,
  boxShadow: `0 14px 40px rgba(0,0,0,0.5), inset 0 0 20px ${color}15`,
  boxSizing: "border-box" as const,
});

const labelStyle: React.CSSProperties = {
  fontFamily: display,
  fontSize: 40,
  color: C.muted,
  marginBottom: 16,
  letterSpacing: 0.5,
  textAlign: "center",
  fontWeight: 700,
};

// ─────────────────────────────────────────────────────────────
export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── CODE WINDOW ENTER ────────────────────────────────────────
  const winInP  = easeOut(prog(frame, 0, 10));
  const winY    = (1 - winInP) * 200;
  const winOp   = clamp01(prog(frame, 0, 6));

  // ── DIM OBJECT BLOCK ─────────────────────────────────────────
  const dimP         = easeOut(prog(frame, 35, 45));
  const topBlockOp   = interpolate(dimP, [0, 1], [1, DIM]);

  // ── TYPING: structuredClone line ─────────────────────────────
  const fullLine   = `const clone = structuredClone(original);`;
  const totalChars = fullLine.length;
  const charsCount = interpolate(frame, [38, 58], [0, totalChars], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const charsVisible = Math.floor(charsCount);
  const mutLineOp    = easeOut(prog(frame, 48, 58));
  const cursorBlink  = Math.floor(frame / 6) % 2 === 0;

  // Tokenised typing for structuredClone line
  const lineTokens: Array<{ text: string; color: string }> = [
    { text: "const ",              color: C.keyword    },
    { text: "clone",               color: C.codeText   },
    { text: " = ",                 color: C.punctuation},
    { text: "structuredClone",     color: C.fnName     },
    { text: "(",                   color: C.punctuation},
    { text: "original",            color: C.codeText   },
    { text: ");",                  color: C.punctuation},
  ];

  // ── CODE WINDOW EXIT ─────────────────────────────────────────
  const winExitP  = easeOut(prog(frame, 68, 78));
  const winExitOp = 1 - winExitP;
  const winExitY  = winExitP * -160;
  const finalWinOp = winOp * winExitOp;
  const finalWinY  = winY + winExitY;

  // ── DIAGRAM: header ──────────────────────────────────────────
  const headerOp = easeOut(prog(frame, 75, 85));
  const headerY  = (1 - headerOp) * 24;

  // ── DIAGRAM: boxes spring in ─────────────────────────────────
  const origBoxScale = spring({ frame, fps, from: 0, to: 1, delay: 78, config: { damping: 13, mass: 0.8 } });
  const cloneBoxScale = spring({ frame, fps, from: 0, to: 1, delay: 82, config: { damping: 13, mass: 0.8 } });

  // ── DIAGRAM: arrows draw ─────────────────────────────────────
  const arrowProg = interpolate(frame, [85, 92], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>

      {/* ════════════════════════════════════════════════
          CODE WINDOW
      ════════════════════════════════════════════════ */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          opacity: finalWinOp,
          transform: `translateY(${finalWinY}px)`,
        }}>
          <CodeWindow tabLabel="js" tabColor="#C9A227" fileName="clone.js">

            {/* Object block — dims as typing begins */}
            <div style={{
              opacity: topBlockOp,
              fontFamily: mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH, whiteSpace: "pre",
            }}>
              <div>{tok(C.keyword, "const ")}{tok(C.codeText, "original")}{tok(C.punctuation, " = {")}</div>
              <div>{"  "}{tok(C.property, "name")}{tok(C.punctuation, ": ")}{tok(C.string, '"John"')}{tok(C.punctuation, ",")}</div>
              <div>{"  "}{tok(C.property, "joined")}{tok(C.punctuation, ": ")}{tok(C.keyword, "new ")}{tok(C.fnName, "Date")}{tok(C.punctuation, "(),")}</div>
              <div>{"  "}{tok(C.property, "stats")}{tok(C.punctuation, ": ")}{tok(C.value, "undefined")}{tok(C.punctuation, ",")}</div>
              <div>{"  "}{tok(C.property, "favorites")}{tok(C.punctuation, ": ")}{tok(C.keyword, "new ")}{tok(C.fnName, "Set")}{tok(C.punctuation, "([")}{tok(C.number, "1")}{tok(C.punctuation, ", ")}{tok(C.number, "2")}{tok(C.punctuation, "])")}</div>
              <div>{tok(C.punctuation, "};")}</div>
            </div>

            <div style={{ height: 28 }} />

            {/* structuredClone line — types in */}
            <div style={{
              opacity: mutLineOp,
              fontFamily: mono, fontSize: FONT,
              fontWeight: 700, lineHeight: LH,
              display: "flex", alignItems: "center",
              height: FONT * LH,
              whiteSpace: "pre",
            }}>
              {(() => {
                let cursor = 0;
                return lineTokens.map((t, i) => {
                  const start = cursor;
                  cursor += t.text.length;
                  const visible = Math.max(0, Math.min(t.text.length, charsVisible - start));
                  if (visible <= 0) return null;
                  return (
                    <span key={i} style={{ color: t.color, fontFamily: mono, whiteSpace: "pre" }}>
                      {t.text.slice(0, visible)}
                    </span>
                  );
                });
              })()}
              {/* blinking caret */}
              {charsVisible > 0 && charsVisible < totalChars && (
                <span style={{
                  display: "inline-block",
                  width: 3, height: "0.82em",
                  background: C.accentA,
                  marginLeft: 3,
                  verticalAlign: "middle",
                  opacity: cursorBlink ? 1 : 0,
                }} />
              )}
            </div>

          </CodeWindow>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          DEEP COPY DIAGRAM
      ════════════════════════════════════════════════ */}

      {/* Header */}
      <div style={{
        position: "absolute",
        top: SAFE.top + 120,
        left: 0, right: 0,
        textAlign: "center",
        opacity: headerOp,
        transform: `translateY(${headerY}px)`,
        zIndex: 10,
      }}>
        <div style={{
          fontFamily: display,
          fontSize: 64, fontWeight: 800,
          color: C.white,
          textTransform: "capitalize",
          letterSpacing: 2,
        }}>
          Deep Copy
        </div>
      </div>

      {/* Diagram — full-canvas positioned layer */}
      <div style={{ position: "absolute", inset: 0 }}>

        {/* ── ORIGINAL column (left) ── */}
        <div style={{
          position: "absolute",
          top: "32%", left: "50%",
          transform: `translate(-50%, -50%) translateX(-240px) scale(${origBoxScale})`,
        }}>
          {/* label */}
          <div style={labelStyle}>original</div>
          {/* code card */}
          <div style={boxStyle(C.accentA)}>
            <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"John"</span>,</div>
            <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.punctuation }}>{"{"}</span></div>
            <div>{"\u00A0\u00A0"}<span style={{ color: C.property }}>city</span>: <span style={{ color: C.string }}>"London"</span></div>
            <div><span style={{ color: C.punctuation }}>{"}"}</span></div>
          </div>
        </div>

        {/* ── CLONE column (right) ── */}
        <div style={{
          position: "absolute",
          top: "32%", left: "50%",
          transform: `translate(-50%, -50%) translateX(240px) scale(${cloneBoxScale})`,
        }}>
          {/* label */}
          <div style={labelStyle}>clone</div>
          {/* code card — same content, same color as original to show true deep copy */}
          <div style={boxStyle(C.accentB)}>
            <div><span style={{ color: C.property }}>name</span>: <span style={{ color: C.string }}>"John"</span>,</div>
            <div><span style={{ color: C.property }}>address</span>: <span style={{ color: C.punctuation }}>{"{"}</span></div>
            <div>{"\u00A0\u00A0"}<span style={{ color: C.property }}>city</span>: <span style={{ color: C.string }}>"London"</span></div>
            <div><span style={{ color: C.punctuation }}>{"}"}</span></div>
          </div>
        </div>

        {/* ── ORIGINAL isometric box (left, below card) ── */}
        <div style={{
          position: "absolute",
          top: "65%", left: "50%",
          transform: `translate(-50%, -50%) translateX(-240px) scale(${origBoxScale * 2.2})`,
        }}>
          <IsometricBox />
        </div>

        {/* ── CLONE isometric box (right, below card) — identical ── */}
        <div style={{
          position: "absolute",
          top: "65%", left: "50%",
          transform: `translate(-50%, -50%) translateX(240px) scale(${cloneBoxScale * 2.2})`,
        }}>
          <IsometricBox />
        </div>

        {/* ── ARROWS: full-canvas SVG ── */}
        <svg style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          overflow: "visible",
          pointerEvents: "none",
        }}>
          {/* original label-card → original iso box */}
          <StraightArrow
            x1={LEFT_X}  y1={ARROW_Y1}
            x2={LEFT_X}  y2={ARROW_Y2}
            progress={arrowProg}
            color={C.accentA}
          />
          {/* clone label-card → clone iso box */}
          <StraightArrow
            x1={RIGHT_X} y1={ARROW_Y1}
            x2={RIGHT_X} y2={ARROW_Y2}
            progress={arrowProg}
            color={C.accentB}
          />
        </svg>

      </div>

    </AbsoluteFill>
  );
};