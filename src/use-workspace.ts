import { URL } from "url";
import fs from "fs/promises";
import { exec } from "./utils/exec";

async function* eachNodeModulesFolders() {
  const maxIntents = 200;
  let index = 0;
  let currentAlternative = new URL("./", import.meta.url);
  let isEnd = false;
  while (true) {
    index = index + 1;
    if (index > maxIntents) return;
    const alternativeNodeModule = new URL("node_modules/", currentAlternative);
    const exists = await fs.exists(alternativeNodeModule);
    const stat = exists ? await fs.stat(alternativeNodeModule) : null;
    const isDirectory = stat?.isDirectory() ?? false;
    if (isDirectory) yield alternativeNodeModule;
    currentAlternative = new URL("../", currentAlternative);
    if (isEnd) return;
    if (currentAlternative.pathname === "/") {
      isEnd = true;
    }
  }
}

async function getNodeModulesFolder() {
  for await (const alternative of eachNodeModulesFolders()) {
    return alternative;
  }
  return null;
}

const toWorkspaceLocation = async (relativeName: string | URL) => {
  if (relativeName instanceof URL) return relativeName;
  const nodeModules = await getNodeModulesFolder();
  if (!nodeModules) throw new Error(`Missing node_modules folder`);
  return new URL(`${relativeName}/`, new URL(".workspaces/", nodeModules));
};

type WorkspaceOptions = {
  /** Clean all content of workspace if exists */
  cleanBefore?: boolean;
};

export class Workspace {
  constructor(readonly location: URL) {}

  async exec(options: { cmd: string[] }) {
    return await exec({ cmd: options.cmd, cwd: this.location });
  }
}

export const useWorkspace = async (
  relativeName: string | URL = "default",
  options?: WorkspaceOptions,
): Promise<Workspace> => {
  const cleanBefore = options?.cleanBefore ?? false;

  const workspaceLocation = await toWorkspaceLocation(relativeName);

  if (cleanBefore) await fs.rm(workspaceLocation, { recursive: true });

  await fs.mkdir(workspaceLocation, { recursive: true });

  return new Workspace(workspaceLocation);
};
