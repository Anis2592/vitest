import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cellphone1: { type: String, required: true },
  cellphone2: { type: String, default: null },
  homenumber: { type: String, default: null },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  emailid: { type: String, required: true, unique: true },
  jobTitle: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  dateOfJoining: { type: Date, required: true },
  languages: { type: [String], required: true },
  ofPaidVacationDaysAllowed: { type: Number, required: true, default: 15 },
  ofPaidSickVacationAllowed: { type: Number, required: true, default: 5 },
  employeeStatus: { type: String, required: true, default: "Active" },
});


const User = mongoose.model("Employeeq", userSchema);

export default User;