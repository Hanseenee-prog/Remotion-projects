// Scene 8 — "Follow to discover more hidden tips like this."
// 75 frames (2.5s) @ 30fps
//
// ProfileCard lifted verbatim from Scene 7 (uploaded) — story ring, avatar,
// name, handle, Follow button with interpolateColors + ripple + cursor click.
// Glow reduced: card boxShadow blue glow 0.35→0.18 opacity cap.
//
// Timeline:
//   0–20  : Card springs in (scale 0.7→1, opacity 0→1)
//   10–24 : Cursor flies to Follow button
//   24    : Click — button turns grey, ripple, cursor scale squish
//   24–30 : Cursor fades out after click
//   24–75 : Hold on "Following ✓" state

import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  interpolateColors,
  spring,
  staticFile,
  Img,
} from "remotion";
import { COLORS, FONTS } from "./tokens";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function clamp(v: number, lo = 0, hi = 1) {
  return Math.min(hi, Math.max(lo, v));
}

// ─── ProfileCard — verbatim from uploaded Scene7, glow reduced ────────────────

const CARD_W      = 680;
const CARD_H      = 730;
const AVATAR_R    = 110;

const ProfileCard: React.FC<{
  cardScale: number;
  cardOpacity: number;
  isClicked: boolean;
  colorSpring: number;
  cursorX: number;
  cursorY: number;
  cursorClickScale: number;
  rippleScale: number;
  rippleOpacity: number;
  showCursor: boolean;
}> = ({
  cardScale, cardOpacity, isClicked, colorSpring,
  cursorX, cursorY, cursorClickScale, rippleScale, rippleOpacity, showCursor,
}) => {
  const btnBg    = interpolateColors(colorSpring, [0, 1], ["#0095F6", "#2A2A2A"]);
  const btnTextC = interpolateColors(colorSpring, [0, 1], ["#FFFFFF", "#AAAAAA"]);
  const btnText  = isClicked ? "Following ✓" : "Follow";
  // Glow reduced: was 0.35, now 0.18
  const glowOp   = interpolate(colorSpring, [0, 1], [0, 0.18]);

  return (
    <div style={{
      width: CARD_W,
      height: CARD_H,
      opacity: cardOpacity,
      transform: `scale(${cardScale})`,
      transformOrigin: "center center",
      zIndex: 50,
    }}>
      <div style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "#121212",
        borderRadius: 40,
        border: "1.5px solid rgba(255,255,255,0.08)",
        // Reduced glow: glowOp capped at 0.18 instead of 0.35
        boxShadow: `0 40px 120px rgba(0,0,0,0.95), 0 0 60px rgba(0,149,246,${glowOp})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 60,
        overflow: "hidden",
      }}>

        {/* Story ring + avatar */}
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div style={{
            width: (AVATAR_R + 14) * 2,
            height: (AVATAR_R + 14) * 2,
            borderRadius: "50%",
            background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            padding: 5,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: (AVATAR_R + 7) * 2,
              height: (AVATAR_R + 7) * 2,
              borderRadius: "50%",
              background: "#121212",
              padding: 5,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: AVATAR_R * 2,
                height: AVATAR_R * 2,
                borderRadius: "50%",
                overflow: "hidden",
                background: "#333",
              }}>
                <Img
                  src={staticFile("profile-img.jpg")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 38%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Name */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 46, fontWeight: 800,
          color: "#FFFFFF", letterSpacing: "0.01em", marginBottom: 10,
        }}>
          Hanson Emmanuel
        </div>

        {/* Handle */}
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 34, fontWeight: 500,
          color: "rgba(255,255,255,0.55)",
          marginBottom: 80,
          letterSpacing: "0.02em",
        }}>
          @hee_codes
        </div>

        {/* Follow button */}
        <div style={{ position: "relative" }}>
          <div style={{
            backgroundColor: btnBg,
            color: btnTextC,
            width: 400, height: 110,
            borderRadius: 20,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
            boxShadow: isClicked
              ? "0 4px 20px rgba(0,0,0,0.5)"
              : "0 12px 40px rgba(0,149,246,0.5)",
            position: "relative", overflow: "hidden",
            border: isClicked ? "2px solid rgba(255,255,255,0.08)" : "none",
          }}>
            {isClicked && (
              <div style={{
                position: "absolute",
                width: 120, height: 120,
                backgroundColor: "rgba(255,255,255,0.7)",
                borderRadius: "50%",
                transform: `scale(${rippleScale})`,
                opacity: rippleOpacity,
                pointerEvents: "none",
                zIndex: 0,
              }} />
            )}
            <span style={{ zIndex: 1 }}>{btnText}</span>
          </div>

          {/* Cursor */}
          {showCursor && (
            <div style={{
              position: "absolute",
              left: "50%", top: "50%",
              transform: `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
              zIndex: 20,
              fontSize: 90, lineHeight: 1,
              filter: "drop-shadow(0px 12px 12px rgba(0,0,0,0.5))",
              rotate: "-10deg",
            }}>
              👆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Scene ────────────────────────────────────────────────────────────────────

export const Scene8: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const CURSOR_IN = 10;
  const CLICK_AT  = 24;

  // ── Card springs in (frame 0–20) ─────────────────────────────────────────
  const cardInSpring = spring({
    fps, frame,
    config: { damping: 14, stiffness: 130, mass: 0.9 },
    durationInFrames: 20,
  });
  const cardScale   = interpolate(clamp(cardInSpring), [0, 1], [0.7, 1]);
  const cardOpacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── Cursor flies to Follow button (frames 10–24) ──────────────────────────
  const cursorMoveSpring = spring({
    fps, frame: frame - CURSOR_IN,
    config: { damping: 14, stiffness: 100 },
  });
  // Same relative offset pattern as uploaded Scene7 exactly
  const cursorX = interpolate(clamp(cursorMoveSpring), [0, 1], [380, 0]);
  const cursorY = interpolate(clamp(cursorMoveSpring), [0, 1], [600, 40]);

  // ── Click (frame 24) ──────────────────────────────────────────────────────
  const isClicked = frame >= CLICK_AT;

  const colorSpringRaw = spring({
    fps, frame: frame - CLICK_AT,
    config: { damping: 20, stiffness: 120 },
  });
  const colorSpring = clamp(isClicked ? colorSpringRaw : 0);

  const cursorPressSpring = spring({
    fps, frame: frame - CLICK_AT,
    config: { damping: 12, stiffness: 300, mass: 0.5 },
  });
  const cursorClickScale = interpolate(
    cursorPressSpring, [0, 0.5, 1], [1, 0.75, 1],
    { extrapolateRight: "clamp" }
  );

  const rippleSpring  = spring({ fps, frame: frame - CLICK_AT, config: { damping: 20, stiffness: 60 } });
  const rippleScale   = clamp(rippleSpring) * 5;
  const rippleOpacity = interpolate(clamp(rippleSpring), [0, 1], [0.6, 0]);

  // Cursor visible during move, fades out after click (frame 24–32)
  const cursorFadeAfterClick = interpolate(frame, [CLICK_AT, CLICK_AT + 8], [1, 0], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });
  const showCursor = frame >= CURSOR_IN && cursorFadeAfterClick > 0;

  return (
    <AbsoluteFill style={{
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <ProfileCard
        cardScale={cardScale}
        cardOpacity={cardOpacity}
        isClicked={isClicked}
        colorSpring={colorSpring}
        cursorX={cursorX}
        cursorY={cursorY}
        cursorClickScale={cursorClickScale}
        rippleScale={rippleScale}
        rippleOpacity={rippleOpacity}
        showCursor={showCursor}
      />
    </AbsoluteFill>
  );
};