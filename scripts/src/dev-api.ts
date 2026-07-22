import { loadRootEnv } from "./env";
import { runCommand } from "./run-command";

const env = loadRootEnv();

await runCommand("pnpm", ["--filter", "@workspace/api-server", "run", "dev"], {
  ...process.env,
  DATABASE_URL: env.DATABASE_URL,
  LOG_LEVEL: env.LOG_LEVEL,
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: env.API_PORT,
});
