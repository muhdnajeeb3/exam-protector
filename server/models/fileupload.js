const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  test_code: { type: String, required: true },
  screenshot: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, required: true }, // Store base64 data
});
const File = mongoose.model("File", FileSchema);

module.exports = File;
