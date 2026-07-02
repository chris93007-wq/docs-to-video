import {existsSync, mkdirSync, readFileSync, rmSync, writeFileSync} from "node:fs";
import path from "node:path";
import {artifactFiles, assertValidArtifact} from "./schemas.mjs";
import {artifactRoot, hashValue, slugify} from "./utils.mjs";

export const artifactKeyForStage = (stageName) =>
  stageName === "parse" ? "documentAst" : stageName;

export const defaultArtifactDir = (sourcePath) => {
  const base = path.basename(sourcePath ?? "document", path.extname(sourcePath ?? "document"));
  return path.join(artifactRoot, slugify(base));
};

export const ensureDir = (dirPath) => {
  mkdirSync(dirPath, {recursive: true});
  return dirPath;
};

export const readJson = (filePath) => JSON.parse(readFileSync(filePath, "utf8"));

export const writeJson = (filePath, value) => {
  ensureDir(path.dirname(filePath));
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
};

export const artifactPath = (dirPath, artifactName) => {
  const fileName = artifactFiles[artifactName];
  if (!fileName) {
    throw new Error(`No artifact file registered for ${artifactName}`);
  }
  return path.join(dirPath, fileName);
};

export const cachePath = (dirPath, stageName) =>
  path.join(dirPath, `.${stageName}.cache.json`);

export const readArtifact = (dirPath, artifactName) =>
  assertValidArtifact(artifactName, readJson(artifactPath(dirPath, artifactName)));

export const cleanArtifacts = (dirPath) => {
  if (existsSync(dirPath)) {
    rmSync(dirPath, {recursive: true, force: true});
  }
};

export const runCachedStage = async ({
  stageName,
  artifactName = artifactKeyForStage(stageName),
  artifactDir,
  input,
  promptVersion = "deterministic",
  force = false,
  build,
}) => {
  ensureDir(artifactDir);

  const outputPath = artifactPath(artifactDir, artifactName);
  const stageCachePath = cachePath(artifactDir, stageName);
  const inputHash = hashValue({
    stageName,
    promptVersion,
    input,
  });

  if (!force && existsSync(outputPath) && existsSync(stageCachePath)) {
    const cache = readJson(stageCachePath);
    if (cache.inputHash === inputHash) {
      return {
        artifact: assertValidArtifact(artifactName, readJson(outputPath)),
        cached: true,
        inputHash,
      };
    }
  }

  const artifact = assertValidArtifact(artifactName, await build());
  writeJson(outputPath, artifact);
  writeJson(stageCachePath, {
    stageName,
    artifactName,
    inputHash,
    artifactHash: hashValue(artifact),
    promptVersion,
    updatedAt: new Date().toISOString(),
  });

  return {artifact, cached: false, inputHash};
};
