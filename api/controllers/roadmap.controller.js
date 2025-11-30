// import Roadmap from "../models/roadmap.model.js";
// import { Groq } from "groq-sdk";
// import dotenv from "dotenv";
// dotenv.config();

// const groq = new Groq({
//   apiKey: process.env.VITE_GROQ_API_KEY,
// });

// export const generateRoadmap = async (req, res) => {
//   try {
//     const { userId, ...formData } = req.body;


//     const prompt = `
//       Create a 4-week learning roadmap for ${formData.languages
//         .map((l) => l.name)
//         .join(", ")}
//       focusing on ${formData.goals.specificArea}.
//       User experience: ${formData.experience.description}.
//       Format: A human-readable string with weekly topics, projects, and resources, using bullet points.
//     `;

//     const completion = await groq.chat.completions.create({
//       messages: [{ role: "user", content: prompt }],
//       model: "llama-3.3-70b-versatile",
//       temperature: 0.9,
//     });

//     const roadmapContent = completion.choices[0].message.content;
//     // Save to database
//     const roadmap = await Roadmap.create({
//       user: userId,
//       ...formData,
//       generatedRoadmap: roadmapContent,
//     });

//     res.status(201).json({
//       success: true,
//       roadmap,
//     });
//   } catch (error) {
//     console.error("Roadmap generation error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to generate roadmap",
//       error: error.message,
//     });
//   }
// };


import Roadmap from "../models/roadmap.model.js";
import { Groq } from "groq-sdk";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();
console.log("Loaded GROQ key:", process.env.GROQ_API_KEY);

// Initialize Groq client with correct ENV variable
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // FIXED HERE
});

console.log("Loaded GROQ key is :", process.env.GROQ_API_KEY);
export const generateRoadmap = async (req, res) => {
  try {
    const { userId, ...formData } = req.body;

    // Build prompt for Groq AI
    const prompt = `
      Create a detailed 4-week learning roadmap for:
      - Selected Languages/Technologies: ${formData.languages.map(l => l.name).join(", ")}
      - Focus Area: ${formData.goals.specificArea}
      - User Experience: ${formData.experience.description}

      Format:
      - Weekly breakdown
      - Bullet points
      - Topics + Practice + Projects
      - Beginner-friendly language
    `;

    // Groq Model Request
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.9,
    });

    const roadmapContent = completion.choices[0].message.content;

    // Save to DB
    const roadmap = await Roadmap.create({
      user: userId,
      ...formData,
      generatedRoadmap: roadmapContent,
    });

    res.status(201).json({
      success: true,
      roadmap,
    });

  } catch (error) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate roadmap",
      error: error.message,
    });
  }
};
