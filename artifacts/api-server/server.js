/**
 * Vercel server entrypoint.
 *
 * Vercel detects server entrypoints in the project root by looking for
 * files that call `listen()` during module startup. Once detected, ALL
 * incoming requests are routed through this server — no additional
 * `routes` / `rewrites` config is needed because Express already
 * handles `/api/*` natively.
 */
import app from "./dist/vercel.mjs";

const port = process.env.PORT || 3000;

app.listen(port);
