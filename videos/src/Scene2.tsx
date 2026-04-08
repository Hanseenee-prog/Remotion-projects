// Scene 2 — "But before that request finishes… you click search again.
//            Now both requests are running at the same time…
//            and the first one might still come back and overwrite the new data."
// Duration: 297 frames (9.9s) @ 30fps
// Layout: Portrait (1080x1920)

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

// ─── Colors ───────────────────────────────────────────────────────────────────
const COLORS = {
  searchBar: "#ffffff",
  searchText: "#202124",
  accentBlue: "#1a73e8",
  serverBody: "#3c4043",
  serverLight: "#34a853",
  imposter1: "#ea4335",
  imposter1Backpack: "#c5221f",
  imposter2: "#00bcd4",       // cyan — the "latest" request
  imposter2Backpack: "#0097a7",
  imposterVisor: "#8ab4f8",
  text: "#ffffff",
  dashedLine: "rgba(255, 255, 255, 0.4)",
  skeleton: "rgba(255,255,255,0.08)",
  skeletonShimmer: "rgba(255,255,255,0.14)",
};

const FONTS = {
  sans: "Inter, system-ui, -apple-system, sans-serif",
};

// ─── Enhanced Server Icon (matches Scene1) ────────────────────────────────────
const ServerIcon: React.FC<{ opacity: number }> = ({ opacity }) => {
  const W = 220;
  const BH = 54;
  const GAP = 10;
  const RX = 8;
  const bays = [0, BH + GAP, (BH + GAP) * 2];

  return (
    <div style={{
      opacity,
      transform: `scaleX(${1.3 + 0.6}) scaleY(${1.3})`,
      filter: "drop-shadow(0px 24px 40px rgba(0,0,0,0.55))",
    }}>
      <svg width={W + 20} height={(BH + GAP) * 3 + 30} viewBox={`0 0 ${W + 20} ${(BH + GAP) * 3 + 30}`}>
        <polygon points={`10,18 ${W + 10},18 ${W + 20},6 20,6`} fill="#555a5f" />
        <polygon points={`10,18 20,6 20,${(BH + GAP) * 3 + 20} 10,${(BH + GAP) * 3 + 28}`} fill="#2a2d30" />
        {bays.map((yOff, i) => (
          <g key={i} transform={`translate(10, ${yOff + 18})`}>
            <rect width={W} height={BH} rx={RX} fill="#3c4043" />
            <rect width={W} height={4} fill="rgba(255,255,255,0.06)" />
            <rect y={BH - 3} width={W} height={3} fill="rgba(0,0,0,0.3)" />
            <circle cx={20} cy={BH / 2} r={7} fill={i === 2 ? "#fbbc04" : "#34a853"} />
            <circle cx={20} cy={BH / 2} r={12} fill={i === 2 ? "rgba(251,188,4,0.15)" : "rgba(52,168,83,0.18)"} />
            <rect x={42} y={BH / 2 - 5} width={130} height={10} rx={5} fill="rgba(255,255,255,0.09)" />
            <rect x={42} y={BH / 2 - 5} width={40} height={10} rx={5} fill="rgba(255,255,255,0.07)" />
            {[0, 1, 2, 3].map((v) => (
              <rect key={v} x={W - 30 + v * 6} y={12} width={3} height={BH - 24} rx={1.5} fill="rgba(0,0,0,0.35)" />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
};

// ─── Imposter ─────────────────────────────────────────────────────────────────
const Imposter: React.FC<{
  color: string;
  backpackColor: string;
  yPos: number;
  scale: number;
  opacity: number;
  xOffset: number;
  grayscale?: boolean;
}> = ({ color, backpackColor, yPos, scale, opacity, xOffset, grayscale = false }) => (
  <div style={{
    position: "absolute",
    top: yPos,
    left: `calc(50% + ${xOffset}px)`,
    transform: `translateX(-50%) scale(${scale})`,
    opacity,
    zIndex: 10,
    filter: grayscale ? "grayscale(1) brightness(1)" : "none",
  }}>
    <svg width="120" height="150" viewBox="0 0 80 100">
      <rect x="0" y="30" width="20" height="40" rx="8" fill={backpackColor} />
      <rect x="15" y="10" width="50" height="80" rx="25" fill={color} />
      <rect x="40" y="25" width="35" height="25" rx="12" fill={COLORS.imposterVisor} />
      <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
    </svg>
  </div>
);

// ─── Response label tag on imposter ──────────────────────────────────────────
const ImposterLabel: React.FC<{
  label: string;
  xOffset: number;
  yPos: number;
  color: string;
  opacity: number;
}> = ({ label, xOffset, yPos, color, opacity }) => (
  <div style={{
    position: "absolute",
    top: yPos - 44,
    left: `calc(50% + ${xOffset}px)`,
    transform: "translate(-50%, -30%)",
    opacity,
    zIndex: 15,
    background: color,
    borderRadius: 20,
    padding: "6px 18px",
    fontFamily: FONTS.sans,
    fontSize: 26,
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap",
    boxShadow: `0 4px 16px ${color}55`,
  }}>
    {label}
  </div>
);

// ─── Cursor ───────────────────────────────────────────────────────────────────
const Cursor: React.FC<{ x: number; y: number; opacity: number; scale: number }> = ({ x, y, opacity, scale }) => (
  <div style={{
    position: "absolute",
    left: x,
    top: y,
    opacity,
    transform: `scale(${scale})`,
    pointerEvents: "none",
    zIndex: 100,
  }}>
    <svg width="45" height="45" viewBox="0 0 32 32" fill="none">
      <path d="M8 4V24.58L13.2 19.38L16.6 27.38L19.4 26.18L16 18.18H23.2L8 4Z" fill="white" stroke="black" strokeWidth="2" />
    </svg>
  </div>
);

// ─── Skeleton UI ──────────────────────────────────────────────────────────────
const SkeletonRow: React.FC<{ delay: number; frame: number }> = ({ delay, frame }) => {
  const op = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ opacity: op, display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
      <div style={{ width: 64, height: 64, borderRadius: 12, background: COLORS.skeleton, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 18, borderRadius: 9, background: COLORS.skeleton, marginBottom: 10, width: "75%" }} />
        <div style={{ height: 14, borderRadius: 7, background: COLORS.skeleton, width: "50%" }} />
      </div>
    </div>
  );
};

// ─── Result Cards ─────────────────────────────────────────────────────────────
const HOUSES = [
  { name: "Buckingham Palace", price: "$4.9 Billion", emoji: "🏰" },
  { name: "Antilia", price: "$2 Billion", emoji: "🏢" },
  { name: "Villa Leopolda", price: "$750 Million", emoji: "🏯" },
];
const RICHEST = [
  { name: "Elon Musk", net: "$799B", emoji: "🚀" },
  { name: "Larry Page", net: "$251B", emoji: "🔍" },
  { name: "Sergey Brin", net: "$232B", emoji: "🌎" },
  { name: "Jeff Bezos", net: "$227B", emoji: "📦" },
  { name: "Mark Zuckerberg", net: "$197B", emoji: "📱" },
];

const ResultCard: React.FC<{ emoji: string; title: string; sub: string; index: number; frame: number; startFrame: number }> = ({
  emoji, title, sub, index, frame, startFrame,
}) => {
  const op = interpolate(frame, [startFrame + index * 8, startFrame + index * 8 + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [startFrame + index * 8, startFrame + index * 8 + 14], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div style={{
      opacity: op,
      transform: `translateY(${y}px)`,
      display: "flex",
      alignItems: "center",
      gap: 16,
      background: "rgba(255,255,255,0.06)",
      borderRadius: 16,
      padding: "16px 20px",
      marginBottom: 12,
      border: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span style={{ fontSize: 40 }}>{emoji}</span>
      <div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 32, fontWeight: 700, color: "#fff" }}>{title}</div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 25, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // ── Shared layout constants ────────────────────────────────────────────────
  const lineStartY = height * 0.75;
  const lineEndY = height * 0.22;

  // ── GLOBAL SHIFT UP (Camera Pan Effect) ──────────────────────────────────
  // Starts right as requests fade into server (f=160), lifting everything to center the UI
  const globalShiftUp = spring({
    frame: frame - 160,
    fps,
    from: 0,
    to: -(height * 0.42), // Moves server and half the line off-screen
    config: { damping: 16 },
  });

  // ── EXISTING SEQUENCE 0–135f (untouched logic) ────────────────────────────

  // Search bar: moves to center then back down
  const barToCenter = spring({ frame: frame - 20, fps, from: 0, to: 1, config: { damping: 15 } });
  const barBackDown = spring({ frame: frame - 85, fps, from: 0, to: 1, config: { damping: 15 } });
  const searchBarYMoving = interpolate(barToCenter - barBackDown, [0, 1], [height * 0.795, height / 2]);
  const dimOpacity = interpolate(barToCenter - barBackDown, [0, 1], [1, 0.2]);

  // Cursor
  const cursorOpacity = interpolate(frame, [45, 52, 80, 85], [0, 1, 1, 0]);
  const cursorMove = interpolate(frame, [52, 70], [0, 1], { easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cursorX = interpolate(cursorMove, [0, 1], [width / 2 + 100, width / 2 + 400]);
  const cursorY = interpolate(cursorMove, [0, 1], [height / 2 + 300, height / 2 + 40]);
  const clickScale = interpolate(frame, [70, 73, 77], [5, 4.8, 5], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Lines split
  const linesShift = spring({ frame: frame - 95, fps, from: 0, to: 1, config: { damping: 14 } });
  const line1X = interpolate(linesShift, [0, 1], [width / 2, width / 2 - 160]);
  const line2X = interpolate(linesShift, [0, 1], [width / 2, width / 2 + 160]);
  const line2Opacity = interpolate(frame, [95, 105], [0, 1]);

  // Imp1 (Red) going UP
  const imp1UpProgress = interpolate(frame, [0, 165], [0.251, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const imp1UpY = lineStartY - (lineStartY - lineEndY) * imp1UpProgress;
  const imp1UpOp = interpolate(imp1UpProgress, [0.82, 1.0], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Imp2 (Cyan) going UP
  const imp2Pop = spring({ frame: frame - 105, fps, from: 0, to: 1.3, config: { damping: 10 } });
  const imp2UpProgress = interpolate(frame, [115, 175], [0, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const imp2UpY = lineStartY - (lineStartY - lineEndY) * imp2UpProgress;
  const imp2UpOp = interpolate(imp2UpProgress, [0.82, 1.0], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── NEW: After 135f — search bar settles and UI transition ────────────────

  // Search bar: after 135f it stays fixed. Fading logic removed entirely.
  const searchBarY = frame < 135 ? searchBarYMoving : height * 0.795;

  // Skeleton UI area: fades in 150→162
  const skeletonOp = interpolate(frame, [150, 162], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const skeletonFadeOut = interpolate(frame, [196, 204], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const skeletonVisible = skeletonOp * skeletonFadeOut;

  // UI card container (persistent from 150f onward)
  const uiCardOp = interpolate(frame, [150, 162], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── RETURN TRIPS ──────────────────────────────────────────────────────────

  // CYAN (imp2) returns DOWN fast
  const imp2DownProgress = interpolate(frame, [178, 200], [0, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const imp2DownY = lineEndY + (lineStartY - lineEndY) * imp2DownProgress;
  const imp2DownOp = interpolate(imp2DownProgress, [0, 0.12, 0.88, 1.0], [0, 1, 1, 0]);
  const showImp2Down = frame >= 178 && frame < 210;

  // RED (imp1) returns DOWN slow / grayscale
  const imp1DownProgress = interpolate(frame, [195, 242], [0, 1.0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.linear,
  });
  const imp1DownY = lineEndY + (lineStartY - lineEndY) * imp1DownProgress;
  const imp1DownOp = interpolate(imp1DownProgress, [0, 0.1, 0.88, 1.0], [0, 1, 1, 0]);
  const showImp1Down = frame >= 195 && frame < 252;

  // ── RESULT DATA STATES ────────────────────────────────────────────────────
  const showHouses = frame >= 200;
  const showRichest = frame >= 242;

  const housesOp = interpolate(frame, [200, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
    * interpolate(frame, [238, 246], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const richestOp = interpolate(frame, [242, 252], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── LABEL OPACITY ─────────────────────────────────────────────────────────
  const latestLabelOp = frame >= 178 ? imp2DownOp : 0;
  const outdatedLabelOp = frame >= 195 ? imp1DownOp : 0;

  // ── WHICH IMPOSTER IS VISIBLE GOING UP? ───────────────────────────────────
  const showImp1Up = frame < 170;
  const showImp2Up = frame >= 105 && frame < 182;

  // ── WHICH LINE X TO USE FOR DOWN TRIPS? ──────────────────────────────────
  const line1XSettled = width / 2 - 160;
  const line2XSettled = width / 2 + 160;

  // ── OVERWRITE FLASH on UI ─────────────────────────────────────────────────
  const overwriteFlash = interpolate(frame, [242, 244, 252], [0, 0.35, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", fontFamily: FONTS.sans }}>
      {/* Wrapper to shift everything upwards after requests hit the server */}
      <div style={{ width: "100%", height: "100%", transform: `translateY(${globalShiftUp}px)` }}>

        {/* ── Server ── */}
        <div style={{ position: "absolute", top: "12%", left: "50%", transform: "translateX(-50%)", zIndex: 20 }}>
          <ServerIcon opacity={frame < 135 ? dimOpacity : 1} />
        </div>

        {/* ── Dashed Lines ── */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5 }}>
          <line
            x1={line1X} y1={lineStartY} x2={line1X} y2={lineEndY}
            stroke={COLORS.dashedLine} strokeWidth="10" strokeDasharray="25 20" strokeLinecap="round"
            opacity={frame < 135 ? dimOpacity : 1}
          />
          <line
            x1={line2X} y1={lineStartY} x2={line2X} y2={lineEndY}
            stroke={COLORS.dashedLine} strokeWidth="10" strokeDasharray="25 20" strokeLinecap="round"
            opacity={(frame < 135 ? dimOpacity : 1) * (frame < 105 ? 0 : line2Opacity)}
          />
        </svg>

        {/* ── Imp1 Red — going UP ── */}
        {showImp1Up && (
          <Imposter
            color={COLORS.imposter1} backpackColor={COLORS.imposter1Backpack}
            yPos={imp1UpY - 100} scale={1.3}
            opacity={frame < 135 ? dimOpacity * imp1UpOp : imp1UpOp}
            xOffset={line1X - width / 2}
          />
        )}

        {/* ── Imp2 Cyan — going UP ── */}
        {showImp2Up && (
          <Imposter
            color={COLORS.imposter2} backpackColor={COLORS.imposter2Backpack}
            yPos={imp2UpY - 100}
            scale={frame < 108 ? imp2Pop : 1.3}
            opacity={imp2UpOp}
            xOffset={line2X - width / 2}
          />
        )}

        {/* ── Imp2 Cyan — coming DOWN with "Latest" label ── */}
        {showImp2Down && (
          <>
            <ImposterLabel
              label="Latest ✓" xOffset={line2XSettled - width / 2}
              yPos={imp2DownY - 100} color="#1c9a26" opacity={latestLabelOp}
            />
            <Imposter
              color={COLORS.imposter2} backpackColor={COLORS.imposter2Backpack}
              yPos={imp2DownY - 100} scale={1.3} opacity={imp2DownOp}
              xOffset={line2XSettled - width / 2}
            />
          </>
        )}

        {/* ── Imp1 Red — coming DOWN grayscale with "Outdated" label ── */}
        {showImp1Down && (
          <>
            <ImposterLabel
              label="Outdated ⚠" xOffset={line1XSettled - width / 2}
              yPos={imp1DownY - 100} color="#cb250f" opacity={outdatedLabelOp}
            />
            <Imposter
              color={COLORS.imposter1} backpackColor={COLORS.imposter1Backpack}
              yPos={imp1DownY - 100} scale={1.3} opacity={imp1DownOp}
              xOffset={line1XSettled - width / 2}
              grayscale
            />
          </>
        )}

        {/* ── Search Bar (Always Visible) ── */}
        <div style={{
          position: "absolute",
          top: searchBarY,
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900,
          height: 120,
          backgroundColor: COLORS.searchBar,
          borderRadius: 60,
          display: "flex",
          alignItems: "center",
          padding: "0 45px",
          boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
          zIndex: 50,
        }}>
          <div style={{ fontSize: 42, color: COLORS.searchText, flex: 1, fontWeight: 700 }}>
            {frame < 60 ? "Top 5 richest men in the world" : "Expensive houses in the world"}
          </div>
          <div style={{
            width: 70, height: 70,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: frame > 70 && frame < 80 ? "rgba(26,115,232,0.1)" : "transparent",
            borderRadius: "50%",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={COLORS.accentBlue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* ── Styled UI Results area ── */}
        {frame >= 150 && (
          <div style={{
            position: "absolute",
            top: height * 0.795 + 90, // Positioned below the main search bar
            left: "50%",
            transform: "translateX(-50%)",
            width: 920,
            height: 700,
            opacity: uiCardOp,
            zIndex: 30,
            // Proper Styling (Glassmorphism & Padding)
            background: "rgba(30, 32, 36, 0.7)",
            backdropFilter: "blur(16px)",
            borderRadius: 32,
            padding: 32,
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
          }}>
            {/* Overwrite flash overlay */}
            {overwriteFlash > 0 && (
              <div style={{
                position: "absolute",
                inset: 0,
                background: `rgba(234,67,53,${overwriteFlash})`,
                borderRadius: 32,
                zIndex: 40,
                pointerEvents: "none",
              }} />
            )}

            {/* Inner relative wrapper so absolutes don't break padding */}
            <div style={{ position: "relative" }}>
              {/* Skeleton — visible until houses appear */}
              <div style={{ opacity: skeletonVisible, position: "absolute", width: "100%", top: 0 }}>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonRow key={i} delay={152 + i * 6} frame={frame} />
                ))}
              </div>

              {/* Houses result (Dictates Container Height) */}
              <div style={{ opacity: housesOp }}>
                {HOUSES.map((h, i) => (
                  <ResultCard
                    key={i} emoji={h.emoji} title={h.name} sub={h.price}
                    index={i} frame={frame} startFrame={200}
                  />
                ))}
              </div>

              {/* Richest men result — overlays houses */}
              <div style={{ opacity: richestOp, position: "absolute", top: 0, width: "100%" }}>
                {RICHEST.map((r, i) => (
                  <ResultCard
                    key={i} emoji={r.emoji} title={r.name} sub={r.net}
                    index={i} frame={frame} startFrame={242}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Cursor ── */}
        <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} scale={clickScale} />

      </div>
    </AbsoluteFill>
  );
};