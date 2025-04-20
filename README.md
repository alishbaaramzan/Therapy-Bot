# 🧠 AI Pal – Therapy Bot 

A friendly voice-based AI pal that detects your emotions and responds empathetically.  
Built using React, face-api.js, Groq + OpenAI APIs, and browser-based speech tools.

## 🚀 Getting Started

### Clone the repository

```bash
git clone https://github.com/alishbaaramzan/Therapy-Bot.git
cd therapy-bot-ui
```

### Install dependencies

```bash
npm install
```

### Set up environment variables

Create a `.env` file in the root directory and add the following ( Note: OPENAI API Key is optional, if you don't include it then the code will fallback to speechSynthesis from JavaScript Web API.

```env
REACT_GROQ_API_KEY=your-groq-api-key
REACT_OPENAI_API_KEY=your-openai-api-key
```

### Run the development server

```bash
npm run dev
```

Visit [http://localhost:5173](http://localhost:5173) in your browser.

## 📁 Required Assets

Download the face-api.js models (tinyFaceDetector and FaceExpressionNet, both places in models folder already) and place them in:

```
public/models/
```

Add these images to:

```
public/images/
  ├── blogs_aipal_bg.jpg
  └── bot.jpeg
```

## 💬 Features

- Real-time facial emotion detection using webcam
- Voice-to-text input via browser's speech recognition
- Emotion-aware AI responses using Groq LLM
- Natural speech output via OpenAI TTS or browser fallback

## 🛠 Tech Stack

- React + Vite
- Material UI
- face-api.js
- Groq API (LLaMA 3)
- OpenAI API (TTS)
- Web Speech API

## 📄 License

This project is intended for educational and personal use.
```
