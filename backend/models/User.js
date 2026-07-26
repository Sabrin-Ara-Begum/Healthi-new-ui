import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: "",
    },
    age: {
      type: Number,
      default: null,
    },
    gender: {
      type: String,
      default: "",
    },
    bloodGroup: {
      type: String,
      default: "",
    },
    allergies: {
      type: String,
      default: "",
    },
    medicalConditions: {
      type: String,
      default: "",
    },
    emergencyContact: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    themePreference: {
      type: String,
      default: "light",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
