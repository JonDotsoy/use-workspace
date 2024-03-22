import { useNpmPack } from "./use-npm-pack.js";
import { test } from "bun:test";
import { useWorkspace } from "./use-workspace.js";
import { Glob } from "bun";
import { useSample2 } from "./__examples__/samples.js";

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

test.only("", async () => {
  const workspace = await useSample2("sample_2");
  const pack = await useNpmPack(
    workspace,
    new Glob("package.json").scan({ cwd: workspace.location.pathname }),
  );
  console.log("🚀 ~ test.only ~ pack:", pack);
});
