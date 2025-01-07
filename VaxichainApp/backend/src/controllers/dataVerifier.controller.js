import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { UserModel } from "../models/user.model.js";
import mongoose from "mongoose";

import axios from "axios";

const editDataVerifierInfo = async (req, res, next) => {
  const blockChainToken = req.blockChainToken;
  console.log("The blockchain token is:", blockChainToken);

  try {
    const { dataverifierId } = req.params;
    const updateData = req.body;

    const updatedDataverifier = await UserModel.findByIdAndUpdate(
      dataverifierId,
      { $set: updateData }, // Apply updates from the body
      { new: true, runValidators: true, select: "-__v -password -refreshToken" }
    );

    if (!updatedDataverifier) {
      return next(new ApiError(404, "Verifier not found"));
    }

    const args = [
      updatedDataverifier._id.toString(),
      updatedDataverifier.companyName,
      updatedDataverifier.address?.zip,
      updatedDataverifier.address?.city,
      updatedDataverifier.address?.country,
      updatedDataverifier.address?.addressLine,
      updatedDataverifier.firstName,
      updatedDataverifier.lastName,
      updatedDataverifier.email,
      updatedDataverifier.phoneNumber,
      updatedDataverifier.userType,
    ];

    // Prepare the payload
    const payload = {
      fcn: "EditCompany",
      // peers: ["peer0.company.example.com"],
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
          updatedDataverifier,
          "Verifier info updated successfully and sent to blockchain"
        )
      );
  } catch (error) {
    console.error(
      "Error while updating dataverifier info or sending to blockchain:",
      error.message
    );

    if (!error.message) {
      error.message = "Something went wrong while updating dataverifier info";
    }
    next(error);
  }
};

const getDataVerifierById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if the id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Invalid verifier ID format"));
    }
    const verifier = await UserModel.findById(id).select(
      "-__v -password -refreshToken"
    );
    if (!verifier) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "verifier not found"));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, verifier, "verifier details fetched successfully")
      );
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while fetching verifier details";
    }
    next(error);
  }
};

export { editDataVerifierInfo, getDataVerifierById };
