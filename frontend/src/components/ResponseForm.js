import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, TextField, Button, List, ListItem, ListItemText, 
  IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, 
  Snackbar, Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function ResponseForm() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [answererName, setAnswererName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [dayPreference, setDayPreference] = useState('');
  const [timePreference, setTimePreference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

console.log("client ID: ", process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log("Test Variable: ", process.env.REACT_APP_TEST_VARIABLE);

  useEffect(() => {
    const loadGoogleAPI = () => {
      if (window.gapi) {
        window.gapi.load('client:auth2', () => {
          window.gapi.auth2.init({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, // Use the environment variable
          }).then(() => {
            console.log('Google API initialized');
          }).catch((error) => {
            console.error('Error initializing Google API:', error);
          });
        });
      } else {
        console.error('Google API script not loaded');
      }
    };
  
    const loadScript = (src, onLoad) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;
      script.onload = onLoad;
      document.body.appendChild(script);
    };
  
    // Load the Google API script if not already loaded
    if (!window.gapi) {
      loadScript('https://apis.google.com/js/platform.js', loadGoogleAPI);
    } else {
      loadGoogleAPI();
    }
  }, [eventId]);  

  const handleAddAvailability = () => {
    if (selectedDate && startTime && endTime) {
      const newAvailability = {
        date: selectedDate,
        startTime: startTime,
        endTime: endTime,
      };
      setAvailabilities([...availabilities, newAvailability]);
      setStartTime(null);
      setEndTime(null);
    }
  };

  const handleRemoveAvailability = (index) => {
    const newAvailabilities = availabilities.filter((_, i) => i !== index);
    setAvailabilities(newAvailabilities);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answererName || availabilities.length === 0 || !dayPreference || !timePreference) {
      setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
      return;
    }

    setIsSubmitting(true);
    const responseData = {
      event_id: eventId,
      name: answererName,
      availability: availabilities,
      preference_gap: 0,
      preference_day: dayPreference,
      preference_time: timePreference
    };

    try {
      const response = await axios.post(`http://localhost:5001/api/response/submit`, responseData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      setSnackbar({ open: true, message: 'Response submitted successfully', severity: 'success' });
      setTimeout(() => {
        navigate(`/submitted/${eventId}`, { state: { submissionData: response.data } });
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setSnackbar({ open: true, message: 'Error submitting response. Please try again.', severity: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleGoogleLogin = () => {
    const authInstance = window.gapi.auth2.getAuthInstance();
    if (authInstance) {
      authInstance.signIn().then((googleUser) => {
        const profile = googleUser.getBasicProfile();
        const token = googleUser.getAuthResponse().access_token; // Get the access token

        console.log('Google User:', profile);
        // Send the token to your backend to fetch calendar data
        fetchCalendarData(token);
      }).catch((error) => {
        if (error.error === 'popup_closed_by_user') {
          console.warn('Login popup was closed before completion.');
          setSnackbar({ open: true, message: 'Login was canceled. Please try again.', severity: 'warning' });
        } else {
          console.error('Google login error:', error);
          setSnackbar({ open: true, message: 'Error during Google login. Please try again.', severity: 'error' });
        }
      });
    } else {
      console.error('Google API not initialized');
    }
  };

  // Function to fetch calendar data
  const fetchCalendarData = async (token) => {
    try {
      const response = await axios.get('http://localhost:5001/api/calendar', {
        headers: {
          Authorization: `Bearer ${token}`, // Send the token in the header
        },
      });
      console.log('Calendar Data:', response.data);
      // Handle the calendar data as needed
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Response Form for Event <strong>{eventName}</strong>
            <br />
            Event ID: {eventId}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleGoogleLogin} 
            style={{ marginLeft: 'auto' }}
          >
            Login with Google
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Your Name"
            value={answererName}
            onChange={(e) => setAnswererName(e.target.value)}
            margin="normal"
            required
          />
          <DatePicker
            label="Select Date"
            value={selectedDate}
            onChange={(newValue) => setSelectedDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" required />}
          />
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
          />
          <Button onClick={handleAddAvailability} variant="outlined" fullWidth style={{ marginTop: '10px' }}>
            Add Availability
          </Button>
          <List>
            {availabilities.map((availability, index) => (
              <ListItem key={index}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveAvailability(index)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${availability.date.toLocaleDateString()} - ${availability.startTime.toLocaleTimeString()} to ${availability.endTime.toLocaleTimeString()}`}
                />
              </ListItem>
            ))}
          </List>

          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Day Preference</FormLabel>
            <RadioGroup
              row
              value={dayPreference}
              onChange={(e) => setDayPreference(e.target.value)}
            >
              <FormControlLabel value="weekdays" control={<Radio />} label="Weekdays" />
              <FormControlLabel value="weekends" control={<Radio />} label="Weekends" />
            </RadioGroup>
          </FormControl>

          <FormControl component="fieldset" margin="normal">
            <FormLabel component="legend">Time Preference</FormLabel>
            <RadioGroup
              row
              value={timePreference}
              onChange={(e) => setTimePreference(e.target.value)}
            >
              <FormControlLabel value="morning" control={<Radio />} label="Morning (6am-12pm)" />
              <FormControlLabel value="afternoon" control={<Radio />} label="Afternoon (12pm-5pm)" />
              <FormControlLabel value="evening" control={<Radio />} label="Evening (5pm-9pm)" />
              <FormControlLabel value="night" control={<Radio />} label="Night (9pm-2am)" />
            </RadioGroup>
          </FormControl>

          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            fullWidth 
            style={{ marginTop: '20px' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </form>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </LocalizationProvider>
  );
}

export default ResponseForm;
