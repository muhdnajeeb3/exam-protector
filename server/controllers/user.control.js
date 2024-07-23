const User = require('../models/user');
const jwt = require('jsonwebtoken');

const register = (req, res) => {
  User.findOne({ email: req.body.email })
    .exec((error, user) => {
      if (user) {
        return res.status(409).json({ msg: 'User already registered' });
      }

      const { fullName, email, password, profilePicture } = req.body;

      const _user = new User({
        fullName: fullName,
        email: email,
        password: password,
        profilePicture: profilePicture
      });

      _user.save((error, data) => {
        if (error) {
          return res.status(400).json({ msg: 'Something happened while storing new user', error });
        }
        if (data) {
          return res.status(201).json({ msg: 'New user successfully registered!' });
        }
      });
    });
};

const signIn = (req, res) => {
  User.findOne({ email: req.body.email })
    .exec((error, user) => {
      if (error) return res.status(400).json({ msg: "Internal error", error });
      if (user) {
        if (user.authenticate(req.body.password)) {
          const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.jwt_secret_key,
            { expiresIn: '2d' }
          );
          const { _id, fullName, email, profilePicture } = user;
          res.cookie('token', token, { expiresIn: '2d' });
          res.status(200).json({
            token, user: {
              _id, fullName, email, profilePicture
            }
          });
        } else {
          return res.status(401).json({ msg: "Invalid password" });
        }
      } else {
        return res.status(404).json({ msg: "User does not exist" });
      }
    });
};

const signOut = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ msg: 'Sign-out Successfully' });
};

module.exports = {
  register,
  signIn,
  signOut
};
