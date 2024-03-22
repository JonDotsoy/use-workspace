import { useWorkspace } from "../use-workspace.js";

export const useSample1 = (relativeName?: string) =>
  useWorkspace(relativeName, {
    cleanBefore: true,
    template: `${new URL("sample1/", import.meta.url)}`,
  });
