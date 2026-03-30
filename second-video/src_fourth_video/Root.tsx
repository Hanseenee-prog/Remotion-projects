import "./index.css";
import { Composition } from "remotion";
import { Reel, TOTAL_FRAMES } from "./Reel";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="AnimationReel"
      component={Reel}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
