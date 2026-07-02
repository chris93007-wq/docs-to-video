import {execFileSync} from "node:child_process";
import {existsSync, mkdirSync, readFileSync, writeFileSync, statSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const narrationFile = path.join(projectRoot, "src", "narration", "narration.ts");
const compilerManifestFile = path.join(projectRoot, "src", "compiler", "generated", "render-manifest.json");
const audioDir = path.join(projectRoot, "public", "audio");
const narrationMode = process.env.DOC_VIDEO_NARRATION === "compiler" ? "compiler" : "legacy";
const audioFile = path.join(
  audioDir,
  narrationMode === "compiler" ? "compiler-narration.wav" : "narration.wav",
);

mkdirSync(audioDir, {recursive: true});

const readLegacyNarration = () => {
  const narrationSource = readFileSync(narrationFile, "utf8");
  const textMatch = narrationSource.match(/export const narrationText = `([\s\S]*?)`;/);
  const durationMatch = narrationSource.match(/estimatedDurationSeconds:\s*(\d+)/);
  return {
    text: textMatch?.[1].replace(/\s+/g, " ").trim(),
    durationSeconds: Number(durationMatch?.[1] ?? 105),
  };
};

const readCompilerNarration = () => {
  const manifest = JSON.parse(readFileSync(compilerManifestFile, "utf8"));
  return {
    text: manifest.narration?.text?.replace(/\s+/g, " ").trim(),
    durationSeconds: Math.ceil(manifest.totalDurationSeconds ?? 90),
  };
};

const {text: narrationText, durationSeconds} =
  narrationMode === "compiler" ? readCompilerNarration() : readLegacyNarration();

if (!narrationText) {
  throw new Error("Could not find narrationText in src/narration/narration.ts");
}

const hasAudibleSamples = (filePath) => {
  const buffer = readFileSync(filePath);
  if (buffer.length < 46 || buffer.toString("ascii", 0, 4) !== "RIFF") {
    return false;
  }

  let maxAmplitude = 0;
  for (let offset = 44; offset + 1 < buffer.length; offset += 2) {
    maxAmplitude = Math.max(maxAmplitude, Math.abs(buffer.readInt16LE(offset)));
    if (maxAmplitude > 16) {
      return true;
    }
  }

  return false;
};

const isUsableAudio = () => {
  if (!existsSync(audioFile)) {
    return false;
  }
  return statSync(audioFile).size > 44100 && hasAudibleSamples(audioFile);
};

const writeSilentWav = (filePath, seconds) => {
  const sampleRate = 44100;
  const channels = 1;
  const bitsPerSample = 16;
  const samples = sampleRate * seconds;
  const byteRate = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign = channels * (bitsPerSample / 8);
  const dataSize = samples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  writeFileSync(filePath, buffer);
};

if (isUsableAudio()) {
  process.exit(0);
}

try {
  execFileSync(
    "say",
    [
      "-v",
      "Samantha",
      "-r",
      "225",
      "--file-format=WAVE",
      "--data-format=LEI16@44100",
      "-o",
      audioFile,
      narrationText,
    ],
    {stdio: "ignore"},
  );
} catch {
  writeSilentWav(audioFile, durationSeconds);
}

if (!isUsableAudio()) {
  writeSilentWav(audioFile, durationSeconds);
}
