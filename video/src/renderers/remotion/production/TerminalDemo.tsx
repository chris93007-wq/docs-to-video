import {AbsoluteFill, interpolate} from "remotion";
import {TerminalChrome} from "../visual-language/shared";
import {theme} from "../../../styles/theme";
import {clamp} from "../../../utils/animation";
import {useShotMotion} from "./helpers";
import type {ProductionShotProps} from "./types";

export const TerminalDemo = (_props: ProductionShotProps) => {
  const {frame, fps} = useShotMotion();
  const lines = [
    "Codex prompt: Run SDD for RX-13603 in pharmacy-ui",
    ".sdd-runtime/run.json registered",
    "WAITING_FOR_REQUIREMENTS_INPUT",
    "Approve, then continue the coordinator run",
  ];

  return (
    <AbsoluteFill style={{padding: "150px 250px", justifyContent: "center"}}>
      <TerminalChrome title="Codex coordinator">
        {lines.map((line, index) => {
          const opacity = interpolate(frame, [fps * (0.35 + index * 0.42), fps * (0.65 + index * 0.42)], [0, 1], clamp);
          return (
            <div
              key={line}
              style={{
                fontFamily: theme.typography.mono,
                fontSize: 26,
                lineHeight: 1.35,
                opacity,
                marginBottom: 18,
                color: index === 2 ? theme.colors.gold : "#E8F0FA",
              }}
            >
              {line}
            </div>
          );
        })}
      </TerminalChrome>
    </AbsoluteFill>
  );
};
