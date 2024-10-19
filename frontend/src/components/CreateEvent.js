import React, { useState } from 'react';
import { TextField, Button, Container, Typography, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

function CreateEvent() {
  const [eventName, setEventName] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [duration, setDuration] = useState('');
  const [participants, setParticipants] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!eventName || !startDate || !endDate || !duration || !participants) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Here you would send the data to your backend
      console.log('Event created:', { eventName, startDate, endDate, duration, participants });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newEventId = Math.floor(Math.random() * 1000);
      navigate(`/event/${newEventId}`);
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Typography variant="h2" align="center" gutterBottom>
          Create Event
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
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
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Create Event'}
          </Button>
        </form>
      </Container>
    </LocalizationProvider>
  );
}

export default CreateEvent;