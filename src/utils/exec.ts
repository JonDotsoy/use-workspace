import { URL } from "url";
import { spawn } from "child_process";
import { MultiplyStream } from "streamable-tools/multiply-stream";
import { SplitStream } from "streamable-tools/split-stream";
import { readableStreamWithController } from "streamable-tools/readable-stream-with-controller";

type ExecOptions = {
  cmd: string[];
  cwd?: URL;
};

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

class LoggerOutput {
  // readable = new ReadableStream<Uint8Array>();
  writable = new WritableStream<Uint8Array>({
    write: (chunk) => {
      const txt = new TextDecoder().decode(chunk.filter((c) => !!c)).trim();
      if (!txt.length) return;
      process.stdout.write(`> ${txt}\n`);
    },
  });
}

export const exec = async (options: ExecOptions) => {
  const [command, ...args] = options.cmd;
  const cwd = options?.cwd;
  const exitCodePromise = Promise.withResolvers<number | null>();
  const { readable: stdout, controller: stdoutController } =
    readableStreamWithController<Uint8Array>();
  const { readable: stderr, controller: stderrController } =
    readableStreamWithController<Uint8Array>();

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

  const loggerStdout = new SplitStream();
  const loggerStderr = new SplitStream();

  loggerStdout.readable.pipeTo(new LoggerOutput().writable);
  loggerStderr.readable.pipeTo(new LoggerOutput().writable);

  return new ChildProcess(
    exitCode,
    stdout.pipeThrough(new MultiplyStream(loggerStdout)),
    stderr.pipeThrough(new MultiplyStream(loggerStderr)),
  );
};
