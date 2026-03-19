import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Box Zoom IN & Expand Animation
  const boxSpring = spring({ frame, fps, config: { damping: 14 } });
  
  // Scaled up 1.2x as requested (previous max was 1, now 1.2)
  const boxScale = interpolate(boxSpring, [0, 1], [0.2, 1.2]); 
  
  const targetVisualWidth = 400; 
  const boxWidth = interpolate(boxSpring, [0, 1], [100, targetVisualWidth]);

  // 2. Code Window Slide Up
  const windowSpring = spring({ frame: frame - 10, fps, config: { damping: 12 } });
  const windowTranslateY = interpolate(windowSpring, [0, 1], [800, 0]);

  // 3. Typing Effect Logic
  const codeText = "width: 200px;";
  const charsToType = interpolate(frame - 15, [0, 20], [0, codeText.length], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  
  const typedWidth = "width".substring(0, Math.max(0, charsToType));
  const typedColon = ": ".substring(0, Math.max(0, charsToType - 5));
  const typedValue = "200px".substring(0, Math.max(0, charsToType - 7));
  const typedSemi = ";".substring(0, Math.max(0, charsToType - 12));

  const colors = {
    bg: '#0d1117',
    border: '#30363d',
    text: '#c9d1d9',
    selector: '#d2a8ff', 
    property: '#79c0ff', 
    value: '#a5d6ff',    
    punctuation: '#c9d1d9',
    cssPurple: '#663399' // Standard CSS/Rebeccapurple
  };

  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center' }}>
      {/* Background Music */}
      {/* <Audio src={staticFile("background-music.mp3")} /> */}
      
      {/* --- THE VISUAL BOX --- */}
      <div style={{ transform: `scale(${boxScale})`, marginTop: '-350px' }}>
        <div style={{
          width: boxWidth,
          height: 400,
          backgroundColor: '#38bdf8',
          boxSizing: 'content-box',
          borderRadius: 20,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }} />
      </div>

      {/* --- THE CODE WINDOW --- */}
      <div style={{
        position: 'absolute',
        bottom: 120,
        width: '90%', // Slightly wider for impact
        backgroundColor: colors.bg,
        borderRadius: 20,
        transform: `translateY(${windowTranslateY}px)`,
        overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        border: `1px solid ${colors.border}`,
        fontFamily: '"Martian Mono", monospace',
      }}>
        {/* Expanded Tab Header */}
        <div style={{ 
          display: 'flex', 
          backgroundColor: '#010409', 
          borderBottom: `1px solid ${colors.border}`,
          alignItems: 'center',
          height: 80, // Increased height
          paddingLeft: 25
        }}>
          {/* Window Buttons */}
          <div style={{ display: 'flex', gap: 10, marginRight: 30 }}>
            <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#ff5f56' }} />
            <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#ffbd2e' }} />
            <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: '#27c93f' }} />
          </div>

          {/* Active Tab */}
          <div style={{
            backgroundColor: colors.bg,
            height: '100%',
            padding: '0 35px',
            borderRight: `1px solid ${colors.border}`,
            borderTop: '3px solid #f78166',
            color: colors.text,
            fontSize: 28, // Increased font size
            display: 'flex',
            alignItems: 'center',
            gap: 15
          }}>
            {/* CSS Icon */}
            <div style={{
              backgroundColor: colors.cssPurple,
              color: 'white',
              fontSize: 14,
              fontWeight: 'bold',
              padding: '4px 6px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              CSS
            </div>
            style.css
          </div>
        </div>

        {/* Code Area */}
        <div style={{ padding: '50px 60px', fontSize: 48, lineHeight: 1.6 }}>
          <div>
            <span style={{ color: colors.selector }}>.box</span>{' '}
            <span style={{ color: colors.punctuation }}>{'{'}</span>
          </div>
          
          <div style={{ paddingLeft: 50 }}>
            <span style={{ color: colors.property }}>height</span>
            <span style={{ color: colors.punctuation }}>:</span>{' '}
            <span style={{ color: colors.value }}>200px</span>
            <span style={{ color: colors.punctuation }}>;</span>
          </div>
          
          <div style={{ paddingLeft: 50, height: 80 }}>
            <span style={{ color: colors.property }}>{typedWidth}</span>
            <span style={{ color: colors.punctuation }}>{typedColon}</span>
            <span style={{ color: colors.value }}>{typedValue}</span>
            <span style={{ color: colors.punctuation }}>{typedSemi}</span>
            {charsToType < codeText.length && (
              <span style={{ borderRight: '5px solid #58a6ff', marginLeft: 4 }} />
            )}
          </div>
          
          <div><span style={{ color: colors.punctuation }}>{'}'}</span></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};