import * as fs from "fs/promises";
import { useWorkspace } from "../use-workspace.js";

export const useCache = async () => {
  const cacheWorkspace = await useWorkspace("::cache::");

  const set = async (key: string, value: Uint8Array) => {
    await fs.writeFile(new URL(key, cacheWorkspace.location), value);
  };

  const get = async (key: string) => {
    const location = new URL(key, cacheWorkspace.location);
    const exists = await fs.exists(location);
    if (!exists) return null;
    const stat = await fs.stat(location);
    if (!stat.isFile()) return null;
    return new Uint8Array(await fs.readFile(location));
  };

  return {
    workspace: cacheWorkspace,
    set,
    get,
  };
};
