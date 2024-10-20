import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Typography, Button, Grid, Paper } from '@mui/material';
import CreateEvent from './components/CreateEvent';
import EventPage from './components/EventPage';
import ResponseForm from './components/ResponseForm';
import SubmittedPage from './components/SubmittedPage';
import logo from './MeetSmart IMAGE.jpg';
import './Home.css';
import {GoogleOAuthProvider} from "@react-oauth/google";

const theme = createTheme();

function Home() {
  return (
    <div className="home-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh', // Center content vertically
      padding: '20px' 
    }}>
      {/* SVG Filter for Shining Effect */}
      <svg width="0" height="0">
        <defs>
          <filter id="shine">
            <feFlood floodColor="rgba(255, 255, 255, 0.8)" result="color" />
            <feBlend in="SourceGraphic" in2="color" mode="screen" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      {/* Welcome Message Section */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ textAlign: 'left' }}>
          <Typography variant="h5" style={{ 
            fontWeight: 'bold', 
            color: '#333', 
            fontFamily: '"Open Sans", sans-serif', 
            margin: 0,
            marginRight: '10px' // Space between the texts
          }}>
            Welcome to
          </Typography>
          <Typography variant="h1" style={{ 
            fontWeight: 'bold', 
            color: '#1976d2', 
            fontFamily: '"Open Sans", sans-serif', 
            margin: 0,
            filter: 'url(#shine)' // Apply the shine filter
          }}>
            <span style={{ color: '#1976d2' }}>Meet</span> 
            <span style={{ color: '#4caf50' }}>Smart</span>
          </Typography>
        </div>
        
        
{/* Action Button Next to Welcome Message */}
<div style={{ marginLeft: '40px', marginTop: '40px' }}> {/* Added marginTop */}
  <Button 
    variant="contained" 
    color="primary" 
    href="/create" 
    style={{ 
      padding: '15px 30px', 
      fontSize: '20px', 
      borderRadius: '8px' 
    }}
  >
    Create New Event
  </Button>
</div>
      </div>

      {/* Cleaned Description Section */}
      <Typography variant="h5" style={{ 
        textAlign: 'center', 
        color: '#666', 
        marginTop: '20px', // Space from the top
        maxWidth: '600px', 
        margin: '0 auto',
        fontFamily: '"Open Sans", sans-serif' 
      }}>
        Simplify scheduling with MeetSmart. Connect with your team and easily plan events while syncing your calendar for a seamless experience.
      </Typography>
      
      {/* Features Section */}
      <Grid container spacing={3} justifyContent="center" style={{ marginTop: '40px' }}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1976d2', fontFamily: '"Open Sans", sans-serif' }}>Easy Scheduling</Typography>
            <Typography variant="body1" style={{ color: '#555', fontFamily: '"Open Sans", sans-serif' }}>Quickly set up events and share with participants.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1976d2', fontFamily: '"Open Sans", sans-serif' }}>Calendar Integration</Typography>
            <Typography variant="body1" style={{ color: '#555', fontFamily: '"Open Sans", sans-serif' }}>Sync with Google Calendar for seamless planning.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '20px', textAlign: 'center' }}>
            <Typography variant="h6" style={{ fontWeight: 'bold', color: '#1976d2', fontFamily: '"Open Sans", sans-serif' }}>User-Friendly Interface</Typography>
            <Typography variant="body1" style={{ color: '#555', fontFamily: '"Open Sans", sans-serif' }}>Navigate through a clean and intuitive layout.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create" element={<CreateEvent />} />
            <Route path="/event/:eventId" element={<EventPage />} />
            <Route path="event/response/:eventId" element={<ResponseForm />} />
            <Route path="/submitted/:eventId" element={<SubmittedPage />} />
          </Routes>
        </div>
      </Router>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}

export default App;