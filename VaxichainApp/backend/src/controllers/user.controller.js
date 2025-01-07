import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";

import { sendBulkEmail } from "../middlewares/sendEmail.middleware.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import { OrgUserModel } from "../models/orgUser.model.js";
import crypto from "crypto";
import axios from "axios";

const userTypes = () => [
  process.env.USER_TYPE_DATACOLLECTOR,
  process.env.USER_TYPE_DATAVERIFIER,
];
const userStatus = () => [
  process.env.USER_STATUS_PENDING,
  process.env.USER_STATUS_VERIFIED,
  process.env.USER_STATUS_DECLINED,
];

// const generateRefreshAndAccessToken = async (userId) => {
//   try {
//     const user = await UserModel.findOne({ _id: userId });
//     const refreshToken = user.generateRefreshToken();
//     const accessToken = user.generateAccessToken();

//     user.refreshToken = refreshToken;
//     await user.save({ validateBeforeSave: false });

//     return { refreshToken, accessToken };
//   } catch (error) {
//     if (!error.message) {
//       error.message =
//         "something went wrong while generating refresh and access tokens";
//     }
//     next(error);
//   }
// };
const generateRefreshAndAccessToken = async (userId, userModel) => {
  try {
    console.log("Generating tokens for User ID:", userId);

    const user = await userModel.findOne({ _id: userId });

    if (!user) {
      throw new ApiError(404, "User not found while generating tokens");
    }

    console.log("User Found for Token Generation:", user);

    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    console.error("Error in generateRefreshAndAccessToken:", error);
    if (!error.message) {
      error.message =
        "Something went wrong while generating refresh and access tokens";
    }
    throw error; // Ensure error bubbles up to the caller
  }
};

const userSignup = async (req, res, next) => {
  try {
    const acceptableUserTypes = userTypes();
    const acceptableUserStatus = userStatus();

    const {
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      companyName,
      status,
      remarks,
      address,
    } = req.body;

    console.log(
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      userType,
      companyName
    );

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNumber ||
      !userType ||
      !companyName
    ) {
      throw new ApiError(400, "Required Fields Empty");
    }

    if (status) {
      if (
        !acceptableUserStatus.some(
          (eachAccepatbleStatus) =>
            status.toLowerCase() === eachAccepatbleStatus
        )
      ) {
        throw new ApiError(406, "user status unacceptable");
      }
    }

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      throw new ApiError(409, "user already exists with the provided email");
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userFields = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      userType,
      companyName,
      address,
      status,
      remarks,
    };

    const savedUser = await UserModel.create(userFields);
    const recentlySavedUser = await UserModel.findOne({
      _id: savedUser._id,
    }).select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(201, recentlySavedUser, "user signed up successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while creating user";
    }
    next(error);
  }
};

// const userSignin = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const existingUser = await UserModel.findOne({ email: email });

//     if (!existingUser) {
//       throw new ApiError(404, "User doesn't exist");
//     }

//     const passwordMatch = await bcrypt.compare(password, existingUser.password);

//     if (!passwordMatch) {
//       throw new ApiError(401, "Email or Password does not match");
//     }
//     if (
//       existingUser.userType === "dataCollector" &&
//       existingUser.status !== "enabled"
//     ) {
//       throw new ApiError(403, " User must be enabled to sign in");
//     }
//     if (
//       existingUser.userType === "dataVerifier" &&
//       existingUser.status !== "enabled"
//     ) {
//       throw new ApiError(403, " User must be enabled to sign in");
//     }

//     const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
//       existingUser._id
//     );

//     const signedInUser = await UserModel.findOne({
//       _id: existingUser._id,
//     }).select("-__v -password -refreshToken");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(
//           200,
//           { user: signedInUser, refreshToken, accessToken },
//           "User logged in successfully"
//         )
//       );
//   } catch (error) {
//     if (!error.message) {
//       error.message = "Something went wrong while signing user in";
//     }
//     next(error);
//   }
// };

const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    let existingUser = await UserModel.findOne({ email: email });

    // If not found in UserModel, check OrgUserModel
    const isOrgUser = !existingUser;
    if (isOrgUser) {
      existingUser = await OrgUserModel.findOne({ email: email });
    }

    if (!existingUser) {
      throw new ApiError(404, "User doesn't exist");
    }

    // Validate password
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      throw new ApiError(401, "Email or Password does not match");
    }

    // Check user status (if the field exists)
    if (existingUser.status && existingUser.status !== "enabled") {
      throw new ApiError(403, "User must be enabled to sign in");
    }

    // Generate tokens with the appropriate model
    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
      existingUser._id,
      isOrgUser ? OrgUserModel : UserModel
    );

    // Fetch the signed-in user without sensitive fields
    const signedInUser = await (isOrgUser ? OrgUserModel : UserModel)
      .findOne({ _id: existingUser._id })
      .select("-__v -password -refreshToken");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { user: signedInUser, refreshToken, accessToken },
          "User logged in successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while signing user in";
    }
    next(error);
  }
};

const userSignout = async (req, res, next) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "unauthorized request");
    }

    let decodedToken;

    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "jwt error";
      next(error);
    }

    await UserModel.findOneAndUpdate(
      { _id: decodedToken._id },
      {
        $unset: {
          refreshToken: 1,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "user signed out successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while signing user out";
    }
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(401, "unauthorized request");
    }

    const users = await UserModel.aggregate([
      {
        $group: {
          _id: "$userType",
          count: {
            $sum: 1,
          },
        },
      },
      {},
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, users, "users fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users";
    }
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const status = req.user.status;
    if (status === "disabled") {
      throw new ApiError(401, "Unauthorized request");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, req.user, "user fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching current user";
    }
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching users";
    }
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.body.refreshToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    let decodedRefreshToken;

    try {
      decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (error) {
      error.statusCode = 401;
      error.data = null;
      error.success = false;
      error.name = "jwt error";
      next(error);
    }

    const user = await UserModel.findOne({ _id: decodedRefreshToken?._id });

    if (!user) {
      throw new ApiError(404, "unknown user");
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "unauthorized request");
    }

    const { refreshToken: newRefreshToken, accessToken } =
      await generateRefreshAndAccessToken(user?._id);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "token refreshed successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while generating access token";
    }
    next(error);
  }
};
/* 
//orginal without hash code
const getCompanies = async (req, res, next) => { 
  try {
    const companies = await UserModel.find({ userType: "company" }).select(
      "-__v -password -refreshToken"
    );
    return res
      .status(200)
      .json(new ApiResponse(200, companies, "companies fetched successfully"));
  } catch (error) {
    if (!error.message) {
      error.message = "something went wrong while fetching companies";
    }
    next(error);
  }
};
*/

const getCompanyIds = async (req, res, next) => {
  try {
    const companyIds = await UserModel.find({ userType: "company" }).select(
      "_id"
    );
    const ids = companyIds.map((company) => company._id);

    // If called via an HTTP request, send a response
    if (res && req) {
      return res.status(200).json({
        status: 200,
        message: "Company IDs fetched successfully",
        data: ids,
      });
    }

    // If called programmatically, just return the IDs
    return ids;
  } catch (error) {
    if (!error.message) {
      error.message = "Failed to fetch company IDs";
    }
    if (next) next(error);
    throw error; // Rethrow error for programmatic use
  }
};

const getDataVerifiers = async (req, res, next) => {
  const blockChainToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MzU5MzAyNTUsInVzZXJpZCI6IjY3NmU4MzZmYzM5NDM1YWViN2QzMzYyNSIsIm9yZ05hbWUiOiJkYXRhVmVyaWZpZXIiLCJjb21wYW55TmFtZSI6IkJzZXNQcm9kIiwiaWF0IjoxNzM1ODk0MjU1fQ.3iu5DyFkQ3rnZ55cON4gxh0qTBbzkL96gF0gww_opSk";
  if (!blockChainToken) {
    throw new ApiError(401, "Authorization token of blockchain not found");
  }
  console.log(
    "=================Starting getDataVerifiers controller========================"
  );

  try {
    const verifiers = await UserModel.find({ userType: "dataVerifier" })
      .sort({ createdAt: -1 })
      .lean();

    if (!verifiers || verifiers.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No verifiers found",
      });
    }

    // Transform all companies into the desired format
    const transformedVerifiers = verifiers.map((verifier) => ({
      id: verifier._id.toString(),
      address: {
        zip: verifier.address?.zip || null,
        city: verifier.address?.city || null,
        country: verifier.address?.country || null,
        addressLine: verifier.address?.addressLine || null,
      },
      firstName: verifier.firstName,
      lastName: verifier.lastName,
      email: verifier.email,
      password: verifier.password,
      phoneNumber: verifier.phoneNumber,
      userType: verifier.userType,
      productType: verifier.productType,
      companyName: verifier.companyName,
      status: verifier.status,

      profilePic: verifier.profilePic || "http://example.com/logo.png",
      remarks: verifier.remarks,
      createdAt: verifier.createdAt.toISOString(),
    }));

    const hashedVerifiers = transformedVerifiers.map((verifier) => {
      const verifierForHashing = { ...verifier };
      delete verifierForHashing.hash; // Exclude any pre-existing hash field (if present)

      const verifierString = JSON.stringify(verifierForHashing);
      const hash = crypto
        .createHash("sha256")
        .update(verifierString)
        .digest("hex");

      return { ...verifier, hash }; // Append hash to the company object
    });

    const verifierIds = hashedVerifiers.map((verifier) => verifier.id);

    try {
      const payload = {
        fcn: "GetCompanyWithHash",
        args: verifierIds,
      };

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${blockChainToken}`,
          },
        }
      );

      if (
        response.data &&
        response.data.result &&
        response.data.result.result
      ) {
        const apiHashes = response.data.result.result;

        // Compare generated hashes with API hashes
        const comparisonResults = hashedVerifiers.map((verifier) => {
          const apiVerifier = apiHashes.find(
            (apiHash) => apiHash.id === verifier.id
          );

          if (apiVerifier) {
            let blockChainVerified;
            if (apiVerifier.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified = apiVerifier.blockHash === verifier.hash;
            }

            return {
              verifierId: verifier.id,
              blockChainVerified,
              generatedHash: verifier.hash,
              companyName: verifier.companyName,
              apiHash: apiVerifier.blockHash,
            };
          } else {
            return {
              verifierId: verifier.id,
              blockChainVerified: false, // Default to false if not found
              generatedHash: verifier.hash,
              companyName: verifier.companyName,
              apiHash: null,
            };
          }
        });

        console.log("Comparison Results:", comparisonResults);

        // Add `blockChainVerified` to the transformed companies
        const verifiersWithBlockchainVerification = comparisonResults.map(
          (result) => {
            const verifier = hashedVerifiers.find(
              (veri) => veri.id === result.verifierId
            );
            return {
              ...verifier,
              blockChainVerified: result.blockChainVerified,
            };
          }
        );

        return res.status(200).json({
          status: 200,
          message: "Verfiers fetched successfully",
          data: verifiersWithBlockchainVerification,
        });
      }
    } catch (err) {
      console.error("Error sending request:", err.message);
    }

    return res.status(200).json({
      status: 200,
      message: "Verifiers fetched successfully",
      data: hashedVerifiers.map((verifier) => ({
        ...verifier,
        blockChainVerified: false, // Default to false if the comparison isn't successful
      })),
    });
  } catch (error) {
    console.error("Error fetching verifiers:", error.message);
    next(error);
  }
};
// const getDataCollectors = async (req, res, next) => {
//   const blockChainToken = "asdzxcxzcasd";
//   if (!blockChainToken) {
//     throw new ApiError(401, "Authorization token of blockchain not found");
//   }
//   console.log(
//     "=================Starting getDataCollectors controller========================"
//   );

//   try {
//     const collectors = await UserModel.find({ userType: "datacollector" })
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!collectors || collectors.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         message: "No collectors found",
//       });
//     }

//     // Transform all companies into the desired format
//     const transformedCollectors = collectors.map((collector) => ({
//       id: collector._id.toString(),
//       address: {
//         zip: collector.address?.zip || null,
//         city: collector.address?.city || null,
//         country: collector.address?.country || null,
//         addressLine: collector.address?.addressLine || null,
//       },
//       firstName: collector.firstName,
//       lastName: collector.lastName,
//       email: collector.email,
//       password: collector.password,
//       phoneNumber: collector.phoneNumber,
//       userType: collector.userType,
//       productType: collector.productType,
//       companyName: collector.companyName,
//       status: collector.status,

//       profilePic: collector.profilePic || "http://example.com/logo.png",
//       remarks: collector.remarks,
//       createdAt: collector.createdAt.toISOString(),
//     }));

//     const hashedCollectors = transformedCollectors.map((collector) => {
//       const collectorForHashing = { ...collector };
//       delete collectorForHashing.hash; // Exclude any pre-existing hash field (if present)

//       const collectorString = JSON.stringify(collectorForHashing);
//       const hash = crypto
//         .createHash("sha256")
//         .update(collectorString)
//         .digest("hex");

//       return { ...collector, hash };
//     });

//     const collectorIds = hashedCollectors.map((collector) => collector.id);

//     try {
//       const payload = {
//         fcn: "GetCompanyWithHash",
//         args: collectorIds,
//       };

//       const response = await axios.post(
//         `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${blockChainToken}`,
//           },
//         }
//       );

//       if (
//         response.data &&
//         response.data.result &&
//         response.data.result.result
//       ) {
//         const apiHashes = response.data.result.result;

//         // Compare generated hashes with API hashes
//         const comparisonResults = hashedCollectors.map((collector) => {
//           const apiCollector = apiHashes.find(
//             (apiHash) => apiHash.id === collector.id
//           );

//           if (apiCollector) {
//             let blockChainVerified;
//             if (apiCollector.blockHash.trim().toLowerCase() === "pending") {
//               blockChainVerified = "pending";
//             } else {
//               blockChainVerified = apiCollector.blockHash === collector.hash;
//             }

//             return {
//               collectorId: collector.id,
//               blockChainVerified,
//               generatedHash: collector.hash,
//               companyName: collector.companyName,
//               apiHash: apiCollector.blockHash,
//             };
//           } else {
//             return {
//               collectorId: collector.id,
//               blockChainVerified: false, // Default to false if not found
//               generatedHash: collector.hash,
//               companyName: collector.companyName,
//               apiHash: null,
//             };
//           }
//         });

//         console.log("Comparison Results:", comparisonResults);

//         // Add `blockChainVerified` to the transformed companies
//         const collectorsWithVerification = comparisonResults.map((result) => {
//           const collector = hashedCollectors.find(
//             (coll) => coll.id === result.collectorId
//           );
//           return {
//             ...collector,
//             blockChainVerified: result.blockChainVerified,
//           };
//         });

//         return res.status(200).json({
//           status: 200,
//           message: "Collectors fetched successfully",
//           data: collectorsWithVerification,
//         });
//       }
//     } catch (err) {
//       console.error("Error sending request:", err.message);
//     }

//     return res.status(200).json({
//       status: 200,
//       message: "Collectors fetched successfully",
//       data: hashedCollectors.map((collector) => ({
//         ...collector,
//         blockChainVerified: false, // Default to false if the comparison isn't successful
//       })),
//     });
//   } catch (error) {
//     console.error("Error fetching collectors:", error.message);
//     next(error);
//   }
// };

const getDataCollectors = async (req, res, next) => {
  console.log(
    "=================Starting getDataCollectors controller========================"
  );

  try {
    const collectors = await UserModel.find({ userType: "dataCollector" })
      .sort({ createdAt: -1 })
      .lean();

    if (!collectors || collectors.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No collectors found",
      });
    }

    // Transform all companies into the desired format
    const transformedCollectors = collectors.map((collector) => ({
      id: collector._id.toString(),
      address: {
        zip: collector.address?.zip || null,
        city: collector.address?.city || null,
        country: collector.address?.country || null,
        addressLine: collector.address?.addressLine || null,
      },
      firstName: collector.firstName,
      lastName: collector.lastName,
      email: collector.email,
      password: collector.password,
      phoneNumber: collector.phoneNumber,
      userType: collector.userType,
      productType: collector.productType,
      companyName: collector.companyName,
      status: collector.status,
      profilePic: collector.profilePic || "http://example.com/logo.png",
      remarks: collector.remarks,
      createdAt: collector.createdAt.toISOString(),
    }));

    return res.status(200).json({
      status: 200,
      message: "Collectors fetched successfully",
      data: transformedCollectors,
    });
  } catch (error) {
    console.error("Error fetching collectors:", error.message);
    next(error);
  }
};

const updateVerifierStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  console.log("the id of params is", req.params);
  const trimmedId = id.trim();
  console.log("trimmed id are ", trimmedId);
  if (!trimmedId || !status) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Verifier ID and status are required."));
  }

  try {
    const verifierData = await UserModel.findById(
      trimmedId,
      "-__v -refreshToken"
    );

    if (!verifierData) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Verifier not found."));
    }
    console.log("User id is ", verifierData._id);
    console.log("user password is", verifierData.password);

    if (
      status.toLowerCase() === "enabled" ||
      status.toLowerCase() === "disabled"
    ) {
      try {
        console.log(
          `Registering Verfier in friend's API for status: ${status}...`
        );

        const args = [
          verifierData._id.toString(),
          verifierData.companyName,
          verifierData.address.zip,
          verifierData.address.city,
          verifierData.address.country,
          verifierData.address.addressLine,
          status.toLowerCase(),
          remarks || "",
          verifierData.profilePic || "http://example.com/logo.png",
          verifierData.firstName,
          verifierData.lastName,
          verifierData.email,
          verifierData.password,
          verifierData.phoneNumber,
          verifierData.userType,
          verifierData.createdAt.toISOString(),
          verifierData.updatedAt.toISOString(),
        ];

        console.log("Constructed args array:", args);
        console.log("current staatus is ", status);
        console.log("the remarks is", verifierData.remarks);

        const payload = {
          fcn: "CreateCompany",
          args,
        };

        const registerPayload = {
          userid: verifierData._id,
          orgName:
            verifierData.userType.charAt(0).toUpperCase() +
            verifierData.userType.slice(1),

          companyName: verifierData.companyName,
        };

        const registerResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/register`,
          registerPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = registerResponse.data?.token;
        if (!token) {
          return res
            .status(500)
            .json({ message: "Failed to fetch token from /register API." });
        }

        const apiResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Use the fetched token here
            },
          }
        );

        console.log(
          `API Response of CompanyChaincode for ${status}:`,
          apiResponse.data
        );
        if (apiResponse.data?.errorData != null) {
          console.error(
            `API Response  failure for status: ${status}`,
            apiResponse.data
          );

          // Do not enable or disable the verifier
          return res.status(503).json({
            message: `Unable to update verifier status to "${status}" due to a DiscoveryService failure.`,
            error: apiResponse.data?.error || "Unknown error occurred",
            errorData: apiResponse.data?.errorData || null,
          });
        }

        // If API call succeeds, update the verifier status
        const updatedVerifier = await UserModel.findByIdAndUpdate(
          trimmedId,
          { status: status.toLowerCase(), remarks: remarks || "" },
          { new: true, select: "-__v -password -refreshToken" }
        );

        if (!updatedVerifier) {
          return res
            .status(404)
            .json(new ApiResponse(404, null, "Verifier not found."));
        }

        const emailOptions = [
          {
            from: process.env.SENDER_ADDRESS,
            to: updatedVerifier.email,
            subject: `Verifier ${status}`,
            html: `<p>Dear ${updatedVerifier.companyName},</p>
            <p>We’re excited to let you know that your verifier's status has been updated to <strong>"${status}"</strong>.</>
            <p>You can log in anytime at ${
              process.env.FRONTEND_URL_DEV
            } to explore further updates.</p>
            <p>Thank you for choosing DataAuth. We’re thrilled to have you on board!</p>
            <p>Remarks: ${remarks || "No additional remarks at this time."}</p>
            <p>Warm regards,</p>
            <p>The DataAuth Team</p>`,
          },
        ];
        try {
          await sendBulkEmail(emailOptions);
          console.log(
            `Email sent successfully to ${updatedVerifier.email} for status: ${status}`
          );
        } catch (emailError) {
          console.error(
            `Failed to send email for status: ${status}`,
            emailError
          );
        }

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedVerifier,
              `Verifier status updated to "${status}" successfully.`
            )
          );
      } catch (error) {
        console.error("Error in friend's API call:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        return res.status(503).json({
          message: `Unable to update company status to "${status}" due to an error with the external API.`,
          error: error.response?.data || error.message,
        });
      }
    } else {
      // Handle status updates other than "enabled" or "disabled"
      const updatedVerifier = await UserModel.findByIdAndUpdate(
        trimmedId,
        { status, remarks: remarks || "" },
        { new: true, select: "-__v -password -refreshToken" }
      );

      if (!updatedVerifier) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "Verifier not found."));
      }

      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedVerifier.email,
          subject: `Verifier ${status}`,
          html: `<p>Dear ${updatedVerifier.companyName},</p>
                 <p>Your verifier status has been updated to <strong>"${status}"</strong>.</p>
                 <p>Remarks: ${remarks || "No remarks provided."}</p>`,
        },
      ];
      try {
        await sendBulkEmail(emailOptions);
        console.log(
          `Email sent successfully to ${updatedVerifier.email} for status: ${status}`
        );
      } catch (emailError) {
        console.error(`Failed to send email for status: ${status}`, emailError);
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedVerifier,
            `Verifier status updated to "${status}" successfully.`
          )
        );
    }
  } catch (error) {
    console.error("Error in updating verifier status:", error);
    next(error);
  }
};

const updateCollectorStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;
  console.log("the id of params is", req.params);
  const trimmedId = id.trim();
  console.log("trimmed id are ", trimmedId);
  if (!trimmedId || !status) {
    return res
      .status(400)
      .json(
        new ApiResponse(400, null, "Collector ID and status are required.")
      );
  }

  try {
    const collectorData = await UserModel.findById(
      trimmedId,
      "-__v -refreshToken"
    );

    if (!collectorData) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Collector not found."));
    }
    console.log("User id is ", collectorData._id);
    console.log("user password is", collectorData.password);

    if (
      status.toLowerCase() === "enabled" ||
      status.toLowerCase() === "disabled"
    ) {
      try {
        console.log(
          `Registering Collector in friend's API for status: ${status}...`
        );

        const args = [
          collectorData._id.toString(),
          collectorData.companyName,
          collectorData.address.zip,
          collectorData.address.city,
          collectorData.address.country,
          collectorData.address.addressLine,
          status.toLowerCase(),
          remarks || "",
          collectorData.profilePic || "http://example.com/logo.png",
          collectorData.firstName,
          collectorData.lastName,
          collectorData.email,
          collectorData.password,
          collectorData.phoneNumber,
          collectorData.userType,
          collectorData.createdAt.toISOString(),
          collectorData.updatedAt.toISOString(),
        ];

        console.log("Constructed args array:", args);
        console.log("current staatus is ", status);
        console.log("the remarks is", collectorData.remarks);

        const payload = {
          fcn: "CreateCompany",
          args,
        };

        const registerPayload = {
          userid: collectorData._id,
          orgName:
            collectorData.userType.charAt(0).toUpperCase() +
            collectorData.userType.slice(1),

          companyName: collectorData.companyName,
        };

        const registerResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/register`,
          registerPayload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const token = registerResponse.data?.token;
        if (!token) {
          return res
            .status(500)
            .json({ message: "Failed to fetch token from /register API." });
        }

        const apiResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`, // Use the fetched token here
            },
          }
        );

        console.log(
          `API Response of CompanyChaincode for ${status}:`,
          apiResponse.data
        );
        if (apiResponse.data?.errorData != null) {
          console.error(
            `API Response  failure for status: ${status}`,
            apiResponse.data
          );

          // Do not enable or disable the collector
          return res.status(503).json({
            message: `Unable to update collector status to "${status}" due to a DiscoveryService failure.`,
            error: apiResponse.data?.error || "Unknown error occurred",
            errorData: apiResponse.data?.errorData || null,
          });
        }

        // If API call succeeds, update the collector status
        const updatedCollector = await UserModel.findByIdAndUpdate(
          trimmedId,
          { status: status.toLowerCase(), remarks: remarks || "" },
          { new: true, select: "-__v -password -refreshToken" }
        );

        if (!updatedCollector) {
          return res
            .status(404)
            .json(new ApiResponse(404, null, "Collector not found."));
        }

        const emailOptions = [
          {
            from: process.env.SENDER_ADDRESS,
            to: updatedCollector.email,
            subject: `Collector ${status}`,
            html: `<p>Dear ${updatedCollector.companyName},</p>
            <p>We’re excited to let you know that your collector's status has been updated to <strong>"${status}"</strong>.</>
            <p>You can log in anytime at ${
              process.env.FRONTEND_URL_DEV
            } to explore further updates.</p>
            <p>Thank you for choosing DataAuth. We’re thrilled to have you on board!</p>
            <p>Remarks: ${remarks || "No additional remarks at this time."}</p>
            <p>Warm regards,</p>
            <p>The DataAuth Team</p>`,
          },
        ];
        try {
          await sendBulkEmail(emailOptions);
          console.log(
            `Email sent successfully to ${updatedVerifier.email} for status: ${status}`
          );
        } catch (emailError) {
          console.error(
            `Failed to send email for status: ${status}`,
            emailError
          );
        }

        return res
          .status(200)
          .json(
            new ApiResponse(
              200,
              updatedCollector,
              `Collector status updated to "${status}" successfully.`
            )
          );
      } catch (error) {
        console.error("Error in friend's API call:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
        });
        return res.status(503).json({
          message: `Unable to update company status to "${status}" due to an error with the external API.`,
          error: error.response?.data || error.message,
        });
      }
    } else {
      // Handle status updates other than "enabled" or "disabled"
      const updatedCollector = await UserModel.findByIdAndUpdate(
        trimmedId,
        { status, remarks: remarks || "" },
        { new: true, select: "-__v -password -refreshToken" }
      );

      if (!updatedCollector) {
        return res
          .status(404)
          .json(new ApiResponse(404, null, "collector not found."));
      }

      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: updatedCollector.email,
          subject: `Collector ${status}`,
          html: `<p>Dear ${updatedCollector.companyName},</p>
                 <p>Your collector status has been updated to <strong>"${status}"</strong>.</p>
                 <p>Remarks: ${remarks || "No remarks provided."}</p>`,
        },
      ];
      try {
        await sendBulkEmail(emailOptions);
        console.log(
          `Email sent successfully to ${updatedCollector.email} for status: ${status}`
        );
      } catch (emailError) {
        console.error(`Failed to send email for status: ${status}`, emailError);
      }

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            updatedCollector,
            `Collector status updated to "${status}" successfully.`
          )
        );
    }
  } catch (error) {
    console.error("Error in updating collector status:", error);
    next(error);
  }
};

const deleteCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trimmedId = id.trim();
    if (!trimmedId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Company ID is required."));
    }
    const deletedCompany = await UserModel.findByIdAndDelete(trimmedId).select(
      "-__v -password -refreshToken"
    );

    if (!deletedCompany) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Company not found."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedCompany, "Company deleted successfully.")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while deleting the company.";
    }
    next(error);
  }
};

const testHash = async (req, res, next) => {
  try {
    // Data to be hashed
    const companyForHashing = {
      id: "6778f795670b9b7ecb04e684",
      vaccinationCenterName: "Fifa",
      vaccinationCenterAddress: {
        wardNo: 44,
        municipality: "nep",
      },
      vaccinationDate: "2025-01-05T00:00:00.000Z",
      weather: "Rainy",
      totalBoys: 11,
      totalGirls: 9,
      healthCareProviders: [
        {
          providerName: "Opis",
          providerPhone: 9841205250,
          _id: "6778f796670b9b7ecb04e685",
        },
        {
          providerName: "Alex",
          providerPhone: 9847176923,
          _id: "6778f796670b9b7ecb04e686",
        },
      ],
      vaccinationCenterStatus: "Ongoing",
      observationPeriod: "14days",
      observerDetail: {
        observerName: "ObserverRam",
        observerPhone: 9841525263,
      },
      roadStatus: "Good",
      createdBy: {
        _id: "6770fcfd10cee2b21b2af590",
        companyName: "TimeComesEsta",
        userType: "dataCollector",
      },
      assignedDataCollector: {
        _id: "6778e28ecb10e6810e88582a",
        name: "Ram",
        email: "ram123@gmail.com",
      },
      assignedDataVerifier: {
        _id: "6777aaf6b6540198642d548e",
        name: "Water",
        email: "water@gmail.com",
      },
      createdAt: "2025-01-04T08:55:50.018Z",
    };

    // Convert the object to a string
    const companyString = JSON.stringify(companyForHashing);
    // console.log(companySt);

    // Generate the SHA-256 hash
    const hash = crypto
      .createHash("sha256")
      .update(companyString)
      .digest("hex");

    // Return the response with the hash and original data
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...companyForHashing, hash },
          "Hash generated successfully."
        )
      );
  } catch (error) {
    // Catch any errors and pass them to the error handler
    if (!error.message) {
      error.message = "Something went wrong while generating the hash.";
    }
    next(error);
  }
};

const uploadProfilePicture = async (req, res) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  if (!blockChainToken) {
    return res
      .status(401)
      .json({ message: "Authorization token of blockchain not found" });
  }

  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Prepare data for the external API
    const payload = {
      fcn: "EditCompanyProfile",
      peers: ["peer0.company.example.com"],
      args: [
        user._id,
        filePath,
        user.firstName,
        user.lastName,
        user.email,
        user.phoneNumber,
        user.companyName || "DefaultCompany",
        user.address.zip || "00000",
        user.address.city || "City",
        user.address.country || "Country",
        user.address.addressLine || "Address Line",
      ],
    };

    console.log("Sending profilePic to external API:", filePath);

    // Call the external API
    const apiResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Response from uploadProfile:", apiResponse.data);

    // Check if the response contains an  warning
    if (
      apiResponse.data &&
      (apiResponse.data.error || !apiResponse.data.result)
    ) {
      console.error("External API error:", apiResponse.data.errorData);
      return res.status(503).json({
        message:
          "Unable to update company profile due to an external API failure.",
        error: apiResponse.data.error || "Unknown error occurred",
        errorData: apiResponse.data.errorData || null,
      });
    }

    // Proceed with updating the user in the database only if the external API is successful
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { profilePic: filePath },
      { new: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return a combined response
    return res.status(200).json({
      message: "Profile picture uploaded and external API called successfully",
      user: updatedUser,
      externalApiResponse: apiResponse.data,
    });
  } catch (error) {
    console.error("Unexpected error:", error.message);
    return res.status(500).json({
      message: "Error uploading profile picture or calling external API",
      error: error.message,
    });
  }
};

// const userEditProfile = async (req, res, next) => {
//   try {
//     const user = req.user;
//     if (!user || !user._id) {
//       return res.status(401).json({ message: "Unauthorized. User not found." });
//     }

//     const {
//       userId,
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       companyName,
//       address,
//     } = req.body;

//     if (!userId) {
//       throw new ApiError(400, "User ID is required");
//     }

//     if (
//       address &&
//       (typeof address !== "object" ||
//         !address.zip ||
//         !address.city ||
//         !address.country ||
//         !address.addressLine)
//     ) {
//       throw new ApiError(
//         400,
//         "Address must be an object with zip, city, country, and addressLine"
//       );
//     }

//     const existingUser = await UserModel.findById(userId);
//     if (!existingUser) {
//       throw new ApiError(404, "User not found");
//     }

//     const updatedUserFields = {
//       firstName,
//       lastName,
//       email,
//       phoneNumber,
//       companyName,
//       address, // Update with the new address structure
//     };

//     // Update the user in the database
//     const updatedUser = await UserModel.findByIdAndUpdate(
//       userId,
//       updatedUserFields,
//       { new: true, runValidators: true }
//     ).select("-__v -password -refreshToken");

//     return res
//       .status(200)
//       .json(
//         new ApiResponse(200, updatedUser, "User profile updated successfully")
//       );
//   } catch (error) {
//     if (!error.message) {
//       error.message = "Something went wrong while updating user profile";
//     }
//     next(error);
//   }
// };

const userEditProfile = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  if (!blockChainToken) {
    return res
      .status(401)
      .json({ message: "Authorization token of blockchain not found" });
  }

  try {
    const user = req.user;
    if (!user || !user._id) {
      return res.status(401).json({ message: "Unauthorized. User not found." });
    }

    const {
      userId,
      firstName,
      lastName,
      email,
      phoneNumber,
      companyName,
      address,
    } = req.body;

    if (!userId) {
      throw new ApiError(400, "User ID is required");
    }

    if (
      address &&
      (typeof address !== "object" ||
        !address.zip ||
        !address.city ||
        !address.country ||
        !address.addressLine)
    ) {
      throw new ApiError(
        400,
        "Address must be an object with zip, city, country, and addressLine"
      );
    }

    const existingUser = await UserModel.findById(userId);
    if (!existingUser) {
      throw new ApiError(404, "User not found");
    }

    // Prepare data for the external API
    const payload = {
      fcn: "EditCompanyProfile",
      // peers: ["peer0.company.example.com"],
      args: [
        userId,
        existingUser.profilePic,
        firstName || existingUser.firstName,
        lastName || existingUser.lastName,
        email || existingUser.email,
        phoneNumber || existingUser.phoneNumber,
        companyName || existingUser.companyName,
        address?.zip || existingUser.address.zip,
        address?.city || existingUser.address.city,
        address?.country || existingUser.address.country,
        address?.addressLine || existingUser.address.addressLine,
      ],
    };

    console.log("Sending profile data to external API:", payload);

    // Call the external API
    const apiResponse = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the API response indicates a failure
    if (
      apiResponse.status !== 200 ||
      apiResponse.data?.error ||
      !apiResponse.data?.result
    ) {
      console.error("External API error:", apiResponse.data?.errorData);
      return res.status(503).json({
        message: "Failed to update profile via external API",
        error: apiResponse.data?.error || "Unknown error occurred",
        errorData: apiResponse.data?.errorData || null,
      });
    }

    // If the external API succeeds, update the user in the database
    const updatedUserFields = {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(email && { email }),
      ...(phoneNumber && { phoneNumber }),
      ...(companyName && { companyName }),
      ...(address && { address }),
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      updatedUserFields,
      { new: true, runValidators: true }
    ).select("-__v -password -refreshToken");

    if (!updatedUser) {
      throw new ApiError(404, "Failed to update user");
    }

    // Return a success response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: updatedUser,
          externalApiResponse: apiResponse.data,
        },
        "User profile updated successfully and external API called"
      )
    );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating user profile";
    }
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new ApiError(400, "Email is required");
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with the provided email does not exist");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);
    const tokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = tokenExpiry;
    await user.save();

    const resetLink = `${process.env.FRONTEND_URL_DEV}/resetPassword?token=${resetToken}&email=${user.email}`;
    await sendResetPasswordEmail(user.email, resetLink);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset link sent to your email"));
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, email, newPassword } = req.body;

    if (!token || !email || !newPassword) {
      throw new ApiError(400, "Token, email, and new password are required");
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError(404, "User with the provided email does not exist");
    }

    if (!user.resetPasswordToken || !user.resetPasswordExpires) {
      throw new ApiError(400, "No password reset token found for this user");
    }

    if (user.resetPasswordExpires < Date.now()) {
      throw new ApiError(400, "Password reset token has expired");
    }

    const isTokenValid = await bcrypt.compare(token, user.resetPasswordToken);
    if (!isTokenValid) {
      throw new ApiError(400, "Invalid or expired password reset token");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password has been successfully reset"));
  } catch (error) {
    next(error);
  }
};
const blockChainTokenController = async (req, res, next) => {
  // console.log(req.user);
  try {
    // Check if req.user is defined
    if (!req.user) {
      throw new ApiError(401, "User not authenticated");
    }

    const { firstName, _id, userType } = req.user;
    if (!firstName || !_id) {
      throw new ApiError(400, "Missing required user information");
    }

    // Capitalize the first letter of userType
    const formattedUserType =
      userType === "super-admin"
        ? "Superadmin"
        : userType.charAt(0).toUpperCase() + userType.slice(1);
    const payload = {
      username: firstName,
      orgName: formattedUserType,
    };

    // Call the external API
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/users/token`,
      payload
    );
    console.log("response from blockChainToken", response.data);

    // Extract token from response
    const blockChainToken = response.data?.message?.token;

    if (!blockChainToken) {
      throw new ApiError(500, "Token not received from blockchain API");
    }

    // Store the token in the request object for later use
    req.token = blockChainToken;

    next();
  } catch (error) {
    // Handle errors and provide appropriate message
    if (!error.message) {
      error.message = "Something went wrong while calling the user token API";
    }
    next(error);
  }
};

// const createOrganizationUser = async (req, res, next) => {
//   try {
//     const blockChainToken = req.blockChainToken;
//     console.log("From create org user", blockChainToken);
//     const { userType, companyName, _id: userId } = req.user;

//     if (userType !== "dataVerifier" && userType !== "dataCollector") {
//       return res
//         .status(403)
//         .json(
//           new ApiResponse(
//             403,
//             null,
//             "You are not authorized to perform this action"
//           )
//         );
//     }

//     const { firstName, lastName, email, password, phone, status, address } =
//       req.body;

//     if (
//       !firstName ||
//       !lastName ||
//       !email ||
//       !password ||
//       !phone ||
//       !address ||
//       !address.zip ||
//       !address.city ||
//       !address.country ||
//       !address.addressLine
//     ) {
//       return res
//         .status(400)
//         .json(new ApiResponse(400, null, "All fields are required"));
//     }

//     // Check if the email is already registered
//     const existingUser = await OrgUserModel.findOne({ email });
//     if (existingUser) {
//       return res
//         .status(409)
//         .json(new ApiResponse(409, null, "Email is already in use"));
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Determine userType based on creator's userType
//     const derivedUserType =
//       userType === "dataVerifier" ? "dataVerifierUser" : "dataCollectorUser";

//     const organizationUser = new OrgUserModel({
//       firstName,
//       lastName,
//       email,
//       password: hashedPassword,
//       phone,
//       userType: derivedUserType, // Set the derived userType
//       organization: {
//         _id: userId, // Use the authenticated user's ID
//         name: companyName, // Use the companyName from the authenticated user
//       },
//       address: {
//         zip: address.zip,
//         city: address.city,
//         country: address.country,
//         addressLine: address.addressLine,
//       },
//       status: status || "enabled",
//     });

//     await organizationUser.save();

//     // Blockchain API payload for "CreateOrganizationUser" with address fields
//     const blockchainPayload = {
//       fcn: "CreateUser",
//       args: [
//         organizationUser._id.toString(),
//         organizationUser.organization._id.toString(),
//         organizationUser.organization.name,
//         organizationUser.firstName,
//         organizationUser.lastName,
//         organizationUser.email,
//         organizationUser.phone,
//         organizationUser.address.zip,
//         organizationUser.address.city,
//         organizationUser.address.country,
//         organizationUser.address.addressLine,
//         organizationUser.userType,
//         organizationUser.password,
//         organizationUser.status,
//         organizationUser.remarks || "null",
//         organizationUser.profilePic || "http://example.com/logo.png",
//         organizationUser.createdAt.toISOString(),
//         organizationUser.updatedAt.toISOString(),
//       ],
//     };

//     try {
//       const blockchainResponse = await axios.post(
//         `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationOrg`,
//         blockchainPayload,
//         {
//           headers: {
//             Authorization: `Bearer ${blockChainToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       const transactionId = blockchainResponse.data.result.transactionId;

//       if (transactionId) {
//         organizationUser.transactionId = transactionId;
//         await organizationUser.save();
//       }
//     } catch (blockchainError) {
//       console.error("Blockchain API error:", blockchainError.message);
//     }

//     // Email options
//     const emailOptions = [
//       {
//         from: process.env.SENDER_ADDRESS,
//         to: email,
//         subject: "Welcome to Our Organization",
//         text: `Hello ${firstName},\n\nYour account has been created successfully.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after your first login.\n\nBest regards,\nYour Company`,
//       },
//     ];

//     // Send email
//     try {
//       const emailResults = await sendBulkEmail(emailOptions);
//       console.log("Email Results:", emailResults);
//     } catch (emailError) {
//       console.error("Error sending email:", emailError);
//     }

//     return res
//       .status(201)
//       .json(
//         new ApiResponse(
//           201,
//           { id: organizationUser._id },
//           "Organization user created successfully"
//         )
//       );
//   } catch (error) {
//     if (!error.message) {
//       error.message =
//         "Something went wrong while creating an organization user";
//     }
//     next(error);
//   }
// };

const createOrganizationUser = async (req, res, next) => {
  try {
    const blockChainToken = req.blockChainToken;
    console.log("From create org user", blockChainToken);
    const { userType, companyName, _id: userId } = req.user;

    if (userType !== "dataVerifier" && userType !== "dataCollector") {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "You are not authorized to perform this action"
          )
        );
    }

    const { firstName, lastName, email, password, phone, status, address } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !address.zip ||
      !address.city ||
      !address.country ||
      !address.addressLine
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }

    // Check if the email is already registered
    const existingUser = await OrgUserModel.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json(new ApiResponse(409, null, "Email is already in use"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const registerPayloadUserType = req.user.userType;
    const derivedUserType =
      userType === "dataVerifier" ? "dataVerifierUser" : "dataCollectorUser";

    // Step 1: Call the register Blockchain API
    const registerPayload = {
      userid: userId,
      orgName: registerPayloadUserType,
      companyName: "companyName",
    };

    try {
      const registerResponse = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_REGISTER}/register`,
        registerPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Register response", registerResponse);
      // const token = registerResponse.data?.token;
      // if (!token) {
      //   return res
      //     .status(500)
      //     .json({ message: "Failed to fetch token from /register API." });
      // }

      // Use the fetched token for further Blockchain API calls
      const organizationUser = new OrgUserModel({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        userType: derivedUserType,
        organization: {
          _id: userId,
          name: companyName,
        },
        address: {
          zip: address.zip,
          city: address.city,
          country: address.country,
          addressLine: address.addressLine,
        },
        status: status || "enabled",
      });

      await organizationUser.save();

      // Blockchain API payload for creating user
      const blockchainPayload = {
        fcn: "CreateUser",
        args: [
          organizationUser._id.toString(),
          organizationUser.organization._id.toString(),
          organizationUser.organization.name,
          organizationUser.firstName,
          organizationUser.lastName,
          organizationUser.email,
          organizationUser.phone,
          organizationUser.address.zip,
          organizationUser.address.city,
          organizationUser.address.country,
          organizationUser.address.addressLine,
          organizationUser.userType,
          organizationUser.password,
          organizationUser.status,
          organizationUser.remarks || "null",
          organizationUser.profilePic || "http://example.com/logo.png",
          organizationUser.createdAt.toISOString(),
          organizationUser.updatedAt.toISOString(),
        ],
      };

      try {
        const blockchainResponse = await axios.post(
          `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationOrg`,
          blockchainPayload,
          {
            headers: {
              Authorization: `Bearer ${blockChainToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const transactionId = blockchainResponse.data.result.transactionId;

        if (transactionId) {
          organizationUser.transactionId = transactionId;
          await organizationUser.save();
        }
      } catch (blockchainError) {
        console.error("Blockchain API error:", blockchainError.message);
      }

      // Email options
      const emailOptions = [
        {
          from: process.env.SENDER_ADDRESS,
          to: email,
          subject: "Welcome to Our Organization",
          text: `Hello ${firstName},\n\nYour account has been created successfully.\n\nLogin Credentials:\nEmail: ${email}\nPassword: ${password}\n\nPlease change your password after your first login.\n\nBest regards,\nYour Company`,
        },
      ];

      // Send email
      try {
        const emailResults = await sendBulkEmail(emailOptions);
        console.log("Email Results:", emailResults);
      } catch (emailError) {
        console.error("Error sending email:", emailError);
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            { id: organizationUser._id },
            "Organization user created successfully"
          )
        );
    } catch (registerError) {
      console.error("Error in register API call:", {
        message: registerError.message,
        response: registerError.response?.data,
        status: registerError.response?.status,
      });
      return res.status(503).json({
        message: "Failed to register organization in Blockchain API.",
        error: registerError.response?.data || registerError.message,
      });
    }
  } catch (error) {
    if (!error.message) {
      error.message =
        "Something went wrong while creating an organization user";
    }
    next(error);
  }
};

export {
  userSignup,
  userEditProfile,
  uploadProfilePicture,
  userSignin,
  userSignout,
  getUsers,
  getCurrentUser,
  updateUser,
  refreshAccessToken,
  getDataVerifiers,
  getDataCollectors,
  updateVerifierStatus,
  deleteCompany,
  forgotPassword,
  resetPassword,
  getCompanyIds,
  testHash,
  blockChainTokenController,
  createOrganizationUser,
  updateCollectorStatus,
};
