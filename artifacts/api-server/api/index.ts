import { type VercelRequest, type VercelResponse } from "@vercel/node";
import app from "../src/app.js";

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Express apps work with @vercel/node automatically
  // The adapter converts Vercel request/response to Express
  return app(req as any, res as any);
}