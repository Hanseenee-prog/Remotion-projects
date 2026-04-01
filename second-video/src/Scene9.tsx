// Scene 8 — "Throttle Teaser & Follow"
// 120 Frames (4s) @ 30fps
//
// Sequence:
//   0–35  : "Want to learn about Throttle next?" text enters and stays.
//   35–50 : Text fades/slides up as Profile Card springs in.
//   50–70 : Card springs in (scale 0.7→1, opacity 0→1).
//   60–74 : Cursor flies to Follow button.
//   74    : Click — button turns grey, ripple, cursor scale squish.
//   74–82 : Cursor fades out after click.
//   74–120: Hold on "Following ✓" state.

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
const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

// ─── ProfileCard — verbatim logic from your request ──────────────────────────
const CARD_W = 680;
const CARD_H = 730;
const AVATAR_R = 110;

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
  const btnBg = interpolateColors(colorSpring, [0, 1], ["#0095F6", "#2A2A2A"]);
  const btnTextC = interpolateColors(colorSpring, [0, 1], ["#FFFFFF", "#AAAAAA"]);
  const btnText = isClicked ? "Following ✓" : "Follow";
  const glowOp = interpolate(colorSpring, [0, 1], [0, 0.18]);

  return (
    <div style={{
      width: CARD_W, height: CARD_H,
      opacity: cardOpacity,
      transform: `scale(${cardScale})`,
      transformOrigin: "center center",
      zIndex: 50,
    }}>
      <div style={{
        position: "relative", width: "100%", height: "100%",
        background: "#121212", borderRadius: 40,
        border: "1.5px solid rgba(255,255,255,0.08)",
        boxShadow: `0 40px 120px rgba(0,0,0,0.95), 0 0 60px rgba(0,149,246,${glowOp})`,
        display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 60, overflow: "hidden",
      }}>
        <div style={{ position: "relative", marginBottom: 28 }}>
          <div style={{
            width: (AVATAR_R + 14) * 2, height: (AVATAR_R + 14) * 2, borderRadius: "50%",
            background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
            padding: 5, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: (AVATAR_R + 7) * 2, height: (AVATAR_R + 7) * 2, borderRadius: "50%",
              background: "#121212", padding: 5, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <div style={{
                width: AVATAR_R * 2, height: AVATAR_R * 2, borderRadius: "50%",
                overflow: "hidden", background: "#333",
              }}>
                <Img
                  src={staticFile("profile-img.jpg")}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 38%" }}
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ fontFamily: FONTS.mono, fontSize: 46, fontWeight: 800, color: "#FFFFFF", marginBottom: 10 }}>
          Hanson Emmanuel
        </div>
        <div style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 80 }}>
          @hee_codes
        </div>

        <div style={{ position: "relative" }}>
          <div style={{
            backgroundColor: btnBg, color: btnTextC, width: 400, height: 110,
            borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 40, fontWeight: 700, fontFamily: FONTS.mono,
            boxShadow: isClicked ? "0 4px 20px rgba(0,0,0,0.5)" : "0 12px 40px rgba(0,149,246,0.5)",
            position: "relative", overflow: "hidden",
            border: isClicked ? "2px solid rgba(255,255,255,0.08)" : "none",
          }}>
            {isClicked && (
              <div style={{
                position: "absolute", width: 120, height: 120, background: "rgba(255,255,255,0.7)",
                borderRadius: "50%", transform: `scale(${rippleScale})`, opacity: rippleOpacity,
              }} />
            )}
            <span style={{ zIndex: 1 }}>{btnText}</span>
          </div>

          {showCursor && (
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `translate(${cursorX}px, ${cursorY}px) scale(${cursorClickScale})`,
              zIndex: 20, fontSize: 90, filter: "drop-shadow(0px 12px 12px rgba(0,0,0,0.5))", rotate: "-10deg",
            }}>
              👆
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Scene Component ──────────────────────────────────────────────────────────

export const Scene9: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Timing constants
  const TEASER_OUT = 35;
  const CARD_START = 45;
  const CURSOR_IN  = 60;
  const CLICK_AT   = 74;

  // ── Teaser Animation ──────────────────────────────────────────────────────
  const teaserSpring = spring({ frame, fps, config: { stiffness: 100 } });
  const teaserOpacity = interpolate(frame, [0, 10, TEASER_OUT, TEASER_OUT + 10], [0, 1, 1, 0]);
  const teaserBlur = interpolate(teaserSpring, [0, 1], [20, 0]);
  const teaserY = interpolate(teaserSpring, [0, 1], [20, 0]) + interpolate(frame, [TEASER_OUT, TEASER_OUT + 10], [0, -40]);

  // ── Card Animation (Starts after teaser) ──────────────────────────────────
  const cardInSpring = spring({
    fps, frame: frame - CARD_START,
    config: { damping: 14, stiffness: 130, mass: 0.9 },
  });
  const cardScale = interpolate(clamp(cardInSpring), [0, 1], [0.7, 1]);
  const cardOpacity = interpolate(frame, [CARD_START, CARD_START + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // ── Cursor Movement ──────────────────────────────────────────────────────
  const cursorMoveSpring = spring({
    fps, frame: frame - CURSOR_IN,
    config: { damping: 14, stiffness: 100 },
  });
  const cursorX = interpolate(clamp(cursorMoveSpring), [0, 1], [380, 0]);
  const cursorY = interpolate(clamp(cursorMoveSpring), [0, 1], [600, 40]);

  // ── Click Logic ──────────────────────────────────────────────────────────
  const isClicked = frame >= CLICK_AT;
  const colorSpring = clamp(isClicked ? spring({ fps, frame: frame - CLICK_AT, config: { damping: 20, stiffness: 120 } }) : 0);
  const cursorPress = spring({ fps, frame: frame - CLICK_AT, config: { damping: 12, stiffness: 300, mass: 0.5 } });
  const cursorClickScale = interpolate(cursorPress, [0, 0.5, 1], [1, 0.75, 1], { extrapolateRight: "clamp" });
  const rippleSpring = spring({ fps, frame: frame - CLICK_AT, config: { damping: 20, stiffness: 60 } });
  const rippleScale = clamp(rippleSpring) * 5;
  const rippleOpacity = interpolate(clamp(rippleSpring), [0, 1], [0.6, 0]);
  const cursorFade = interpolate(frame, [CLICK_AT, CLICK_AT + 8], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const showCursor = frame >= CURSOR_IN && cursorFade > 0;

  return (
    <AbsoluteFill style={{ background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
      
      {/* Teaser Text */}
      <div style={{
        position: "absolute",
        textAlign: "center",
        opacity: teaserOpacity,
        filter: `blur(${teaserBlur}px)`,
        transform: `translateY(${teaserY}px)`,
        zIndex: 10,
      }}>
        <div style={{ fontFamily: FONTS.mono, fontSize: 32, color: COLORS.accentC, fontWeight: 700, letterSpacing: 2, marginBottom: 10 }}>
          UP NEXT
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 64, color: "white", fontWeight: 900, maxWidth: 800 }}>
          Want to learn about <span style={{ color: COLORS.accentB }}>Throttle</span> next?
        </div>
      </div>

      {/* Profile Card */}
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