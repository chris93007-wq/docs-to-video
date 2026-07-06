import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {SmallLabel, textForShot, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const MetaphorVisual = ({shot}: ProductionShotProps) => {
  const {frame, fps} = useShotMotion();
  const pulse = interpolate(frame % Math.round(fps * 1.2), [0, fps * 0.6, fps * 1.2], [0.75, 1, 0.75], clamp);
  return (
    <AbsoluteFill style={{padding: "120px 160px"}}>
      <SmallLabel>Command center</SmallLabel>
      <div style={{position: "absolute", left: 710, top: 285, width: 500, height: 260, borderRadius: 28, background: "white", boxShadow: theme.shadow.soft, display: "grid", placeItems: "center", border: `4px solid ${theme.colors.accent}`}}>
        <div style={{...theme.typography.h2, maxWidth: 390, textAlign: "center"}}>{textForShot(shot)}</div>
      </div>
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (Math.PI * 2 * index) / 6;
        const x = 960 + Math.cos(angle) * 520;
        const y = 415 + Math.sin(angle) * 255;
        return (
          <div key={index} style={{position: "absolute", left: x - 76, top: y - 38, width: 152, height: 76, borderRadius: 16, background: `rgba(77,141,255,${0.1 + pulse * 0.12})`, border: "1px solid rgba(77,141,255,0.38)"}} />
        );
      })}
    </AbsoluteFill>
  );
};
