import { useNpmPack } from "./use-npm-pack.js";
import { test } from "bun:test";
import { useWorkspace } from "./use-workspace.js";
import { Glob } from "bun";

test("should pack a workspace file", async () => {
  const workspace = await useWorkspace(new URL("../", import.meta.url));

  const sources = await Array.fromAsync(
    await new Glob("src/**/*[!.spec].ts").scan({
      cwd: new URL("../", import.meta.url).pathname,
      onlyFiles: true,
      absolute: true,
      dot: true,
    }),
  );

  await useNpmPack(workspace, sources);
});
