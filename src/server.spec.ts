import { test, expect } from "bun:test";
import { useWorkspace } from "./use-workspace.js";
import { useServer } from "./server.js";
import { useSample1 } from "./__examples__/samples.js";

test.only("", async () => {
  const workspace = await useSample1();

  await using server1 = await useServer(workspace);

  expect(await (await fetch(`${server1.toURL("foo")}`)).text()).toEqual("biz");
});
