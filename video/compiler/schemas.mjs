const object = (name, properties, required = Object.keys(properties)) => ({
  type: "object",
  title: name,
  additionalProperties: true,
  required,
  properties,
});

const stringArray = {type: "array", items: {type: "string"}};
const numberArray = {type: "array", items: {type: "number"}};
const booleanSchema = {type: "boolean"};

const shotRoleSchema = {
  type: "string",
  enum: [
    "source-document-closeup",
    "product-ui-proof",
    "terminal-demo",
    "workflow-wide",
    "diagram-build",
    "callout-insert",
    "comparison",
    "transition-bridge",
    "emotional-hook",
    "summary-payoff",
    "metaphor-visual",
    "kinetic-title",
  ],
};

const shotFramingSchema = {
  type: "string",
  enum: ["wide", "medium", "closeup", "macro", "split-screen", "overhead", "hero"],
};

const shotCameraSchema = {
  type: "string",
  enum: ["static", "push-in", "pull-back", "pan-left", "pan-right", "track", "zoom-to-detail", "match-cut", "parallax"],
};

const editTransitionSchema = {
  type: "string",
  enum: ["cut", "crossfade", "match-cut", "push", "whip-pan", "morph", "fade-through-white"],
};

const pacingRoleSchema = {
  type: "string",
  enum: ["hook", "setup", "explain", "proof", "emphasis", "breath", "payoff"],
};

const captionBehaviorSchema = {
  type: "string",
  enum: ["none", "lower-third", "inline-callout", "source-highlight", "terminal-caption"],
};

const soundCueSchema = {
  type: "string",
  enum: ["none", "soft-hit", "whoosh", "ui-click", "terminal-tick", "success-chime", "gate-lock", "path-draw", "transition-rise"],
};

const mediaTypeSchema = {
  type: "string",
  enum: [
    "source-excerpt",
    "ui-mockup",
    "terminal",
    "workflow-animation",
    "diagram",
    "metaphor-visual",
    "kinetic-text",
    "icon-card",
    "transition",
  ],
};

const visualPrimitiveSchema = {
  type: "string",
  enum: [
    "AnimatedWorkflow",
    "PipelineFlow",
    "TraceabilityChain",
    "ApprovalGate",
    "ArtifactRegistry",
    "ParallelLanes",
    "ValidationGate",
    "TerminalSequence",
    "DiagramReveal",
    "BenefitCards",
    "FloatingDocumentCloud",
    "ConnectedNodeGraph",
    "CameraRail",
    "PathDraw",
    "ProgressiveHighlight",
    "MorphingCardStack",
    "SceneTransition",
  ],
};

const blockSchema = object("DocumentBlock", {
  id: {type: "string"},
  type: {
    type: "string",
    enum: ["paragraph", "list", "table", "diagram", "image", "quote", "code"],
  },
  text: {type: "string"},
  language: {type: "string"},
  ordered: {type: "boolean"},
  items: {type: "array", items: {type: "string"}},
  headers: {type: "array", items: {type: "string"}},
  rows: {type: "array", items: {type: "array", items: {type: "string"}}},
  alt: {type: "string"},
  src: {type: "string"},
  href: {type: "string"},
}, ["id", "type"]);

const sectionSchema = object("DocumentSection", {
  id: {type: "string"},
  level: {type: "number"},
  heading: {type: "string"},
  blocks: {type: "array", items: blockSchema},
});

const conceptSchema = object("SemanticConcept", {
  id: {type: "string"},
  name: {type: "string"},
  description: {type: "string"},
  importance: {type: "number"},
  evidence: stringArray,
});

const storySceneSchema = object("StoryScene", {
  id: {type: "string"},
  arcRole: {
    type: "string",
    enum: [
      "hook",
      "problem",
      "pain",
      "solution",
      "guided walkthrough",
      "benefits",
      "developer experience",
      "conclusion",
    ],
  },
  title: {type: "string"},
  purpose: {type: "string"},
  teachingPoint: {type: "string"},
  learningObjectives: stringArray,
  sourceConceptIds: stringArray,
  importance: {type: "number"},
  durationSeconds: {type: "number"},
});

const visualSceneSchema = object("VisualScene", {
  sceneId: {type: "string"},
  metaphor: {type: "string"},
  visualPrimitive: visualPrimitiveSchema,
  visualType: {
    type: "string",
    enum: [
      "checkpoint-gate",
      "pipeline",
      "chain",
      "control-room",
      "lanes",
      "timeline",
      "graph",
      "network",
      "stack",
      "comparison",
      "callout",
    ],
  },
  layout: {type: "string"},
  motionStyle: {type: "string"},
  density: {type: "string", enum: ["medium", "high"]},
  textDensity: {type: "string", enum: ["low", "medium"]},
  camera: {type: "string"},
  emphasis: stringArray,
  avoid: stringArray,
});

const assetSchema = object("Asset", {
  assetId: {type: "string"},
  identifier: {type: "string"},
  sceneId: {type: "string"},
  shotId: {type: "string"},
  assetType: {type: "string"},
  type: {
    type: "string",
    enum: [
      "svg",
      "icon",
      "diagram",
      "terminal",
      "browser",
      "architecture-graphic",
      "illustration",
      "background",
    ],
  },
  purpose: {type: "string"},
  reusable: booleanSchema,
  generationMethod: {
    type: "string",
    enum: ["deterministic-vector", "reuse-existing", "ai-generated", "manual"],
  },
  reuseKey: {type: "string"},
}, ["identifier", "sceneId", "type", "purpose", "generationMethod", "reuseKey"]);

const narrationSegmentSchema = object("NarrationSegment", {
  sceneId: {type: "string"},
  startSeconds: {type: "number"},
  endSeconds: {type: "number"},
  text: {type: "string"},
});

const narrationAudioSegmentSchema = object("NarrationAudioSegment", {
  sceneId: {type: "string"},
  spokenText: {type: "string"},
  staticFile: {type: "string"},
  sampleRate: {type: "number"},
  audioDurationSeconds: {type: "number"},
  startSeconds: {type: "number"},
  endSeconds: {type: "number"},
  pauseAfterSeconds: {type: "number"},
});

const animationSceneSchema = object("AnimationScene", {
  sceneId: {type: "string"},
  camera: {type: "string"},
  layout: {type: "string"},
  transition: {type: "string"},
  transitionIn: {type: "string"},
  transitionOut: {type: "string"},
  primaryAnimatedObject: {type: "string"},
  secondaryAnimatedObjects: stringArray,
  progressiveReveal: {
    type: "array",
    items: object("ProgressiveRevealStep", {
      label: {type: "string"},
      startSeconds: {type: "number"},
      durationSeconds: {type: "number"},
    }),
  },
  focus: stringArray,
  staticHoldSeconds: {type: "number"},
  requiresPathAnimation: booleanSchema,
  requiresCameraMovement: booleanSchema,
  elements: {
    type: "array",
    items: object("AnimationElement", {
      asset: {type: "string"},
      animation: {type: "string"},
      startSeconds: {type: "number"},
      durationSeconds: {type: "number"},
    }),
  },
});

const shotContinuitySchema = object("ShotContinuity", {
  entersFrom: {type: "string"},
  exitsTo: {type: "string"},
  connectsToShotId: {type: "string"},
  visualMotif: {type: "string"},
}, []);

const shotSchema = object("Shot", {
  shotId: {type: "string"},
  sceneId: {type: "string"},
  order: {type: "number"},
  startSeconds: {type: "number"},
  durationSeconds: {type: "number"},
  shotRole: shotRoleSchema,
  purpose: {type: "string"},
  visualIntent: {type: "string"},
  sourceConceptIds: stringArray,
  framing: shotFramingSchema,
  camera: shotCameraSchema,
  continuity: shotContinuitySchema,
  onScreenText: stringArray,
  staticHoldSeconds: {type: "number"},
  justificationForLongShot: {type: "string"},
}, [
  "shotId",
  "sceneId",
  "order",
  "startSeconds",
  "durationSeconds",
  "shotRole",
  "purpose",
  "visualIntent",
  "sourceConceptIds",
  "framing",
  "camera",
  "continuity",
  "onScreenText",
]);

const mediaMixAssignmentSchema = object("MediaMixAssignment", {
  shotId: {type: "string"},
  sceneId: {type: "string"},
  mediaType: mediaTypeSchema,
  assetNeeds: stringArray,
  rationale: {type: "string"},
});

const animationShotSchema = object("AnimationShot", {
  shotId: {type: "string"},
  sceneId: {type: "string"},
  primaryMotion: {type: "string"},
  secondaryMotion: stringArray,
  cameraMove: shotCameraSchema,
  transitionIn: {type: "string"},
  transitionOut: {type: "string"},
  staticHoldSeconds: {type: "number"},
  animatedElements: stringArray,
  soundCue: soundCueSchema,
}, [
  "shotId",
  "sceneId",
  "primaryMotion",
  "secondaryMotion",
  "cameraMove",
  "transitionIn",
  "transitionOut",
  "staticHoldSeconds",
  "animatedElements",
]);

const editDecisionSchema = object("EditDecision", {
  cutId: {type: "string"},
  shotId: {type: "string"},
  sceneId: {type: "string"},
  fromFrame: {type: "number"},
  durationFrames: {type: "number"},
  transition: editTransitionSchema,
  pacingRole: pacingRoleSchema,
  narrationSegmentId: {type: "string"},
  captionBehavior: captionBehaviorSchema,
  soundCue: soundCueSchema,
}, [
  "cutId",
  "shotId",
  "sceneId",
  "fromFrame",
  "durationFrames",
  "transition",
  "pacingRole",
  "captionBehavior",
  "soundCue",
]);

export const artifactFiles = {
  documentAst: "document-ast.json",
  semantic: "semantic-document.json",
  story: "story-plan.json",
  visual: "visual-plan.json",
  shots: "shot-plan.json",
  mediaMix: "media-mix-plan.json",
  assets: "asset-manifest.json",
  narration: "narration.json",
  narrationAudio: "narration-audio.json",
  animation: "animation-plan.json",
  edit: "edit-decision-list.json",
  experience: "experience-validation.json",
  render: "render-manifest.json",
};

export const stageOrder = [
  "parse",
  "semantic",
  "story",
  "visual",
  "shots",
  "media-mix",
  "assets",
  "narration",
  "audio",
  "animation",
  "edit",
  "render",
];

export const artifactSchemas = {
  documentAst: object("DocumentAST", {
    kind: {type: "string", const: "DocumentAST"},
    version: {type: "string"},
    source: object("DocumentSource", {
      path: {type: "string"},
      format: {type: "string"},
      hash: {type: "string"},
    }),
    metadata: object("DocumentMetadata", {
      title: {type: "string"},
      wordCount: {type: "number"},
      createdAt: {type: "string"},
    }),
    sections: {type: "array", items: sectionSchema},
    links: {type: "array", items: object("DocumentLink", {
      text: {type: "string"},
      href: {type: "string"},
      sectionId: {type: "string"},
    })},
    images: {type: "array", items: object("DocumentImage", {
      alt: {type: "string"},
      src: {type: "string"},
      sectionId: {type: "string"},
    })},
    tables: {type: "array", items: blockSchema},
    diagrams: {type: "array", items: blockSchema},
  }),

  semantic: object("SemanticDocument", {
    kind: {type: "string", const: "SemanticDocument"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    title: {type: "string"},
    concepts: {type: "array", items: conceptSchema},
    workflows: {type: "array", items: conceptSchema},
    systems: {type: "array", items: conceptSchema},
    actors: {type: "array", items: conceptSchema},
    lifecycle: stringArray,
    dependencies: {type: "array", items: object("Dependency", {
      from: {type: "string"},
      to: {type: "string"},
      rationale: {type: "string"},
    })},
    comparisons: {type: "array", items: object("Comparison", {
      left: {type: "string"},
      right: {type: "string"},
      basis: {type: "string"},
    })},
    architecture: stringArray,
    terminology: {type: "array", items: object("Term", {
      term: {type: "string"},
      definition: {type: "string"},
    })},
    keyMessages: stringArray,
    repetitiveContent: stringArray,
    lowValueContent: stringArray,
  }),

  story: object("StoryPlan", {
    kind: {type: "string", const: "StoryPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    narrativeArc: stringArray,
    totalDurationSeconds: {type: "number"},
    scenes: {type: "array", items: storySceneSchema},
  }),

  visual: object("VisualPlan", {
    kind: {type: "string", const: "VisualPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    scenes: {type: "array", items: visualSceneSchema},
  }),

  shots: object("ShotPlan", {
    kind: {type: "string", const: "ShotPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    documentSlug: {type: "string"},
    targetRuntimeSeconds: {type: "number"},
    targetShotCount: {type: "number"},
    shots: {type: "array", items: shotSchema},
  }),

  mediaMix: object("MediaMixPlan", {
    kind: {type: "string", const: "MediaMixPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    documentSlug: {type: "string"},
    targetMix: {type: "object"},
    assignments: {type: "array", items: mediaMixAssignmentSchema},
    warnings: stringArray,
  }),

  assets: object("AssetManifest", {
    kind: {type: "string", const: "AssetManifest"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    assets: {type: "array", items: assetSchema},
    reuseOpportunities: {type: "array", items: object("ReuseOpportunity", {
      reuseKey: {type: "string"},
      identifiers: stringArray,
    })},
  }),

  narration: object("Narration", {
    kind: {type: "string", const: "Narration"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    targetWordCount: numberArray,
    wordCount: {type: "number"},
    text: {type: "string"},
    segments: {type: "array", items: narrationSegmentSchema},
  }),

  narrationAudio: object("NarrationAudio", {
    kind: {type: "string", const: "NarrationAudio"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    model: {type: "string"},
    voice: {type: "string"},
    pauseSeconds: {type: "number"},
    totalDurationSeconds: {type: "number"},
    segments: {type: "array", items: narrationAudioSegmentSchema},
  }),

  animation: object("AnimationPlan", {
    kind: {type: "string", const: "AnimationPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    scenes: {type: "array", items: animationSceneSchema},
    shots: {type: "array", items: animationShotSchema},
  }, ["kind", "version", "sourceHash", "scenes"]),

  edit: object("EditDecisionList", {
    kind: {type: "string", const: "EditDecisionList"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    fps: {type: "number"},
    totalFrames: {type: "number"},
    decisions: {type: "array", items: editDecisionSchema},
  }),

  experience: object("ExperienceValidation", {
    kind: {type: "string", const: "ExperienceValidation"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    passed: booleanSchema,
    profile: {type: "string"},
    errors: stringArray,
    warnings: stringArray,
    metrics: {type: "object"},
    sceneDiagnostics: {type: "array", items: {type: "object"}},
  }),

  render: object("RenderManifest", {
    kind: {type: "string", const: "RenderManifest"},
    version: {type: "string"},
    renderer: {type: "string"},
    sourceHash: {type: "string"},
    fps: {type: "number"},
    width: {type: "number"},
    height: {type: "number"},
    totalDurationSeconds: {type: "number"},
    scenes: {type: "array", items: object("RenderScene", {
      id: {type: "string"},
      title: {type: "string"},
      purpose: {type: "string"},
      teachingPoint: {type: "string"},
      startSeconds: {type: "number"},
      durationSeconds: {type: "number"},
      visual: visualSceneSchema,
      assets: {type: "array", items: assetSchema},
      animation: animationSceneSchema,
      narration: narrationSegmentSchema,
    })},
    shots: {type: "array", items: object("RenderShot", {
      shotId: {type: "string"},
      sceneId: {type: "string"},
      order: {type: "number"},
      title: {type: "string"},
      purpose: {type: "string"},
      teachingPoint: {type: "string"},
      shotRole: shotRoleSchema,
      startSeconds: {type: "number"},
      durationSeconds: {type: "number"},
      visualIntent: {type: "string"},
      framing: shotFramingSchema,
      camera: shotCameraSchema,
      onScreenText: stringArray,
      visual: visualSceneSchema,
      media: mediaMixAssignmentSchema,
      assets: {type: "array", items: assetSchema},
      animation: animationShotSchema,
      narration: narrationSegmentSchema,
      decision: editDecisionSchema,
    })},
    mediaMix: {type: "object"},
    edl: {type: "object"},
    narration: {type: "object"},
    narrationAudio: {type: "object"},
  }, ["kind", "version", "renderer", "sourceHash", "fps", "width", "height", "totalDurationSeconds", "scenes"]),
};

artifactSchemas.render.properties.narration = artifactSchemas.narration;
artifactSchemas.render.properties.narrationAudio = artifactSchemas.narrationAudio;

export const schemaForStage = (stageName) => {
  const key =
    stageName === "parse"
      ? "documentAst"
      : stageName === "media" || stageName === "media-mix"
        ? "mediaMix"
        : stageName === "edl"
          ? "edit"
          : stageName;
  const schema = artifactSchemas[key];
  if (!schema) {
    throw new Error(`No schema registered for stage: ${stageName}`);
  }
  return schema;
};

const pathFor = (base, key) => (base ? `${base}.${key}` : key);

const getType = (value) => {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
};

export const validateWithSchema = (schema, value, basePath = "") => {
  const errors = [];

  const visit = (currentSchema, currentValue, currentPath) => {
    if (!currentSchema) {
      return;
    }

    if (currentSchema.const !== undefined && currentValue !== currentSchema.const) {
      errors.push(`${currentPath || "artifact"} must equal ${JSON.stringify(currentSchema.const)}`);
      return;
    }

    if (currentSchema.enum && !currentSchema.enum.includes(currentValue)) {
      errors.push(`${currentPath || "artifact"} must be one of ${currentSchema.enum.join(", ")}`);
      return;
    }

    if (currentSchema.type) {
      const actual = getType(currentValue);
      if (actual !== currentSchema.type) {
        errors.push(`${currentPath || "artifact"} must be ${currentSchema.type}, got ${actual}`);
        return;
      }
    }

    if (currentSchema.type === "object") {
      for (const requiredKey of currentSchema.required ?? []) {
        if (!(requiredKey in currentValue)) {
          errors.push(`${pathFor(currentPath, requiredKey)} is required`);
        }
      }

      for (const [key, childSchema] of Object.entries(currentSchema.properties ?? {})) {
        if (key in currentValue) {
          visit(childSchema, currentValue[key], pathFor(currentPath, key));
        }
      }
    }

    if (currentSchema.type === "array") {
      currentValue.forEach((item, index) => {
        visit(currentSchema.items, item, `${currentPath}[${index}]`);
      });
    }
  };

  visit(schema, value, basePath);
  return errors;
};

export const assertValidArtifact = (artifactName, value) => {
  const schema = artifactSchemas[artifactName];
  if (!schema) {
    throw new Error(`Unknown artifact type: ${artifactName}`);
  }

  const errors = validateWithSchema(schema, value);
  if (errors.length > 0) {
    throw new Error(`${artifactName} failed validation:\n${errors.join("\n")}`);
  }

  return value;
};
