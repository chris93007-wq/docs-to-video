const object = (name, properties, required = Object.keys(properties)) => ({
  type: "object",
  title: name,
  additionalProperties: true,
  required,
  properties,
});

const stringArray = {type: "array", items: {type: "string"}};
const numberArray = {type: "array", items: {type: "number"}};

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
  emphasis: stringArray,
  avoid: stringArray,
});

const assetSchema = object("Asset", {
  identifier: {type: "string"},
  sceneId: {type: "string"},
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
  generationMethod: {
    type: "string",
    enum: ["deterministic-vector", "reuse-existing", "ai-generated", "manual"],
  },
  reuseKey: {type: "string"},
});

const narrationSegmentSchema = object("NarrationSegment", {
  sceneId: {type: "string"},
  startSeconds: {type: "number"},
  endSeconds: {type: "number"},
  text: {type: "string"},
});

const animationSceneSchema = object("AnimationScene", {
  sceneId: {type: "string"},
  camera: {type: "string"},
  layout: {type: "string"},
  transition: {type: "string"},
  focus: stringArray,
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

export const artifactFiles = {
  documentAst: "document-ast.json",
  semantic: "semantic-document.json",
  story: "story-plan.json",
  visual: "visual-plan.json",
  assets: "asset-manifest.json",
  narration: "narration.json",
  animation: "animation-plan.json",
  render: "render-manifest.json",
};

export const stageOrder = [
  "parse",
  "semantic",
  "story",
  "visual",
  "assets",
  "narration",
  "animation",
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

  animation: object("AnimationPlan", {
    kind: {type: "string", const: "AnimationPlan"},
    version: {type: "string"},
    sourceHash: {type: "string"},
    scenes: {type: "array", items: animationSceneSchema},
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
    narration: {type: "object"},
  }, ["kind", "version", "renderer", "sourceHash", "fps", "width", "height", "totalDurationSeconds", "scenes"]),
};

artifactSchemas.render.properties.narration = artifactSchemas.narration;

export const schemaForStage = (stageName) => {
  const key = stageName === "parse" ? "documentAst" : stageName;
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
