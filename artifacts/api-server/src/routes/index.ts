import { Router, type IRouter } from "express";
import healthRouter from "./health";
import promptsRouter from "./prompts";
import entriesRouter from "./entries";
import moodsRouter from "./moods";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(promptsRouter);
router.use(entriesRouter);
router.use(moodsRouter);
router.use(dashboardRouter);

export default router;
