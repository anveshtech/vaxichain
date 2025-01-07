import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ChildrenModel } from "../models/children.model.js";
import { VaccinationModel } from "../models/vaccination.model.js";
import { UserModel } from "../models/user.model.js";
import { VaccinationCenterModel } from "../models/vaccinationCenter.model.js";
import mongoose from "mongoose";
import crypto from "crypto";

import axios from "axios";

const createVaccination = async (req, res, next) => {
  try {
    console.log("Child ID is", req.params);
    let { childId } = req.params;

    childId = childId.trim();

    const { vaccineName, vaccineCompany, vaccinatedDate, vaccineType } =
      req.body;

    if (!vaccineName || !vaccineCompany || !vaccinatedDate || !vaccineType) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required."));
    }

    // Fetch child details
    const child = await ChildrenModel.findById(childId);
    if (!child) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Child not found."));
    }

    const newVaccination = new VaccinationModel({
      vaccineName: vaccineName.trim(),
      vaccineCompany: vaccineCompany.trim(),
      vaccinatedDate: new Date(vaccinatedDate),
      vaccineType: vaccineType.trim(),
      childDetails: {
        _id: child._id,
        firstName: child.firstName.trim(),
        guardianName: child.guardianDetails.guardianName.trim(),
        guardianPhone: child.guardianDetails.guardianPhone,
      },
    });

    const savedVaccination = await newVaccination.save();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          savedVaccination,
          "Vaccination record created successfully."
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message =
        "Something went wrong while creating the vaccination record.";
    }
    next(error);
  }
};
const getVaccinationsByChildId = async (req, res, next) => {
  console.log("Fetching vaccinations by child ID");
  const blockChainToken = "req.blockChainToken";
  console.log("Blockchain token:", blockChainToken);

  if (!blockChainToken) {
    return next(new ApiError(401, "Blockchain authorization token not found."));
  }

  try {
    const { page = 1, limit = 10 } = req.query;
    let { childId } = req.params;

    childId = childId.trim();

    if (!childId) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Child ID is required."));
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    // Validate child existence
    const child = await ChildrenModel.findById(childId);
    if (!child) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Child not found."));
    }

    // Fetch total vaccination records count
    const totalVaccinations = await VaccinationModel.countDocuments({
      "childDetails._id": childId,
    });

    // Fetch vaccinations with pagination
    const vaccinations = await VaccinationModel.find({
      "childDetails._id": childId,
    })
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort({ vaccinationDate: -1 })
      .lean();

    if (!vaccinations.length) {
      return res
        .status(404)
        .json(
          new ApiResponse(
            404,
            null,
            "No vaccination records found for this child."
          )
        );
    }

    // Generate hashes for each vaccination
    const hashedVaccinations = vaccinations.map((vaccination) => {
      const vaccinationForHashing = { ...vaccination };
      const vaccinationString = JSON.stringify(vaccinationForHashing);
      const hash = crypto
        .createHash("sha256")
        .update(vaccinationString)
        .digest("hex");

      return { ...vaccination, hash };
    });

    const vaccinationIds = hashedVaccinations.map((vaccination) =>
      vaccination._id.toString()
    );

    let vaccinationsWithBlockchainVerification = [];

    try {
      // Blockchain API call
      const payload = {
        fcn: "GetVaccinationsWithHashes",
        args: vaccinationIds,
      };

      const response = await axios.post(
        `${process.env.BLOCKCHAIN_TEST_URL}/channel1/chaincodes/VaccinationRecords`,
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
        const comparisonResults = hashedVaccinations.map((vaccination) => {
          const apiVaccination = apiHashes.find(
            (apiHash) => apiHash.id === vaccination._id.toString()
          );

          if (apiVaccination) {
            let blockChainVerified;
            if (apiVaccination.blockHash.trim().toLowerCase() === "pending") {
              blockChainVerified = "pending";
            } else {
              blockChainVerified =
                apiVaccination.blockHash === vaccination.hash;
            }

            return {
              vaccinationId: vaccination._id.toString(),
              blockChainVerified,
              generatedHash: vaccination.hash,
              apiHash: apiVaccination.blockHash,
            };
          } else {
            return {
              vaccinationId: vaccination._id.toString(),
              blockChainVerified: false,
              generatedHash: vaccination.hash,
              apiHash: null,
            };
          }
        });

        // Add blockchain verification status to vaccination data
        vaccinationsWithBlockchainVerification = comparisonResults.map(
          (result) => {
            const vaccination = hashedVaccinations.find(
              (vax) => vax._id.toString() === result.vaccinationId
            );
            return {
              ...vaccination,
              blockChainVerified: result.blockChainVerified,
            };
          }
        );
      }
    } catch (err) {
      console.error("Error with blockchain API:", err.message);
      vaccinationsWithBlockchainVerification = hashedVaccinations.map(
        (vaccination) => ({
          ...vaccination,
          blockChainVerified: false,
        })
      );
    }

    return res.status(200).json({
      statusCode: 200,
      data: {
        vaccinations: vaccinationsWithBlockchainVerification,
        pagination: {
          totalVaccinations,
          totalPages: Math.ceil(totalVaccinations / options.limit),
          currentPage: options.page,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching vaccinations by child ID:", error.message);
    next(error);
  }
};

export { createVaccination, getVaccinationsByChildId };
