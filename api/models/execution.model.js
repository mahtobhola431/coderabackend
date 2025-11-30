import mongoose from "mongoose";

const executionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    input: {
      type: String,
      default: "",
    },

    output: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["success", "error"],
      default: "success",
    },

    executionTime: {
      type: Number, // milliseconds
      default: 0,
    },

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Execution", executionSchema);
