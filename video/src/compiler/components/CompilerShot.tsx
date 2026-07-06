import {AbsoluteFill} from "remotion";
import {theme} from "../../styles/theme";
import {TechnicalGrid} from "../../renderers/remotion/visual-language/shared";
import {CalloutInsert} from "../../renderers/remotion/production/CalloutInsert";
import {DiagramBuild} from "../../renderers/remotion/production/DiagramBuild";
import {KineticTitle} from "../../renderers/remotion/production/KineticTitle";
import {MetaphorVisual} from "../../renderers/remotion/production/MetaphorVisual";
import {ProductUIMockup} from "../../renderers/remotion/production/ProductUIMockup";
import {ShotTransition} from "../../renderers/remotion/production/ShotTransition";
import {SourceCloseup} from "../../renderers/remotion/production/SourceCloseup";
import {TerminalDemo} from "../../renderers/remotion/production/TerminalDemo";
import {WorkflowWide} from "../../renderers/remotion/production/WorkflowWide";
import type {ProductionShot} from "../../renderers/remotion/production/types";

type CompilerShotProps = {
  shot: ProductionShot;
};

const ShotBody = ({shot}: CompilerShotProps) => {
  switch (shot.media?.mediaType) {
    case "source-excerpt":
      return <SourceCloseup shot={shot} />;
    case "ui-mockup":
      return <ProductUIMockup shot={shot} />;
    case "terminal":
      return <TerminalDemo shot={shot} />;
    case "workflow-animation":
      return <WorkflowWide shot={shot} />;
    case "diagram":
      return <DiagramBuild shot={shot} />;
    case "icon-card":
      return <CalloutInsert shot={shot} />;
    case "kinetic-text":
      return <KineticTitle shot={shot} />;
    case "metaphor-visual":
    case "transition":
    default:
      return <MetaphorVisual shot={shot} />;
  }
};

export const CompilerShot = ({shot}: CompilerShotProps) => (
  <AbsoluteFill
    style={{
      background: theme.gradients.page,
      color: theme.colors.ink,
      fontFamily: theme.typography.family,
      overflow: "hidden",
    }}
  >
    <TechnicalGrid opacity={0.24} />
    <ShotBody shot={shot} />
    <ShotTransition />
  </AbsoluteFill>
);
