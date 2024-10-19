import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button, Typography, Container } from '@mui/material';
import CreateEvent from './components/CreateEvent';
import EventPage from './components/EventPage';
import ResponseForm from './components/ResponseForm';
import SubmittedPage from './components/SubmittedPage';

const theme = createTheme();

function Home() {
  return (
    <Container>
      <Typography variant="h1" gutterBottom>Welcome to MeetSmart</Typography>
      <Button variant="contained" color="primary" href="/create">
        Create New Event
      </Button>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateEvent />} />
          <Route path="/event/:eventId" element={<EventPage />} />
          <Route path="/response/:eventId" element={<ResponseForm />} />
          <Route path="/submitted/:eventId?" element={<SubmittedPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;