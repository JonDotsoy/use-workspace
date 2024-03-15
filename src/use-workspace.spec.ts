import { test, expect } from "bun:test";
import fs from "fs/promises";
import { useWorkspace } from "./use-workspace";

test("", async () => {
  await fs.rm(new URL("./__scripts__/test_1/workspaces/", import.meta.url), {
    recursive: true,
  });

  const subprocess = await Bun.spawn({
    cmd: [
      process.argv0,
      `${new URL("./__scripts__/test_1/run.ts", import.meta.url).pathname}`,
    ],
    cwd: `${new URL("./__scripts__/test_1/", import.meta.url).pathname}`,
    env: {
      WORKSPACE_LOCATION: `${new URL("./__scripts__/test_1/workspaces/", import.meta.url)}`,
    },
    stderr: "inherit",
    stdout: "inherit",
  });

  const exitCode = await subprocess.exited;

  const okStat = await fs.stat(
    new URL("./__scripts__/test_1/workspaces/default/ok", import.meta.url),
  );

  expect(okStat.isFile()).toBeTrue();
});

test("", async () => {
  await fs.rm(new URL("./__scripts__/test_1/workspaces/", import.meta.url), {
    recursive: true,
  });

  const subprocess = await Bun.spawn({
    cmd: [
      process.argv0,
      `${new URL("./__scripts__/test_1/run.ts", import.meta.url).pathname}`,
    ],
    cwd: `${new URL("./__scripts__/test_1/", import.meta.url).pathname}`,
    env: {
      WORKSPACE_LOCATION: `workspaces/`,
    },
    stderr: "inherit",
    stdout: "inherit",
  });

  const exitCode = await subprocess.exited;

  const okStat = await fs.stat(
    new URL("./__scripts__/test_1/workspaces/default/ok", import.meta.url),
  );

  expect(okStat.isFile()).toBeTrue();
});

test("", async () => {
  const workspace = await useWorkspace("foo", {
    cleanBefore: true,
    template: `${new URL("./__examples__/sample1/", import.meta.url)}`,
  });

  expect(
    await fs.readFile(new URL("foo", workspace.location), "utf-8"),
  ).toStartWith("biz");
});
