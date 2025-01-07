import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ChildrenModel } from "../models/children.model.js";
import { UserModel } from "../models/user.model.js";
import { VaccinationCenterModel } from "../models/vaccinationCenter.model.js";
import mongoose from "mongoose";
import crypto from "crypto";

import axios from "axios";
const createVaccinationCenterChildren = async (req, res, next) => {
  try {
    console.log("Vaccination center ID is", req.params);
    let { vaccinationCenterId } = req.params;

    vaccinationCenterId = vaccinationCenterId.trim();

    const { firstName, lastName, address, guardianDetails, age, gender } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !address ||
      !guardianDetails ||
      !age ||
      !gender
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required."));
    }

    // Fetch vaccination center details
    const vaccinationCenter = await VaccinationCenterModel.findById(
      vaccinationCenterId
    );
    if (!vaccinationCenter) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Vaccination center not found."));
    }

    const newChild = new ChildrenModel({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      address: {
        location: address.location.trim(),
        wardNo: address.wardNo,
        municipality: address.municipality.trim(),
      },
      guardianDetails: {
        guardianName: guardianDetails.guardianName.trim(),
        guardianPhone: guardianDetails.guardianPhone,
      },
      age,
      gender,
      vaccinationCenterDetails: {
        _id: vaccinationCenter._id,
        vaccinationCenterName: vaccinationCenter.vaccinationCenterName,
      },
    });

    const savedChild = await newChild.save();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          savedChild,
          "Child vaccination record created successfully."
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while creating the child record.";
    }
    next(error);
  }
};

const getVaccinationCenterChildren = async (req, res, next) => {
  console.log("calling vacc childeren");
  const blockChainToken = "req.blockChainToken";
  console.log("Blockchain token:", blockChainToken);

  if (!blockChainToken) {
    return next(new ApiError(401, "Blockchain authorization token not found."));
  }

  try {
    const { page = 1, limit = 10 } = req.query;
    let { vaccinationCenterId } = req.params;

    vaccinationCenterId = vaccinationCenterId.trim();

    if (!vaccinationCenterId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Vaccination Center ID is required."));
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Validate vaccination center existence
    const vaccinationCenter = await VaccinationCenterModel.findById(
      vaccinationCenterId
    );
    if (!vaccinationCenter) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Vaccination center not found."));
    }

    // Fetch total children count
    const totalChildren = await ChildrenModel.countDocuments({
      "vaccinationCenterDetails._id": vaccinationCenterId,
    });

    // Fetch children with pagination
    const children = await ChildrenModel.find({
      "vaccinationCenterDetails._id": vaccinationCenterId,
    })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ createdAt: -1 })
      .lean();

    if (!children.length) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No children records found for this vaccination center."
          )
        );
    }

    // Generate hashes for each child
    const hashedChildren = children.map((child) => {
      const childForHashing = { ...child };
      const childString = JSON.stringify(childForHashing);
      const hash = crypto
        .createHash("sha256")
        .update(childString)
        .digest("hex");

      return { ...child, hash };
    });

    const childIds = hashedChildren.map((child) => child._id.toString());

    let childrenWithBlockchainVerification = [];

    try {
      // Blockchain API call
      const payload = {
        fcn: "GetChildrenWithHashes",
        args: childIds,
      };

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationChildren`,
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

        // Compare generated hashes with blockchain API hashes
        const comparisonResults = hashedChildren.map((child) => {
          const apiChild = apiHashes.find(
            (apiHash) => apiHash.id === child._id.toString()
          );

          if (apiChild) {
            let blockChainVerified;
            if (apiChild.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified = apiChild.blockHash === child.hash;
            }

            return {
              childId: child._id.toString(),
              blockChainVerified,
              generatedHash: child.hash,
              apiHash: apiChild.blockHash,
            };
          } else {
            return {
              childId: child._id.toString(),
              blockChainVerified: false,
              generatedHash: child.hash,
              apiHash: null,
            };
          }
        });

        // Add blockchain verification status to children data
        childrenWithBlockchainVerification = comparisonResults.map((result) => {
          const child = hashedChildren.find(
            (ch) => ch._id.toString() === result.childId
          );
          return {
            ...child,
            blockChainVerified: result.blockChainVerified,
          };
        });
      }
    } catch (err) {
      console.error("Error with blockchain API:", err.message);
      childrenWithBlockchainVerification = hashedChildren.map((child) => ({
        ...child,
        blockChainVerified: false,
      }));
    }

    return res.status(200).json({
      statusCode: 200,
      data: {
        children: childrenWithBlockchainVerification,
        pagination: {
          totalChildren,
          totalPages: Math.ceil(totalChildren / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching vaccination center children:", error.message);
    next(error);
  }
};
const updateVaccinationCenterChild = async (req, res, next) => {
  try {
    console.log("Vaccination center ID and Child ID are", req.params);
    let { vaccinationCenterId, childId } = req.params;

    vaccinationCenterId = vaccinationCenterId.trim();
    childId = childId.trim();

    const { firstName, lastName, address, guardianDetails, age, gender } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !address ||
      !guardianDetails ||
      !age ||
      !gender
    ) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required."));
    }

    // Check if vaccination center exists
    const vaccinationCenter = await VaccinationCenterModel.findById(
      vaccinationCenterId
    );
    if (!vaccinationCenter) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Vaccination center not found."));
    }

    // Check if child exists
    const child = await ChildrenModel.findById(childId);
    if (!child) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Child record not found."));
    }

    // Update child details
    child.firstName = firstName.trim();
    child.lastName = lastName.trim();
    child.address = {
      location: address.location.trim(),
      wardNo: address.wardNo,
      municipality: address.municipality.trim(),
    };
    child.guardianDetails = {
      guardianName: guardianDetails.guardianName.trim(),
      guardianPhone: guardianDetails.guardianPhone,
    };
    child.age = age;
    child.gender = gender;
    child.vaccinationCenterDetails = {
      _id: vaccinationCenter._id,
      vaccinationCenterName: vaccinationCenter.vaccinationCenterName,
    };

    const updatedChild = await child.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedChild,
          "Child vaccination record updated successfully."
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating the child record.";
    }
    next(error);
  }
};
const getChildrenById = async (req, res, next) => {
  console.log("Fetching child by ID and vaccination center ID");

  try {
    let { childId, vaccinationCenterId } = req.params;

    childId = childId.trim();
    vaccinationCenterId = vaccinationCenterId.trim();

    if (!childId || !vaccinationCenterId) {
      return res.status(400).json({
        statusCode: 400,
        message: "Child ID and Vaccination Center ID are required.",
      });
    }

    // Validate vaccination center existence
    const vaccinationCenter = await VaccinationCenterModel.findById(
      vaccinationCenterId
    );
    if (!vaccinationCenter) {
      return res.status(404).json({
        statusCode: 404,
        message: "Vaccination center not found.",
      });
    }

    // Validate child existence and association with the vaccination center
    const child = await ChildrenModel.findOne({
      _id: childId,
      "vaccinationCenterDetails._id": vaccinationCenterId,
    }).lean();

    if (!child) {
      return res.status(404).json({
        statusCode: 404,
        message:
          "Child not found or not associated with this vaccination center.",
      });
    }

    return res.status(200).json({
      statusCode: 200,
      data: {
        child,
      },
      message: "Child fetched successfully.",
    });
  } catch (error) {
    console.error("Error fetching child by ID:", error.message);
    next(error);
  }
};

export {
  createVaccinationCenterChildren,
  getVaccinationCenterChildren,
  updateVaccinationCenterChild,
  getChildrenById,
};
