import { URL } from "url";
import * as fs from "fs/promises";
import { exec } from "./utils/exec.js";

async function* eachNodeModulesFolders() {
  const maxIntents = 200;
  let index = 0;
  let currentAlternative = new URL("./", `file://${__filename}`);
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

function getWorkspaceLocationByEnv() {
  const WORKSPACE_LOCATION = process.env.WORKSPACE_LOCATION ?? null;
  if (!WORKSPACE_LOCATION) return null;
  const cwd = `file://${process.cwd()}/`;
  if (!URL.canParse(WORKSPACE_LOCATION, cwd)) return null;
  return new URL(WORKSPACE_LOCATION, cwd);
}

async function getBaseWorkspaceLocation() {
  const byEnv = getWorkspaceLocationByEnv();
  if (byEnv) return byEnv;
  const nodeModules = await getNodeModulesFolder();
  if (!nodeModules)
    throw new Error(
      `Missing node_modules folder. Please describe the environment WORKSPACE_LOCATION.`,
    );
  return new URL(".workspaces/", nodeModules);
}

const toWorkspaceLocation = async (relativeName: string | URL) => {
  if (relativeName instanceof URL) return relativeName;
  return new URL(`${relativeName}/`, await getBaseWorkspaceLocation());
};

type WorkspaceOptions = {
  /** Clean all content of workspace if exists */
  cleanBefore?: boolean;
  /** URL format */
  template?: string;
};

export class Workspace {
  constructor(readonly location: URL) {}

  async exec(options: { cmd: string[]; silent?: boolean }) {
    return await exec({
      cmd: options.cmd,
      cwd: this.location,
      silent: options.silent,
    });
  }
}

export const useWorkspace = async (
  relativeName: string | URL = "default",
  options?: WorkspaceOptions,
): Promise<Workspace> => {
  const cleanBefore = options?.cleanBefore ?? false;
  const template = options?.template ? new URL(options?.template) : null;

  const workspaceLocation = await toWorkspaceLocation(relativeName);

  if (cleanBefore) await fs.rm(workspaceLocation, { recursive: true });

  await fs.mkdir(workspaceLocation, { recursive: true });

  // Copy the template on the workspace
  if (template) {
    const templateFiles = await fs.readdir(template, {
      recursive: true,
      withFileTypes: true,
    });
    for (const direct of templateFiles) {
      if (direct.isFile()) {
        const source = new URL(direct.name, template);
        const target = new URL(direct.name, workspaceLocation);
        await fs.mkdir(new URL("./", source), { recursive: true });
        await fs.copyFile(source, target);
      }
    }
  }

  return new Workspace(workspaceLocation);
};
