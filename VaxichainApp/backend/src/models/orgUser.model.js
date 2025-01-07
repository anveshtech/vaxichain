import { config } from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

config();

const orgUserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },

    organization: {
      _id: mongoose.Schema.Types.ObjectId,
      name: String,
    },

    status: {
      type: String,
      required: true,
      enum: [
        process.env.USER_STATUS_PENDING,
        process.env.USER_STATUS_VERIFIED,
        process.env.USER_STATUS_DECLINED,
        process.env.USER_STATUS_ENABLED,
      ],
      default: process.env.USER_STATUS_PENDING,
    },
    address: {
      zip: {
        type: Number,
        required: true,
        trim: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
      },
      country: {
        type: String,
        required: true,
        trim: true,
      },
      addressLine: {
        type: String,
        required: true,
        trim: true,
      },
    },
    refreshToken: {
      type: String,
    },
    userType: {
      type: String,
    },
    profilePic: {
      type: String,
      default: null, // default image is handled
    },
    remarks: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      required: false,
    },
    resetPasswordExpires: {
      type: Date,
      required: false,
    },
  },
  { timestamps: true }
);

orgUserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      email: this.email,
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

orgUserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const OrgUserModel = mongoose.model("OrgUser", orgUserSchema);

export { OrgUserModel };
