import axios from "axios";
import Execution from "../models/execution.model.js";

export const executeCode = async (req, res) => {
  const { script, language, input, userId } = req.body;

  try {
    const start = Date.now();

    const jdoodleResponse = await axios.post(
      "https://api.jdoodle.com/v1/execute",
      {
        script,
        stdin: input || "",
        language,
        versionIndex: "0",
        clientId: process.env.JDOODLE_CLIENT_ID,
        clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      }
    );

    const executionTime = Date.now() - start;

    const output = jdoodleResponse.data.output;

    // SAVE EXECUTION LOG
    const newExecution = await Execution.create({
      userId,
      language,
      code: script,
      input,
      output,
      status: "success",
      executionTime,
    });

    return res.status(200).json({
      output,
      executionId: newExecution._id,
      executionTime,
    });

  } catch (error) {
    console.error("Execution Error:", error?.response?.data || error.message);

    // Save error log
    await Execution.create({
      userId,
      language,
      code: script,
      input,
      output: error?.response?.data?.output || "Error executing code",
      status: "error",
      executionTime: 0,
    });

    return res.status(500).json({
      error: "Code execution failed",
      details: error?.response?.data || error.message,
    });
  }
};

export const getExecutionHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const executions = await Execution.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50); // latest 50 executions

    res.json(executions);

  } catch (err) {
    res.status(500).json({ error: "Failed to fetch execution history" });
  }
};
