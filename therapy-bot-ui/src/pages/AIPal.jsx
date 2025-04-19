import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import {
  Box, Typography, Button, Grid, Paper, TextField
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/system';
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Simpler background container without complex gradients
const BackgroundContainer = styled(Box)({
  background: 'linear-gradient(to bottom, #f8f6e9, #f0e8c9)',
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

// Simpler navigation bar
const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.2)',
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  color: '#006400',
  fontWeight: 'bold',
  zIndex: 10,
}));

const NavLink = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(0,100,0,0.1)',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(4),
}));

// Simpler chat bubble without animations or complex styling
const ChatBubble = ({ text, sender }) => (
  <Box
    sx={{
      bgcolor: sender === 'user' ? '#e0f2f1' : '#c8e6c9',
      p: 2,
      borderRadius: sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
      maxWidth: '75%',
      alignSelf: sender === 'user' ? 'flex-end' : 'flex-start',
      mb: 2,
    }}
  >
    <Typography variant="body1">{text}</Typography>
  </Box>
);

const AIPal = () => {
  const videoRef = useRef();
  const chatContainerRef = useRef();
  const audioRef = useRef(new Audio());
  const [expression, setExpression] = useState('neutral');
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadModels = async () => {
    try {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
    } catch (error) {
      console.error("Error loading face detection models:", error);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      addMessage("Could not access camera. Please check your permissions.", "ai");
    }
  };

  const detectExpressions = async () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
        setExpression(sorted[0][0]);
      }
    } catch (error) {
      console.error("Error detecting expressions:", error);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      addMessage("Speech recognition is not supported in this browser.", "ai");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = (e) => {
      console.error(e);
      setListening(false);
    };

    recognition.onresult = async (event) => {
      const voiceText = event.results[0][0].transcript;
      await handleUserMessage(voiceText);
    };

    recognition.start();
  };

  const handleUserMessage = async (text) => {
    // Add user message
    addMessage(text, "user");
    setTextInput('');
    setLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);

    // Get AI response
    try {
      const aiReply = await getLLMResponse(text, expression);
      addMessage(aiReply, "ai");
      setLoading(false);
      
      // Speak the response
      speak(aiReply);
      
      // Scroll to bottom again after response
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error getting response:", error);
      setLoading(false);
      addMessage("Sorry, I had trouble responding. Please try again.", "ai");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleUserMessage(textInput);
    }
  };

  const addMessage = (text, sender) => {
    setMessages(prevMessages => [...prevMessages, { text, sender }]);
  };

  const getLLMResponse = async (userText, emotion) => {
    try {
      const prompt = `User is feeling '${emotion}' and said: '${userText}'. Respond with empathy. Be emotionally intelligent. Keep it short but caring. Provide solutions and suggestion when the user asks for them.`;

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
      console.error("API error:", err);
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
      console.error("TTS error:", error);
      setSpeaking(false);
      
      // Fallback to browser's speech synthesis
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  useEffect(() => {
    loadModels().then(startVideo);
    
    // Set up interval for emotion detection - less frequent to reduce processing
    const interval = setInterval(detectExpressions, 5000);
    
    // Add welcome message with delay to ensure component is fully mounted
    setTimeout(() => {
      addMessage("Hello! I'm your AI Pal. How are you feeling today?", "ai");
    }, 1500);
    
    return () => {
      clearInterval(interval);
      if (audioRef.current.src) {
        URL.revokeObjectURL(audioRef.current.src);
      }
      // Clean up video
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <BackgroundContainer>
      <NavBar>
        <NavLink variant="body1" component={RouterLink} to="/">Home</NavLink>
        <NavLink variant="body1" component={RouterLink} to="/ai-pal" sx={{ 
          backgroundColor: 'rgba(0,100,0,0.1)',
          fontWeight: 'bold'
        }}>Talk to AI Pal</NavLink>
        <NavLink variant="body1" component={RouterLink} to="/breathing-exercise">Breathing Exercise</NavLink>
        <NavLink variant="body1" component={RouterLink} to="/self-help-blogs">Self Help Blogs</NavLink>
      </NavBar>

      <Content>
        <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto' }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            sx={{ 
              color: '#006400', 
              mb: 4,
              borderBottom: '2px solid #006400',
              pb: 1,
              display: 'inline-block'
            }}
          >
            Talk to AI Pal
          </Typography>

          <Grid container spacing={3}>
            {/* Video Box */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  backgroundColor: 'white',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px',
                      border: '2px solid #e0f2f1',
                      maxHeight: '240px',
                      backgroundColor: '#f5f5f5'
                    }}
                  />
                </Box>
                
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 2, 
                    color: '#006400',
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Box 
                    component="span" 
                    sx={{ 
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      backgroundColor: '#006400',
                      marginRight: 1
                    }} 
                  />
                  Detected Emotion: {expression.charAt(0).toUpperCase() + expression.slice(1)}
                </Typography>
                
                <Button
                  variant="contained"
                  onClick={startListening}
                  disabled={speaking || listening}
                  sx={{
                    mt: 'auto',
                    py: 1.5,
                    mb: 1,
                    backgroundColor: listening ? '#ff9800' : '#006400',
                    borderRadius: '30px',
                    color: '#fff',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: listening ? '#f57c00' : '#004d00',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: '#c8e6c9',
                      color: '#388e3c',
                    }
                  }}
                >
                  {listening ? 'Listening...' : speaking ? 'Speaking...' : 'Talk to AI Pal'}
                </Button>
                
                <Button
                  variant="outlined"
                  onClick={clearChat}
                  sx={{
                    borderColor: '#006400',
                    color: '#006400',
                    '&:hover': {
                      borderColor: '#004d00',
                      backgroundColor: 'rgba(0,100,0,0.05)',
                    }
                  }}
                >
                  Clear Chat
                </Button>
              </Paper>
            </Grid>

            {/* Conversation Box */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={3} 
                sx={{ 
                  borderRadius: 3,
                  height: '500px',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'white',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ 
                  p: 2,
                  borderBottom: '1px solid rgba(0,0,0,0.1)',
                  backgroundColor: '#f0f8f0'
                }}>
                  <Typography variant="h6" sx={{ color: '#006400', fontWeight: 'bold' }}>
                    Conversation
                  </Typography>
                </Box>

                {/* Chat messages container */}
                <Box 
                  ref={chatContainerRef}
                  sx={{ 
                    flex: 1, 
                    p: 3, 
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: '#fcfcfc'
                  }}
                >
                  {messages.map((message, index) => (
                    <ChatBubble
                      key={index}
                      text={message.text}
                      sender={message.sender}
                    />
                  ))}
                  
                  {loading && (
                    <Box sx={{ alignSelf: 'flex-start', ml: 2, mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        AI Pal is thinking...
                      </Typography>
                    </Box>
                  )}
                  
                  {messages.length === 0 && !loading && (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%'
                    }}>
                      <Typography variant="body1" color="text.secondary">
                        Start a conversation with AI Pal
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Message input area */}
                <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={1}>
                      <Grid item xs>
                        <TextField
                          fullWidth
                          variant="outlined"
                          placeholder="Type your message..."
                          value={textInput}
                          onChange={(e) => setTextInput(e.target.value)}
                          disabled={speaking || loading}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#006400',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item>
                        <Button
                          type="submit"
                          variant="contained"
                          disabled={!textInput.trim() || speaking || loading}
                          sx={{
                            height: '100%',
                            backgroundColor: '#006400',
                            '&:hover': {
                              backgroundColor: '#004d00',
                            },
                            '&.Mui-disabled': {
                              backgroundColor: '#c8e6c9',
                            }
                          }}
                        >
                          Send
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Content>
    </BackgroundContainer>
  );
};

export default AIPal;