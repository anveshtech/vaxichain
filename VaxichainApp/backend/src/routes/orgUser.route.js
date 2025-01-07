import express from "express";
import { checkUserAuth } from "../middlewares/auth.middleware.js";
import { blockChainToken } from "../middlewares/blockChainToken.middleware.js";

import {
  editOrgUser,
  getOrganizationUsers,
  getOrgUserById,
  getAssignedDataCollectorUser,
  getAssignedDataVerifierUser,
} from "../controllers/orgUsers.controller.js";
const router = express.Router();

router.get(
  "/getOrgUsers",
  checkUserAuth,
  blockChainToken,
  getOrganizationUsers
);
router.get("/getSingleOrgUser/:id", getOrgUserById);
router.get(
  "/getAssignedDataCollectorUser",
  checkUserAuth,
  getAssignedDataCollectorUser
);
router.get(
  "/getAssignedDataVerifierUser",
  checkUserAuth,
  getAssignedDataVerifierUser
);
router.patch(
  "/editOrgUserDetails/:orguserId",
  checkUserAuth,
  blockChainToken,
  editOrgUser
);
export default router;
