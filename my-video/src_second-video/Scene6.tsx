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

const paddingBoxW = BOX_W + VISUAL_PADDING * 2;
const paddingBoxH = BOX_H + VISUAL_PADDING * 2;

// ── Dimension Arrow ───────────────────────────────────────
const DimensionArrow: React.FC<{
  type: 'horizontal' | 'vertical';
  label: string;
  top?: number | string;
  left?: number | string;
  length: number;
  springVal: number; // 0→1
}> = ({ type, label, top, left, length, springVal }) => {
  const isH = type === 'horizontal';
  const T = 8; const A = 25;

  const lineScale = interpolate(springVal, [0, 1], [0, 1]);
  const opacity   = interpolate(springVal, [0, 0.1, 1], [0, 1, 1]);

  return (
    <div style={{
      position: 'absolute', top, left,
      display: 'flex', flexDirection: isH ? 'column' : 'row',
      alignItems: 'center', justifyContent: 'center',
      transform: isH ? 'translateX(-50%)' : 'translateY(-50%)',
      width: isH ? length : 100,
      height: isH ? 100 : length,
      opacity,
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'relative',
        width: isH ? '100%' : T,
        height: isH ? T : '100%',
        backgroundColor: ARROW_COLOR,
        transform: `scale${isH ? 'X' : 'Y'}(${lineScale})`,
        transformOrigin: 'center center',
        zIndex: 10,
      }}>
        <div style={{ position: 'absolute', [isH ? 'left' : 'top']: 0, width: A, height: A, borderLeft: `${T}px solid ${ARROW_COLOR}`, borderTop: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(-2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), -2px) rotate(45deg)` }} />
        <div style={{ position: 'absolute', [isH ? 'right' : 'bottom']: 0, width: A, height: A, borderRight: `${T}px solid ${ARROW_COLOR}`, borderBottom: `${T}px solid ${ARROW_COLOR}`, transform: isH ? `translate(2px, calc(-50% + ${T/2}px)) rotate(-45deg)` : `translate(calc(-50% + ${T/2}px), 2px) rotate(45deg)` }} />
      </div>
      {/* Label — no animation, always fully visible once opacity kicks in */}
      <span style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: `translate(-50%, -50%) ${isH ? '' : 'rotate(90deg)'}`,
        color: ARROW_COLOR, fontFamily: FONT, fontSize: 36, fontWeight: 'bold',
        backgroundColor: LABEL_BG, padding: '8px 18px', borderRadius: 8,
        whiteSpace: 'nowrap', zIndex: 10,
      }}>
        {label}
      </span>
    </div>
  );
};

// ── Marching dashed border (always marching, no draw-on needed — already drawn) ─
const MarchingBorder: React.FC<{
  width: number;
  height: number;
  frame: number;
  borderRadius?: number;
}> = ({ width, height, frame, borderRadius = 28 }) => {
  const strokeW = 8;
  const outset = 10;
  const svgW = width + outset * 2;
  const svgH = height + outset * 2;
  const dash = 28; const gap = 14;
  // Always marching from frame 0
  const offset = -frame * 2.2;

  return (
    <svg style={{ position: 'absolute', top: -outset, left: -outset, pointerEvents: 'none', overflow: 'visible' }} width={svgW} height={svgH}>
      <rect
        x={strokeW / 2} y={strokeW / 2}
        width={svgW - strokeW} height={svgH - strokeW}
        rx={borderRadius + outset} ry={borderRadius + outset}
        fill="none" stroke={BORDER_COLOR}
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${gap}`}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

export const Scene6: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 0–20: Code window fades out and slides down ───────
  const windowFade = interpolate(frame, [0, 18], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const windowSlideDown = interpolate(frame, [0, 20], [0, 300], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── 0–22: Box group moves to center + scales down slightly ─
  const boxCenterSpring = spring({ frame, fps, config: { damping: 14, stiffness: 90 } });
  // marginTop was -750px (upper area), now moves to 0 (true center)
  const boxMarginTop = interpolate(boxCenterSpring, [0, 1], [-750, -60]);
  // Scale: was 1.42, shrink to 1.1 to leave room for arrows
  const boxScale = interpolate(boxCenterSpring, [0, 1], [1.42, 1.1]);
  // Opacity: reduce to 0.78 so arrows pop against it
  const boxOpacity = interpolate(boxCenterSpring, [0, 1], [1, 0.78]);

  // ── Width arrow springs in at frame 22 ───────────────
  const widthSpring = spring({ frame: frame - 22, fps, config: { damping: 10, stiffness: 200 } });

  // ── Height arrow springs in at frame 35 (~13 frames later) ─
  const heightSpring = spring({ frame: frame - 35, fps, config: { damping: 10, stiffness: 200 } });

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* ── BOX GROUP — centered, scaled down, reduced opacity ── */}
      <div style={{
        position: 'relative',
        marginTop: boxMarginTop,
        transform: `scale(${boxScale})`,
        opacity: boxOpacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: paddingBoxW,
        height: paddingBoxH,
      }}>

        {/* Padding box */}
        <div style={{
          position: 'absolute',
          width: paddingBoxW,
          height: paddingBoxH,
          borderRadius: 28,
          backgroundColor: PADDING_COLOR,
          border: `2px solid ${PADDING_BORDER_COLOR}`,
          boxSizing: 'border-box',
        }}>
          {/* Always-marching dashed border outside the padding box */}
          <MarchingBorder
            width={paddingBoxW}
            height={paddingBoxH}
            frame={frame}
            borderRadius={28}
          />
        </div>

        {/* Inner box */}
        <div style={{
          position: 'relative',
          width: BOX_W,
          height: BOX_H,
          backgroundColor: '#38bdf8',
          borderRadius: 20,
          zIndex: 2,
        }} />

        {/* ── Width arrow — horizontal, above the group ── */}
        <DimensionArrow
          type="horizontal"
          label="212px"
          length={paddingBoxW + 40}
          top={-110}
          left="50%"
          springVal={widthSpring}
        />

        {/* ── Height arrow — vertical, right of the group ── */}
        <DimensionArrow
          type="vertical"
          label="212px"
          length={paddingBoxH + 40}
          top="50%"
          left={paddingBoxW + 20}
          springVal={heightSpring}
        />
      </div>

      {/* ── CODE WINDOW — fades + slides down ── */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        width: '90%',
        backgroundColor: colors.bg,
        borderRadius: 20,
        overflow: 'hidden',
        border: `1px solid ${colors.border}`,
        fontFamily: FONT,
        opacity: windowFade,
        transform: `translateY(${windowSlideDown}px)`,
        // pointer events off so it doesn't block interaction during fade
        pointerEvents: 'none',
      }}>
        {/* Tab Header */}
        <div style={{ display: 'flex', backgroundColor: '#010409', borderBottom: `1px solid ${colors.border}`, alignItems: 'center', height: 80, paddingLeft: 25 }}>
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
        {/* Code body */}
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>
          <div><span style={{ color: colors.selector }}>.box</span>{' '}<span style={{ color: colors.punctuation }}>{'{'}</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>padding</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>9px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>border</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>3px</span><span style={{ color: BORDER_COLOR }}> dashed</span><span style={{ color: BORDER_COLOR }}> #ffd166</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>height</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>200px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>width</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>200px</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div style={{ paddingLeft: 50 }}><span style={{ color: colors.property }}>box-sizing</span><span style={{ color: colors.punctuation }}>: </span><span style={{ color: colors.value }}>content-box</span><span style={{ color: colors.punctuation }}>;</span></div>
          <div><span style={{ color: colors.punctuation }}>{'}'}</span></div>
        </div>
      </div>

    </AbsoluteFill>
  );
};