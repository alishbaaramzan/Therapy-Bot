// pages/AIPal.jsx
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Basic NavBar (reused from LandingPage)
const NavBar = () => (
  <Box display="flex" justifyContent="flex-end" alignItems="center" p={2} gap={4}>
    <Typography variant="body1" component={RouterLink} to="/">Home</Typography>
    <Typography variant="body1" component={RouterLink} to="/ai-pal">Talk to AI Pal</Typography>
    <Typography variant="body1" component={RouterLink} to="/breathing-exercise">Breathing Exercise</Typography>
    <Typography variant="body1" component={RouterLink} to="/self-help-blogs">Self Help Blogs</Typography>
  </Box>
);

const AIPal = () => {
  const videoRef = useRef();
  const [expression, setExpression] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');

  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = () => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      videoRef.current.srcObject = stream;
    });
  };

  const detectExpressions = async () => {
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections?.expressions) {
      const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
      setExpression(sorted[0][0]); // e.g. "sad", "happy", "neutral"
    }
  };

  const startListening = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => console.error(e);

    recognition.onresult = async (event) => {
      const voiceText = event.results[0][0].transcript;
      setTranscript(voiceText);
      const aiReply = await getLLMResponse(voiceText, expression);
      setResponse(aiReply);
      speak(aiReply);
    };

    recognition.start();
  };

  const getLLMResponse = async (userText, emotion) => {
    try {
      const prompt = `User is feeling "${emotion}" and said: "${userText}". Respond with empathy.`;
  
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
  
      const data = await res.json();
      console.log("AI response:", data);
  
      if (!data.choices || !data.choices.length) {
        return 'AI Pal had trouble replying. Try again!';
      }
  
      return data.choices[0].message.content;
    } catch (err) {
      console.error("Groq API error:", err);
      return 'There was an error contacting AI Pal.';
    }
  };
  

  const speak = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    loadModels().then(startVideo);
    const interval = setInterval(detectExpressions, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box p={4} textAlign="center">
      <NavBar />
      <Typography variant="h4" mb={2}>Talk to AI Pal</Typography>
      <video ref={videoRef} autoPlay muted width="400" style={{ borderRadius: '10px' }} />
      <Typography variant="h6" mt={2}>Detected Emotion: {expression}</Typography>

      <Button variant="contained" onClick={startListening} sx={{ mt: 2 }}>
        {listening ? 'Listening...' : 'Talk to AI Pal'}
      </Button>

      {transcript && (
        <Box mt={3}>
          <Typography variant="body1"><strong>You said:</strong> {transcript}</Typography>
          <Typography variant="body1"><strong>AI Pal:</strong> {response}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default AIPal;
