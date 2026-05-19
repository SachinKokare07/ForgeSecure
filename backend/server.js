const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");

const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api", deviceRoutes);

app.get("/", (req, res) => {
  res.send("ForgeSecure Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});