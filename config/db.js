const mongoose = require("mongoose");
const config = require("config");

// Get variable from default.json
const db = config.get("mongoURI");

// Connect to db
const connectDB = async () => {
  try {
    await mongoose.connect(
      db /* , {
      useNewUrlParser: true,
    } */
    );
    console.log("MongoDB connected :)");
  } catch (error) {
    console.error("error:", error);
    // Exit procces with failure
    //process.exit(1); // TODO is this needed ?
  }
};

module.exports = connectDB;
// TODO check other export methods
