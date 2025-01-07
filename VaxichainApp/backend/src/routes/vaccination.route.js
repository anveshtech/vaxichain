import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
import {
  createVaccination,
  getVaccinationsByChildId,
} from "../controllers/vaccination.controller.js";

const router = express.Router();
router.post("/createVaccination/:childId", checkUserAuth, createVaccination);
router.get("/getVaccination/:childId", checkUserAuth, getVaccinationsByChildId);
export default router;
