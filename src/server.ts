import { createServer, Server, IncomingMessage, ServerResponse } from "http";
import net from "net";
import type { Workspace } from "./use-workspace";
import fs from "fs/promises";

type Fetcher = (request: Request) => Promise<Response | null> | Response | null;

type UseServerOptions = {
  publicUrl?: string,
  port?: number;
  fetchers?: Fetcher[];
};

type ErrorWithCode = Error & { code: unknown };
const isErrorWithCode = (value: unknown): value is ErrorWithCode =>
  value instanceof Error && Reflect.has(value, "code");

class SafetyPort {
  private startPort: number = 22765;

  async findPort() {
    while (true) {
      const port = await this.nextPort();
      if (port == null) continue;
      return port;
    }
    throw new Error("Cannot found port enabled");
  }

  nextPort() {
    const { promise, resolve, reject } = Promise.withResolvers<number | null>();
    const port = this.startPort++;
    if (port > SafetyPort.MAX_PORT_ABLE)
      throw new Error("Limit port to check is exceded");
    const socket = new net.Socket();
    socket.addListener("timeout", () => {
      return resolve(null);
    });
    socket.addListener("error", (err) => {
      if (isErrorWithCode(err)) {
        if (err.code === "ECONNREFUSED") return resolve(port);
      }
      return reject(err);
    });
    socket.addListener("connect", () => {
      socket.end();
      return resolve(null);
    });
    socket.connect(port, "0.0.0.0");
    return promise;
  }

  static MAX_PORT_ABLE = 30000;
}

class UseServer {
  server: Server<typeof IncomingMessage, typeof ServerResponse>;
  private fetchers: Fetcher[] = [];

  private constructor(
    readonly workspace: Workspace,
    private port?: number,
    fetchers?: Fetcher[],
    private publicUrl?: string,
  ) {
    this.fetchers = [this.workspaceFetcher, ...(fetchers ?? [])];

    this.server = createServer(async (req, res) => {
      try {
        const response = await this.fetcher(this.incomingMessageToRequest(req));
        res.statusCode = response.status;
        res.statusMessage = response.statusText;
        response.headers.forEach((value, key) => {
          res.appendHeader(key, value);
        });
        res.write(Buffer.from(await response.arrayBuffer()));
        res.end();
      } catch (ex) {
        console.error(ex);
        res.statusCode = 500;
        res.end();
      }
    });
  }

  private workspaceFetcher: Fetcher = async (req) => {
    const filePath = new URL(`.${new URL(req.url).pathname}`, this.workspace.location);
    const exists = await fs.exists(filePath)
    if (exists) {
      const stat = await fs.stat(filePath)
      if (stat.isFile()) {
        return new Response(new Uint8Array(await fs.readFile(filePath)))
      }
    }
    return null;
  };

  private incomingMessageToRequest = (incomingMessage: IncomingMessage) => {
    const headers = new Headers();

    for (const [key, value] of Object.entries(incomingMessage.headers)) {
      const values =
        value === undefined ? [] : Array.isArray(value) ? value : [value];
      for (const value of values) {
        headers.append(key, value);
      }
    }

    return new Request(
      new URL(incomingMessage.url ?? "/", this.getServerURL()),
    );
  };

  getServerURL() {
    const address = this.server.address();
    if (address === null) throw new Error("Server is not ready");
    if (typeof address === "string") return new URL(address);
    return new URL(`http://localhost:${address.port}/`);
  }

  toURL(relativePath: string) {
    return new URL(relativePath, this.publicUrl ?? this.getServerURL());
  }

  private async fetcher(req: Request) {
    for (const fetcher of this.fetchers) {
      const res = await fetcher(req);
      if (res) return res;
    }
    return new Response(`Cannot found`, { status: 404 });
  }

  private async closeServer() {
    const { promise, resolve, reject } = Promise.withResolvers<void>();
    this.server?.close((err) => (err ? reject(err) : resolve())) ?? resolve();
    await promise;
  }

  async [Symbol.asyncDispose]() {
    await this.closeServer();
  }

  private async setup() {
    const { promise, resolve, reject } = Promise.withResolvers();
    this.server.addListener("error", reject);
    this.server.listen(
      {
        port: this.port,
      },
      () => {
        resolve();
      },
    );
    await promise;
    return this;
  }

  static createServer = async (
    workspace: Workspace,
    options?: UseServerOptions,
  ) => {
    return new UseServer(
      workspace,
      options?.port ?? (await UseServer.safetyPort.findPort()),
      options?.fetchers,
      options?.publicUrl,
    ).setup();
  };

  static safetyPort = new SafetyPort();
}

export const useServer = (workspace: Workspace, options?: UseServerOptions) =>
  UseServer.createServer(workspace, options);
