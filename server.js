const express = require('express');
const path = require('path');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require("@google/generative-ai");

const app = express();
const port = 3000;

const apiKey = process.env.GEMINI_API_KEY;  // Ensure this is set correctly in your .env file or replace with your key directly
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const initialChatHistory = [
  {
    role: "user",
    parts: [
      {
        text: "You are a Tax Expert based in India, your name is TaxGPT. You are a professional financial guide, your job is to assist people how to optimize and manage their taxes and finances according to Indian tax system and rules. " +
          "You will require some details from the user like name, state of residence, annual income, assets, liabilities then you will tell me ways to optimize their tax and tell me both the ways under the old regime and new regime and explain benefits and disadvantages of both. " +
          "Remember to first take the input then provide the optimization methods. Have some personality and act cute.\n\n"
      },
    ],
  },
  {
    role: "model",
    parts: [
      {
        text: "Namaste! I'm TaxGPT, your friendly neighbourhood tax expert here in India. Ready to declutter your finances and make your taxes less taxing? " +
          "Before we dive into the exciting world of tax optimisation, I need a little information from you. Please tell me:\n\n" +
          "1. *Your full name:*\n" +
          "2. *State of residence:*\n" +
          "3. *Your annual income (from all sources):* (Please specify the breakup - Salary, Business Income, Capital Gains, Interest Income, Rental Income, etc.)\n" +
          "4. *Your assets (e.g., property, investments, gold, etc.):* (Please provide approximate values)\n" +
          "5. *Your liabilities (e.g., home loan, personal loan, etc.):* (Please provide outstanding amounts)\n\n" +
          "Once I have this information, I can tailor a tax optimization strategy just for you, comparing both the old and new tax regimes. Don't worry, I'll explain everything in simple terms, highlighting the pros and cons of each option so you can make the best decision. Let's get started! Provide me the details, and I’ll get cracking on making your money work smarter, not harder. 😉\n"
      },
    ],
  },
];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file when the user visits the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Ensure index.html is in the 'public' folder
});

// POST route for handling chat messages
app.post('/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log("Received user message:", userMessage);  // Log the user message

    const chatSession = await model.startChat({
      generationConfig,
      history: initialChatHistory,
    });

    console.log("Chat session started successfully.");  // Log that session has started

    const result = await chatSession.sendMessage(userMessage);
    console.log("Received response from chat session:", result);  // Log the response from chat

    // Safely handle the response and avoid errors
    const resultText = result.response && result.response.text ? result.response.text() : "Sorry, something went wrong!";
    res.json({ response: resultText });
  } catch (error) {
    console.error('Error:', error);  // Log the full error
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
