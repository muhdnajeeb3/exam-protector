const Test = require("../models/test");
const User = require("../models/user");
const shortid = require("shortid");
const File = require("../models/fileupload");
const Attendance = require("../models/attendance");

const createTest = (req, res) => {
  const {
    email,
    test_name,
    test_link_by_user,
    start_time,
    end_time,
    no_of_candidates_appear,
    duration,
  } = req.body;

  // Check if the test_link_by_user already exists
  Test.findOne(
    { test_link_by_user: test_link_by_user },
    (err, existingTest) => {
      if (err) {
        // Handle any server errors while querying the database
        return res.status(500).json({
          msg: "Server error while checking for existing test link",
          error: err,
        });
      }
      if (existingTest) {
        // If the test link already exists, send a specific response
        return res.status(400).json({ msg: "Test link already exists" });
      }

      // If test link does not exist, proceed to create a new test
      const testCode = shortid.generate() + "-" + shortid.generate();
      const test = new Test({
        userId: req.user.id,
        email: email,
        test_name: test_name,
        test_link_by_user: test_link_by_user,
        test_code: testCode,
        start_time: start_time,
        end_time: end_time,
        no_of_candidates_appear: no_of_candidates_appear,
        // total_threshold_warnings: total_threshold_warnings,
        duration: duration,
      });

      test.save((error, data) => {
        if (error) {
          // Handle any errors while saving the new test
          return res
            .status(400)
            .json({ msg: "Something happened while creating new test", error });
        }
        if (data) {
          // If the test is successfully created, send a success response
          return res.status(201).json({
            msg: "Successfully created new Test on platform",
            test_code: testCode,
          });
        }
      });
    }
  );
};

const userCreatedTests = (req, res) => {
  Test.find({}).exec((error, _allTests) => {
    if (error) {
      return res.status(400).json({
        msg: "Something went wrong while fetching all tests",
        error,
      });
    }
    if (_allTests) {
      return res.status(200).json({ _allTests });
    }
  });
};

// const testRegister = async (req, res) => {
//   const { test_code } = req.params;
//   const userId = req.user.id;
//   if (userId) {
//     const updateData = await User.findOneAndUpdate(
//       { _id: userId },
//       {
//         test_code: test_code,
//       }
//     );
//     // res.status(200).json({ updateData });
//     res.status(200).json({ msg: "Now you are register" });
//   }
// };

const testRegister = async (req, res) => {
  const { test_code } = req.params; // Extract the test_code from the URL
  const userId = req.user.id;

  if (userId) {
    try {
      // Fetch the user's name from the database
      const user = await User.findById(userId, "fullName");

      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check if the attendance record already exists
      const existingRecord = await Attendance.findOne({
        test_code: test_code,
        userId: userId,
      });

      if (existingRecord) {
        return res.status(200).json({
          msg: "Attendance already marked for this user",
          attendanceRecords: existingRecord,
        });
      }

      // Create a new attendance record
      const attendance = new Attendance({
        userId: userId,
        fullName: user.fullName,
        test_code: test_code,
        attendance_time: new Date(),
      });

      // Save the attendance record
      await attendance.save();

      res.status(200).json({ msg: "Attendance marked successfully" });
    } catch (error) {
      res.status(500).json({ msg: "Error registering for the exam", error });
    }
  } else {
    res.status(400).json({ msg: "Invalid user ID" });
  }
};

// In your controller file
const getAttendanceByTestCode = async (req, res) => {
  const { test_code } = req.params;

  try {
    const attendanceRecords = await Attendance.find({ test_code })
      .populate("userId", "email fullName") // Populate both email and fullName
      .exec();

    // Respond with userId and fullName
    const response = attendanceRecords.map((record) => ({
      userId: record.userId._id,
      fullName: record.userId.fullName,
      email: record.userId.email,
      attendance_time: new Date(record.attendance_time).toLocaleString(),
    }));  

    res.status(200).json({ attendanceRecords: response });
  } catch (error) {
    console.error("Error fetching attendance records:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const testAdminData = (req, res) => {
  const { test_code } = req.params;
  if (test_code) {
    User.find({ test_code: test_code }).exec((error, candidates) => {
      if (error)
        return res.status(400).json({
          msg: "Something went wrong while fetching candidates-status",
        });
      if (candidates) return res.status(200).json({ candidates });
    });
  }
};

const increasePersonDetected = async (req, res) => {
  const userId = req.user.id;
  if (userId) {
    const updateData = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { person_detected: 1 },
      }
    );
    res.status(200).json({ msg: "warning of person detected" });
  }
};

// Handler to get warnings for all users
const getAllWarnings = async (req, res) => {
  try {
    const users = await User.find(
      {},
      "studentID fullName person_detected voice_detected face_covering other_warning_fields"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching all warnings:", error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
};

const increaseVoiceDetected = async (req, res) => {
  const userId = req.user.id;
  if (userId) {
    const updateData = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { voice_detected: 1 },
      }
    );
    res.status(200).json({ msg: "warning of voice detected" });
  }
};

const increaseFaceCovering = async (req, res) => {
  const userId = req.user.id;
  if (userId) {
    const updateData = await User.findOneAndUpdate(
      { _id: userId },
      {
        $inc: { face_covered: 1 },
      }
    );
    res.status(200).json({ msg: "warning for face covering" });
  }
};

const totalWarnings = (req, res) => {
  const userId = req.user.id;
  if (userId) {
    User.findOne({ _id: userId }).exec((error, data) => {
      if (data) {
        let total_warnings =
          data.person_detected + data.voice_detected + data.face_covered;
        return res.status(200).json({ totalWarnings: total_warnings });
      }
    });
  } else {
    return res.status(200).json({ msg: "check user-id" });
  }
};

// const terminateExam = async (req, res) => {
//     const userId = req.user?.id;
//     if (userId) {
//         const updateData = await User.findOneAndUpdate({ _id: userId }, {
//             status: "block"
//         });
//         // res.status(200).json({ updateData });
//         res.status(200).json({ msg: "candidate has been blocked" })
//     }
// }
const terminateExam = async (req, res) => {
  const userId = req.params.userId;
  if (userId) {
    try {
      await User.findOneAndUpdate({ _id: userId }, { status: "block" });
      res.status(200).json({ msg: "Candidate has been blocked" });
    } catch (error) {
      res.status(500).json({ msg: "Error blocking candidate", error });
    }
  } else {
    res.status(400).json({ msg: "Invalid user ID" });
  }
};
const getTerminatedUsers = async (req, res) => {
  try {
    const terminatedUsers = await User.find({ status: "block" });
    res.status(200).json(terminatedUsers);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching terminated users", error });
  }
};

// const allowInExam = async (req, res) => {
//     const userId = req.user.id;
//     if (userId) {
//         const updateData = await User.findOneAndUpdate({ _id: userId }, {
//             status: "safe"
//         });
//         // res.status(200).json({ updateData });
//         res.status(200).json({ msg: "candidate is now allowed to give exam" })
//     }
// }
const allowInExam = async (req, res) => {
  const userId = req.params.userId;
  if (userId) {
    try {
      // Find the user by ID
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ msg: "User not found" });
      }

      // Check if the user is terminated
      if (user.status === "block") {
        // Remove user from the terminated list
        await User.findOneAndUpdate({ _id: userId }, { status: "safe" });

        // Add user to the allowed users list
        await User.findOneAndUpdate(
          { _id: userId },
          { $addToSet: { allowedUsers: userId } }
        );

        res.status(200).json({ msg: "Candidate is now allowed to give exam" });
      } else {
        res.status(400).json({ msg: "User is not terminated" });
      }
    } catch (error) {
      res.status(500).json({ msg: "Error allowing candidate", error });
    }
  } else {
    res.status(400).json({ msg: "Invalid user ID" });
  }
};

const getAllowedUsers = async (req, res) => {
  try {
    const allowedUsers = await User.find({ status: "safe" });
    res.status(200).json(allowedUsers);
  } catch (error) {
    res.status(500).json({ msg: "Failed to fetch allowed users", error });
  }
};

// In test.control.js
const uploadScreenshot = async (req, res) => {
  try {
    const { user_id, test_code } = req.params;
    const { screenshot, message, timestamp } = req.body;

    if (!screenshot) {
      return res.status(400).json({ message: "No image data provided" });
    }

    const fileData = {
      user_id,
      test_code,
      screenshot,
      message,
      timestamp, // Ensure the timestamp is a valid Date object
    };

    const newFile = new File(fileData);
    await newFile.save();

    res.status(200).json({ message: "File uploaded successfully", fileData });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getScreenshotsByTestCodeAndUserId = async (req, res) => {
  const { test_code, user_id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 10; // Default to 10 if not specified
  const offset = parseInt(req.query.offset, 10) || 0; // Default to 0 if not specified

  try {
    // Fetch screenshots for a specific test code and user ID with pagination
    const screenshots = await File.find({
      test_code: test_code,
      user_id: user_id,
    })
      .skip(offset)
      .limit(limit);

    if (!screenshots.length) {
      return res.status(404).json({
        message: "No screenshots found for this test code and user ID",
      });
    }

    // Fetch user details
    const user = await User.findById(user_id, "fullName");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const result = {
      user_id: user_id,
      fullName: user.fullName,
      screenshots: screenshots.map((screenshot) => ({
        screenshot: screenshot.screenshot,
        message: screenshot.message,
        timestamp: screenshot.timestamp,
      })),
    };

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTest,
  userCreatedTests,
  testRegister,
  testAdminData,
  increasePersonDetected,
  increaseVoiceDetected,
  increaseFaceCovering,
  increasePersonDetected,
  increaseVoiceDetected,
  increaseFaceCovering,
  totalWarnings,
  terminateExam,
  allowInExam,
  getAllWarnings,
  getTerminatedUsers,
  getAllowedUsers,
  uploadScreenshot,
  getScreenshotsByTestCodeAndUserId,
  getAttendanceByTestCode,
};
