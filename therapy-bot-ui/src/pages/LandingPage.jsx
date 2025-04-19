// pages/LandingPage.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography, Button, Link } from '@mui/material';
import { styled } from '@mui/system';

const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(/images/landing_page_bg.jpg)',
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
  alignItems: 'center',
  paddingLeft: theme.spacing(10),
  maxWidth: '500px',
  color: '#006400',
}));

const LandingPage = () => {
  return (
    <BackgroundContainer>
      <NavBar>
        <NavLink component={RouterLink} to="/">Home</NavLink>
        <NavLink
          component={RouterLink}
          to="/ai-pal"
          sx={{ 
            backgroundColor: 'rgba(0,100,0,0.1)',
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
          <Typography variant="h3" fontWeight={700} gutterBottom>
            Therapy for Free? Lezguu
          </Typography>
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
    </BackgroundContainer>
  );
};

export default LandingPage;
