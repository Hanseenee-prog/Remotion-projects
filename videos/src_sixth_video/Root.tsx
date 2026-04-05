import { Composition } from "remotion";
import { Reel, TOTAL_FRAMES } from "./Reel";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="ThrottleReel"
    component={Reel}
    durationInFrames={TOTAL_FRAMES}
    fps={30}
    width={1080}
    height={1920}
  />
);
