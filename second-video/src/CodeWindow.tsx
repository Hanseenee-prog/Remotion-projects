import React from "react";

// ─── Design Tokens (Gemini style — locked) ────────────────────────────────────
export const SYN = {
  plain:   "#ABB2BF",   // default text
  method:  "#C678DD",   // purple  — .addEventListener, .forEach, .backgroundColor
  string:  "#A5D6FF",   // light blue — all strings
  param:   "#E06C75",   // coral/salmon — () params e.g. ()  in addEventListener
  keyword: "#56B6C2",   // cyan — reserved words
  comment: "#5C6370",   // muted italic
  number:  "#D19A66",   // orange — numeric literals
  arrow:   "#E06C75",   // coral/salmon — => and = operators (matches image)
  dim:     "#636D83",   // dimmed
  ident:   "#D19A66",   // orange — named identifiers e.g. "button" in forEach((button))
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export type TokenType = keyof typeof SYN;

export type Token =
  | { t: "plain";   v: string }
  | { t: "method";  v: string }
  | { t: "string";  v: string }
  | { t: "param";   v: string }
  | { t: "keyword"; v: string }
  | { t: "comment"; v: string }
  | { t: "number";  v: string }
  | { t: "arrow";   v: string }
  | { t: "dim";     v: string }
  | { t: "ident";   v: string };

export type CodeLine = Token[] | "blank";

// ─── Token shorthand helpers ──────────────────────────────────────────────────
export const p  = (v: string): Token => ({ t: "plain",   v });
export const m  = (v: string): Token => ({ t: "method",  v });
export const s  = (v: string): Token => ({ t: "string",  v });
export const pr = (v: string): Token => ({ t: "param",   v });
export const kw = (v: string): Token => ({ t: "keyword", v });
export const cm = (v: string): Token => ({ t: "comment", v });
export const nm = (v: string): Token => ({ t: "number",  v });
export const ar = (v: string): Token => ({ t: "arrow",   v });
export const dm = (v: string): Token => ({ t: "dim",     v });
export const id = (v: string): Token => ({ t: "ident",   v });  // orange identifier

// ─── CodeWindow Props ─────────────────────────────────────────────────────────
interface CodeWindowProps {
  lines: CodeLine[];
  filename?: string;
  scale?: number;
  style?: React.CSSProperties;
  highlightLine?: number;
  opacity?: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const CodeWindow: React.FC<CodeWindowProps> = ({
  lines,
  filename = "scripts.js",
  scale = 1,
  style = {},
  highlightLine,
  opacity = 1,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        opacity,
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        ...style,
      }}
    >
      <div
        style={{
          width: 800,
          background: "#0D1117",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 30px 80px rgba(0,0,0,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {/* ── Title bar ── */}
        <div
          style={{
            height: 54,
            background: "#161B22",
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", gap: 8, zIndex: 2 }}>
            <div style={dot("#FF5F56")} />
            <div style={dot("#FFBD2E")} />
            <div style={dot("#27C93F")} />
          </div>

          <div
            style={{
              position: "absolute",
              left: 95,
              bottom: 0,
              height: 44,
              background: "#0D1117",
              padding: "0 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              borderRadius: "8px 8px 0 0",
              fontSize: 15,
              color: "#E6EDF3",
            }}
          >
            <div
              style={{
                background: "#F7DF1E",
                color: "#000",
                fontWeight: 900,
                fontSize: 11,
                width: 18,
                height: 18,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "flex-end",
                padding: "0 2px 1px 0",
                borderRadius: 2,
                boxSizing: "border-box",
                fontFamily: "sans-serif",
                flexShrink: 0,
              }}
            >
              JS
            </div>
            {filename}
          </div>
        </div>

        {/* ── Code body ── */}
        <div
          style={{
            padding: 40,
            fontSize: 20,
            lineHeight: 1.6,
            color: "#ABB2BF",
          }}
        >
          {lines.map((line, i) =>
            line === "blank" ? (
              <div key={i} style={{ height: "1.6em" }} />
            ) : (
              <div
                key={i}
                style={{
                  borderRadius: 4,
                  paddingLeft: 6,
                  paddingRight: 6,
                  background:
                    highlightLine === i
                      ? "rgba(86,182,194,0.10)"
                      : "transparent",
                  boxShadow:
                    highlightLine === i
                      ? "inset 3px 0 0 #56B6C2"
                      : "none",
                }}
              >
                {line.map((token, j) => (
                  <span key={j} style={{ color: SYN[token.t] }}>
                    {token.v}
                  </span>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Helper ───────────────────────────────────────────────────────────────────
const dot = (color: string): React.CSSProperties => ({
  width: 12,
  height: 12,
  borderRadius: "50%",
  background: color,
  flexShrink: 0,
});