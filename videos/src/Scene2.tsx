// Scene 2 — "But before that request finishes… you click search again.
//            Now both requests are running at the same time…
//            and the first one might still come back and overwrite the new data."
// Duration: 297 frames (9.9s) @ 30fps

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  spring,
  useVideoConfig,
  Easing,
} from "remotion";

const COLORS = {
  searchBar: "#ffffff",
  searchText: "#202124",
  accentBlue: "#1a73e8",
  imposter1: "#ea4335",
  imposter1Backpack: "#c5221f",
  imposter2: "#00bcd4",
  imposter2Backpack: "#0097a7",
  imposterVisor: "#8ab4f8",
  dashedLine: "rgba(255,255,255,0.4)",
  skeleton: "rgba(255,255,255,0.08)",
};

const FONTS = { sans: "Inter, system-ui, -apple-system, sans-serif" };

// ─── Flat Stacked Server Icon (matches reference image) ───────────────────────
const ServerIcon: React.FC<{ opacity: number }> = ({ opacity }) => {
  const W = 340;
  const UH = 78;
  const GAP = 10;
  const UNITS = 3;
  const totalH = UNITS * UH + (UNITS - 1) * GAP + 28;

  const leds = [
    ["#3ec66a", "#3ec66a", "#ea4335"],
    ["#3ec66a", "#fbbc04", "#3ec66a"],
    ["#3ec66a", "#3ec66a", "#3ec66a"],
  ];

  return (
    <div style={{
      opacity,
      transformOrigin: "top center",
      filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
    }}>
      <svg width={W + 40} height={totalH} viewBox={`0 0 ${W + 40} ${totalH}`}>
        <ellipse cx={(W + 40) / 2} cy={totalH - 4} rx={W * 0.48} ry={10} fill="rgba(0,0,0,0.28)" />
        {[0, 1, 2].map((u) => {
          const y = u * (UH + GAP);
          return (
            <g key={u} transform={`translate(20, ${y})`}>
              <rect x={0} y={0} width={W} height={8} rx={4} fill="#5a6478" />
              <rect x={0} y={6} width={W} height={UH - 6} rx={6} fill="#4a5568" />
              <rect x={W * 0.38} y={6} width={W * 0.62} height={UH - 6} rx={4} fill="#2d3748" />
              {[0, 1, 2, 3].map((col) =>
                [0, 1, 2].map((row) => (
                  <rect key={`v-${col}-${row}`} x={16 + col * 16} y={16 + row * 16}
                    width={9} height={9} rx={2} fill="rgba(0,0,0,0.45)" />
                ))
              )}
              {[0, 1].map((s) => (
                <rect key={s} x={W * 0.38 + 16} y={18 + s * 22} width={W * 0.38} height={14}
                  rx={4} fill="rgba(0,0,0,0.35)" />
              ))}
              {leds[u].map((c, li) => (
                <g key={li}>
                  <circle cx={W - 28} cy={22 + li * 17} r={5} fill={c} />
                  <circle cx={W - 28} cy={22 + li * 17} r={9} fill={c} opacity={0.25} />
                </g>
              ))}
              <rect x={0} y={UH - 4} width={W} height={4} rx={2} fill="rgba(0,0,0,0.3)" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Imposter ─────────────────────────────────────────────────────────────────
const Imposter: React.FC<{
  color: string; backpackColor: string; yPos: number;
  scale: number; opacity: number; xOffset: number; grayscale?: boolean;
}> = ({ color, backpackColor, yPos, scale, opacity, xOffset, grayscale = false }) => (
  <div style={{
    position: "absolute", top: yPos, left: `calc(50% + ${xOffset}px)`,
    transform: `translateX(-50%) scale(${scale})`, opacity, zIndex: 10,
    filter: grayscale ? "grayscale(1) brightness(0.7)" : "none",
  }}>
    <svg width="120" height="150" viewBox="0 0 80 100">
      <rect x="0" y="30" width="20" height="40" rx="8" fill={backpackColor} />
      <rect x="15" y="10" width="50" height="80" rx="25" fill={color} />
      <rect x="40" y="25" width="35" height="25" rx="12" fill={COLORS.imposterVisor} />
      <rect x="45" y="30" width="25" height="10" rx="5" fill="rgba(255,255,255,0.3)" />
    </svg>
  </div>
);

const ImposterLabel: React.FC<{
  label: string; xOffset: number; yPos: number; color: string; opacity: number;
}> = ({ label, xOffset, yPos, color, opacity }) => (
  <div style={{
    position: "absolute", top: yPos - 44, left: `calc(50% + ${xOffset}px)`,
    transform: "translate(-50%, -30%)", opacity, zIndex: 15,
    background: color, borderRadius: 20, padding: "6px 18px",
    fontFamily: FONTS.sans, fontSize: 26, fontWeight: 700, color: "#fff",
    whiteSpace: "nowrap", boxShadow: `0 4px 16px ${color}55`,
  }}>{label}</div>
);

const Cursor: React.FC<{ x: number; y: number; opacity: number; scale: number }> = ({ x, y, opacity, scale }) => (
  <div style={{
    position: "absolute", left: x, top: y, opacity,
    transform: `scale(${scale})`, pointerEvents: "none", zIndex: 100,
  }}>
    <svg width="45" height="45" viewBox="0 0 32 32" fill="none">
      <path d="M8 4V24.58L13.2 19.38L16.6 27.38L19.4 26.18L16 18.18H23.2L8 4Z"
        fill="white" stroke="black" strokeWidth="2" />
    </svg>
  </div>
);

const SkeletonRow: React.FC<{ delay: number; frame: number }> = ({ delay, frame }) => {
  const op = interpolate(frame, [delay, delay + 12], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{ opacity: op, display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
      <div style={{ width: 56, height: 56, borderRadius: 12, background: COLORS.skeleton, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ height: 18, borderRadius: 9, background: COLORS.skeleton, marginBottom: 8, width: "70%" }} />
        <div style={{ height: 13, borderRadius: 7, background: COLORS.skeleton, width: "45%" }} />
      </div>
    </div>
  );
};

const HOUSES = [
  { name: "Buckingham Palace", sub: "$4.9 Billion  ·  London, UK", emoji: "🏰" },
  { name: "Antilia", sub: "$2 Billion  ·  Mumbai, India", emoji: "🏢" },
  { name: "Villa Leopolda", sub: "$750 Million  ·  Côte d'Azur", emoji: "🏯" },
];
const RICHEST = [
  { name: "Elon Musk", sub: "$799B  ·  Tesla, SpaceX, xAI", emoji: "🚀" },
  { name: "Larry Page", sub: "$251B  ·  Google / Alphabet", emoji: "🔍" },
  { name: "Sergey Brin", sub: "$232B  ·  Google / Alphabet", emoji: "🌎" },
  { name: "Jeff Bezos", sub: "$227B  ·  Amazon, Blue Origin", emoji: "📦" },
  { name: "Mark Zuckerberg", sub: "$197B  ·  Meta Platforms", emoji: "📱" },
];

const ResultCard: React.FC<{
  emoji: string; name: string; sub: string;
  index: number; frame: number; startFrame: number; rank: number;
}> = ({ emoji, name, sub, index, frame, startFrame, rank }) => {
  const op = interpolate(frame, [startFrame + index * 9, startFrame + index * 9 + 16], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [startFrame + index * 9, startFrame + index * 9 + 16], [24, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  return (
    <div style={{
      opacity: op, transform: `translateY(${y}px)`,
      display: "flex", alignItems: "center", gap: 18,
      background: rank === 1
        ? "linear-gradient(135deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.04) 100%)"
        : "rgba(255,255,255,0.045)",
      borderRadius: 20, padding: "18px 22px", marginBottom: 10,
      border: rank === 1 ? "1px solid rgba(255,215,0,0.25)" : "1px solid rgba(255,255,255,0.07)",
      boxShadow: rank === 1 ? "0 4px 24px rgba(255,215,0,0.08)" : "none",
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: rank === 1 ? "rgba(255,215,0,0.18)" : "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONTS.sans, fontSize: 20, fontWeight: 800,
        color: rank === 1 ? "#ffd700" : "rgba(255,255,255,0.35)",
      }}>
        {rank}
      </div>
      <div style={{
        width: 56, height: 56, borderRadius: 14, flexShrink: 0,
        background: "rgba(255,255,255,0.06)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30,
      }}>
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: FONTS.sans, fontSize: 30, fontWeight: 700, color: "#fff",
          lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {name}
        </div>
        <div style={{ fontFamily: FONTS.sans, fontSize: 22, color: "rgba(255,255,255,0.45)", marginTop: 4 }}>
          {sub}
        </div>
      </div>
    </div>
  );
};

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const lineStartY = height * 0.75;
  const lineEndY = height * 0.22;

  const globalShiftUp = spring({
    frame: frame - 160, fps, from: 0, to: -(height * 0.42), config: { damping: 16 },
  });

  const barToCenter = spring({ frame: frame - 20, fps, from: 0, to: 1, config: { damping: 15 } });
  const barBackDown = spring({ frame: frame - 85, fps, from: 0, to: 1, config: { damping: 15 } });
  const searchBarYMoving = interpolate(barToCenter - barBackDown, [0, 1], [height * 0.795, height / 2]);
  const dimOpacity = interpolate(barToCenter - barBackDown, [0, 1], [1, 0.2]);

  const cursorOpacity = interpolate(frame, [45, 52, 80, 85], [0, 1, 1, 0]);
  const cursorMove = interpolate(frame, [52, 70], [0, 1], { easing: Easing.bezier(0.33, 1, 0.68, 1) });
  const cursorX = interpolate(cursorMove, [0, 1], [width / 2 + 100, width / 2 + 400]);
  const cursorY = interpolate(cursorMove, [0, 1], [height / 2 + 300, height / 2 + 40]);
  const clickScale = interpolate(frame, [70, 73, 77], [5, 4.8, 5], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const linesShift = spring({ frame: frame - 95, fps, from: 0, to: 1, config: { damping: 14 } });
  const line1X = interpolate(linesShift, [0, 1], [width / 2, width / 2 - 160]);
  const line2X = interpolate(linesShift, [0, 1], [width / 2, width / 2 + 160]);
  const line2Opacity = interpolate(frame, [95, 105], [0, 1]);

  const imp1UpProgress = interpolate(frame, [0, 165], [0.251, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear,
  });
  const imp1UpY = lineStartY - (lineStartY - lineEndY) * imp1UpProgress;
  const imp1UpOp = interpolate(imp1UpProgress, [0.82, 1.0], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const imp2Pop = spring({ frame: frame - 105, fps, from: 0, to: 1.3, config: { damping: 10 } });
  const imp2UpProgress = interpolate(frame, [115, 175], [0, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear,
  });
  const imp2UpY = lineStartY - (lineStartY - lineEndY) * imp2UpProgress;
  const imp2UpOp = interpolate(imp2UpProgress, [0.82, 1.0], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const searchBarY = frame < 135 ? searchBarYMoving : height * 0.795;

  const skeletonOp = interpolate(frame, [150, 162], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const skeletonFadeOut = interpolate(frame, [196, 204], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const skeletonVisible = skeletonOp * skeletonFadeOut;
  const uiCardOp = interpolate(frame, [150, 162], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  const imp2DownProgress = interpolate(frame, [178, 200], [0, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.6, 1),
  });
  const imp2DownY = lineEndY + (lineStartY - lineEndY) * imp2DownProgress;
  const imp2DownOp = interpolate(imp2DownProgress, [0, 0.12, 0.88, 1.0], [0, 1, 1, 0]);
  const showImp2Down = frame >= 178 && frame < 210;

  const imp1DownProgress = interpolate(frame, [195, 242], [0, 1.0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.linear,
  });
  const imp1DownY = lineEndY + (lineStartY - lineEndY) * imp1DownProgress;
  const imp1DownOp = interpolate(imp1DownProgress, [0, 0.1, 0.88, 1.0], [0, 1, 1, 0]);
  const showImp1Down = frame >= 195 && frame < 252;

  const showImp1Up = frame < 170;
  const showImp2Up = frame >= 105 && frame < 182;
  const line1XSettled = width / 2 - 160;
  const line2XSettled = width / 2 + 160;

  const latestLabelOp  = frame >= 178 ? imp2DownOp : 0;
  const outdatedLabelOp = frame >= 195 ? imp1DownOp : 0;

  const housesOp =
    interpolate(frame, [200, 210], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
    interpolate(frame, [238, 246], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const richestOp = interpolate(frame, [242, 252], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const overwriteFlash = interpolate(frame, [242, 244, 252], [0, 0.4, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", fontFamily: FONTS.sans }}>
      <div style={{ width: "100%", height: "100%", transform: `translateY(${globalShiftUp}px)` }}>

        {/* Server */}
        <div style={{
          position: "absolute", top: "8%", left: "50%",
          transform: "translateX(-50%)", zIndex: 20,
        }}>
          <ServerIcon opacity={frame < 135 ? dimOpacity : 1} />
        </div>

        {/* Lines */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 5 }}>
          <line x1={line1X} y1={lineStartY} x2={line1X} y2={lineEndY}
            stroke={COLORS.dashedLine} strokeWidth="10" strokeDasharray="25 20" strokeLinecap="round"
            opacity={frame < 135 ? dimOpacity : 1} />
          <line x1={line2X} y1={lineStartY} x2={line2X} y2={lineEndY}
            stroke={COLORS.dashedLine} strokeWidth="10" strokeDasharray="25 20" strokeLinecap="round"
            opacity={(frame < 135 ? dimOpacity : 1) * (frame < 105 ? 0 : line2Opacity)} />
        </svg>

        {showImp1Up && (
          <Imposter color={COLORS.imposter1} backpackColor={COLORS.imposter1Backpack}
            yPos={imp1UpY - 100} scale={1.3}
            opacity={frame < 135 ? dimOpacity * imp1UpOp : imp1UpOp}
            xOffset={line1X - width / 2} />
        )}
        {showImp2Up && (
          <Imposter color={COLORS.imposter2} backpackColor={COLORS.imposter2Backpack}
            yPos={imp2UpY - 100} scale={frame < 108 ? imp2Pop : 1.3}
            opacity={imp2UpOp} xOffset={line2X - width / 2} />
        )}
        {showImp2Down && (
          <>
            <ImposterLabel label="Latest ✓" xOffset={line2XSettled - width / 2}
              yPos={imp2DownY - 100} color="#1c9a26" opacity={latestLabelOp} />
            <Imposter color={COLORS.imposter2} backpackColor={COLORS.imposter2Backpack}
              yPos={imp2DownY - 100} scale={1.3} opacity={imp2DownOp}
              xOffset={line2XSettled - width / 2} />
          </>
        )}
        {showImp1Down && (
          <>
            <ImposterLabel label="Outdated ⚠" xOffset={line1XSettled - width / 2}
              yPos={imp1DownY - 100} color="#cb250f" opacity={outdatedLabelOp} />
            <Imposter color={COLORS.imposter1} backpackColor={COLORS.imposter1Backpack}
              yPos={imp1DownY - 100} scale={1.3} opacity={imp1DownOp}
              xOffset={line1XSettled - width / 2} grayscale />
          </>
        )}

        {/* Search Bar */}
        <div style={{
          position: "absolute", top: searchBarY, left: "50%",
          transform: "translate(-50%, -50%)",
          width: 900, height: 120, backgroundColor: COLORS.searchBar,
          borderRadius: 60, display: "flex", alignItems: "center",
          padding: "0 45px", boxShadow: "0 25px 60px rgba(0,0,0,0.25)", zIndex: 50,
        }}>
          <div style={{ fontSize: 42, color: COLORS.searchText, flex: 1, fontWeight: 700 }}>
            {frame < 60 ? "Top 5 richest men in the world" : "Expensive houses in the world"}
          </div>
          <div style={{
            width: 70, height: 70, display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: frame > 70 && frame < 80 ? "rgba(26,115,232,0.1)" : "transparent",
            borderRadius: "50%",
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke={COLORS.accentBlue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Results area */}
        {frame >= 150 && (
          <div style={{
            position: "absolute",
            top: height * 0.795 + 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: 920, height: 680,
            opacity: uiCardOp, zIndex: 30,
            background: "rgba(22,24,28,0.82)",
            backdropFilter: "blur(20px)",
            borderRadius: 28,
            padding: "24px 24px 20px",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 48px 96px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}>
            {overwriteFlash > 0 && (
              <div style={{
                position: "absolute", inset: 0,
                background: `rgba(234,67,53,${overwriteFlash})`,
                borderRadius: 28, zIndex: 40, pointerEvents: "none",
              }} />
            )}
            <div style={{
              fontFamily: FONTS.sans, fontSize: 20, fontWeight: 600,
              color: "rgba(255,255,255,0.3)", letterSpacing: 1.5,
              textTransform: "uppercase" as const, marginBottom: 16, paddingLeft: 4,
            }}>
              Search results
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ opacity: skeletonVisible, position: "absolute", width: "100%", top: 0 }}>
                {[0, 1, 2, 3].map((i) => (
                  <SkeletonRow key={i} delay={152 + i * 6} frame={frame} />
                ))}
              </div>
              <div style={{ opacity: housesOp }}>
                {HOUSES.map((h, i) => (
                  <ResultCard key={i} emoji={h.emoji} name={h.name} sub={h.sub}
                    index={i} frame={frame} startFrame={200} rank={i + 1} />
                ))}
              </div>
              <div style={{ opacity: richestOp, position: "absolute", top: 0, width: "100%" }}>
                {RICHEST.map((r, i) => (
                  <ResultCard key={i} emoji={r.emoji} name={r.name} sub={r.sub}
                    index={i} frame={frame} startFrame={242} rank={i + 1} />
                ))}
              </div>
            </div>
          </div>
        )}

        <Cursor x={cursorX} y={cursorY} opacity={cursorOpacity} scale={clickScale} />
      </div>
    </AbsoluteFill>
  );
};