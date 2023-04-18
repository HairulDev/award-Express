const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, },
  email: { type: String, },
  password: { type: String, },
  file: String,
  id: { type: String },
});

module.exports = mongoose.model("User", userSchema);
