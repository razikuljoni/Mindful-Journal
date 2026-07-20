import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

type RootEnv = {
  DATABASE_URL: string;
  API_PORT: string;
  WEB_PORT: string;
  MOCKUP_PORT: string;
  WEB_BASE_PATH: string;
  MOCKUP_BASE_PATH: string;
  LOG_LEVEL: string;
};

const DEFAULT_ENV = {
  API_PORT: "3001",
  WEB_PORT: "5173",
  MOCKUP_PORT: "4173",
  WEB_BASE_PATH: "/",
  MOCKUP_BASE_PATH: "/",
  LOG_LEVEL: "info",
} satisfies Omit<RootEnv, "DATABASE_URL">;

export function getRepoRoot(): string {
  const currentFile = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), "../..");
}

function parseEnvLine(line: string): [string, string] | null {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith("#")) {
    return null;
  }

  const normalized = trimmed.startsWith("export ") ? trimmed.slice(7) : trimmed;
  const separator = normalized.indexOf("=");

  if (separator <= 0) {
    return null;
  }

  const key = normalized.slice(0, separator).trim();
  const rawValue = normalized.slice(separator + 1).trim();
  const value = rawValue.replace(/^(["'])(.*)\1$/, "$2");

  return [key, value];
}

function readRootDotEnv(): Record<string, string> {
  const envPath = path.join(getRepoRoot(), ".env");

  if (!fs.existsSync(envPath)) {
    return {};
  }

  const fileContent = fs.readFileSync(envPath, "utf8");
  const entries = fileContent
    .split(/\r?\n/)
    .map(parseEnvLine)
    .filter((entry): entry is [string, string] => entry !== null);

  return Object.fromEntries(entries);
}

export function loadRootEnv(): RootEnv {
  const fileEnv = readRootDotEnv();
  const merged = {
    ...DEFAULT_ENV,
    ...fileEnv,
    ...process.env,
  } as Partial<RootEnv>;

  if (!merged.DATABASE_URL || !merged.DATABASE_URL.trim()) {
    throw new Error(
      "DATABASE_URL is required. Copy .env.example to .env and update the database connection before running root scripts.",
    );
  }

  return {
    DATABASE_URL: merged.DATABASE_URL,
    API_PORT: merged.API_PORT ?? DEFAULT_ENV.API_PORT,
    WEB_PORT: merged.WEB_PORT ?? DEFAULT_ENV.WEB_PORT,
    MOCKUP_PORT: merged.MOCKUP_PORT ?? DEFAULT_ENV.MOCKUP_PORT,
    WEB_BASE_PATH: merged.WEB_BASE_PATH ?? DEFAULT_ENV.WEB_BASE_PATH,
    MOCKUP_BASE_PATH: merged.MOCKUP_BASE_PATH ?? DEFAULT_ENV.MOCKUP_BASE_PATH,
    LOG_LEVEL: merged.LOG_LEVEL ?? DEFAULT_ENV.LOG_LEVEL,
  };
}
