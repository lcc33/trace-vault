
const mongoose = require("mongoose");


const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: String,
  email: String,
  profilePic: String,
  username: { type: String, unique: true, required: true, trim: true, minLength: [5, 'username must have 5 characters!'], lowercase: true, },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
