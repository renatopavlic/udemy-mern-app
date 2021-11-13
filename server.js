const express = require("express");

const app = express();

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Renato API version 1.0");
});

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
