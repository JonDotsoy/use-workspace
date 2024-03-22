import * as fs from "fs/promises";

type StringLike = string | { toString: () => string };

const listFilesRecursive = async function* (
  paths: StringLike[],
  base: StringLike,
): AsyncIterable<StringLike> {
  for (const path of paths) {
    const url = new URL(path, new URL(base));
    const exists = await fs.exists(url);
    if (!exists) continue;
    const stat = await fs.stat(url);
    if (stat.isDirectory()) {
      const a = await fs.readdir(url, { recursive: true, withFileTypes: true });
      for (const b of a) {
        if (b.isFile()) {
          yield new URL(b.name, url);
        }
      }
    }
    if (stat.isFile()) {
      yield url;
    }
  }
};

const aggregateShasum = async (items: StringLike[]) => {
  const sum = { current: new Uint8Array([]) };
  for (const item of items) {
    sum.current = new Uint8Array(
      await crypto.subtle.digest(
        "sha-256",
        new Uint8Array([
          ...sum.current,
          ...new Uint8Array(await fs.readFile(new URL(`${item}`))),
        ]),
      ),
    );
  }
  return Array.from(sum.current, (e) => e.toString(16).padStart(2, "0")).join(
    "",
  );
};

export const digestFiles = async (files: StringLike[], base: StringLike) => {
  const paths = [
    ...new Set(
      await Array.fromAsync(listFilesRecursive(files, base), (e) => `${e}`),
    ),
  ].sort();
  return await aggregateShasum(paths);
};
