import * as fs from "fs/promises";

type StringLike = string | { toString: () => string };

export const jsonQuery = async (fileLike: StringLike) => {
  const configPath = new URL(fileLike);
  const load = async () => {
    try {
      const payload = JSON.parse(await fs.readFile(configPath, "utf-8"));
      if (typeof payload === "object" && payload !== null) {
        return payload as Record<string, string | undefined>;
      }
    } catch (ex) {}
    return null;
  };
  const write = async (value: unknown) =>
    await fs.writeFile(configPath, JSON.stringify(value, null, 2));
  return {
    async set(key: string, value: StringLike) {
      const cnf = (await load()) ?? {};
      cnf[key] = `${value}`;
      await write(cnf);
    },
    async get(key: string) {
      const cnf = (await load()) ?? {};
      return cnf[key];
    },
  };
};
