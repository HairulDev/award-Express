const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, },
  email: { type: String, },
  password: { type: String, },
  active: Boolean,
  file: String,
  id: { type: String },
});

module.exports = mongoose.model("User", userSchema);
