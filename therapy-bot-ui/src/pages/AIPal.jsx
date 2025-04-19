import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Box, Typography, Button
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const BackgroundContainer = styled(Box)({
  background: 'linear-gradient(to bottom, #f8f6e9, #f0e8c9)',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  backgroundColor: '006400',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '1rem',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const NavLink = styled(Typography)(({ theme }) => ({
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  '&:hover': {
    textDecoration: 'underline',
    cursor: 'pointer',
  },
}));

const CallContainer = styled(Box)({
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2rem',
  padding: '2rem',
  position: 'relative',
});

const VideoWrapper = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const VideoBox = styled('video')({
  width: '40vw',
  maxWidth: '320px',
  borderRadius: '16px',
  border: '3px solid #b7e4c7',
  transform: 'scaleX(-1)',
});

const RobotContainer = styled(Box)({
  width: '40vw',
  maxWidth: '320px',
  height: '240px',
  borderRadius: '16px',
  backgroundColor: '#fff',
  border: '3px solid #cdeac0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  flexDirection: 'column',
});

const RobotImage = styled('img')({
  width: '100%',
  height: '100%',
  borderRadius: '16px',
  objectFit: 'cover',
});

const Ripple = styled(Box)({
  position: 'absolute',
  width: '80%',
  height: '80%',
  borderRadius: '50%',
  border: '4px solid #8bc34a',
  animation: 'ripple 1.4s infinite ease-out',
  top: '10%',
  left: '10%',
  zIndex: 1,
  pointerEvents: 'none',
  '@keyframes ripple': {
    '0%': { transform: 'scale(1)', opacity: 0.8 },
    '100%': { transform: 'scale(1.8)', opacity: 0 }
  }
});

const AIPal = () => {
  const videoRef = useRef();
  const audioRef = useRef(new Audio());
  const [expression, setExpression] = useState('neutral');
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [callStarted, setCallStarted] = useState(false);

  const loadModels = async () => {
    const MODEL_URL = process.env.PUBLIC_URL + '/models';
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
  };

  const startVideo = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const detectExpressions = async () => {
    if (!videoRef.current?.srcObject) return;
    const detections = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (detections?.expressions) {
      const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
      setExpression(sorted[0][0]);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognition.onresult = async (event) => {
      const voiceText = event.results[0][0].transcript;
      const reply = await getLLMResponse(voiceText, expression);
      speak(reply);
    };

    recognition.start();
  };

  const getLLMResponse = async (userText, emotion) => {
    const prompt = `User is feeling '${emotion}' and said: '${userText}'. Respond with empathy.`;
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await res.json();
    return data?.choices?.[0]?.message?.content || 'AI Pal had trouble replying.';
  };

  const speak = async (text) => {
    try {
      setSpeaking(true);
      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.play();
    } catch {
      setSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const startCall = () => {
    setCallStarted(true);
    startListening();
    speak("Hello! I'm your AI Pal. How are you feeling today?");
  };

  const endCall = () => {
    setCallStarted(false);
    window.speechSynthesis.cancel();
    audioRef.current.pause();
    audioRef.current.src = '';
  };

  useEffect(() => {
    loadModels().then(startVideo);
    const interval = setInterval(detectExpressions, 5000);
    return () => {
      clearInterval(interval);
      audioRef.current?.src && URL.revokeObjectURL(audioRef.current.src);
      videoRef.current?.srcObject?.getTracks().forEach(track => track.stop());
    };
  }, []);

  return (
    <BackgroundContainer>
      <NavBar>
        <NavLink component={RouterLink} to="/">Home</NavLink>
        <NavLink component={RouterLink} to="/ai-pal">Talk to AI Pal</NavLink>
        <NavLink component={RouterLink} to="/breathing-exercise">Breathing Exercise</NavLink>
        <NavLink component={RouterLink} to="/self-help-blogs">Self Help Blogs</NavLink>
      </NavBar>

      <CallContainer>
        <VideoWrapper>
          <VideoBox ref={videoRef} autoPlay muted />
          <Typography variant="subtitle1" mt={1} color="#2e7d32">Alishba</Typography>
        </VideoWrapper>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <RobotContainer>
            {speaking && <Ripple />}
            <RobotImage src="/images/bot.jpeg" alt="AI Pal" />
          </RobotContainer>
          <Typography variant="subtitle1" mt={1} color="#2e7d32">AI Pal</Typography>
        </Box>
      </CallContainer>

      <Box textAlign="center" pb={5}>
        <Typography variant="h6" sx={{ color: '#006400', mb: 2 }}>
          Detected Emotion: {expression.charAt(0).toUpperCase() + expression.slice(1)}
        </Typography>
        <Button
          variant="contained"
          onClick={startCall}
          disabled={callStarted}
          sx={{ mr: 2, py: 1.5, px: 3 }}
        >
          {callStarted ? 'In Call' : 'Call AI Pal'}
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={endCall}
          disabled={!callStarted}
          sx={{ py: 1.5, px: 3 }}
        >
          Hang Up
        </Button>
      </Box>
    </BackgroundContainer>
  );
};

export default AIPal;
