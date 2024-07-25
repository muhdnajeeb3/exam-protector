const express = require("express");
const multer = require('multer');

const {
    createTest,
    userCreatedTests,
    testAdminData,
    testRegister,
    increasePersonDetected,
    increaseVoiceDetected,
    increaseFaceCovering,
    totalWarnings,
    terminateExam,
    allowInExam,
    getAllWarnings ,
    getTerminatedUsers,
    getAllowedUsers,
    uploadScreenshot,
    getScreenshotsByTestCode,
    getScreenshotsByTestCodeAndUserId
} = require("../controllers/test.control");
const { requireSignIn } = require("../middlewares");
const router = express.Router();
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(path.dirname(__dirname), 'uploads');
        console.log('Saving file to:', uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const fileName = shortid.generate() + '-' + file.originalname;
        console.log('Generated file name:', fileName);
        cb(null, fileName);
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for file uploads
});

// user/admin can create test
router.post("/create-test", requireSignIn, createTest);

// user/admin can fetch a list of test which we created
router.get("/all-created-test", requireSignIn, userCreatedTests);

// for registering the exam
router.patch("/test-register/:test_code", requireSignIn, testRegister);

// user/admin can fetch the live status of test
router.get("/test-live-status/:test_code", requireSignIn, testAdminData);

// increasing warning count of person detected
router.patch("/warning-person-detected", requireSignIn, increasePersonDetected);  

router.get("/all-warnings", requireSignIn, getAllWarnings); // New route to get all warnings

 
// increasing warning count of voice-detected
router.patch("/warning-voice-detected", requireSignIn, increaseVoiceDetected);

// increasing warning count of face-covering
router.patch("/warning-face-covering", requireSignIn, increaseFaceCovering);

// will give you total no of warning given to user
router.get("/total-warnings", requireSignIn, totalWarnings);

// route that will terminate the exam of candidate
router.patch("/terminate/:userId", requireSignIn, terminateExam);

router.get("/terminated-users", requireSignIn, getTerminatedUsers);
// route that will allow the terminated candidates to give an exam
router.patch("/allow-in-exam/:userId", requireSignIn, allowInExam);

router.get("/allowed-users", requireSignIn, getAllowedUsers);

router.post('/test/screenshot/:test_code/:user_id', requireSignIn, upload.single('screenshot'), uploadScreenshot);

router.get('/screenshots/:test_code/:user_id', getScreenshotsByTestCodeAndUserId);


module.exports = router;
