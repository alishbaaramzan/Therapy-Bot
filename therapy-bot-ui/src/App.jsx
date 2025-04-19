// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SelfHelpBlogs from './pages/SelfHelpBlogs';
import BreathingExercise from './pages/BreathingExercise';
import AIPal from './pages/AIPal';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/ai-pal" element={<AIPal />} />
        <Route path="/self-help-blogs" element={<SelfHelpBlogs />} />
        <Route path="/breathing-exercise" element={<BreathingExercise />} />
      </Routes>
    </Router>
  );
};

export default App;
