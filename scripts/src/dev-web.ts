import { loadRootEnv } from "./env";
import { runCommand } from "./run-command";

const env = loadRootEnv();

await runCommand("pnpm", ["--filter", "@workspace/journal-app", "run", "dev"], {
  ...process.env,
  API_PORT: env.API_PORT,
  BASE_PATH: env.WEB_BASE_PATH,
  PORT: env.WEB_PORT,
});
