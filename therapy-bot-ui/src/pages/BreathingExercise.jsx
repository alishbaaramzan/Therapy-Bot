import React, { useState, useRef } from 'react';
import { Box, Button, Typography, CircularProgress, TextField, Link } from '@mui/material';
import { styled } from '@mui/system';
import Confetti from 'react-confetti';
import { Link as RouterLink } from 'react-router-dom';

const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(/images/breathing_bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  backgroundColor: '006400', // cream color
  color: '#000',
  fontWeight: 'bold',
  fontSize: '1rem',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const NavLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4),
  color: '#006400',
}));

const TimerBox = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  padding: theme.spacing(5),
  borderRadius: '12px',
  color: '#fff',
  boxShadow: '0px 4px 15px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const BreathingExercise = () => {
  const [rounds, setRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(5);
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const intervalRef = useRef(null);
  const synth = window.speechSynthesis;

  const speak = (text) => {
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const runTimer = (phase, roundNumber) => {
    let count = 5;
    setTimer(count);

    intervalRef.current = setInterval(() => {
      count -= 1;
      setTimer(count);

      if (count <= 0) {
        clearInterval(intervalRef.current);

        if (phase === 'in') {
          setIsBreathingIn(false);
          speak('Now breathe out...');
          setTimeout(() => runTimer('out', roundNumber), 1500);
        } else {
          const nextRound = roundNumber + 1;
          if (nextRound < rounds) {
            setCurrentRound(nextRound);
            setIsBreathingIn(true);
            speak(`Round ${nextRound + 1}. Breathe in...`);
            setTimeout(() => runTimer('in', nextRound), 1500);
          } else {
            speak('Great job! You’ve completed all your breathing rounds!');
            setIsCelebrating(true);
            setIsExerciseActive(false);
          }
        }
      }
    }, 1000);
  };

  const startExercise = () => {
    setIsCelebrating(false);
    setCurrentRound(0);
    setIsBreathingIn(true);
    setIsExerciseActive(true);
    speak('Let’s start the breathing exercise. Breathe in...');
    setTimeout(() => runTimer('in', 0), 1500);
  };

  return (
    <BackgroundContainer>
      <NavBar>
        <NavLink component={RouterLink} to="/">Home</NavLink>
        <NavLink component={RouterLink} to="/ai-pal" sx={{ 
          backgroundColor: 'rgba(0,100,0,0.1)',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '5px',
        }}>Talk to AI Pal</NavLink>
        <NavLink component={RouterLink} to="/breathing-exercise">Breathing Exercise</NavLink>
        <NavLink component={RouterLink} to="/self-help-blogs">Self Help Blogs</NavLink>
      </NavBar>

      <Content>
        <TimerBox>
          {isCelebrating && <Confetti />}
          <Typography variant="h4" gutterBottom>
            Breathing Exercise
          </Typography>

          {!isExerciseActive && (
            <>
              <TextField
                type="number"
                label="Number of Rounds"
                variant="outlined"
                value={rounds}
                onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))}
                sx={{ mb: 2, backgroundColor: '#fff', borderRadius: 1 }}
              />
              <Button
                variant="contained"
                color="success"
                onClick={startExercise}
                sx={{
                  backgroundColor: '#000',
                  borderRadius: '30px',
                  paddingX: 4,
                  color: '#fff',
                  marginTop: 2,
                  fontSize: '1.2rem', padding: '12px 24px'
                }}
              >
                Start Breathing Exercise
              </Button>
            </>
          )}

          {isExerciseActive && (
            <>
              <Typography variant="h6">
                {isBreathingIn ? 'Breathe In' : 'Breathe Out'}
              </Typography>
              <Typography variant="h3" fontWeight="bold">
                {timer}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Round {currentRound + 1} of {rounds}
              </Typography>
              <CircularProgress sx={{ marginTop: 2 }} color="secondary" />
            </>
          )}
        </TimerBox>
      </Content>
    </BackgroundContainer>
  );
};

export default BreathingExercise;
