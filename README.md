# use-workspace

Set of tools to make a workspace.

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
