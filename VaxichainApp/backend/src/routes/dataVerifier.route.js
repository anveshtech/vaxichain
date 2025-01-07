import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";
import {
  editDataVerifierInfo,
  getDataVerifierById,
} from "../controllers/dataVerifier.controller.js";
const router = express.Router();

router.patch(
  "/editDataVerifierDetails/:dataverifierId",
  checkUserAuth,
  blockChainToken,
  editDataVerifierInfo
);
router.get("/getSingleDataVerifier/:id", getDataVerifierById);
export default router;
