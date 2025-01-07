import mongoose from "mongoose";
import { config } from "dotenv";

config();

const vaccinationCenterSchema = new mongoose.Schema(
  {
    vaccinationCenterName: {
      type: String,
      rquired: true,
    },
    vaccinationCenterAddress: {
      location: {
        type: String,
      },
      wardNo: {
        type: Number,
        required: true,
        trim: true,
      },
      municipality: {
        type: String,
        required: true,
        trim: true,
      },
    },
    vaccinationDate: {
      type: Date,
      required: true,
    },
    weatherCondition: {
      type: String,
      required: true,
    },
    totalBoys: {
      type: Number,
      required: true,
    },
    totalGirls: {
      type: Number,
      required: true,
    },
    vaccinationCenterStatus: {
      type: String,
      required: true,
    },
    healthCareProvider: [
      {
        providerName: {
          type: String,
          required: true,
        },
        providerPhone: {
          type: Number,
          required: true,
        },
      },
    ],

    createdBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
      userType: {
        type: String,
        required: true,
      },
    },
    observationPeriod: {
      type: String,
      required: true,
    },
    observerDetail: {
      observerName: {
        type: String,
        required: true,
      },
      observerPhone: {
        type: Number,
        required: true,
      },
    },
    roadStatus: {
      type: String,
      required: true,
    },
    assignedDataCollectorUser: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrgUser",
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
    assignedDataVerifierUser: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrgUser",
        required: true,
      },
      firstName: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
    },
  },

  { timestamps: true }
);

const VaccinationCenterModel = mongoose.model(
  "VaccinationCenter",
  vaccinationCenterSchema
);

export { VaccinationCenterModel };
