import express from "express";
import { executeCode, getExecutionHistory } from "../controllers/execute.controller.js";

const router = express.Router();

router.post("/", executeCode);
router.get("/history/:userId", getExecutionHistory);

export default router;
