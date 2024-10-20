import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Button, Typography } from '@mui/material';
import CreateEvent from './components/CreateEvent';
import EventPage from './components/EventPage';
import ResponseForm from './components/ResponseForm';
import SubmittedPage from './components/SubmittedPage';

const theme = createTheme();

function Home() {
  return (
    <div>
      <Typography variant="h1">Welcome to MeetSmart</Typography>
      <Button variant="contained" color="primary" href="/create">
        Create New Event
      </Button>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
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
    </ThemeProvider>
  );
}

export default App;