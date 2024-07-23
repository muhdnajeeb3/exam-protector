const express = require('express');
const { register, signIn, signOut } = require('../controllers/user.control');
const router = express.Router();
const multer = require('multer');
const shortid = require('shortid');
const path = require('path');
const { requireSignIn } = require('../middlewares');

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
const upload = multer({ storage });

router.post('/register', upload.single('profilePicture'), register);
router.post('/signin', signIn);
router.post('/signout', requireSignIn, signOut);

module.exports = router;
