import { loadRootEnv } from "./env";
import { runCommand } from "./run-command";

const env = loadRootEnv();

await runCommand(
  "pnpm",
  ["--filter", "@workspace/api-server", "run", "build"],
  {
    ...process.env,
    DATABASE_URL: env.DATABASE_URL,
    LOG_LEVEL: env.LOG_LEVEL,
    NODE_ENV: process.env.NODE_ENV ?? "production",
  },
);

await runCommand(
  "pnpm",
  ["--filter", "@workspace/journal-app", "run", "build"],
  {
    ...process.env,
    BASE_PATH: env.WEB_BASE_PATH,
    PORT: env.WEB_PORT,
  },
);

await runCommand(
  "pnpm",
  ["--filter", "@workspace/mockup-sandbox", "run", "build"],
  {
    ...process.env,
    BASE_PATH: env.MOCKUP_BASE_PATH,
    PORT: env.MOCKUP_PORT,
  },
);
