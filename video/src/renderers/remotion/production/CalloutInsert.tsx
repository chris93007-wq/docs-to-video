import {AbsoluteFill} from "remotion";
import {theme} from "../../../styles/theme";
import {panelStyle, textForShot, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const CalloutInsert = ({shot}: ProductionShotProps) => {
  const {enter} = useShotMotion();
  return (
    <AbsoluteFill style={{display: "grid", placeItems: "center"}}>
      <div style={{...panelStyle, width: 780, padding: 54, transform: `scale(${0.86 + enter * 0.14})`, textAlign: "center"}}>
        <div style={{...theme.typography.h2, color: theme.colors.ink}}>{textForShot(shot)}</div>
        <div style={{height: 6, width: 190, background: theme.colors.accent, margin: "30px auto 0", borderRadius: 99}} />
      </div>
    </AbsoluteFill>
  );
};
