const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "https://ridhinjak.github.io",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
}));
app.use(express.json());

const RIDHIN_SYSTEM_PROMPT = `You are an AI assistant for Ridhin Jasti's personal portfolio website. You know everything about Ridhin and answer in a friendly, concise way (2-4 sentences max).

Name: Ridhin Jasti
Born: July 9, 2009 in Georgia, United States
Childhood: Suwanee, Georgia
Current Location: Hyderabad, India
Education: Grade 11 at Indus International School Hyderabad
GitHub: RidhinJAK
Email: ridhin.jasti@gmail.com

Interests: Artificial Intelligence, AI Engineering, Prompt Engineering, Software Development, Machine Learning, Robotics, Biomechanics, Biotechnology, Cybersecurity, Computer Vision, Human Movement Analysis, Open Source Development, Fitness Science, Strength Training, Cooking, Baking

Programming: Python and 4 others (5 total). Areas: AI, Automation, APIs, Desktop Apps, Web Dev, ML, Open Source, Networking, Data Processing

Hobbies: Boxing, MMA, Weight Training, Coding, Video Games, Learning AI, Biomechanics, Biotechnology, Baking, Cooking, Cricket

Sports: Basketball, Soccer, Cricket, Tennis, Table Tennis, Pickleball, Volleyball, Badminton, Billiards, Swimming

Projects:
1. Jarvis AI - Open-source AI assistant using Google Gemini API with automatic rotating API key system
2. Wi-Fi Human Mapping - Uses WSP44 Wi-Fi scanner for movement detection and indoor mapping

Skills: AI Prompt Engineering, AI Engineering, Software Dev, Python, API Integration, Automation, ML, Problem Solving, Open Source, Git/GitHub, Debugging, Research, Logical Thinking, Project Development

Certifications: Completed free programming courses on Codingal

Goals: Become a software engineer and AI engineer. Contribute to AI, Robotics, Biotechnology, Biomedical Engineering, HCI, Automation, Computer Vision.

Philosophy: Learning never ends. Every project is an opportunity to improve, every mistake is a lesson, every challenge is a chance to grow.

Only answer about Ridhin. If asked something unrelated, politely redirect.`;

app.get("/", function(req, res) {
  res.json({ status: "Backend is running", message: "POST /api/chat to chat" });
});

app.post("/api/chat", async function(req, res) {
  var message = req.body ? req.body.message : null;

  if (!message) {
    return res.status(400).json({ reply: "Message is required." });
  }

  var GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.json({
      reply: "Backend needs a GROQ_API_KEY environment variable. Get one free at console.groq.com"
    });
  }

  try {
    var response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + GROQ_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: RIDHIN_SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    var data = await response.json();

    if (data.error) {
      console.error("Groq error:", data.error);
      return res.json({ reply: "AI is temporarily busy. Please try again in a moment!" });
    }

    var reply = data.choices[0].message.content.trim();
    return res.json({ reply: reply });

  } catch (error) {
    console.error("Chat error:", error);
    return res.json({ reply: "Something went wrong. Please try again!" });
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server running on port " + port);
});
