import { Scene1 } from './Scene1';
import { Scene2 } from './Scene2';
import { Scene3 } from './Scene3';
import { Scene4 } from './Scene4';
import { AbsoluteFill, Audio, staticFile, Series, Img } from 'remotion'; // Added Img
import { Scene5 } from './Scene5';
import { Scene6 } from './Scene6';
import { Scene7 } from './Scene7';
import { Scene8 } from './Scene8';

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}> {/* Changed from green to black for better blending */}
      
      {/* 1. Background Image Layer */}
      <AbsoluteFill style={{ opacity: 0.4 }}>
        <Img 
          src={staticFile("bg-img.jpg")} // Ensure the extension (.jpg/.png) is correct
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }} 
        />
      </AbsoluteFill>

      {/* Global Audio */}
      <Audio src={staticFile("background-music.mp3")} />
      
      {/* 2. Content Layer */}
      <Series>
        <Series.Sequence durationInFrames={80}>
          <Scene1 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={70}>
          <Scene2 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={80}>
          <Scene3 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={90}>
          <Scene4 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={130}>
          <Scene5 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={70}>
          <Scene6 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={50}>
          <Scene7 />
        </Series.Sequence>

        <Series.Sequence durationInFrames={180}>
          <Scene8 />
        </Series.Sequence>
      </Series>
    </AbsoluteFill>
  );
};