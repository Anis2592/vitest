import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  emailid: { type: String, required: true },
  password: { type: String, required: true, unique: true },
  dateOfBirth: { type: Date },
  dateOfJoining: { type: Date },
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.models.AuthUser || mongoose.model("Authuser", userSchema);

export default User;
