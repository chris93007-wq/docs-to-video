import {AbsoluteFill, interpolate} from "remotion";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {panelStyle, SmallLabel, textForShot, useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const SourceCloseup = ({shot}: ProductionShotProps) => {
  const {progress, enter} = useShotMotion();
  const phrase = textForShot(shot, "source of truth");
  const lift = interpolate(progress, [0.45, 0.9], [0, 1], clamp);

  return (
    <AbsoluteFill style={{padding: "120px 170px", justifyContent: "center"}}>
      <div style={{...panelStyle, width: 920, padding: 42, transform: `translateX(${(1 - enter) * -90}px)`}}>
        <SmallLabel>Source closeup</SmallLabel>
        <div style={{...theme.typography.body, color: theme.colors.muted, lineHeight: 1.75}}>
          Requirements, approvals, validation gates, and the evidence trail stay anchored to reviewed source material.
        </div>
        <div
          style={{
            marginTop: 30,
            padding: "18px 22px",
            borderRadius: 12,
            background: "rgba(255,214,102,0.24)",
            color: theme.colors.ink,
            fontWeight: 820,
            transform: `translateY(${-34 * lift}px) scale(${1 + lift * 0.08})`,
            boxShadow: `0 18px 40px rgba(255,214,102,${0.12 + lift * 0.18})`,
          }}
        >
          {phrase}
        </div>
      </div>
    </AbsoluteFill>
  );
};
