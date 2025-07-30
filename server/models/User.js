
const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profilePic: String,
  username: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
