import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONT = '"Martian Mono", monospace';
const BOX_W = 400;
const BOX_H = 400;
const VISUAL_PADDING = 52;

const ARROW_COLOR = '#ff5f56';
const LABEL_BG = '#0d1117';
const PADDING_COLOR = '#c0392b';
const PADDING_BORDER_COLOR = '#ff6b6b';
const BORDER_COLOR = '#ffd166';
const BOX_SCALE = 1.42;

const colors = {
  bg: '#0d1117',
  border: '#30363d',
  text: '#c9d1d9',
  selector: '#d2a8ff',
  property: '#79c0ff',
  value: '#a5d6ff',
  punctuation: '#c9d1d9',
  cssPurple: '#663399',
};

// fontSize=48, lineHeight=1.6 → 76.8px per line
const LINE_H = 77;
// Scene4 code rows: .box{, height, width, box-sizing, } = 5 rows
// Scene5 adds padding + border = 7 rows total
// Each row is LINE_H. Padding top = 50px, bottom = 50px.
const SCENE4_ROWS_H = 5 * LINE_H; // content height only
const SCENE5_ROWS_H = 7 * LINE_H;
const CODE_PAD_V = 50; // top and bottom padding of code area
const SCENE4_CODE_AREA_H = SCENE4_ROWS_H + CODE_PAD_V * 2;
const SCENE5_CODE_AREA_H = SCENE5_ROWS_H + CODE_PAD_V * 2;

// ── Dimension Arrow ───────────────────────────────────────
const DimensionArrow: React.FC<{
  type: 'horizontal' | 'vertical';
  label: string;
  top?: number | string;
  left?: number | string;
  length: number;
  opacity?: number;
}> = ({ type, label, top, left, length, opacity = 1 }) => {
  const isH = type === 'horizontal';
  const T = 8; const A = 25;
  return (
    <div style={{ position: 'absolute', top, left, display: 'flex', flexDirection: isH ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', transform: isH ? 'translateX(-50%)' : 'translateY(-50%)', width: isH ? length : 100, height: isH ? 100 : length, opacity, pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: isH ? '100%' : T, height: isH ? T : '100%', backgroundColor: ARROW_COLOR, zIndex: 10 }}>
        <div style={{ position: 'absolute', [isH ? 'left' : 'top']: 0, width: A, height: A, borderLeft: `${T}px solid ${ARROW_COLOR}`, borderTop: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(-2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), -2px) rotate(45deg)` }} />
        <div style={{ position: 'absolute', [isH ? 'right' : 'bottom']: 0, width: A, height: A, borderRight: `${T}px solid ${ARROW_COLOR}`, borderBottom: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), 2px) rotate(45deg)` }} />
      </div>
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) ${isH ? '' : 'rotate(90deg)'}`, color: ARROW_COLOR, fontFamily: FONT, fontSize: 36, fontWeight: 'bold', backgroundColor: LABEL_BG, padding: '8px 18px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 10 }}>
        {label}
      </span>
    </div>
  );
};

// ── Dashed border SVG — sits outside the padding box ─────
const AnimatedDashedBorder: React.FC<{
  width: number;
  height: number;
  frame: number;
  startFrame: number;
  opacity: number;
  borderRadius?: number;
}> = ({ width, height, frame, startFrame, opacity, borderRadius = 28 }) => {
  const strokeW = 8;
  const outset = 10;
  const svgW = width + outset * 2;
  const svgH = height + outset * 2;
  const dash = 28; const gap = 14;
  const perimeter = 2 * (svgW + svgH);
  const drawDuration = 22;
  const drawOffset = interpolate(frame, [startFrame, startFrame + drawDuration], [perimeter, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const marchOffset = frame > startFrame + drawDuration ? (frame - (startFrame + drawDuration)) * 2.2 : 0;
  const offset = drawOffset - marchOffset;
  return (
    <svg style={{ position: 'absolute', top: -outset, left: -outset, opacity, pointerEvents: 'none', overflow: 'visible' }} width={svgW} height={svgH}>
      <rect x={strokeW / 2} y={strokeW / 2} width={svgW - strokeW} height={svgH - strokeW} rx={borderRadius + outset} ry={borderRadius + outset} fill="none" stroke={BORDER_COLOR} strokeWidth={strokeW} strokeDasharray={`${dash} ${gap}`} strokeDashoffset={offset} />
    </svg>
  );
};

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const paddingBoxW = BOX_W + VISUAL_PADDING * 2;
  const paddingBoxH = BOX_H + VISUAL_PADDING * 2;

  // ── 0–8: Arrows fade out fast ────────────────────────
  const arrowFadeOut = interpolate(frame, [0, 8], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── 0–14: Code area maxHeight expands — outer wrapper has NO overflow hidden ─
  // The outer window has no fixed height — only the inner code area grows via maxHeight
  const codeAreaMaxH = interpolate(frame, [0, 14], [SCENE4_CODE_AREA_H, SCENE5_CODE_AREA_H], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── 8–32: padding: 9px; types in ─────────────────────
  const paddingText = 'padding: 9px;';
  const paddingChars = interpolate(frame, [8, 32], [0, paddingText.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const tProp  = 'padding'.substring(0, Math.max(0, Math.round(paddingChars)));
  const tColon = ': '.substring(0, Math.max(0, Math.round(paddingChars) - 7));
  const tVal   = '9px'.substring(0, Math.max(0, Math.round(paddingChars) - 9));
  const tSemi  = ';'.substring(0, Math.max(0, Math.round(paddingChars) - 12));
  const isPaddingTyping = paddingChars > 0 && paddingChars < paddingText.length;

  // ── 18: Box jerk + padding box grows from behind ─────
  const jerkSpring = spring({ frame: frame - 18, fps, config: { damping: 6, stiffness: 300, mass: 0.6 } });
  const boxJerkScale = interpolate(jerkSpring, [0, 0.35, 1], [BOX_SCALE, BOX_SCALE + 0.14, BOX_SCALE]);
  const boxMoveUp = interpolate(jerkSpring, [0, 1], [0, -28]);

  const innerToOuter = BOX_W / paddingBoxW;
  const paddingBoxSpring = spring({ frame: frame - 18, fps, config: { damping: 11, stiffness: 110 } });
  const paddingBoxScale = interpolate(paddingBoxSpring, [0, 1], [innerToOuter, 1]);
  const paddingBoxOpacity = interpolate(frame, [18, 22], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── Shadow fades in after settle ─────────────────────
  const shadowOpacity = interpolate(frame, [48, 60], [0, 0.3], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ── 44–70: border: 3px dashed #ffd166; types in ──────
  const BORDER_TYPE_START = 44;
  const borderText = "border: 3px dashed #ffd166;";
  const borderChars = interpolate(frame, [BORDER_TYPE_START, BORDER_TYPE_START + 26], [0, borderText.length], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bProp  = 'border'.substring(0, Math.max(0, Math.round(borderChars)));
  const bColon = ': '.substring(0, Math.max(0, Math.round(borderChars) - 6));
  const bVal1  = '3px'.substring(0, Math.max(0, Math.round(borderChars) - 8));
  const bVal2  = ' dashed'.substring(0, Math.max(0, Math.round(borderChars) - 11));
  const bColor = ' #ffd166'.substring(0, Math.max(0, Math.round(borderChars) - 18));
  const bSemi  = ';'.substring(0, Math.max(0, Math.round(borderChars) - 26));
  const isBorderTyping = borderChars > 0 && borderChars < borderText.length;

  // ── Border SVG draws on at frame 58, marches forever ─
  const BORDER_SVG_START = 58;
  const borderOpacity = interpolate(frame, [BORDER_SVG_START, BORDER_SVG_START + 5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* ── BOX GROUP ── */}
      <div style={{
        transform: `scale(${boxJerkScale}) translateY(${boxMoveUp}px)`,
        position: 'relative',
        marginTop: '-950px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: paddingBoxW,
        height: paddingBoxH,
        filter: `drop-shadow(0 10px 20px rgba(0,0,0,${shadowOpacity}))`,
      }}>
        <div style={{ position: 'absolute', width: paddingBoxW, height: paddingBoxH, borderRadius: 28, backgroundColor: PADDING_COLOR, border: `2px solid ${PADDING_BORDER_COLOR}`, transform: `scale(${paddingBoxScale})`, opacity: paddingBoxOpacity, boxSizing: 'border-box' }}>
          <AnimatedDashedBorder width={paddingBoxW} height={paddingBoxH} frame={frame} startFrame={BORDER_SVG_START} opacity={borderOpacity} borderRadius={28} />
        </div>
        <div style={{ position: 'relative', width: BOX_W, height: BOX_H, backgroundColor: '#38bdf8', boxSizing: 'content-box', borderRadius: 20, zIndex: 2 }} />
        <DimensionArrow type="horizontal" label="200px" length={BOX_W} top={-100} left="50%" opacity={arrowFadeOut} />
        <DimensionArrow type="vertical"   label="200px" length={BOX_H} top="50%" left={BOX_W} opacity={arrowFadeOut} />
      </div>

      {/* ── CODE WINDOW ─────────────────────────────────────
          Key fix: outer wrapper has NO height/overflow — it naturally
          sizes to content. The inner code area has overflow:hidden +
          maxHeight that animates, so rows are revealed not clipped.   ── */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        width: '90%',
        backgroundColor: colors.bg,
        borderRadius: 20,
        // NO overflow:hidden here — let the window grow naturally
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        border: `1px solid ${colors.border}`,
        fontFamily: FONT,
      }}>

        {/* Tab Header — always fully visible */}
        <div style={{ display: 'flex', backgroundColor: '#010409', borderBottom: `1px solid ${colors.border}`, alignItems: 'center', height: 80, paddingLeft: 25, borderRadius: '20px 20px 0 0', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            {(['#ff5f56', '#ffbd2e', '#27c93f'] as string[]).map(c => (
              <div key={c} style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: c }} />
            ))}
          </div>
          <div style={{ backgroundColor: colors.bg, height: '100%', padding: '0 35px', borderRight: `1px solid ${colors.border}`, borderTop: '3px solid #f78166', color: colors.text, fontSize: 28, display: 'flex', alignItems: 'center', gap: 15, fontFamily: FONT }}>
            <div style={{ backgroundColor: colors.cssPurple, color: 'white', fontSize: 14, fontWeight: 'bold', padding: '4px 6px', borderRadius: 4, fontFamily: FONT }}>CSS</div>
            style.css
          </div>
        </div>

        {/* Code area — maxHeight grows, overflow hidden clips bottom cleanly */}
        <div style={{
          maxHeight: codeAreaMaxH,
          overflow: 'hidden',
          // Smooth the height expansion
          transition: 'none', // driven by frame interpolation, no CSS transition needed
        }}>
          <div style={{ padding: `${CODE_PAD_V}px 60px`, fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>

            <div>
              <span style={{ color: colors.selector }}>.box</span>{' '}
              <span style={{ color: colors.punctuation }}>{'{'}</span>
            </div>

            {/* padding: 9px; */}
            <div style={{ paddingLeft: 50, minHeight: LINE_H }}>
              <span style={{ color: colors.property }}>{tProp}</span>
              <span style={{ color: colors.punctuation }}>{tColon}</span>
              <span style={{ color: colors.value }}>{tVal}</span>
              <span style={{ color: colors.punctuation }}>{tSemi}</span>
              {isPaddingTyping && <span style={{ display: 'inline-block', width: 4, height: '0.85em', backgroundColor: '#58a6ff', marginLeft: 4, verticalAlign: 'text-bottom' }} />}
            </div>

            {/* border: 3px dashed #ffd166; */}
            <div style={{ paddingLeft: 50, minHeight: LINE_H }}>
              <span style={{ color: colors.property }}>{bProp}</span>
              <span style={{ color: colors.punctuation }}>{bColon}</span>
              <span style={{ color: colors.value }}>{bVal1}</span>
              <span style={{ color: BORDER_COLOR }}>{bVal2}</span>
              <span style={{ color: BORDER_COLOR }}>{bColor}</span>
              <span style={{ color: colors.punctuation }}>{bSemi}</span>
              {isBorderTyping && <span style={{ display: 'inline-block', width: 4, height: '0.85em', backgroundColor: '#58a6ff', marginLeft: 4, verticalAlign: 'text-bottom' }} />}
            </div>

            <div style={{ paddingLeft: 50 }}>
              <span style={{ color: colors.property }}>height</span>
              <span style={{ color: colors.punctuation }}>: </span>
              <span style={{ color: colors.value }}>200px</span>
              <span style={{ color: colors.punctuation }}>;</span>
            </div>

            <div style={{ paddingLeft: 50 }}>
              <span style={{ color: colors.property }}>width</span>
              <span style={{ color: colors.punctuation }}>: </span>
              <span style={{ color: colors.value }}>200px</span>
              <span style={{ color: colors.punctuation }}>;</span>
            </div>

            <div style={{ paddingLeft: 50 }}>
              <span style={{ color: colors.property }}>box-sizing</span>
              <span style={{ color: colors.punctuation }}>: </span>
              <span style={{ color: colors.value }}>content-box</span>
              <span style={{ color: colors.punctuation }}>;</span>
            </div>

            <div>
              <span style={{ color: colors.punctuation }}>{'}'}</span>
            </div>

          </div>
        </div>

        {/* Bottom radius cap — sits below the clipped code area */}
        <div style={{ height: 20, backgroundColor: colors.bg, borderRadius: '0 0 20px 20px' }} />
      </div>

    </AbsoluteFill>
  );
};