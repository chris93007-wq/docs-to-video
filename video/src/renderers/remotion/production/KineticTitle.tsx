import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {textForShot, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const KineticTitle = ({shot}: ProductionShotProps) => {
  const {progress, enter} = useShotMotion();
  const exit = interpolate(progress, [0.72, 1], [0, -70], clamp);
  return (
    <AbsoluteFill style={{display: "grid", placeItems: "center", textAlign: "center"}}>
      <div style={{...theme.typography.h1, maxWidth: 980, transform: `translateY(${(1 - enter) * 52 + exit}px)`, opacity: interpolate(progress, [0, 0.12, 0.88, 1], [0, 1, 1, 0], clamp)}}>
        {textForShot(shot)}
      </div>
    </AbsoluteFill>
  );
};
