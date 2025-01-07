import { config } from "dotenv";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

config();

const userSchema = new mongoose.Schema(
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
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    userType: {
      type: String,
      enum: [
        process.env.USER_TYPE_DATACOLLECTOR,
        process.env.USER_TYPE_DATAVERIFIER,
      ],
      required: true,
    },

    companyName: {
      type: String,
      required: true,
      trim: true,
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
    refreshToken: {
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
    caPort: {
      type: Number,
    },
    peerPort: {
      type: Number,
    },
    couchPort: {
      type: Number,
    },
    network: {
      type: String,
      default: "network_1",
    },
    channelName: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      userType: this.userType,
      email: this.email,
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
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

const UserModel = mongoose.model("User", userSchema);

export { UserModel };
