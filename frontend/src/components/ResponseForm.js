import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';

function ResponseForm() {
  const navigate = useNavigate();
  const [answererName, setAnswererName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(10);
  const [endMinute, setEndMinute] = useState(0);
  const [dayPreference, setDayPreference] = useState('');
  const [timePreference, setTimePreference] = useState('');

  useEffect(() => {
    const gapi = window.gapi;

    const start = async () => {
      try {
        await gapi.client.init({
          apiKey: 'AIzaSyBFKyYCsZfLMGzAF0Um--rVpv5ByJZPKaU',
          clientId: '1008146991028-39omga8pbeaf00miu9gldiv8n64dsnnm.apps.googleusercontent.com',
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: 'https://www.googleapis.com/auth/calendar.readonly',
        });
        console.log('GAPI client initialized');
      } catch (error) {
        console.error('Error initializing GAPI client:', error);
      }
    };

    gapi.load('client:auth2', start);
  }, []); // Empty dependency array to run only once

  const handleAddAvailability = () => {
    if (startHour !== null && endHour !== null && selectedDate) {
      const newAvailability = {
        date: selectedDate,
        startTime: `${startHour}:${startMinute < 10 ? `0${startMinute}` : startMinute}`,
        endTime: `${endHour}:${endMinute < 10 ? `0${endMinute}` : endMinute}`,
      };
      setAvailabilities([...availabilities, newAvailability]);
      // Reset form fields for the next entry
      setStartHour(9);
      setStartMinute(0);
      setEndHour(10);
      setEndMinute(0);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const submissionData = {
      name: answererName,
      availabilities,
      dayPreference,
      timePreference,
    };
    console.log(submissionData); // For demonstration purposes
    navigate('/submitted');
  };

  const handleAuthClick = async () => {
    try {
      await window.gapi.auth2.getAuthInstance().signIn();
      console.log('User signed in');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };
  
  const syncWithGoogleCalendar = async () => {
    const gapi = window.gapi;

    if (!gapi || !gapi.client) {
      console.error('GAPI client not loaded');
      return;
    }

    try {
      const response = await gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });
  
      const events = response.result.items;
      console.log('Fetched events:', events);
  
      // Process the events to determine availability
      const availableTimes = []; // Populate based on the events
      // TODO: Check for gaps between events and populate availableTimes array
  
      // Update your state with available times
      // Example: setAvailableTimes(availableTimes);
    } catch (error) {
      console.error('Error syncing with Google Calendar:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Typography variant="h4" align="center" gutterBottom>
          Response Form
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Your Name"
            variant="outlined"
            value={answererName}
            onChange={(e) => setAnswererName(e.target.value)}
            required
          />
          <Typography variant="h6" align="center" gutterBottom>
            Availability
          </Typography>

          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth variant="outlined" required />}
          />

          {/* Start Time Input */}
          <Typography variant="h6" align="center" gutterBottom>
            Set Start Time
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <TextField
              type="number"
              label="Hour"
              value={startHour}
              onChange={(e) => setStartHour(Math.max(0, Math.min(23, Number(e.target.value))))} // Limit to 0-23
              inputProps={{ min: 0, max: 23 }}
              required
              variant="outlined"
              style={{ width: '80px' }}
            />
            <TextField
              type="number"
              label="Minute"
              value={startMinute}
              onChange={(e) => setStartMinute(Math.max(0, Math.min(59, Number(e.target.value))))} // Limit to 0-59
              inputProps={{ min: 0, max: 59 }}
              required
              variant="outlined"
              style={{ width: '80px' }}
            />
          </div>

          {/* End Time Input */}
          <Typography variant="h6" align="center" gutterBottom>
            Set End Time
          </Typography>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
            <TextField
              type="number"
              label="Hour"
              value={endHour}
              onChange={(e) => setEndHour(Math.max(0, Math.min(23, Number(e.target.value))))} // Limit to 0-23
              inputProps={{ min: 0, max: 23 }}
              required
              variant="outlined"
              style={{ width: '80px' }}
            />
            <TextField
              type="number"
              label="Minute"
              value={endMinute}
              onChange={(e) => setEndMinute(Math.max(0, Math.min(59, Number(e.target.value))))} // Limit to 0-59
              inputProps={{ min: 0, max: 59 }}
              required
              variant="outlined"
              style={{ width: '80px' }}
            />
          </div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleAuthClick}
          >
            Sign in with Google
          </Button>

          <Button
            variant="contained"
            color="primary"
            onClick={syncWithGoogleCalendar}
          >
            Sync with Google Calendar
          </Button>
          {/* Add Availability Button */}
          <Button
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
            onClick={handleAddAvailability}
          >
            Add Availability
          </Button>

          {/* Day Preference Radio Buttons */}
          <Typography variant="h6" align="center" gutterBottom>
            Day Preference
          </Typography>
          <RadioGroup
            value={dayPreference}
            onChange={(e) => setDayPreference(e.target.value)}
            row
            style={{ justifyContent: 'center' }}
          >
            <FormControlLabel value="weekdays" control={<Radio />} label="Weekdays" />
            <FormControlLabel value="weekends" control={<Radio />} label="Weekends" />
          </RadioGroup>

          {/* Time Preference Radio Buttons */}
          <Typography variant="h6" align="center" gutterBottom>
            Time Preference
          </Typography>
          <RadioGroup
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value)}
            row
            style={{ justifyContent: 'center' }}
          >
            <FormControlLabel value="morning" control={<Radio />} label="Weekdays" />
            <FormControlLabel value="weekends" control={<Radio />} label="Weekends" />
          </RadioGroup>

          {/* Time Preference Radio Buttons */}
          <Typography variant="h6" align="center" gutterBottom>
            Time Preference
          </Typography>
          <RadioGroup
            value={timePreference}
            onChange={(e) => setTimePreference(e.target.value)}
            row
            style={{ justifyContent: 'center' }}
          >
            <FormControlLabel value="morning" control={<Radio />} label="Morning (6am-12pm)" />
            <FormControlLabel value="afternoon" control={<Radio />} label="Afternoon (12pm-5pm)" />
            <FormControlLabel value="evening" control={<Radio />} label="Evening (5pm-9pm)" />
            <FormControlLabel value="night" control={<Radio />} label="Night (9pm-2am)" />
          </RadioGroup>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            style={{ marginTop: '20px' }}
          >
            Submit Availability
          </Button>

          {/* Display Current Availabilities */}
          <Typography variant="h6" align="center" gutterBottom style={{ marginTop: '20px' }}>
            Current Availabilities:
          </Typography>
          <ul>
            {availabilities.map((availability, index) => (
              <li key={index}>
                {availability.date.toLocaleDateString()} - {availability.startTime} to {availability.endTime}
              </li>
            ))}
          </ul>
        </form>
      </Container>
    </LocalizationProvider>
  );
}

export default ResponseForm;