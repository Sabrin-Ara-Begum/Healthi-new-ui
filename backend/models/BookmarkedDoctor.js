import mongoose from "mongoose";

const bookmarkedDoctorSchema = new mongoose.Schema({
  email: { type: String, required: true },
  doctorId: { type: String, required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  location: { type: String, default: "" },
  hospital: { type: String, default: "" },
  mapsUrl: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  experience: { type: String, default: "N/A" },
  fee: { type: String, default: "N/A" },
  availability: { type: String, default: "Call Clinic" },
  phone: { type: String, default: "Not Available" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("BookmarkedDoctor", bookmarkedDoctorSchema);
