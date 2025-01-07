import mongoose from "mongoose";
import { config } from "dotenv";

config();

const vaccinationSchema = new mongoose.Schema(
  {
    vaccineName: {
      type: String,
      rquired: true,
    },
    vaccineCompany: {
      type: String,
      rquired: true,
    },

    vaccinatedDate: {
      type: Date,
      required: true,
    },

    vaccineType: {
      type: String,
      required: true,
    },

    childDetails: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "children",
        required: true,
      },
      firstName: { type: String, required: true },
      guardianName: { type: String, required: true },
      guardianPhone: { type: String, required: true },
    },
  },

  { timestamps: true }
);

const VaccinationModel = mongoose.model("vaccination", vaccinationSchema);

export { VaccinationModel };
