import { URL } from "url";
import { spawn } from "child_process";

type ExecOptions = {
  cmd: string[];
  cwd?: URL;
};

class ReadableControl {
  private constructor(
    readonly readable: ReadableStream<Uint8Array>,
    readonly controller: ReadableStreamDefaultController<Uint8Array>,
  ) {}

  static async withController() {
    const controllerResolver =
      Promise.withResolvers<ReadableStreamDefaultController<Uint8Array>>();
    const readable = await new ReadableStream<Uint8Array>({
      start: (controller) => {
        controllerResolver.resolve(controller);
      },
    });
    const controller = await controllerResolver.promise;
    return new ReadableControl(readable, controller);
  }
}

export class ChildProcess {
  constructor(
    readonly exitCode: number | null,
    readonly stdout: ReadableStream<Uint8Array>,
    readonly stderr: ReadableStream<Uint8Array>,
  ) {}

  async toText() {
    const stdoutList = await Array.fromAsync(this.stdout);
    const payload = new Uint8Array(stdoutList.flatMap((b) => [...b]));
    return new TextDecoder().decode(payload.slice(0, payload.indexOf(0)));
  }
}

export const exec = async (options: ExecOptions) => {
  const [command, ...args] = options.cmd;
  const cwd = options?.cwd;
  const exitCodePromise = Promise.withResolvers<number | null>();
  const { readable: stdout, controller: stdoutController } =
    await ReadableControl.withController();
  const { readable: stderr, controller: stderrController } =
    await ReadableControl.withController();

  const childProcess = spawn(command, args, {
    cwd,
    stdio: ["pipe", "pipe", "pipe"],
  });

  childProcess.addListener("close", (exitCode) =>
    exitCodePromise.resolve(exitCode),
  );

  childProcess.stdout.addListener("data", (data) => {
    stdoutController.enqueue(new Uint8Array(data));
  });
  childProcess.stderr.addListener("data", (data) => {
    stderrController.enqueue(new Uint8Array(data));
  });
  childProcess.stdout.addListener("close", () => {
    stdoutController.close();
  });
  childProcess.stderr.addListener("close", () => {
    stderrController.close();
  });

  const exitCode = await exitCodePromise.promise;

  return new ChildProcess(exitCode, stdout, stderr);
};
