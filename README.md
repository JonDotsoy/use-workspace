# use-workspace

`use-workspace` is a set of tools designed to facilitate the creation, configuration, and maintenance of workspaces for development projects. It provides a simple API for managing directories, files, and configurations related to the development environment.

**Sample:**

```ts
import { useWorkspace } from "use-workspace";
import { useGit } from "use-workspace/git";

const workspace = await useWorkspace("foo");

workspace.toURL(); // 'file://$WORKSPACE_LOCATION/foo/'
workspace.toURL("biz.txt"); // 'file://$WORKSPACE_LOCATION/foo/biz.txt'

// $ ls $WORKSPACE_LOCATION/foo/
// .gitignore

const git = await useGit(workspace);
// $ ls $WORKSPACE_LOCATION/foo/
// .git/
// .gitignore

await git.config.set("taz.bar", "Bar");
await git.config.get("taz.bar"); // => "Bar"
```

### Git integration

Allows for easy initialization of Git repositories within the workspace and their configuration.

```ts
import { useGit } from "use-workspace/git";

const git = await useGit(workspace);

const editor = await git.config.get("core.editor");

expect(editor).toEqual("vim");
```

### Server

Includes the ability to launch a local server associated with the workspace for testing and development purposes.

```ts
import { useServer } from "use-workspace/server";

await using server = useServer(workspace);

server.toURL("foo.txt"); // 'https://localhost:3000/foo.txt'
```
