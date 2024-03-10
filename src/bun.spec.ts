import { test } from "bun:test";
import { useWorkspace } from "./use-workspace";
import { useBun } from "./bun";

test("should call to useBun", async () => {
  const workspace = await useWorkspace("foo3");
  const bun = await useBun(workspace);
});
