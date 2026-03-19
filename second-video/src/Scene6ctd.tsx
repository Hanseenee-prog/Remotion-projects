import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ─── Constants ────────────────────────────────────────────────────────────────
const VIDEO_W = 1080;
const VIDEO_H = 1920;

const EMOJI_SRC = staticFile("thinking-emoji.png");
const CLOUD_SRC = staticFile("thought-cloud.png");

const EMOJI_SIZE   = 340;
const CLOUD_W      = 620;
const CLOUD_H      = 460;

const EMOJI_REST_X = 250;
const EMOJI_REST_Y = VIDEO_H / 2 - EMOJI_SIZE / 2 + 40;

const CLOUD_REST_X = VIDEO_W - CLOUD_W - 50;
const CLOUD_REST_Y = VIDEO_H / 2 - CLOUD_H / 2 - 180;

export const Scene6ctd: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // ── 1. Emoji slides in first — starts at frame 0 ─────────────────────────
  const emojiSpring = spring({
    fps,
    frame,                         // starts immediately
    config: { damping: 15, stiffness: 160, mass: 0.85 },
    durationInFrames: 18,
  });
  const emojiX  = interpolate(emojiSpring, [0, 1], [-(EMOJI_SIZE + 100), EMOJI_REST_X]);
  const emojiOp = interpolate(frame, [0, 5], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 2. Cloud slides in after emoji lands — starts at frame 12 ────────────
  const cloudSpring = spring({
    fps,
    frame: frame - 12,             // delayed by 12 frames
    config: { damping: 15, stiffness: 160, mass: 0.85 },
    durationInFrames: 18,
  });
  const cloudX  = interpolate(cloudSpring, [0, 1], [VIDEO_W + 200, CLOUD_REST_X]);
  const cloudOp = interpolate(frame, [12, 17], [0, 1], {
    extrapolateLeft: "clamp", extrapolateRight: "clamp",
  });

  // ── 3. Question mark pops in at frame 22 — after cloud lands ─────────────
  const qSpring = spring({
    fps,
    frame: frame - 22,
    config: { damping: 8, stiffness: 320, mass: 0.45 },
    durationInFrames: 10,
  });
  const qOpacity = frame >= 22 ? Math.min(1, qSpring * 2.5) : 0;
  const qScale   = frame >= 22 ? Math.max(0, qSpring)        : 0;

  // ── 4. Emoji float after frame 18 ────────────────────────────────────────
  const floatEl  = Math.max(0, frame - 18);
  const floatY   = Math.sin(floatEl * 0.18) * 14;
  const floatRot = Math.sin(floatEl * 0.13) * 3;

  return (
    <AbsoluteFill>

      {/* ── Thought cloud (slides in at frame 12) ────────────────────────── */}
      <div style={{
        position: "absolute",
        left:     cloudX,
        top:      CLOUD_REST_Y,
        width:    CLOUD_W,
        height:   CLOUD_H,
        opacity:  cloudOp,
        zIndex:   5,
      }}>
        <Img
          src={CLOUD_SRC}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />

        {/* Question mark */}
        <div style={{
          position:        "absolute",
          top:             "42.5%",
          left:            "52%",
          transform:       `translate(-50%, -50%) scale(${qScale})`,
          transformOrigin: "center center",
          opacity:         qOpacity,
          fontFamily:      "'JetBrains Mono', monospace",
          fontSize:        180,
          fontWeight:      900,
          color:           "#1A1A2E",
          lineHeight:      1,
          userSelect:      "none",
          zIndex:          6,
        }}>
          ?
        </div>
      </div>

      {/* ── Thinking emoji (slides in at frame 0, then floats) ───────────── */}
      <div style={{
        position:        "absolute",
        left:            emojiX,
        top:             EMOJI_REST_Y + floatY,
        width:           EMOJI_SIZE,
        height:          EMOJI_SIZE,
        opacity:         emojiOp,
        transform:       `rotate(${floatRot}deg)`,
        transformOrigin: "center bottom",
        zIndex:          10,
        filter:          "drop-shadow(0px 20px 36px rgba(0,0,0,0.45))",
      }}>
        <Img
          src={EMOJI_SRC}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>

    </AbsoluteFill>
  );
};