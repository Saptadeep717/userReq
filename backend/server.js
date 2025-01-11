const express = require("express");
const connectDB = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes.js");
const userRoutes = require("./routes/userReqRoutes.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const cors = require("cors");


dotenv.config();


const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", userRoutes);

// Start the server
const PORT = process.env.PORT || 4000;
app.get("/", (req, res) => {
  res.send("Welcome to the User Request API");
})
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
