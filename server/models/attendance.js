const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  test_code: { type: String, required: true },
  attendance_time: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Attendance", attendanceSchema);

