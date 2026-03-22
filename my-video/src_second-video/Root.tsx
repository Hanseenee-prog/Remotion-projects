import "./index.css";
import { Composition } from "remotion";
import { Main } from './Main'; // We will create this next

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="MainReel"
      component={Main}
      durationInFrames={950}   // 2s @ 30fps
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
