import { Audio, staticFile, AbsoluteFill } from 'remotion';

export const MyComposition = () => {
  return (
    <AbsoluteFill>
      {/* Your visual layers go here */}
      <h1 className="text-blue text-9xl">Hello World</h1>

      {/* The Audio component */}
      <Audio src={staticFile("background-music.mp3")} />
    </AbsoluteFill>
  );
};
