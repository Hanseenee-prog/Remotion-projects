import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONT = '"Martian Mono", monospace';
const BOX_W = 400; 
const BOX_H = 400;
const ARROW_COLOR = '#ff5f56';
const LABEL_BG = '#0d1117';

const DimensionArrow: React.FC<{
  type: 'horizontal' | 'vertical';
  lineScale: number;
  label: string;
  top?: number | string;
  left?: number | string;
  length: number;
}> = ({ type, lineScale, label, top, left, length }) => {
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
    }}>

      {/* --- The Line --- */}
      <div style={{
        position: 'relative',
        width:  isH ? '100%' : LINE_THICKNESS,
        height: isH ? LINE_THICKNESS : '100%',
        backgroundColor: ARROW_COLOR,
        transform: `scale${isH ? 'X' : 'Y'}(${lineScale})`,
        transformOrigin: 'center center',
        zIndex: 10
      }}>
        
        {/* --- Start Open Arrow (< or ^) --- */}
        <div style={{
          position: 'absolute',
          [isH ? 'left' : 'top']: 0,
          width: ARROW_HEAD_SIZE,
          height: ARROW_HEAD_SIZE,
          // For horizontal, left/top borders. For vertical, left/top borders (then rotated)
          borderLeft: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          borderTop: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          transform: isH 
            ? `translate(-2px, calc(-50% + ${LINE_THICKNESS/2}px)) rotate(-45deg)` 
            : `translate(calc(-50% + ${LINE_THICKNESS/2}px), -2px) rotate(45deg)`, // Rotated for vertical
        }} />

        {/* --- End Open Arrow (> or v) --- */}
        <div style={{
          position: 'absolute',
          [isH ? 'right' : 'bottom']: 0,
          width: ARROW_HEAD_SIZE,
          height: ARROW_HEAD_SIZE,
          borderRight: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          borderBottom: `${LINE_THICKNESS}px solid ${ARROW_COLOR}`,
          transform: isH 
            ? `translate(2px, calc(-50% + ${LINE_THICKNESS/2}px)) rotate(-45deg)` 
            : `translate(calc(-50% + ${LINE_THICKNESS/2}px), 2px) rotate(45deg)`, // Rotated for vertical
        }} />
      </div>

      {/* --- Label --- */}
      <span style={{
        position: 'absolute',
        left: '50%',
        top: '50%',
        // Rotated -90deg + 180deg offset = 180deg total
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

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const windowExitSpring = spring({ frame, fps, config: { damping: 15 } });
  const windowTranslateY = interpolate(windowExitSpring, [0, 1], [0, 1400]);

  const boxGrowSpring = spring({ frame, fps, config: { damping: 12 } });
  const boxScale = interpolate(boxGrowSpring, [0, 1], [1.2, 1.5]);

  const arrowSpring = spring({ frame: frame - 15, fps, config: { stiffness: 60, damping: 14 } });
  const lineScale = interpolate(arrowSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      
      <div style={{ transform: `scale(${boxScale})`, position: 'relative' }}>
        {/* THE VISUAL BOX */}
        <div style={{
          width: BOX_W,
          height: BOX_H,
          backgroundColor: '#38bdf8',
          boxSizing: 'border-box',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        }} />

        {/* Horizontal Arrow - Spaced at -100px top */}
        <DimensionArrow
          type="horizontal"
          lineScale={lineScale}
          label="212px"
          length={BOX_W}
          top={-100}
          left="50%"
        />

        {/* Vertical Arrow - Moved closer (from 100px to 80px distance) */}
        <DimensionArrow
          type="vertical"
          lineScale={lineScale}
          label="212px"
          length={BOX_H}
          top="50%"
          left={BOX_W}
        />
      </div>

      {/* CODE WINDOW EXITING */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        width: '90%',
        backgroundColor: '#0d1117',
        borderRadius: 20,
        transform: `translateY(${windowTranslateY}px)`,
        overflow: 'hidden',
        border: `1px solid #30363d`,
      }}>
        <div style={{ height: 80, backgroundColor: '#010409', borderBottom: '1px solid #30363d' }} />
        <div style={{ height: 200 }} /> 
      </div>
    </AbsoluteFill>
  );
};