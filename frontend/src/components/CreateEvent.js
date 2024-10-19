import React, { useState } from 'react';
import { TextField, Button, Container, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [duration, setDuration] = useState('');
  const [participants, setParticipants] = useState('');
  const navigate = useNavigate(); // Initialize navigate

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Log event data (you can send this to your backend here)
    console.log('Event created:', { eventName, startDate, endDate, duration, participants });

    // Navigate to the event page after creating the event
    const newEventId = Math.floor(Math.random() * 1000); // Mock event ID for demo
    navigate(`/event/${newEventId}`);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Typography variant="h2" align="center" gutterBottom>
          Create Event
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            margin="normal"
          />
          <DatePicker
            label="Start Date"
            value={startDate}
            onChange={(newValue) => setStartDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <DatePicker
            label="End Date"
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <TextField
            fullWidth
            label="Duration (minutes)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Number of Participants"
            type="number"
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Event
          </Button>
        </form>
      </Container>
    </LocalizationProvider>
  );
}

export default CreateEvent;