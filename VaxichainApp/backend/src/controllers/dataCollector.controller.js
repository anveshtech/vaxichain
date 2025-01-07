import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import mongoose from "mongoose";

import axios from "axios";
const editDataCollectorInfo = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  try {
    const { datacollectorId } = req.params;
    const updateData = req.body;

    const updatedDatacollector = await UserModel.findByIdAndUpdate(
      datacollectorId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedDatacollector) {
      return next(new ApiError(404, "collector not found"));
    }

    const args = [
      updatedDatacollector._id.toString(),
      updatedDatacollector.companyName,
      updatedDatacollector.address?.zip,
      updatedDatacollector.address?.city,
      updatedDatacollector.address?.country,
      updatedDatacollector.address?.addressLine,
      updatedDatacollector.firstName,
      updatedDatacollector.lastName,
      updatedDatacollector.email,
      updatedDatacollector.phoneNumber,
      updatedDatacollector.userType,
    ];

    // Prepare the payload
    const payload = {
      fcn: "EditCompany",
      args,
    };

    // Send the payload to the friend's API
    const response = await axios.post(
      `${process.env.BLOCKCHAIN_TEST_URL}/channels/mychannel/chaincodes/Company`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${blockChainToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // Log the friend's API response
    console.log("Response from friend's API:", response.data);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedDatacollector,
          "collector info updated successfully and sent to blockchain"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating datacollector info or sending to blockchain:",
      error.message
    );

    if (!error.message) {
      error.message = "Something went wrong while updating datacollector info";
    }
    next(error);
  }
};
const getDataCollectorById = async (req, res, next) => {
  console.log("hitting single datacoll");
  try {
    const { id } = req.params;

    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid  ID format"));
    }
    const collector = await UserModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!collector) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "collector not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          collector,
          "collector details fetched successfully"
        )
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching collector details";
    }
    next(error);
  }
};

export { getDataCollectorById, editDataCollectorInfo };
