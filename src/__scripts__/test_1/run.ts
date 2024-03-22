import { useWorkspace } from "../../use-workspace.js";
import fs from "fs/promises";

const workspace = await useWorkspace();
await fs.writeFile(new URL(`ok`, workspace.location), "ok");
