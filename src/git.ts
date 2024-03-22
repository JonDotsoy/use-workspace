import type { Workspace } from "./use-workspace.js";
import * as fs from "fs/promises";

type GitConfigOptions = {
  local?: boolean;
};

export class GitConfig {
  constructor(readonly git: Git) {}

  private toFlagLocal(options?: GitConfigOptions) {
    const local = options?.local ?? true;
    if (local) return ["--local"];
    return [];
  }

  async set(
    name: `${string}.${string}`,
    value: string,
    options?: GitConfigOptions,
  ) {
    await this.git.workspace.exec({
      cmd: ["git", "config", ...this.toFlagLocal(), name, value],
    });
  }

  async get(name: `${string}.${string}`, options?: GitConfigOptions) {
    const childProcess = await this.git.workspace.exec({
      cmd: ["git", "config", ...this.toFlagLocal(), "-z", name],
    });
    return await childProcess.toText();
  }
}

export class Git {
  readonly config: GitConfig = new GitConfig(this);

  constructor(readonly workspace: Workspace) {}

  async init() {
    await this.workspace.exec({ cmd: ["git", "init"] });
  }
}

export const useGit = async (workspace: Workspace) => {
  const gitLocation = new URL(".git/", workspace.location);
  const gitExists = await fs.exists(gitLocation);

  const git = new Git(workspace);

  if (!gitExists) {
    await git.init();
  }

  return git;
};
