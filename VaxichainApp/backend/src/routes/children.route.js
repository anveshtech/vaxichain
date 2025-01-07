import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
import {
  createVaccinationCenterChildren,
  getChildrenById,
  getVaccinationCenterChildren,
  updateVaccinationCenterChild,
} from "../controllers/child.controller.js";
const router = express.Router();
router.post(
  "/createChildren/:vaccinationCenterId",
  checkUserAuth,
  createVaccinationCenterChildren // Controller function
);
router.get(
  "/getChildren/:vaccinationCenterId",
  checkUserAuth,
  getVaccinationCenterChildren // Controller function
);
router.get(
  "/getChildrenById/:vaccinationCenterId/:childId",
  checkUserAuth,
  getChildrenById // Controller function
);
router.patch(
  "/editChildren/:vaccinationCenterId/:childId",
  checkUserAuth,
  updateVaccinationCenterChild // Controller function
);

export default router;
