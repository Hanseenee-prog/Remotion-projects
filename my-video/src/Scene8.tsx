import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONT = '"Martian Mono", monospace';
const BOX_W = 400;
const BOX_H = 400;
const VISUAL_PADDING = 52;
const ARROW_COLOR = '#ff5f56';
const LABEL_BG = '#0d1117';
const PADDING_COLOR = '#c0392b';
const BORDER_COLOR = '#ffd166';
const DIM = 0.2;

const colors = {
  bg: '#0d1117', border: '#30363d', text: '#c9d1d9',
  selector: '#d2a8ff', property: '#79c0ff', value: '#a5d6ff',
  punctuation: '#c9d1d9', cssPurple: '#663399',
};

const paddingBoxW = BOX_W + VISUAL_PADDING * 2;
const paddingBoxH = BOX_H + VISUAL_PADDING * 2;
const OUTER_R = 28;
const INNER_R = 20;

const HollowPaddingBox: React.FC<{ opacity?: number; bright?: boolean; strokeOpacity?: number }> = ({ opacity = 1, bright = false, strokeOpacity = 0.7 }) => {
  const fill = bright ? '#ff4444' : PADDING_COLOR;
  return (
    <svg style={{ position: 'absolute', top: 0, left: 0, opacity }} width={paddingBoxW} height={paddingBoxH} viewBox={`0 0 ${paddingBoxW} ${paddingBoxH}`}>
      <mask id="donut-mask">
        <rect x={0} y={0} width={paddingBoxW} height={paddingBoxH} rx={OUTER_R} ry={OUTER_R} fill="white" />
        <rect x={VISUAL_PADDING} y={VISUAL_PADDING} width={BOX_W} height={BOX_H} rx={INNER_R} ry={INNER_R} fill="black" />
      </mask>
      <rect x={0} y={0} width={paddingBoxW} height={paddingBoxH} fill={fill} mask="url(#donut-mask)" />
      <rect x={1} y={1} width={paddingBoxW - 2} height={paddingBoxH - 2} rx={OUTER_R} ry={OUTER_R} fill="none" stroke={`rgba(255,107,107,${strokeOpacity})`} strokeWidth={2} />
    </svg>
  );
};

const MarchingBorder: React.FC<{ width: number; height: number; frame: number; opacity?: number; bright?: boolean }> = ({ width, height, frame, opacity = 1, bright = false }) => {
  const strokeW = 8; const outset = 10;
  const svgW = width + outset * 2; const svgH = height + outset * 2;
  const offset = -frame * 2.2;
  const stroke = bright ? '#ffe566' : BORDER_COLOR;
  return (
    <svg style={{ position: 'absolute', top: -outset, left: -outset, pointerEvents: 'none', overflow: 'visible', opacity }} width={svgW} height={svgH}>
      <rect x={strokeW/2} y={strokeW/2} width={svgW - strokeW} height={svgH - strokeW} rx={OUTER_R + outset} ry={OUTER_R + outset} fill="none" stroke={stroke} strokeWidth={strokeW} strokeDasharray="28 14" strokeDashoffset={offset} />
    </svg>
  );
};

const DimensionArrow: React.FC<{ type: 'horizontal' | 'vertical'; label: string; top?: number | string; left?: number | string; length: number; springVal: number; fadeOut?: number }> = ({ type, label, top, left, length, springVal, fadeOut = 1 }) => {
  const isH = type === 'horizontal';
  const T = 8; const A = 25;
  const lineScale = interpolate(springVal, [0, 1], [0, 1]);
  const baseOpacity = interpolate(springVal, [0, 0.1, 1], [0, 1, 1]);
  return (
    <div style={{ position: 'absolute', top, left, display: 'flex', flexDirection: isH ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', transform: isH ? 'translateX(-50%)' : 'translateY(-50%)', width: isH ? length : 100, height: isH ? 100 : length, opacity: baseOpacity * fadeOut, pointerEvents: 'none' }}>
      <div style={{ position: 'relative', width: isH ? '100%' : T, height: isH ? T : '100%', backgroundColor: ARROW_COLOR, transform: `scale${isH ? 'X' : 'Y'}(${lineScale})`, transformOrigin: 'center center', zIndex: 10 }}>
        <div style={{ position: 'absolute', [isH ? 'left' : 'top']: 0, width: A, height: A, borderLeft: `${T}px solid ${ARROW_COLOR}`, borderTop: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(-2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), -2px) rotate(45deg)` }} />
        <div style={{ position: 'absolute', [isH ? 'right' : 'bottom']: 0, width: A, height: A, borderRight: `${T}px solid ${ARROW_COLOR}`, borderBottom: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), 2px) rotate(45deg)` }} />
      </div>
      <span style={{ position: 'absolute', left: '50%', top: '50%', transform: `translate(-50%, -50%) ${isH ? '' : 'rotate(90deg)'}`, color: ARROW_COLOR, fontFamily: FONT, fontSize: 36, fontWeight: 'bold', backgroundColor: LABEL_BG, padding: '8px 18px', borderRadius: 8, whiteSpace: 'nowrap', zIndex: 10 }}>
        {label}
      </span>
    </div>
  );
};

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Code window exits
  const windowScaleDown = interpolate(frame, [0, 15], [1, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const windowExitX = interpolate(frame, [10, 35], [0, 1400], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // Box enters from left
  const boxEnterSpring = spring({ frame: frame - 18, fps, config: { damping: 14, stiffness: 80 } });
  const boxEnterX = interpolate(boxEnterSpring, [0, 1], [-1300, 0]);
  const boxEnterScale = interpolate(boxEnterSpring, [0, 1], [0.7, 1.1]);

  // Horizontal arrow at frame 48 — padding glows as it springs in
  const widthSpring  = spring({ frame: frame - 48, fps, config: { damping: 14, stiffness: 600 } });
  // Vertical arrow at frame 61 — border glows as it springs in
  const heightSpring = spring({ frame: frame - 48, fps, config: { damping: 14, stiffness: 600 } });

  // Padding glows while horizontal arrow is coming in, fades when vertical starts
  const paddingGlowVal = interpolate(frame, [48, 55, 65, 72], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  // Border glows while vertical arrow is coming in
  const borderGlowVal  = interpolate(frame, [61, 68, 80, 90], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const paddingFillBright = paddingGlowVal > 0.05;
  const paddingStrokeOp   = interpolate(paddingGlowVal, [0, 1], [0.7, 0.1]);
  const paddingOpacity    = interpolate(borderGlowVal, [0, 1], [1, 0.2]);

  const borderBright  = borderGlowVal > 0.5;
  const borderOpacity = borderGlowVal > 0.05
    ? interpolate(borderGlowVal, [0, 1], [0.2, 1])
    : interpolate(paddingGlowVal, [0, 1], [1, 0.2]);

  // Arrows: always full opacity, fade out after border glow ends
  const arrowsFadeOut = interpolate(frame, [90, 102], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* BOX GROUP */}
      <div style={{ position: 'relative', transform: `translateX(${boxEnterX}px) scale(${boxEnterScale})`, display: 'flex', alignItems: 'center', justifyContent: 'center', width: paddingBoxW, height: paddingBoxH, marginTop: -60 }}>

        <HollowPaddingBox opacity={paddingOpacity} bright={paddingFillBright} strokeOpacity={paddingStrokeOp} />
        <MarchingBorder width={paddingBoxW} height={paddingBoxH} frame={frame} opacity={borderOpacity} bright={borderBright} />

        {/* Blue box — dims during both glow phases */}
        <div style={{ position: 'relative', width: BOX_W, height: BOX_H, backgroundColor: '#38bdf8', borderRadius: 20, zIndex: 2, opacity: interpolate(Math.max(paddingGlowVal, borderGlowVal), [0, 1], [1, 0.15]) }} />

        {/* Both arrows — always full opacity, fade out at end */}
        <DimensionArrow type="horizontal" label="200px" length={paddingBoxW + 40} top={-110} left="50%"      springVal={widthSpring}  fadeOut={arrowsFadeOut} />
        <DimensionArrow type="vertical"   label="200px" length={paddingBoxH + 40} top="50%" left={paddingBoxW + 20} springVal={heightSpring} fadeOut={arrowsFadeOut} />
      </div>

      {/* CODE WINDOW exits */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '90%', backgroundColor: colors.bg, borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.6)', border: `1px solid ${colors.border}`, fontFamily: FONT, transform: `translate(-50%, -50%) scale(${windowScaleDown}) translateX(${windowExitX}px)`, transformOrigin: 'center center' }}>
        <div style={{ display: 'flex', backgroundColor: '#010409', borderBottom: `1px solid ${colors.border}`, alignItems: 'center', height: 80, paddingLeft: 25 }}>
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            {(['#ff5f56', '#ffbd2e', '#27c93f'] as string[]).map(c => (<div key={c} style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: c }} />))}
          </div>
          <div style={{ backgroundColor: colors.bg, height: '100%', padding: '0 35px', borderRight: `1px solid ${colors.border}`, borderTop: '3px solid #f78166', color: colors.text, fontSize: 28, display: 'flex', alignItems: 'center', gap: 15, fontFamily: FONT }}>
            <div style={{ backgroundColor: colors.cssPurple, color: 'white', fontSize: 14, fontWeight: 'bold', padding: '4px 6px', borderRadius: 4, fontFamily: FONT }}>CSS</div>
            style.css
          </div>
        </div>
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>
          <div><span style={{ color: colors.selector }}>.box</span>{' '}<span style={{ color: colors.punctuation }}>{'{'}</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>padding</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>9px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>border</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>3px</span><span style={{ color: BORDER_COLOR }}> dashed #ffd166</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>height</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>200px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>width</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>200px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>box-sizing</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>border-box</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div><span style={{ color: colors.punctuation }}>{'}'}</span></div>
        </div>
      </div>

    </AbsoluteFill>
  );
};