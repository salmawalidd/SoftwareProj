import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/manager", managerRoutes);

app.get("/", (req, res) => {
  res.send("API Running Successfully");
});

app.get("/test", (req, res) => {
  res.json({
    message: "working"
  });
});

const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});