import "./index.css";
import { Composition } from "remotion";
import { Reel } from "./Reel";

const TOTAL_DURATION = 47 * 60; // 30 seconds at 30 fps

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="EventDelegationReel"
        component={Reel}
        durationInFrames={TOTAL_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
    </>
  );
};
