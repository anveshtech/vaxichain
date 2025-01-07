import mongoose from "mongoose";
import { config } from "dotenv";

config();

const childrenSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      rquired: true,
    },
    lastName: {
      type: String,
      rquired: true,
    },

    address: {
      location: {
        type: String,
        required: true,
        trim: true,
      },
      wardNo: {
        type: Number,
        required: true,
      },
      municipality: {
        type: String,
        required: true,
        trim: true,
      },
    },

    guardianDetails: {
      guardianName: {
        type: String,
        required: true,
      },
      guardianPhone: {
        type: Number,
        required: true,
      },
    },

    age: {
      type: Number,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    vaccinationCenterDetails: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "VaccinationCenter",
        required: true,
      },
      vaccinationCenterName: { type: String, required: true },
    },
  },

  { timestamps: true }
);

const ChildrenModel = mongoose.model("children", childrenSchema);

export { ChildrenModel };
