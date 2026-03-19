import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

const FONT = '"Martian Mono", monospace';
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

export const Scene7: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 0–20: Box group fades out ─────────────────────────
  const boxFadeOut = interpolate(frame, [0, 10], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  // ── 0–20: Code window moves to center ────────────────
  // Was at bottom:120, now springs to vertical center
  const windowSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  // translateY: 0 = bottom:120 position, negative = moves up toward center
  // 1920/2 - bottom_offset ≈ 680px upward from bottom:120
  const windowTranslateY = interpolate(windowSpring, [0, 1], [900, 0]);

  // ── Editing: "content-box" → "border-box" ────────────
  // Full value being edited is "content-box"  (11 chars)
  // Phase 1 (frame 28–50): delete "content-box" char by char (backspace)
  // Phase 2 (frame 52–70): type "border-box"

  const deleteText = 'content-box';
  const deleteChars = interpolate(frame, [28, 38], [0, deleteText.length], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  // Remaining text after deletion: starts as "content-box", erases from right
  const remainingValue = deleteText.substring(0, Math.max(0, deleteText.length - Math.round(deleteChars)));

  const typeText = 'border-box';
  const typeChars = interpolate(frame, [40, 50], [0, typeText.length], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const typedValue = typeText.substring(0, Math.round(typeChars));

  // The value shown: during deletion = remainingValue, after = typedValue
  const isDeletingDone = Math.round(deleteChars) >= deleteText.length;
  const displayValue = isDeletingDone ? typedValue : remainingValue;

  // Cursor blinks during both edit phases, gone when typing is done
  const isEditing = frame >= 28 && Math.round(typeChars) < typeText.length;
  // Blink every 8 frames
  const cursorVisible = isEditing && Math.floor(frame / 8) % 2 === 0;

  // Value color always matches other values
  const isDone = Math.round(typeChars) >= typeText.length;
  const valueColor = colors.value;

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' }}>

      {/* ── BOX GROUP fading out (carried from Scene6) ── */}
      <div style={{ opacity: boxFadeOut, position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) translateY(-60px)' }}>
        {/* Simple placeholder representing the box group silhouette */}
        <div style={{
          width: 504,
          height: 504,
          borderRadius: 28,
          backgroundColor: '#c0392b',
          border: '2px solid #ff6b6b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            width: 400,
            height: 400,
            backgroundColor: '#38bdf8',
            borderRadius: 20,
          }} />
        </div>
      </div>

      {/* ── CODE WINDOW — centered ── */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '90%',
        backgroundColor: colors.bg,
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        border: `1px solid ${colors.border}`,
        fontFamily: FONT,
        transform: `translate(-50%, calc(-50% + ${windowTranslateY}px))`,
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

        {/* Code Area */}
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6, fontFamily: FONT }}>

          <div>
            <span style={{ color: colors.selector }}>.box</span>{' '}
            <span style={{ color: colors.punctuation }}>{'{'}</span>
          </div>

          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>padding</span>
            <span style={{ color: colors.punctuation }}>: </span>
            <span style={{ color: colors.value }}>9px</span>
            <span style={{ color: colors.punctuation }}>;</span>
          </div>

          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>border</span>
            <span style={{ color: colors.punctuation }}>: </span>
            <span style={{ color: colors.value }}>3px</span>
            <span style={{ color: BORDER_COLOR }}> dashed</span>
            <span style={{ color: BORDER_COLOR }}> #ffd166</span>
            <span style={{ color: colors.punctuation }}>;</span>
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

          {/* box-sizing line — only the value gets edited */}
          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>box-sizing</span>
            <span style={{ color: colors.punctuation }}>: </span>
            <span style={{ color: valueColor }}>{displayValue}</span>
            {/* Cursor — sits right after the value */}
            {cursorVisible && (
              <span style={{
                display: 'inline-block',
                width: 4,
                height: '0.85em',
                backgroundColor: '#58a6ff',
                marginLeft: 2,
                verticalAlign: 'text-bottom',
              }} />
            )}
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