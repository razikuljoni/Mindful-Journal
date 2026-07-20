import { loadRootEnv } from "./env";
import { runCommand } from "./run-command";

const env = loadRootEnv();

await runCommand("pnpm", ["--filter", "@workspace/db", "run", "push"], {
  ...process.env,
  DATABASE_URL: env.DATABASE_URL,
});
