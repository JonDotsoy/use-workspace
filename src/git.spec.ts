import { test, expect } from "bun:test";
import { useWorkspace } from "./use-workspace.js";
import { useGit } from "./git.js";
import fs from "fs/promises";

test("should call useGit expected the .git folder (workspace foo)", async () => {
  const workspace = await useWorkspace("foo", { cleanBefore: true });
  await useGit(workspace);

  expect(await fs.readdir(workspace.location)).toMatchSnapshot(
    "list workspace",
  );
});

test("should call useGit expected the .git folder (workspace foo2)", async () => {
  const workspace = await useWorkspace("foo2");
  const git = await useGit(workspace);

  await git.config.set("aa.bb", "cc");
  await git.config.set("aa.dd", "ee\n");

  expect(await git.config.get("aa.bb")).toEqual("cc");
  expect(await git.config.get("aa.dd")).toEqual("ee\n");

  expect(
    await fs.readFile(new URL(".git/config", workspace.location), "utf-8"),
  ).toMatchSnapshot("list workspace");
});
