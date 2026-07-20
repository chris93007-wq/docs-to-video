import {launchPlan} from "../launch/pharmacy-task-workflow-v0.2.1.mjs";
import {buildPharmacyTaskWorkflowVersion} from "./build-pharmacy-task-workflow-version.mjs";

await buildPharmacyTaskWorkflowVersion({
  launchPlan,
  generatedManifestFile: "pharmacy-task-workflow-v0.2.1.json",
  requireNarrationReuse: true,
});
