import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import {
  createVaccinationCenter,
  getVaccinationCenter,
  getVaccinationCenterById,
  editVaccinationCenter,
  getVaccinationCenterForDataCollectorUser,
} from "../controllers/vaccinationCenter.controller.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
const router = express.Router();

router.post(
  "/createVaccinationCenters",
  checkUserAuth,
  blockChainToken,
  createVaccinationCenter
);
router.get(
  "/getVaccinationCenter",
  checkUserAuth,
  // blockChainToken,
  getVaccinationCenter
);
router.get(
  "/getAssignedVacciantionCenter",
  checkUserAuth,
  getVaccinationCenterForDataCollectorUser
);
router.get("/getVaccinationCenterById/:id", getVaccinationCenterById);
router.patch(
  "/editVaccinationCenter/:vaccinationCenterId",
  editVaccinationCenter
);

export default router;
