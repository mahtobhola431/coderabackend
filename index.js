import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./api/routes/auth.route.js";
import blogRoutes from "./api/routes/blog.route.js";
import userRoutes from "./api/routes/user.route.js";
import runRoutes from "./api/routes/run.route.js";
import contestRoutes from "./api/routes/contest.route.js";
import progressRoutes from "./api/routes/progressRoutes.js";
import { problemDetails } from "./api/routes/problemDetails.route.js";
import { problemsTable } from "./api/routes/problemsTable.route.js";
import roadmapRoutes from "./api/routes/roadmap.route.js";
import executeRoutes from "./api/routes/execute.route.js";

const app = express();
const server = http.createServer(app);


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5137",
  process.env.FRONTEND_URL,
  "https://coderafrontend.onrender.com",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// SOCKET LOGIC
const rooms = new Map();
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", ({ roomId, username }) => {
    socket.join(roomId);

    if (!rooms.has(roomId)) {
      rooms.set(roomId, { content: "", users: new Set() });
    }

    const room = rooms.get(roomId);
    room.users.add(username);

    socket.emit("load-document", room.content);
    io.to(roomId).emit("user-count", room.users.size);
  });

  socket.on("send-changes", ({ delta, roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      room.content = delta;
      socket.broadcast.to(roomId).emit("receive-changes", delta);
    }
  });

  socket.on("draw", ({ drawLine, roomId }) => {
    socket.broadcast.to(roomId).emit("receive-drawing", drawLine);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

// MONGODB
mongoose
  .connect(process.env.MONGO)
  .then(() => console.log("MongoDB Connected"))
  .catch((e) => console.log(e));

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/blog", blogRoutes);
app.use("/api/run", runRoutes);
app.use("/api/contest", contestRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/problemsTable", problemsTable);
app.use("/api/problem", problemDetails);
app.use(progressRoutes);
app.use("/api/execute", executeRoutes);

// SERVER
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Backend + Socket running on port ${PORT}`);
});
