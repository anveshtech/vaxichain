import { VaccinationCenterModel } from "../models/vaccinationCenter.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import axios from "axios";
import crypto from "crypto";
import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";

const createVaccinationCenter = async (req, res, next) => {
  try {
    const blockChainToken = req.blockChainToken;
    const { userType, companyName, _id: userId } = req.user;

    if (userType !== process.env.USER_TYPE_DATACOLLECTOR) {
      return res
        .status(403)
        .json(
          new ApiResponse(
            403,
            null,
            "You are not authorized to create vaccination centers"
          )
        );
    }

    const {
      vaccinationCenterName,
      vaccinationCenterAddress,
      vaccinationDate,
      weatherCondition,
      totalBoys,
      totalGirls,
      vaccinationCenterStatus,
      healthCareProvider,
      observationPeriod,
      observerDetail,
      roadStatus,
      assignedDataCollectorUser,
      assignedDataVerifierUser,
    } = req.body;

    if (
      !vaccinationCenterName ||
      !vaccinationCenterAddress ||
      !vaccinationCenterAddress.wardNo ||
      !vaccinationCenterAddress.municipality ||
      !vaccinationDate ||
      !totalBoys ||
      !totalGirls
    ) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "All required fields must be provided")
        );
    }

    const existingCenter = await VaccinationCenterModel.findOne({
      vaccinationCenterName,
      "vaccinationCenterAddress.wardNo": vaccinationCenterAddress.wardNo,
    });

    if (existingCenter) {
      return res
        .status(400)
        .json(
          new ApiResponse(
            400,
            null,
            "A vaccination center with the same name and ward number already exists"
          )
        );
    }

    const vaccinationCenterData = {
      vaccinationCenterName,
      vaccinationCenterAddress,
      vaccinationDate,
      weatherCondition,
      totalBoys,
      totalGirls,
      vaccinationCenterStatus: vaccinationCenterStatus || "Pending",
      healthCareProvider: healthCareProvider || [],
      observationPeriod,
      observerDetail,
      roadStatus,
      assignedDataCollectorUser,
      assignedDataVerifierUser,
      createdBy: {
        _id: userId,
        companyName,
        userType,
      },
    };

    const vaccinationCenter = new VaccinationCenterModel(vaccinationCenterData);
    await vaccinationCenter.save();

    // Log the saved data to identify potential undefined fields
    console.log("Saved Vaccination Center:", vaccinationCenter);

    // Defensive checks for undefined properties
    const blockchainPayload = {
      fcn: "AddVaccinationCenter",
      args: [
        vaccinationCenter._id?.toString(),
        vaccinationCenter.vaccinationCenterName || "",
        JSON.stringify(vaccinationCenter.vaccinationCenterAddress || {}),
        vaccinationCenter.vaccinationDate?.toISOString() || "",
        vaccinationCenter.weatherCondition || "",
        vaccinationCenter.totalBoys,
        vaccinationCenter.totalGirls,
        JSON.stringify(vaccinationCenter.healthCareProvider || []),
        vaccinationCenter.vaccinationCenterStatus || "",
        vaccinationCenter.observationPeriod || "",
        JSON.stringify(vaccinationCenter.observerDetail || {}),
        vaccinationCenter.roadStatus || "",
        JSON.stringify(vaccinationCenter.createdBy || {}),
        JSON.stringify(vaccinationCenter.assignedDataCollectorUser || {}),
        JSON.stringify(vaccinationCenter.assignedDataVerifierUser || {}),
        vaccinationCenter.createdAt?.toISOString() || "",
        vaccinationCenter.updatedAt?.toISOString() || "",
      ],
    };

    console.log("Blockchain Payload Args:", blockchainPayload.args);
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
        vaccinationCenter.transactionId = transactionId;
        await vaccinationCenter.save();
      }
    } catch (blockchainError) {
      console.error("Blockchain API error:", blockchainError.message);
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { id: vaccinationCenter._id },
          "Vaccination center created successfully"
        )
      );
  } catch (error) {
    console.error("Error in createVaccinationCenter:", error.message);
    next(error);
  }
};

const getVaccinationCenter = async (req, res, next) => {
  const blockChainToken = "blockchain_token_here";
  console.log("The blockchain token is:", blockChainToken);

  if (!blockChainToken) {
    return res.status(401).json({
      success: false,
      message: "Authorization token of blockchain not found",
    });
  }

  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user._id;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    let filter = {};

    // Check for assigned or created roles
    const isAssignedToCenter = await VaccinationCenterModel.exists({
      "assignedDataCollectorUser._id": userId,
    });

    if (isAssignedToCenter) {
      // Fetch the vaccination center assigned to the user
      filter = { "assignedDataCollectorUser._id": userId };
    } else {
      // Fetch all vaccination centers created by the user
      filter = { "createdBy._id": userId };
    }

    const totalCenters = await VaccinationCenterModel.countDocuments(filter);
    const vaccinationCenters = await VaccinationCenterModel.find(filter)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .lean();

    if (!vaccinationCenters || vaccinationCenters.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No vaccination centers found",
      });
    }

    // Transform vaccination centers into the desired format
    const transformedVaccinationCenters = vaccinationCenters.map((center) => ({
      id: center._id.toString(),
      vaccinationCenterName: center.vaccinationCenterName,
      vaccinationCenterAddress: {
        wardNo: center.vaccinationCenterAddress?.wardNo,
        municipality: center.vaccinationCenterAddress?.municipality,
      },
      vaccinationDate: center.vaccinationDate,
      weather: center.weatherCondition,
      totalBoys: center.totalBoys,
      totalGirls: center.totalGirls,
      healthCareProviders: center.healthCareProvider.map((provider) => ({
        providerName: provider.providerName,
        providerPhone: provider.providerPhone,
        _id: provider._id.toString(),
      })),
      vaccinationCenterStatus: center.vaccinationCenterStatus,
      observationPeriod: center.observationPeriod,
      observerDetail: {
        observerName: center.observerDetail.observerName,
        observerPhone: center.observerDetail.observerPhone,
      },
      roadStatus: center.roadStatus,
      createdBy: {
        _id: center.createdBy._id.toString(),
        companyName: center.createdBy.companyName,
        userType: center.createdBy.userType,
      },
      assignedDataCollector: {
        _id: center.assignedDataCollectorUser._id.toString(),
        name: center.assignedDataCollectorUser.firstName,
        email: center.assignedDataCollectorUser.email,
      },
      assignedDataVerifier: {
        _id: center.assignedDataVerifierUser._id.toString(),
        name: center.assignedDataVerifierUser.firstName,
        email: center.assignedDataVerifierUser.email,
      },
      createdAt: center.createdAt.toISOString(),
    }));

    // Blockchain verification logic here (unchanged)...

    return res.status(200).json({
      success: true,
      data: {
        vaccinationCenters: transformedVaccinationCenters,
        pagination: {
          totalCenters,
          totalPages: Math.ceil(totalCenters / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching vaccination centers:", error.message);
    next(error);
  }
};

// const getVaccinationCenter = async (req, res, next) => {
//   const blockChainToken = "apple";
//   console.log("The blockchain token is:", blockChainToken);

//   if (!blockChainToken) {
//     return res.status(401).json({
//       success: false,
//       message: "Authorization token of blockchain not found",
//     });
//   }

//   try {
//     const { page = 1, limit = 10 } = req.query;
//     const userId = req.user._id;

//     const options = {
//       page: parseInt(page, 10),
//       limit: parseInt(limit, 10),
//     };

//     let filter = {};

//     const isAssignedToCenter = await VaccinationCenterModel.exists({
//       "assignedDataCollectorUser._id": userId,
//     });

//     if (isAssignedToCenter) {
//       filter = { "assignedDataCollectorUser._id": userId };
//     } else {
//       filter = { "createdBy._id": userId };
//     }

//     const totalCenters = await VaccinationCenterModel.countDocuments(filter);
//     const vaccinationCenters = await VaccinationCenterModel.find(filter)
//       .skip((options.page - 1) * options.limit)
//       .limit(options.limit)
//       .sort({ createdAt: -1 })
//       .lean();

//     if (!vaccinationCenters || vaccinationCenters.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "No vaccination centers found",
//       });
//     }

//     const transformedVaccinationCenters = vaccinationCenters.map((center) => ({
//       id: center._id.toString(),
//       vaccinationCenterName: center.vaccinationCenterName,
//       vaccinationCenterAddress: {
//         wardNo: center.vaccinationCenterAddress?.wardNo,
//         municipality: center.vaccinationCenterAddress?.municipality,
//         location: center.vaccinationCenterAddress?.location,
//       },
//       vaccinationDate: center.vaccinationDate,
//       weatherCondition: center.weatherCondition,
//       totalBoys: center.totalBoys,
//       totalGirls: center.totalGirls,
//       healthCareProviders: center.healthCareProvider.map((provider) => ({
//         providerName: provider.providerName,
//         providerPhone: provider.providerPhone,
//         _id: provider._id.toString(),
//       })),
//       vaccinationCenterStatus: center.vaccinationCenterStatus,
//       observationPeriod: center.observationPeriod,
//       observerDetail: {
//         observerName: center.observerDetail?.observerName,
//         observerPhone: center.observerDetail?.observerPhone,
//       },
//       roadStatus: center.roadStatus,
//       createdBy: {
//         _id: center.createdBy._id.toString(),
//         companyName: center.createdBy.companyName,
//         userType: center.createdBy.userType,
//       },
//       assignedDataCollectorUser: {
//         _id: center.assignedDataCollectorUser._id.toString(),
//         firstName: center.assignedDataCollectorUser.firstName,
//         email: center.assignedDataCollectorUser.email,
//       },
//       assignedDataVerifierUser: {
//         _id: center.assignedDataVerifierUser._id.toString(),
//         firstName: center.assignedDataVerifierUser.firstName,
//         email: center.assignedDataVerifierUser.email,
//       },
//       createdAt: center.createdAt.toISOString(),
//     }));

//     // Generate hashes for each vaccination center
//     const hashedCenters = transformedVaccinationCenters.map((center) => {
//       const centerString = JSON.stringify(center);
//       const hash = crypto
//         .createHash("sha256")
//         .update(centerString)
//         .digest("hex");
//       return { ...center, hash };
//     });

//     const centerIds = hashedCenters.map((center) => center.id);

//     let centersWithBlockchainVerification = [];

//     try {
//       const payload = {
//         fcn: "GetCentersWithHashes",
//         args: centerIds,
//       };

//       const response = await axios.post(
//         `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationOrg`,
//         payload,
//         {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${blockChainToken}`,
//           },
//         }
//       );

//       if (response.data?.result?.result) {
//         const apiHashes = response.data.result.result;

//         // Compare hashes and log results
//         const comparisonResults = hashedCenters.map((center) => {
//           const apiCenter = apiHashes.find(
//             (apiHash) => apiHash.id === center.id
//           );

//           if (apiCenter) {
//             let blockChainVerified;
//             if (apiCenter.blockHash.trim().toLowerCase() === "pending") {
//               blockChainVerified = "pending";
//             } else {
//               blockChainVerified = apiCenter.blockHash === center.hash;
//             }

//             return {
//               centerId: center.id,
//               blockChainVerified,
//               generatedHash: center.hash,
//               vaccinationCenterName: center.vaccinationCenterName,
//               apiHash: apiCenter.blockHash,
//             };
//           } else {
//             return {
//               centerId: center.id,
//               blockChainVerified: false,
//               generatedHash: center.hash,
//               vaccinationCenterName: center.vaccinationCenterName,
//               apiHash: null,
//             };
//           }
//         });

//         console.log("Comparison Results:", comparisonResults);

//         centersWithBlockchainVerification = comparisonResults.map((result) => {
//           const center = hashedCenters.find(
//             (ctr) => ctr.id === result.centerId
//           );
//           return {
//             ...center,
//             blockChainVerified: result.blockChainVerified,
//           };
//         });
//       }
//     } catch (err) {
//       console.error("Error verifying with blockchain:", err.message);
//       centersWithBlockchainVerification = hashedCenters.map((center) => ({
//         ...center,
//         blockChainVerified: false,
//       }));
//     }

//     return res.status(200).json({
//       success: true,
//       data: {
//         vaccinationCenters: centersWithBlockchainVerification,
//         pagination: {
//           totalCenters,
//           totalPages: Math.ceil(totalCenters / options.limit),
//           currentPage: options.page,
//         },
//       },
//     });
//   } catch (error) {
//     console.error("Error fetching vaccination centers:", error.message);
//     next(error);
//   }
// };

const getVaccinationCenterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Invalid vaccination center ID format")
        );
    }

    const vaccinationCenter = await VaccinationCenterModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!vaccinationCenter) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "vaccinationCenter not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vaccinationCenter,
          "vaccinationCenter details fetched successfully"
        )
      );
  } catch (error) {
    console.error(error);
    if (!error.message) {
      error.message =
        "Something went wrong while fetching vaccinationCenter details";
    }
    next(error);
  }
};

const editVaccinationCenter = async (req, res, next) => {
  try {
    const { vaccinationCenterId } = req.params;
    const updateData = req.body;

    const updatedVaccinationCenter =
      await VaccinationCenterModel.findByIdAndUpdate(
        vaccinationCenterId,
        { $set: updateData },
        { new: true, runValidators: true, select: "-__v" }
      );

    if (!updatedVaccinationCenter) {
      return next(new ApiError(404, "Vaccination center not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedVaccinationCenter,
          "Vaccination center info updated successfully"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating vaccination center info:",
      error.message
    );

    if (!error.message) {
      error.message =
        "Something went wrong while updating vaccination center info";
    }
    next(error);
  }
};
const getVaccinationCenterForDataCollectorUser = async (req, res, next) => {
  try {
    console.log("The user is:", req.user);
    const userId = req.user._id;
    console.log("Logged-in User ID:", userId);

    // Convert userId to ObjectId if necessary
    const vaccinationCenter = await VaccinationCenterModel.findOne({
      "assignedDataCollectorUser._id": new mongoose.Types.ObjectId(userId),
    }).select("-__v");

    if (!vaccinationCenter) {
      return next(
        new ApiError(404, "Vaccination center not found or not assigned to you")
      );
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          vaccinationCenter,
          "Vaccination center data retrieved successfully"
        )
      );
  } catch (error) {
    console.error(
      "Error while retrieving vaccination center info:",
      error.message
    );

    if (!error.message) {
      error.message =
        "Something went wrong while retrieving vaccination center info";
    }
    next(error);
  }
};

export {
  createVaccinationCenter,
  getVaccinationCenter,
  getVaccinationCenterById,
  editVaccinationCenter,
  getVaccinationCenterForDataCollectorUser,
};
