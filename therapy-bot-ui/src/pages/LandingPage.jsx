// pages/LandingPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import { styled, keyframes } from '@mui/system';

// === Background Styling ===
const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(/images/landing_page_bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

// === Navbar ===
const NavBar = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  backgroundColor: '006400',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1rem',
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
}));

const Brand = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontStyle: 'italic',
  fontSize: '1.8rem',
  color: '#000',
  marginRight: 'auto',
}));

const NavLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: '#000',
  fontWeight: 'bold',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

// === Animated Heading ===
const bounceFade = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  50% {
    opacity: 0.8;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedHeading = styled(Typography)(({ theme }) => ({
  animation: `${bounceFade} 2s ease-in-out`,
  color: '#006400',
  fontWeight: 700,
}));

// === Content ===
const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: theme.spacing(10),
  maxWidth: '500px',
  color: '#006400',
}));

// === Mascot Image ===
const Mascot = styled('img')(({ theme }) => ({
  position: 'fixed',
  bottom: '-25px',
  left: '20px', // ✅ changed from right: '20px'
  width: '100px',
  height: 'auto',
  zIndex: 1,
  animation: 'floaty 3s ease-in-out infinite',

  '@keyframes floaty': {
    '0%': { transform: 'translateY(0px)' },
    '50%': { transform: 'translateY(-10px)' },
    '100%': { transform: 'translateY(0px)' },
  },
}));


const LandingPage = () => {
  return (
    <BackgroundContainer>
      <NavBar>
        <Brand component={RouterLink} to="/">AI Pal</Brand>
        <NavLink component={RouterLink} to="/">Home</NavLink>
        <NavLink
          component={RouterLink}
          to="/ai-pal"
          sx={{
            backgroundColor: 'rgba(255,255,255,0.1)',
            fontWeight: 'bold',
            padding: '4px 8px',
            borderRadius: '5px',
          }}
        >
          Talk to AI Pal
        </NavLink>
        <NavLink component={RouterLink} to="/breathing-exercise">Breathing Exercise</NavLink>
        <NavLink component={RouterLink} to="/self-help-blogs">Self Help Blogs</NavLink>
      </NavBar>

      <Content>
        <Box>
          <AnimatedHeading variant="h3" gutterBottom>
            Free Therapy? Lezguu
          </AnimatedHeading>
          <Typography variant="body1" paragraph>
            Mental health is just as important as physical health. Had a rough day or
            just wanna rant, maybe? Let's talk about it. Your very own AI Pal is here to listen to your rants 
            and offer support. No solutions, promise (Unless you ask for them hehe)
          </Typography>
          <Button
            component={RouterLink}
            to="/ai-pal"
            variant="contained"
            sx={{
              backgroundColor: '#000',
              borderRadius: '30px',
              paddingX: 4,
              color: '#fff',
              marginTop: 2,
            }}
          >
            Take me to my Pal Now!
          </Button>
        </Box>
      </Content>

      {/* Cute Robot Mascot */}
      <Mascot src="/images/mascot.png" alt="AI Mascot" />
    </BackgroundContainer>
  );
};

export default LandingPage;
