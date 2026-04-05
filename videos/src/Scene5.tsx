import React from "react";
import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from "remotion";
import { COLORS, FONTS, SAFE } from "./tokens";

const C = COLORS;
const mono = FONTS.mono;
const display = FONTS.display;

function tok(color: string, text: string) {
  return <span style={{ color }}>{text}</span>;
}

interface Problem {
  icon: string;
  title: string;
  code: React.ReactNode;
  result: string;
  delay: number;
}

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [0, 16], [24, 0], { extrapolateRight: "clamp" });

  const problems: Problem[] = [
    {
      icon: "📅",
      title: "Dates → strings",
      code: <>
        {tok(C.keyword, "new ")}
        {tok(C.fnName, "Date")}
        {tok(C.punctuation, "()")}
      </>,
      result: '"2024-01-15T..."  ❌',
      delay: 20,
    },
    {
      icon: "🕳",
      title: "undefined disappears",
      code: <>
        {tok(C.property, "value")}
        {tok(C.punctuation, ": ")}
        {tok(C.keyword, "undefined")}
      </>,
      result: 'key gone silently  ❌',
      delay: 48,
    },
    {
      icon: "💀",
      title: "Functions vanish",
      code: <>
        {tok(C.property, "greet")}
        {tok(C.punctuation, ": () => ...")}
      </>,
      result: 'key gone silently  ❌',
      delay: 76,
    },
  ];

  return (
    <AbsoluteFill style={{ padding: `${SAFE.top}px ${SAFE.left}px` }}>

      {/* Title */}
      <div style={{ opacity: titleOp, transform: `translateY(${titleY}px)`, marginBottom: 48 }}>
        <div style={{ fontFamily: display, fontSize: 58, fontWeight: 800, color: C.white, lineHeight: 1.1 }}>
          But now…<br />
          <span style={{ color: C.accentC }}>things break.</span>
        </div>
      </div>

      {/* Problems */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {problems.map((p, i) => {
          const sc = spring({ frame, fps, from: 0, to: 1, config: { damping: 14, stiffness: 200 }, delay: p.delay });
          const x = interpolate(sc, [0, 1], [-60, 0]);

          return (
            <div key={i} style={{
              opacity: sc,
              transform: `translateX(${x}px)`,
              background: "rgba(255,123,114,0.07)",
              border: "1px solid rgba(255,123,114,0.2)",
              borderRadius: 16,
              padding: "24px 28px",
            }}>
              {/* Row top: icon + title */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 32 }}>{p.icon}</span>
                <span style={{ fontFamily: display, fontSize: 32, fontWeight: 700, color: C.accentC }}>
                  {p.title}
                </span>
              </div>

              {/* Code input */}
              <div style={{
                background: C.codeBg,
                borderRadius: 10,
                padding: "12px 20px",
                fontFamily: mono,
                fontSize: 28,
                marginBottom: 12,
              }}>
                {p.code}
              </div>

              {/* Result */}
              <div style={{
                fontFamily: mono,
                fontSize: 26,
                color: C.accentC,
                paddingLeft: 4,
              }}>
                → {p.result}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
