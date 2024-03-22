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

### Server integration

Includes the ability to launch a local server associated with the workspace for testing and development purposes.

```ts
import { useServer } from "use-workspace/server";

await using server = useServer(workspace);

server.toURL("foo.txt"); // 'https://localhost:3000/foo.txt'
```

**Create server instance**

```ts
await using server = useServer(workspace);
```

**Get url of file**

```ts
server.toURL("foo.txt"); // 'https://localhost:3000/foo.txt'
```

**Custom fetcher**

```ts
await using server = useServer(workspace, {
  fetchers: [(req: Request) => new Response("ok")],
});
```

**Custom URL**

```ts
await using server = useServer(workspace, {
  publicUrl: "https://my-url/with-subpath/",
});
```

## NPM Pack Integration

The `useNpmPack` API provided by the module `"use-workspace/use-npm-pack"` enables the packaging of workspaces for distribution and deployment. The first argument specifies a workspace for a package, and the second argument is an array describing the list of files to observe for changes since the last packaging.

Internally, it executes the `npm pack` command to create a `.tgz` file, allowing it to be used in any other workspace seamlessly.

**Example**

```ts
import {useNpmPack} from "use-workspace/use-npm-pack"

const pack = await useNpmPack(workspace, ["package.json", "src/index.ts",...])
pack // => 'file://.../package.tgz'
```
