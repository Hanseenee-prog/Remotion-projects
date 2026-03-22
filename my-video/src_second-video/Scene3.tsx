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

// ── Dimension Arrow (same as Scene2) ─────────────────────
const DimensionArrow: React.FC<{
  type: 'horizontal' | 'vertical';
  lineScale: number;
  label: string;
  top?: number | string;
  left?: number | string;
  length: number;
  opacity: number;
}> = ({ type, lineScale, label, top, left, length, opacity }) => {
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

// ── Scene 3 ───────────────────────────────────────────────
export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── Phase 1 (frames 0–25): arrows + box fade OUT ──────
  const fadeOut = interpolate(frame, [0, 25], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Box stays at scale 1.5 from Scene2, just fades
  const boxOpacity = fadeOut;
  const arrowOpacity = fadeOut;

  // ── Phase 2 (frames 20–45): code window slides UP to center ─────
  const windowSpring = spring({
    frame: frame - 20,
    fps,
    config: { damping: 12, stiffness: 70 },
  });
  // Starts off-screen below, lands at center (translateY 0 = vertically centered)
  const windowTranslateY = interpolate(windowSpring, [0, 1], [1400, 0]);

  // ── Phase 3: box-sizing: content-box; types in ────────
  // Starts at frame 40, after window is mostly settled
  const codeText = 'box-sizing: content-box;';
  const charsToType = interpolate(frame, [40, 75], [0, codeText.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Token split: "box-sizing" | ": " | "content-box" | ";"
  const typedProp     = 'box-sizing'.substring(0, Math.max(0, Math.round(charsToType)));
  const typedColon    = ': '.substring(0, Math.max(0, Math.round(charsToType) - 10));
  const typedVal      = 'content-box'.substring(0, Math.max(0, Math.round(charsToType) - 12));
  const typedSemi     = ';'.substring(0, Math.max(0, Math.round(charsToType) - 23));
  const isTyping      = charsToType > 0 && charsToType < codeText.length;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* ── BOX (fading out, stays at scene2 scale 1.5) ── */}
      <div style={{
        transform: 'scale(1.5)',
        position: 'relative',
        opacity: boxOpacity,
        // marginTop: '-350px',
      }}>
        <div style={{
          width: BOX_W,
          height: BOX_H,
          backgroundColor: '#38bdf8',
          boxSizing: 'content-box',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }} />

        <DimensionArrow
          type="horizontal"
          lineScale={1}
          label="212px"
          length={BOX_W}
          top={-100}
          left="50%"
          opacity={arrowOpacity}
        />
        <DimensionArrow
          type="vertical"
          lineScale={1}
          label="212px"
          length={BOX_H}
          top="50%"
          left={BOX_W}
          opacity={arrowOpacity}
        />
      </div>

      {/* ── CODE WINDOW (slides up to center) ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        backgroundColor: colors.bg,
        borderRadius: 20,
        transform: `translate(-50%, calc(-50% + ${windowTranslateY}px))`,
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

        {/* Code Area */}
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>

          {/* .box { */}
          <div>
            <span style={{ color: colors.selector }}>.box</span>{' '}
            <span style={{ color: colors.punctuation }}>{'{'}</span>
          </div>

          {/* height: 200px; */}
          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>height</span>
            <span style={{ color: colors.punctuation }}>: </span>
            <span style={{ color: colors.value }}>200px</span>
            <span style={{ color: colors.punctuation }}>;</span>
          </div>

          {/* width: 200px; — already fully written */}
          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>width</span>
            <span style={{ color: colors.punctuation }}>: </span>
            <span style={{ color: colors.value }}>200px</span>
            <span style={{ color: colors.punctuation }}>;</span>
          </div>

          {/* box-sizing: content-box; — types in */}
          <div style={{ paddingLeft: 50, minHeight: 80 }}>
            <span style={{ color: colors.property }}>{typedProp}</span>
            <span style={{ color: colors.punctuation }}>{typedColon}</span>
            <span style={{ color: colors.value }}>{typedVal}</span>
            <span style={{ color: colors.punctuation }}>{typedSemi}</span>
            {isTyping && (
              <span style={{
                display: 'inline-block',
                width: 4,
                height: '0.85em',
                backgroundColor: '#58a6ff',
                marginLeft: 4,
                verticalAlign: 'text-bottom',
              }} />
            )}
          </div>

          {/* } */}
          <div>
            <span style={{ color: colors.punctuation }}>{'}'}</span>
          </div>

        </div>
      </div>

    </AbsoluteFill>
  );
};