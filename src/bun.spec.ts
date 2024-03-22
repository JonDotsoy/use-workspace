import { test } from "bun:test";
import { useWorkspace } from "./use-workspace.js";
import { useBun } from "./bun.js";

test("should call to useBun", async () => {
  const workspace = await useWorkspace("foo3");
  const bun = await useBun(workspace);
});
