import { loadRootEnv } from "./env";

const env = loadRootEnv();

console.log("Root environment is ready:");
console.log(`- DATABASE_URL: ${env.DATABASE_URL}`);
console.log(`- API_PORT: ${env.API_PORT}`);
console.log(`- WEB_PORT: ${env.WEB_PORT}`);
console.log(`- MOCKUP_PORT: ${env.MOCKUP_PORT}`);
console.log(`- WEB_BASE_PATH: ${env.WEB_BASE_PATH}`);
console.log(`- MOCKUP_BASE_PATH: ${env.MOCKUP_BASE_PATH}`);
console.log(`- LOG_LEVEL: ${env.LOG_LEVEL}`);
