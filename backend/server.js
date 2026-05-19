const express = require("express");
const cors = require("cors");
const http = require("http");

const { Server } = require("socket.io");

require("dotenv").config();

const connectDB = require("./config/db");

const deviceRoutes = require("./routes/deviceRoutes");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api", deviceRoutes);

app.get("/", (req, res) => {
  res.send("ForgeSecure Backend Running");
});

io.on("connection", (socket) => {

  console.log("Client Connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client Disconnected");
  });

});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});