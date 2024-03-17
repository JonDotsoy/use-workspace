import { useWorkspace } from "../use-workspace";

export const useSample1 = (relativeName?: string) =>
  useWorkspace(relativeName, {
    cleanBefore: true,
    template: `${new URL("sample1/", import.meta.url)}`,
  });