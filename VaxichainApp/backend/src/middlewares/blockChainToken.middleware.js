import { ApiError } from "../utils/ApiError.js";
import axios from "axios";

export const blockChainToken = async (req, res, next) => {
  try {
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    const { firstName, _id, userType, companyName } = req.user;
    console.log("the user for fetching blockChainToken is", req.user);
    if (!firstName || !_id) {
      throw new ApiError(400, "Missing required user information");
    }
    const formattedUserType =
      userType === "super-admin"
        ? "Superadmin"
        : userType.charAt(0) + userType.slice(1);

    const payload = {
      userid: _id,
      orgName: formattedUserType,
      companyName: companyName,
    };

    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_TOKEN}/users/token`,
      payload
    );

    const blockChainToken = response.data?.message?.token;
    if (!blockChainToken) {
      throw new ApiError(500, "Token not received from blockchain API");
    }

    req.blockChainToken = blockChainToken;
    console.log("bc token from middleware", req.blockChainToken);

    next();
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while calling the user token API";
    }
    next(error);
  }
};
