import assert from "node:assert/strict";
import {test} from "node:test";
import path from "node:path";
import {parseDocument} from "../compiler/stages/parser.mjs";
import {assertValidArtifact} from "../compiler/schemas.mjs";

const samplePath = path.resolve("test/fixtures/sample.md");

test("parser preserves document structure without interpretation", () => {
  const ast = parseDocument(samplePath);

  assertValidArtifact("documentAst", ast);
  assert.equal(ast.kind, "DocumentAST");
  assert.equal(ast.metadata.title, "Release Gate Compiler");
  assert.ok(ast.sections.some((section) => section.heading === "Compiler Workflow"));
  assert.equal(ast.tables.length, 1);
  assert.equal(ast.diagrams.length, 1);
  assert.equal(ast.images.length, 1);
  assert.equal(ast.links.length, 1);
});
