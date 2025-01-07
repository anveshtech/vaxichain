import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";

import {
  getDataCollectorById,
  editDataCollectorInfo,
} from "../controllers/dataCollector.controller.js";
const router = express.Router();
router.patch(
  "/editDataCollectorDetails/:datacollectorId",
  checkUserAuth,
  blockChainToken,
  editDataCollectorInfo
);

router.get("/getSingleDataCollector/:id", getDataCollectorById);
export default router;
