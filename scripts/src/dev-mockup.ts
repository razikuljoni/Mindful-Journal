import { loadRootEnv } from "./env";
import { runCommand } from "./run-command";

const env = loadRootEnv();

await runCommand(
  "pnpm",
  ["--filter", "@workspace/mockup-sandbox", "run", "dev"],
  {
    ...process.env,
    BASE_PATH: env.MOCKUP_BASE_PATH,
    PORT: env.MOCKUP_PORT,
  },
);
