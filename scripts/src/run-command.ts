import { spawn } from "node:child_process";

export async function runCommand(
  command: string,
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env,
      shell: false,
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} exited from signal ${signal}`));
        return;
      }

      if (code && code !== 0) {
        reject(
          new Error(`${command} ${args.join(" ")} exited with code ${code}`),
        );
        return;
      }

      resolve();
    });
  });
}
