import { Workspace } from "./use-workspace.js";
import { jsonQuery } from "./utils/json-query.js";
import { digestFiles } from "./utils/digest-files.js";

type StringLike = string | { toString: () => string };

const useMemory = async (
  workspace: Workspace,
  likePath: StringLike = ".use-npm-pack.json",
) => {
  const configPath = new URL(likePath, workspace.location);

  return jsonQuery(configPath);
};

type Options = {};

export const useNpmPack = async (
  workspace: Workspace,
  files: StringLike[],
  _options?: Options,
) => {
  const memory = await useMemory(workspace);
  const shasumSource = await digestFiles(files, workspace.location);
  const shasumTarget = await memory.get("shasum");

  if (shasumSource === shasumTarget) {
    const e = await memory.get("filename");
    if (e !== undefined) return e;
  }

  const packingDetail = await workspace.exec({
    cmd: ["npm", "pack", "--json"],
    silent: true,
  });
  const outputChunks = await Array.fromAsync(packingDetail.stdout);
  const outputText = JSON.parse(
    new TextDecoder().decode(
      outputChunks.reduce(
        (accum, e) => new Uint8Array([...accum, ...e]),
        new Uint8Array([]),
      ),
    ),
  );

  const filename = outputText.at(0)?.filename;

  if (!filename) throw new Error(`Cannot pack workspace`);

  const packFilenameSource = new URL(filename, workspace.location);

  await memory.set("shasum", shasumSource);
  await memory.set("filename", packFilenameSource);

  return packFilenameSource.toString();
};
