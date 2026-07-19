import { Router, type IRouter } from "express";
import healthRouter from "./health";
import promptsRouter from "./prompts";
import entriesRouter from "./entries";
import moodsRouter from "./moods";
import dashboardRouter from "./dashboard";
import breathingSessionsRouter from "./breathing-sessions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(promptsRouter);
router.use(entriesRouter);
router.use(moodsRouter);
router.use(dashboardRouter);
router.use(breathingSessionsRouter);

export default router;
