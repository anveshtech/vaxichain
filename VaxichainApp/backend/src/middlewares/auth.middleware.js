import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";
import { UserModel } from "../models/user.model.js";
import { OrgUserModel } from "../models/orgUser.model.js";

// const checkUserAuth = async (req, _, next) => {
//   try {
//     const token = req.headers["authorization"]?.split(" ")[1];

//     if (!token) {
//       throw new ApiError(401, "unauthorized request");
//     }

//     let decodedToken;

//     try {
//       decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//     } catch (error) {
//       error.statusCode = 401;
//       error.data = null;
//       error.success = false;
//       error.name = "jwt error";
//       next(error);
//     }

//     const user = await UserModel.findOne({ _id: decodedToken?._id }).select(
//       "-__v -refreshToken -password"
//     );

//     if (!user) {
//       throw new ApiError(401, "unauthorized request");
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     if (!error.message) {
//       error.message = "something went wrong while authenticating";
//     }
//     next(error);
//   }
// };

const checkUserAuth = async (req, _, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Unauthorized request: No token provided");
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "JWT Error";
      return next(error);
    }

    // Try finding the user in UserModel first
    let user = await UserModel.findOne({ _id: decodedToken?._id }).select(
      "-__v -refreshToken -password"
    );

    // If not found, try OrgUserModel
    if (!user) {
      user = await OrgUserModel.findOne({ _id: decodedToken?._id }).select(
        "-__v -refreshToken -password"
      );
    }

    if (!user) {
      throw new ApiError(401, "Unauthorized request: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while authenticating";
    }
    next(error);
  }
};

const checkSuperAdmin = async (req, _, next) => {
  try {
    if (req.user?.userType !== process.env.USER_TYPE_SUPER_ADMIN) {
      throw new ApiError(401, "unauthorized request, you're not an admin");
    }

    next();
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while authenticating";
    }
    next(error);
  }
};

const checkCompany = async (req, _, next) => {
  try {
    if (req.user?.userType !== process.env.USER_TYPE_COMPANY) {
      throw new ApiError(401, "unauthorized request, you're not a company");
    }

    if (req.user?.status !== process.env.USER_STATUS_VERIFIED) {
      throw new ApiError(
        401,
        "unverified user, please wait until verification"
      );
    }

    next();
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while authenticating";
    }
    next(error);
  }
};

const checkRetailer = async (req, _, next) => {
  try {
    if (req.user?.userType !== process.env.USER_TYPE_RETAILER) {
      throw new ApiError(
        401,
        "unauthorized request, you're not an admin or a retailer"
      );
    }

    if (req.user?.status !== process.env.USER_STATUS_VERIFIED) {
      throw new ApiError(
        401,
        "unverified user, please wait until verification"
      );
    }

    next();
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while authenticating";
    }
    next(error);
  }
};

export { checkUserAuth, checkSuperAdmin, checkCompany, checkRetailer };
