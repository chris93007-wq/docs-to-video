import {runAiOrFallback} from "./ai-stage.mjs";
import {compactText, firstSentence, hashValue, slugify, unique} from "../utils.mjs";

const textBlocks = (ast) =>
  ast.sections.flatMap((section) =>
    section.blocks
      .filter((block) => ["paragraph", "quote", "list", "code", "diagram"].includes(block.type))
      .map((block) => ({
        section,
        block,
        text: compactText(block.text ?? (block.items ?? []).join(" ")),
      })),
  );

const topTerms = (ast, limit = 8) => {
  const frequency = new Map();
  const add = (term, weight = 1) => {
    const normalized = compactText(term).replace(/[`*_]/g, "");
    if (!normalized || normalized.length < 4 || /^\d+$/.test(normalized)) {
      return;
    }
    frequency.set(normalized, (frequency.get(normalized) ?? 0) + weight);
  };

  for (const section of ast.sections) {
    if (section.level > 0) {
      add(section.heading, 4);
      for (const part of section.heading.split(/[:,-]/)) {
        add(part, 2);
      }
    }
  }

  const source = textBlocks(ast).map((entry) => entry.text).join(" ");
  for (const match of source.matchAll(/`([^`]+)`/g)) {
    add(match[1], 3);
  }
  for (const match of source.matchAll(/\b[A-Z][A-Za-z0-9-]*(?:\s+[A-Z][A-Za-z0-9-]*){0,3}\b/g)) {
    add(match[0], 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([term]) => term);
};

const conceptFrom = (name, index, ast, importance = 0.7) => {
  const evidence = ast.sections
    .filter((section) => section.heading.toLowerCase().includes(name.toLowerCase().split(/\s+/)[0]))
    .map((section) => section.heading)
    .slice(0, 3);

  const fallbackEvidence = ast.sections
    .filter((section) => section.level > 0)
    .map((section) => section.heading)
    .slice(index, index + 2);

  return {
    id: slugify(name, `concept-${index + 1}`),
    name,
    description: `Important idea identified from ${ast.metadata.title}.`,
    importance,
    evidence: evidence.length > 0 ? evidence : fallbackEvidence,
  };
};

const extractKeyMessages = (ast) =>
  unique(
    textBlocks(ast)
      .filter((entry) => entry.block.type === "paragraph" && entry.text.length > 40)
      .map((entry) => firstSentence(entry.text))
      .filter((sentence) => sentence.length > 30)
      .slice(0, 6),
  );

const extractWorkflows = (ast) => {
  const listWorkflows = ast.sections.flatMap((section, index) =>
    section.blocks
      .filter((block) => block.type === "list" && (block.ordered || (block.items ?? []).length >= 3))
      .map((block) => ({
        id: slugify(`${section.heading}-workflow`, `workflow-${index + 1}`),
        name: section.heading,
        description: `Workflow with ${(block.items ?? []).length} documented steps.`,
        importance: 0.78,
        evidence: block.items ?? [],
      })),
  );

  const namedWorkflows = ast.sections
    .filter((section) => /workflow|process|phase|lifecycle|pipeline|run/i.test(section.heading))
    .map((section, index) => ({
      id: slugify(`${section.heading}-workflow`, `workflow-${index + 1}`),
      name: section.heading,
      description: "Workflow-oriented section identified by heading.",
      importance: 0.72,
      evidence: section.blocks.map((block) => compactText(block.text)).filter(Boolean).slice(0, 3),
    }));

  return [...[...listWorkflows, ...namedWorkflows]
    .reduce((byId, workflow) => {
      if (!byId.has(workflow.id)) {
        byId.set(workflow.id, workflow);
      }
      return byId;
    }, new Map())
    .values()].slice(0, 6);
};

const extractSystems = (concepts) =>
  concepts
    .filter((concept) => /system|service|runtime|orchestrator|compiler|renderer|api|pipeline|platform|model/i.test(concept.name))
    .map((concept) => ({
      ...concept,
      description: `System or component: ${concept.name}.`,
      importance: Math.max(concept.importance, 0.76),
    }))
    .slice(0, 6);

const extractActors = (text) => {
  const actors = [
    ["engineer", "Engineers"],
    ["developer", "Developers"],
    ["user", "Users"],
    ["team", "Teams"],
    ["administrator", "Administrators"],
    ["coordinator", "Coordinator"],
    ["reviewer", "Reviewers"],
  ];

  return actors
    .filter(([needle]) => new RegExp(`\\b${needle}s?\\b`, "i").test(text))
    .map(([, name], index) => ({
      id: slugify(name, `actor-${index + 1}`),
      name,
      description: `Actor mentioned in the source material.`,
      importance: 0.64,
      evidence: [name],
    }));
};

const extractTerminology = (ast) => {
  const terms = [];
  for (const entry of textBlocks(ast)) {
    const text = entry.text;
    const definition = text.match(/\b([A-Z][A-Za-z0-9 -]{2,40})\s+(?:is|are|means|refers to)\s+([^.!?]+[.!?])/);
    if (definition) {
      terms.push({
        term: compactText(definition[1]),
        definition: compactText(definition[2]),
      });
    }
  }

  return unique(terms.map((term) => JSON.stringify(term)))
    .map((term) => JSON.parse(term))
    .slice(0, 8);
};

const extractDependencies = (ast) =>
  textBlocks(ast)
    .filter((entry) => /depends on|requires|before|after|blocks|must/i.test(entry.text))
    .slice(0, 6)
    .map((entry) => ({
      from: entry.section.heading,
      to: firstSentence(entry.text).slice(0, 80),
      rationale: "Dependency language appears in the source text.",
    }));

const extractComparisons = (ast) =>
  textBlocks(ast)
    .filter((entry) => /\bvs\.?\b|versus|instead of|rather than|compared with/i.test(entry.text))
    .slice(0, 4)
    .map((entry) => ({
      left: entry.section.heading,
      right: firstSentence(entry.text).slice(0, 80),
      basis: "Comparison language appears in the source text.",
    }));

export const analyzeSemantics = async (documentAst, {aiClient} = {}) =>
  runAiOrFallback({
    stageName: "semantic",
    artifactName: "semantic",
    input: documentAst,
    aiClient,
    fallback: async () => {
      const terms = topTerms(documentAst);
      const concepts = terms.map((term, index) =>
        conceptFrom(term, index, documentAst, Math.max(0.52, 0.9 - index * 0.05)),
      );
      const fullText = textBlocks(documentAst).map((entry) => entry.text).join(" ");
      const workflows = extractWorkflows(documentAst);
      const systems = extractSystems(concepts);

      return {
        kind: "SemanticDocument",
        version: "1.0.0",
        sourceHash: hashValue(documentAst),
        title: documentAst.metadata.title,
        concepts,
        workflows,
        systems,
        actors: extractActors(fullText),
        lifecycle: unique(
          workflows
            .flatMap((workflow) => workflow.evidence)
            .map((step) => firstSentence(step))
            .filter(Boolean),
        ).slice(0, 8),
        dependencies: extractDependencies(documentAst),
        comparisons: extractComparisons(documentAst),
        architecture: [
          ...documentAst.diagrams.map((diagram) => `Diagram: ${diagram.language || "diagram"}`),
          ...documentAst.sections
            .filter((section) => /architecture|system|component|runtime|pipeline/i.test(section.heading))
            .map((section) => section.heading),
        ].slice(0, 8),
        terminology: extractTerminology(documentAst),
        keyMessages: extractKeyMessages(documentAst),
        repetitiveContent: [],
        lowValueContent: documentAst.sections
          .filter((section) => section.level > 0 && section.blocks.length === 0)
          .map((section) => section.heading),
      };
    },
  });
