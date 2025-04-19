import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Box, Typography, Button, Grid, Paper
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const BackgroundContainer = styled(Box)({
  backgroundImage: 'url(/images/blogs_aipal_bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100vw',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  background: 'transparent',
  color: '#000',
  fontWeight: 'bold',
  fontSize: '1rem',
  zIndex: 10,
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(10),
  paddingRight: theme.spacing(10),
  color: '#006400',
}));

const ChatBubble = ({ text, sender }) => (
  <Box
    sx={{
      bgcolor: sender === 'user' ? '#e0f2f1' : '#c8e6c9',
      p: 1.5,
      borderRadius: 2,
      mb: 1,
      maxWidth: '75%',
      alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
    }}
  >
    <Typography variant="body1">{text}</Typography>
  </Box>
);

const AIPal = () => {
  const videoRef = useRef();
  const audioRef = useRef(new Audio());
  const [expression, setExpression] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [speaking, setSpeaking] = useState(false);

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
      setExpression(sorted[0][0]);
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
      const prompt = `User is feeling '${emotion}' and said: '${userText}'. Respond with empathy. Be emotionally intelligent. Keep it short but caring.`;

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
    } catch (err) {
      console.error("Groq API error:", err);
      return 'There was an error contacting AI Pal.';
    }
  };

  const speak = async (text) => {
    try {
      setSpeaking(true);
      const response = await openai.audio.speech.create({
        model: "gpt-4o-mini-tts",
        voice: "alloy",
        input: text,
        instructions: "You are an AI therapist. Speak in empathetic tone, tailored to the user's emotional state.",
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      audioRef.current.src = audioUrl;
      audioRef.current.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };
      audioRef.current.play();
    } catch (error) {
      console.error("OpenAI TTS error:", error);
      setSpeaking(false);
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    loadModels().then(startVideo);
    const interval = setInterval(detectExpressions, 3000);
    return () => {
      clearInterval(interval);
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
    };
  }, []);

  return (
    <BackgroundContainer>
      <NavBar>
        <Typography variant="body1" component={RouterLink} to="/">Home</Typography>
        <Typography variant="body1" component={RouterLink} to="/ai-pal">Talk to AI Pal</Typography>
        <Typography variant="body1" component={RouterLink} to="/breathing-exercise">Breathing Exercise</Typography>
        <Typography variant="body1" component={RouterLink} to="/self-help-blogs">Self Help Blogs</Typography>
      </NavBar>

      <Content>
        <Box sx={{ width: '100%' }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#006400', mb: 3 }}>
            Talk to AI Pal
          </Typography>

          <Grid container spacing={3}>
            {/* Video Box */}
            <Grid item xs={12} md={3}>
              <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderRadius: 3 }}>
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  width="100%"
                  style={{ borderRadius: '10px', maxHeight: '200px' }}
                />
                <Typography variant="h6" mt={2} sx={{ color: '#006400' }}>
                  Detected Emotion: {expression}
                </Typography>
                <Button
                  variant="contained"
                  onClick={startListening}
                  disabled={speaking}
                  sx={{
                    mt: 2,
                    backgroundColor: '#000',
                    borderRadius: '30px',
                    paddingX: 4,
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: '#222',
                    }
                  }}
                >
                  {listening ? 'Listening...' : speaking ? 'Speaking...' : 'Talk to AI Pal'}
                </Button>
              </Paper>
            </Grid>

            {/* Conversation Box */}
            <Grid item xs={12} md={9}>
              <Paper elevation={3} sx={{ 
                p: 3, 
                pb: 5, // extra bottom padding
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2, 
                height: '100%', 
                borderRadius: 3 
              }}>
                <Typography variant="h6" sx={{ color: '#006400' }}>Conversation</Typography>
                {transcript ? (
                  <>
                    <ChatBubble text={transcript} sender="user" />
                    <ChatBubble text={response} sender="ai" />
                  </>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Your chat will appear here.
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Content>
    </BackgroundContainer>
  );
};

export default AIPal;