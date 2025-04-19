import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Link,
  Button,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import { styled } from '@mui/system';

const BackgroundContainer = styled(Box)(({ theme }) => ({
  backgroundImage: 'url(/images/blogs_aipal_bg.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const NavBar = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  padding: theme.spacing(2, 4),
  gap: theme.spacing(4),
  backgroundColor: '006400', // cream color
  color: '#000',
  fontWeight: 'bold',
  fontSize: '1rem',
  boxShadow: '0px 2px 10px rgba(0,0,0,0.1)',
}));

const NavLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: '#004d00',
  fontWeight: 'bold',
  '&:hover': {
    textDecoration: 'underline',
    color: '#006400',
  },
}));

const Content = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(8, 10),
  color: '#004d00',
  overflowY: 'auto',
}));

const BlogGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
  gap: theme.spacing(4),
  marginTop: theme.spacing(4),
}));

const blogs = [
  {
    title: 'How A Recovering Self-Help Junkie Finds Contentment',
    url: 'https://medium.com/@jasoncmcbride/how-a-recovering-self-help-junkie-finds-contentment-bb9fc8d102d1',
    description: 'After asking all the wrong questions and looking for answers in all the wrong places',
    image: '/images/self_help_blogs/5.jpg',
  },
  {
    title: 'How to Love Yourself With All Your Flaws And Shortcomings',
    url: 'https://medium.com/@stevenchayes/how-to-love-yourself-with-all-your-flaws-and-shortcomings-7673826efa71',
    description: 'A guide on self-love, healing, and growth, and on how to love ourselves despite anything.',
    image: '/images/self_help_blogs/2.jpg',
  },
  {
    title: 'Seven Ways to Re-Frame Self-Contradiction to Your Advantage',
    url: 'https://medium.com/@granthbrennermd/seven-ways-to-re-frame-self-contradition-to-your-advantage-0f975c4a7b70',
    description: 'A psychoanalytically-informed take on the potential uses of seeing personality.',
    image: '/images/self_help_blogs/3.jpg',
  },
  {
    title: 'The one question to ask to make the next few months a little easier',
    url: 'https://medium.com/personal-growth/the-one-question-to-ask-to-make-the-next-few-months-a-little-easier-6ced7ff74905',
    description: 'The barrenness of dead time.',
    image: '/images/self_help_blogs/4.jpg',
  },
  {
    title: 'My Regrets Changed Me For The Better',
    url: 'https://medium.com/modern-women/my-regrets-made-my-life-better-2e939cdd45c0',
    description: 'The two types of regrets and how both types helped me',
    image: '/images/self_help_blogs/1.jpg',
  },
  {
    title: 'The Subtle Ways Philosophy Has Changed My Life',
    url: 'https://medium.com/personal-growth/the-subtle-ways-philosophy-has-changed-my-life-6a73939f5e0d',
    description: 'It’s slowly and quietly stretching my reality.',
    image: '/images/self_help_blogs/6.jpg',
  },
];

const SelfHelpBlogs = () => {
  return (
    <BackgroundContainer>
      <NavBar>
        <NavLink component={RouterLink} to="/">Home</NavLink>
        <NavLink component={RouterLink} to="/ai-pal" sx={{
          backgroundColor: 'rgba(0,100,0,0.1)',
          padding: '4px 8px',
          borderRadius: '6px'
        }}>Talk to AI Pal</NavLink>
        <NavLink component={RouterLink} to="/breathing-exercise">Breathing Exercise</NavLink>
        <NavLink component={RouterLink} to="/self-help-blogs">Self Help Blogs</NavLink>
      </NavBar>

      <Content>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          Self-Help Blogs
        </Typography>
        <Typography variant="body1" paragraph>
          These blogs are great resources to help you take care of your mental well-being:
        </Typography>

        <BlogGrid>
          {blogs.map((blog, index) => (
            <Card key={index} sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardMedia
                component="img"
                height="160"
                image={blog.image}
                alt={blog.title}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {blog.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {blog.description}
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  href={blog.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ marginTop: 1 }}
                >
                  Read More
                </Button>
              </CardContent>
            </Card>
          ))}
        </BlogGrid>
      </Content>
    </BackgroundContainer>
  );
};

export default SelfHelpBlogs;
