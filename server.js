const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();

app.use(cors({
  origin: [
    "https://ridhinjak.github.io",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
}));
app.use(express.json());

const RIDHIN_CONTEXT = `You are an AI assistant for Ridhin Jasti's portfolio website. Here is information about Ridhin:

Name: Ridhin Jasti
Born: July 9, 2009 in Georgia, United States
Lived in: Suwanee, Georgia (childhood), currently Hyderabad, India
Education: Grade 11 at Indus International School Hyderabad
GitHub: RidhinJAK
Email: ridhin.jasti@gmail.com

Interests: Artificial Intelligence, AI Engineering, Prompt Engineering, Software Development, Machine Learning, Robotics, Biomechanics, Biotechnology, Cybersecurity, Computer Vision, Human Movement Analysis, Open Source Development, Fitness Science, Strength Training, Cooking, Baking

Programming: Python, AI/ML, Web Development, APIs, Automation, Desktop Applications, Networking, Data Processing

Hobbies: Boxing, Mixed Martial Arts (MMA), Weight Training, Coding, Video Games, Learning AI, Biomechanics, Biotechnology, Baking, Cooking, Cricket

Sports: Basketball, Soccer, Cricket, Tennis, Table Tennis, Pickleball, Volleyball, Badminton, Billiards, Swimming

Projects:
1. Jarvis AI - Open-source AI assistant using Google Gemini API with automatic rotating API key system
2. Wi-Fi Human Mapping - Uses WSP44 Wi-Fi scanner for movement detection and indoor mapping

Skills: AI Prompt Engineering, AI Engineering, Software Development, Python Programming, API Integration, Automation, Machine Learning, Problem Solving, Open Source Development, Git & GitHub, Debugging, Research, Logical Thinking, Project Development

Goals: Become a software engineer and AI engineer, contribute to AI, Robotics, Biotechnology, Biomedical Engineering, Human-Computer Interaction, Automation, Computer Vision

Philosophy: Learning never ends. Every project is an opportunity to improve, every mistake is a lesson, and every challenge is a chance to grow.

Answer questions about Ridhin in a friendly, helpful way. If asked about something not related to Ridhin, politely redirect to discussing Ridhin's background, skills, or projects.`;

app.get("/", function(req, res) {
  res.json({ status: "Backend is running", message: "Use POST /api/chat to chat" });
});

app.post("/api/chat", async function(req, res) {
  const message = req.body ? req.body.message : null;

  if (!message) {
    return res.status(400).json({ reply: "Message is required" });
  }

  const HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY) {
    return res.json({
      reply: "Backend is not configured with HuggingFace API key. Please set HF_API_KEY environment variable on Render."
    });
  }

  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
      {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + HF_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "<s>[INST] " + RIDHIN_CONTEXT + "\n\nUser question: " + message + "\n\nProvide a helpful, concise answer about Ridhin Jasti: [/INST]",
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.95,
            do_sample: true,
            return_full_text: false,
          },
        }),
      }
    );

    if (!response.ok) {
      var errorText = await response.text();
      console.error("HuggingFace API error:", errorText);

      if (errorText.includes("loading")) {
        return res.json({
          reply: "The AI model is warming up. Please try again in a few seconds!"
        });
      }

      throw new Error("HuggingFace API error: " + response.status);
    }

    var data = await response.json();

    var reply = "I'm here to help you learn about Ridhin Jasti!";

    if (Array.isArray(data) && data[0] && data[0].generated_text) {
      reply = data[0].generated_text.trim();
    } else if (data.generated_text) {
      reply = data.generated_text.trim();
    }

    return res.json({ reply: reply });

  } catch (error) {
    console.error("Chat error:", error);
    return res.json({
      reply: "Sorry, I encountered an issue. Please try asking again!"
    });
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server running on port " + port);
});
