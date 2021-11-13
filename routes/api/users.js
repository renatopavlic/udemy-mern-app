const express = require("express");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
//Create router
const router = express.Router();
// Express Validation library
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route     POST api/users
// @desc      Register a user
// @access    Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    //  console.log("user info", req.body);
    const errors = validationResult(req);

    // If there are errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exist
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] }); // formated this way because we want the same err msg format as on line 37
      }

      // Get users gravatar
      const avatar = gravatar.url(email, {
        s: "200", // size
        r: "pg", // rating
        d: "mm", // default
      });

      // Create user instance
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      // Save user to db
      await user.save();

      // Return jwt token
      const payload = {
        user: {
          id: user.id, // when user.save(), we get back mongo db user object with user._id but mongoose transform to to just user.id
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        {
          expiresIn: 360000, // 3600 is one hour (added 00 for longer time for testing)
        },
        (err, token) => {
          if (err) throw err;
          console.log("token: ", token);
          res.json({ token });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
