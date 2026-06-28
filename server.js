const express = require("express");
const cors = require("cors");
const { InferenceClient } = require("@huggingface/inference");

const app = express();

app.use(cors({
  origin: [
    "https://ridhinjak.github.io",
    "http://localhost:5173",
    "http://localhost:4173"
  ],
}));
app.use(express.json());

const RIDHIN_SYSTEM_PROMPT = `You are an AI assistant for Ridhin Jasti's personal portfolio website. You know everything about Ridhin and answer in a friendly, concise way. Here is all the information about Ridhin:

Name: Ridhin Jasti
Born: July 9, 2009 in Georgia, United States
Childhood: Suwanee, Georgia
Current Location: Hyderabad, India
Education: Grade 11 at Indus International School Hyderabad
GitHub: RidhinJAK
Email: ridhin.jasti@gmail.com

Interests: Artificial Intelligence, AI Engineering, Prompt Engineering, Software Development, Machine Learning, Robotics, Biomechanics, Biotechnology, Cybersecurity, Computer Vision, Human Movement Analysis, Open Source Development, Fitness Science, Strength Training, Cooking, Baking

Programming Languages: Python and 4 others (5 total)
Programming Areas: AI, Automation, APIs, Desktop Apps, Web Dev, ML, Open Source, Networking, Data Processing

Hobbies: Boxing, MMA, Weight Training, Coding, Video Games, Learning AI, Biomechanics, Biotechnology, Baking, Cooking, Cricket

Sports: Basketball, Soccer, Cricket, Tennis, Table Tennis, Pickleball, Volleyball, Badminton, Billiards, Swimming

Projects:
1. Jarvis AI - Open-source AI assistant using Google Gemini API with automatic rotating API key system that switches keys when usage limit is reached
2. Wi-Fi Human Mapping - Uses WSP44 Wi-Fi scanner to estimate movement in buildings and generate indoor space maps

Skills: AI Prompt Engineering, AI Engineering, Software Development, Python, API Integration, Automation, ML, Problem Solving, Open Source, Git/GitHub, Debugging, Research, Logical Thinking, Project Development

Certifications: Completed free programming courses on Codingal (codingal.com)

Goals: Become a software engineer and AI engineer. Contribute to AI, Robotics, Biotechnology, Biomedical Engineering, Human-Computer Interaction, Automation, Computer Vision. Build impactful open-source software.

Philosophy: Learning never ends. Every project is an opportunity to improve, every mistake is a lesson, every challenge is a chance to grow.

Rules:
- Only answer questions related to Ridhin Jasti
- If someone asks something unrelated, politely say you only know about Ridhin and redirect
- Keep answers short and friendly (2-4 sentences max)
- Be enthusiastic about Ridhin's work`;

app.get("/", function(req, res) {
  res.json({ status: "Backend is running", message: "Use POST /api/chat to chat" });
});

app.post("/api/chat", async function(req, res) {
  var message = req.body ? req.body.message : null;

  if (!message) {
    return res.status(400).json({ reply: "Message is required" });
  }

  var HF_API_KEY = process.env.HF_API_KEY;

  if (!HF_API_KEY) {
    return res.json({
      reply: "Backend is not configured with HuggingFace API key. Set HF_API_KEY on Render."
    });
  }

  try {
    var client = new InferenceClient(HF_API_KEY);

    var result = await client.chatCompletion({
      model: "HuggingFaceH4/zephyr-7b-beta",
      messages: [
        { role: "system", content: RIDHIN_SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    var reply = "I'm here to help you learn about Ridhin Jasti!";

    if (result && result.choices && result.choices[0] && result.choices[0].message) {
      reply = result.choices[0].message.content.trim();
    }

    return res.json({ reply: reply });

  } catch (error) {
    console.error("Chat error:", error.message || error);

    // If model is loading (cold start on free tier)
    if (error.message && error.message.includes("loading")) {
      return res.json({
        reply: "The AI model is warming up, please try again in 10-20 seconds!"
      });
    }

    // If model is not available, try fallback
    try {
      console.log("Trying fallback model...");
      var client2 = new InferenceClient(HF_API_KEY);

      var result2 = await client2.chatCompletion({
        model: "microsoft/DialoGPT-large",
        messages: [
          { role: "system", content: RIDHIN_SYSTEM_PROMPT },
          { role: "user", content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      });

      var reply2 = "I'm here to help you learn about Ridhin!";
      if (result2 && result2.choices && result2.choices[0] && result2.choices[0].message) {
        reply2 = result2.choices[0].message.content.trim();
      }
      return res.json({ reply: reply2 });

    } catch (fallbackError) {
      console.error("Fallback also failed:", fallbackError.message || fallbackError);
      return res.json({
        reply: "The AI models are currently loading. Please wait 20 seconds and try again!"
      });
    }
  }
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Server running on port " + port);
});
