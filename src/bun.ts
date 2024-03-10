import type { Workspace } from "./use-workspace";

export class Bun {
  constructor(readonly workspace: Workspace) {}

  async init() {
    await this.workspace.exec({ cmd: ["bun", "-y", "init", "."] });
  }
}

export const useBun = async (workspace: Workspace) => {
  const bun = new Bun(workspace);

  await bun.init();

  return bun;
};
