const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const auth = require("../../middlewere/auth");

// Express Validation library
const { check, validationResult } = require("express-validator");

//Create router
const router = express.Router();

const User = require("../../models/User");

// @route     GET api/auth
// @desc      Get User
// @access    Public

router.get("/", auth, async (req, res) => {
  try {
    // Get the user, leave out the password
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route     POST api/auth
// @desc      Authenticate user & get token
// @access    Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    //  console.log("user info", req.body);
    const errors = validationResult(req);

    // If there are errors
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exist
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] }); // formated this way because we want the same err msg format as on two lines above
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid credentials" }] });
      }

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
