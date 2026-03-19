import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONT = '"Martian Mono", monospace';
const BOX_W = 400;
const BOX_H = 400;
const ARROW_COLOR = '#ff5f56';
const LABEL_BG = '#0d1117';

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

// ── Dimension Arrow (same as Scene2/3) ────────────────────
const DimensionArrow: React.FC<{
  type: 'horizontal' | 'vertical';
  lineScale: number;
  label: string;
  top?: number | string;
  left?: number | string;
  length: number;
  opacity?: number;
}> = ({ type, lineScale, label, top, left, length, opacity = 1 }) => {
  const isH = type === 'horizontal';
  const LINE_THICKNESS = 8;
  const ARROW_HEAD_SIZE = 25;

  return (
    <div style={{
      position: 'absolute',
      top, left,
      display: 'flex',
      flexDirection: isH ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'center',
      transform: isH ? 'translateX(-50%)' : 'translateY(-50%)',
      width: isH ? length : 100,
      height: isH ? 100 : length,
      opacity,
    }}>
      <div style={{
        position: 'relative',
        width: isH ? '100%' : LINE_THICKNESS,
        height: isH ? LINE_THICKNESS : '100%',
        backgroundColor: ARROW_COLOR,
        transform: `scale${isH ? 'X' : 'Y'}(${lineScale})`,
        transformOrigin: 'center center',
        zIndex: 10,
      }}>
        <div style={{
          position: 'absolute',
          [isH ? 'left' : 'top']: 0,
          width: ARROW_HEAD_SIZE,
          height: ARROW_HEAD_SIZE,
          borderLeft: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          borderTop: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          transform: isH
            ? `translate(-2px, calc(-50% + ${LINE_THICKNESS / 2}px)) rotate(-45deg)`
            : `translate(calc(-50% + ${LINE_THICKNESS / 2}px), -2px) rotate(45deg)`,
        }} />
        <div style={{
          position: 'absolute',
          [isH ? 'right' : 'bottom']: 0,
          width: ARROW_HEAD_SIZE,
          height: ARROW_HEAD_SIZE,
          borderRight: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          borderBottom: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          transform: isH
            ? `translate(2px, calc(-50% + ${LINE_THICKNESS / 2}px)) rotate(-45deg)`
            : `translate(calc(-50% + ${LINE_THICKNESS / 2}px), 2px) rotate(45deg)`,
        }} />
      </div>
      <span style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: `translate(-50%, -50%) ${isH ? '' : 'rotate(90deg)'}`,
        color: ARROW_COLOR,
        fontFamily: FONT,
        fontSize: 36,
        fontWeight: 'bold',
        backgroundColor: LABEL_BG,
        padding: '8px 18px',
        borderRadius: 8,
        whiteSpace: 'nowrap',
        zIndex: 10,
      }}>
        {label}
      </span>
    </div>
  );
};

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Timeline ──────────────────────────────────────────
  // 0–20:   window exits down, box fades in fast
  // 20–40:  width arrow springs in (horizontal)
  // 50–70:  height arrow springs in (vertical)

  // ── Window slides back DOWN to bottom: 120 ───────────
  // Starts centered (from Scene3), springs back down to rest at bottom
  const windowDownSpring = spring({
    frame,
    fps,
    config: { damping: 18, stiffness: 140 },
  });
  // 0 = centered offset (where Scene3 left it), 1 = back at bottom resting position
  // We just drive translateY from 0 → 0 since bottom:120 is its natural position
  // So we animate it: starts pulled UP (negative Y = higher on screen), returns to 0
  const windowTranslateY = interpolate(windowDownSpring, [0, 1], [-680, 0]);

  // ── Box fades in fast ────────────────────────────────
  const boxFadeIn = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Box scale — matches where Scene3 left it (1.5)
  const boxScale = 1.5;

  // ── Width arrow — springs in at frame 20 ─────────────
  const widthArrowSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 10, stiffness: 180 }, // snappy
  });
  const widthLineScale = interpolate(widthArrowSpring, [0, 1], [0, 1]);
  const widthOpacity   = interpolate(widthArrowSpring, [0, 1], [0, 1]);

  // ── Height arrow — springs in at frame 33 (~13 frames later) ─
  const heightArrowSpring = spring({
    frame: frame - 33,
    fps,
    config: { damping: 10, stiffness: 180 }, // same snappy feel
  });
  const heightLineScale = interpolate(heightArrowSpring, [0, 1], [0, 1]);
  const heightOpacity   = interpolate(heightArrowSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* ── BOX (fades in, centered higher up) ── */}
      <div style={{
        transform: `scale(${boxScale})`,
        position: 'relative',
        opacity: boxFadeIn,
        marginTop: '-750px',
      }}>
        <div style={{
          width: BOX_W,
          height: BOX_H,
          backgroundColor: '#38bdf8',
          boxSizing: 'content-box',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }} />

        {/* Width arrow — horizontal, above the box */}
        <DimensionArrow
          type="horizontal"
          lineScale={widthLineScale}
          label="200px"
          length={BOX_W}
          top={-100}
          left="50%"
          opacity={widthOpacity}
        />

        {/* Height arrow — vertical, right of the box */}
        <DimensionArrow
          type="vertical"
          lineScale={heightLineScale}
          label="200px"
          length={BOX_H}
          top="50%"
          left={BOX_W}
          opacity={heightOpacity}
        />
      </div>

      {/* ── CODE WINDOW (slides back down to bottom: 120) ── */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        width: '90%',
        backgroundColor: colors.bg,
        borderRadius: 20,
        transform: `translateY(${windowTranslateY}px)`,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        border: `1px solid ${colors.border}`,
        fontFamily: FONT,
      }}>
        {/* Tab Header */}
        <div style={{
          display: 'flex',
          backgroundColor: '#010409',
          borderBottom: `1px solid ${colors.border}`,
          alignItems: 'center',
          height: 80,
          paddingLeft: 25,
        }}>
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            {(['#ff5f56', '#ffbd2e', '#27c93f'] as string[]).map(c => (
              <div key={c} style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: c }} />
            ))}
          </div>
          <div style={{
            backgroundColor: colors.bg,
            height: '100%',
            padding: '0 35px',
            borderRight: `1px solid ${colors.border}`,
            borderTop: '3px solid #f78166',
            color: colors.text,
            fontSize: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 15,
            fontFamily: FONT,
          }}>
            <div style={{
              backgroundColor: colors.cssPurple,
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
              padding: '4px 6px',
              borderRadius: 4,
              fontFamily: FONT,
            }}>CSS</div>
            style.css
          </div>
        </div>

        {/* Code body — fully written snippet from Scene3 */}
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>
          <div>
            <span style={{ color: colors.selector }}>.box</span>{' '}
            <span style={{ color: colors.punctuation }}>{'{'}</span>
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

    </AbsoluteFill>
  );
};