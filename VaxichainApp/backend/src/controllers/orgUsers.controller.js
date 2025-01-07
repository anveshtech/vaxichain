import { OrgUserModel } from "../models/orgUser.model.js";
import crypto from "crypto";
import axios from "axios";
import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import bcrypt from "bcrypt";

const getOrganizationUsers = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain from getorguser is:", blockChainToken);
  if (!blockChainToken) {
    throw new ApiError(401, "Authorization token of blockchain not found");
  }

  try {
    const { page = 1, limit = 10 } = req.query;
    const { userType, id: organizationId } = req.user || {};

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    let filter = {};

    if (userType === "super-admin") {
      filter = {};
    } else if (organizationId) {
      filter = {
        "organization._id": organizationId,
      };
    } else {
      const error = new Error("Organization ID is required but not provided");
      error.statusCode = 400;
      throw error;
    }

    const totalUsers = await OrgUserModel.countDocuments(filter);
    const organizationUsers = await OrgUserModel.find(filter)
      .select(
        "_id firstName lastName email phone status organization createdAt password remarks address profilePic userType"
      )
      .populate("userType") // Populate if userType is a reference
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: -1 })
      .lean();

    if (!organizationUsers || organizationUsers.length === 0) {
      return res.status(404).json({
        status: 404,
        message: "No organization users found",
      });
    }

    // Transform users into the desired format
    const transformedUsers = organizationUsers.map((user) => ({
      id: user._id.toString(),
      organization: user.organization
        ? {
            _id: user.organization._id.toString(), // Convert _id to string
            name: user.organization.name,
          }
        : null,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      address: {
        zip: user.address?.zip || null,
        city: user.address?.city || null,
        country: user.address?.country || null,
        addressLine: user.address?.addressLine || null,
      },
      userType: user.userType,
      password: user.password,
      status: user.status,
      remarks: user.remarks,
      profilePic: user.profilePic || "http://example.com/logo.png",
      createdAt: user.createdAt.toISOString(),
    }));

    console.log("The transformed users are", transformedUsers);

    // Generate hashes for each user
    const hashedUsers = transformedUsers.map((user) => {
      const userForHashing = { ...user };
      const userString = JSON.stringify(userForHashing);

      const hash = crypto.createHash("sha256").update(userString).digest("hex");

      return { ...user, hash };
    });

    const userIds = hashedUsers.map((user) => user.id);

    let usersWithBlockchainVerification = [];

    try {
      // External API call
      const payload = {
        fcn: "GetUsersWithHashes",
        args: userIds,
      };

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationOrg`,
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
        const comparisonResults = hashedUsers.map((user) => {
          const apiUser = apiHashes.find((apiHash) => apiHash.id === user.id);

          if (apiUser) {
            let blockChainVerified;
            if (apiUser.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified = apiUser.blockHash === user.hash;
            }

            return {
              userId: user.id,
              blockChainVerified,
              generatedHash: user.hash,
              userName: `${user.firstName} ${user.lastName}`,
              apiHash: apiUser.blockHash,
            };
          } else {
            return {
              userId: user.id,
              blockChainVerified: false,
              generatedHash: user.hash,
              userName: `${user.firstName} ${user.lastName}`,
              apiHash: null,
            };
          }
        });

        console.log("Comparison Results:", comparisonResults);

        // Add `blockChainVerified` to the transformed users
        usersWithBlockchainVerification = comparisonResults.map((result) => {
          const user = hashedUsers.find((usr) => usr.id === result.userId);
          return {
            ...user,
            blockChainVerified: result.blockChainVerified,
          };
        });
      }
    } catch (err) {
      console.error("Error sending request:", err.message);
      usersWithBlockchainVerification = hashedUsers.map((user) => ({
        ...user,
        blockChainVerified: false,
      }));
    }

    return res.status(200).json({
      statusCode: 200,
      data: {
        organizationUsers: usersWithBlockchainVerification,
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching organization users:", error.message);
    next(error);
  }
};
const getOrgUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid orguser ID format"));
    }

    const orguser = await OrgUserModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!orguser) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "orguser not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, orguser, "orguser details fetched successfully")
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message = "Something went wrong while fetching orguser details";
    }
    next(error);
  }
};
const editOrgUser = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  try {
    const { orguserId } = req.params;
    const updateData = req.body;

    const updatedOrgUser = await OrgUserModel.findByIdAndUpdate(
      orguserId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedOrgUser) {
      return next(new ApiError(404, "Org user not found"));
    }

    // Prepare blockchain arguments
    const args = [
      updatedOrgUser._id.toString(),
      updatedOrgUser.organization?._id.toString() || "",
      updatedOrgUser.organization?.name || "",
      updatedOrgUser.firstName || "",
      updatedOrgUser.lastName || "",
      updatedOrgUser.email || "",
      updatedOrgUser.phone || "",
      updatedOrgUser.address?.zip || "",
      updatedOrgUser.address?.city || "",
      updatedOrgUser.address?.country || "",
      updatedOrgUser.address?.addressLine || "",
    ];

    const payload = {
      fcn: "UpdateUser",
      args,
    };

    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationOrg`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the response from the blockchain API
    console.log("Response from blockchain API:", response.data);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedOrgUser,
          "Org user info updated successfully and sent to blockchain"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating org user info or sending to blockchain:",
      error.message
    );

    if (!error.message) {
      error.message = "Something went wrong while updating org user info";
    }
    next(error);
  }
};
const getAssignedDataCollectorUser = async (req, res, next) => {
  try {
    const { _id } = req.user; // Extracting user ID from `req.user`
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID format"));
    }

    const dataCollectors = await OrgUserModel.find({
      "organization._id": _id,
    }).select("firstName email _id");

    if (!dataCollectors || dataCollectors.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "No data collectors found for this user")
        );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          dataCollectors,
          "Data collector users fetched successfully"
        )
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message =
        "Something went wrong while fetching data collector users";
    }
    next(error);
  }
};
const getAssignedDataVerifierUser = async (req, res, next) => {
  try {
    const { _id } = req.user;
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid user ID format"));
    }

    // Fetch all data verifiers (assuming 'userType' field differentiates them)
    const dataVerifiers = await UserModel.find({
      userType: "dataVerifier", // Assuming userType differentiates data verifiers
    }).select("_id firstName email");

    if (!dataVerifiers || dataVerifiers.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "No data verifiers found in the system")
        );
    }

    // Extract verifier IDs
    const verifierIds = dataVerifiers.map((verifier) => verifier._id);

    // Fetch users created by these data verifiers from OrgUserModel
    const createdUsers = await OrgUserModel.find({
      "organization._id": { $in: verifierIds }, // Match organization._id with verifier _id
    }).select(" firstName email organization._id _id ");

    if (!createdUsers || createdUsers.length === 0) {
      return res
        .status(404)
        .json(
          new ApiResponse(404, null, "No users created by data verifiers found")
        );
    }

    // Group users by the data verifier who created them
    const groupedData = dataVerifiers.map((verifier) => {
      const usersCreatedByVerifier = createdUsers.filter(
        (user) => user.organization._id.toString() === verifier._id.toString()
      );
      return {
        dataVerifier: verifier,
        createdUsers: usersCreatedByVerifier.map((user) => ({
          _id: user._id,
          firstName: user.firstName,
          email: user.email,
        })),
      };
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          groupedData,
          "Data verifiers and their created users fetched successfully"
        )
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message =
        "Something went wrong while fetching data verifiers and their users";
    }
    next(error);
  }
};
const generateRefreshAndAccessToken = async (orgUserId) => {
  try {
    const user = await OrgUserModel.findOne({ _id: orgUserId });
    const refreshToken = user.generateRefreshToken();
    const accessToken = user.generateAccessToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { refreshToken, accessToken };
  } catch (error) {
    if (!error.message) {
      error.message =
        "something went wrong while generating refresh and access tokens";
    }
    next(error);
  }
};
const orgUserSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await OrgUserModel.findOne({ email: email });

    if (!existingUser) {
      throw new ApiError(404, "OrgUser doesn't exist");
    }

    const passwordMatch = await bcrypt.compare(password, existingUser.password);

    if (!passwordMatch) {
      throw new ApiError(401, "Email or Password does not match");
    }

    const { refreshToken, accessToken } = await generateRefreshAndAccessToken(
      existingUser._id
    );

    const signedInUser = await OrgUserModel.findOne({
      _id: existingUser._id,
    }).select("-__v -password -refreshToken");

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

const orgUserSignout = async (req, res, next) => {
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

    await OrgUserModel.findOneAndUpdate(
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

export {
  getOrganizationUsers,
  getOrgUserById,
  editOrgUser,
  getAssignedDataCollectorUser,
  getAssignedDataVerifierUser,
  orgUserSignout,
  orgUserSignin,
};
