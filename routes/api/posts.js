const express = require("express");
//Create router
const router = express.Router();

// @route     GET api/posts
// @desc      Test route
// @access    Public
router.get("/", (req, res) => res.send("Posts route"));
router.get("/22", (req, res) => res.send("Posts route 22"));

module.exports = router;
