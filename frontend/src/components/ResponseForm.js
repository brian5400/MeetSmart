import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container, Typography, TextField, Button, List, ListItem, ListItemText,
    IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel,
    Snackbar, Alert, Paper, Box, Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { useGoogleLogin } from '@react-oauth/google';

function ResponseForm() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventName, setEventName] = useState(''); // Define state for eventName
    const [answererName, setAnswererName] = useState('');
    const [selectedDate, setSelectedDate] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [dayPreference, setDayPreference] = useState('');
    const [timePreference, setTimePreference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Google OAuth States
    const [googleToken, setGoogleToken] = useState(null);
    const [googleCalendarId, setGoogleCalendarId] = useState(null);

    // Initialize Google Login
    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setGoogleToken(tokenResponse.access_token);
            fetchPrimaryCalendar(tokenResponse.access_token);
        },
        onError: (errorResponse) => {
            console.error('Google Login Failed:', errorResponse);
            setSnackbar({ open: true, message: 'Google Login Failed', severity: 'error' });
        },
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
    });

    // Fetch Primary Calendar ID
    const fetchPrimaryCalendar = async (accessToken) => {
        try {
            const response = await axios.get('https://www.googleapis.com/calendar/v3/users/me/calendarList/primary', {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            setGoogleCalendarId(response.data.id);
            setSnackbar({ open: true, message: 'Google Calendar Connected', severity: 'success' });
        } catch (error) {
            console.error('Error fetching primary calendar:', error);
            setSnackbar({ open: true, message: 'Failed to connect to Google Calendar', severity: 'error' });
        }
    };

    // Sync with Google Calendar
    const syncWithGoogleCalendar = async () => {
        if (!googleToken) {
            // Prompt user to log in with Google
            login();
            return;
        }

        if (availabilities.length === 0) {
            setSnackbar({ open: true, message: 'No availabilities to sync', severity: 'warning' });
            return;
        }

        try {
            const eventPromises = availabilities.map(async (availability) => {
                const event = {
                    summary: `Availability: ${eventName}`,
                    description: `Respondent: ${answererName}`,
                    start: {
                        dateTime: new Date(`${formatDate(availability.date)}T${formatTime(availability.startTime)}`).toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                    end: {
                        dateTime: new Date(`${formatDate(availability.date)}T${formatTime(availability.endTime)}`).toISOString(),
                        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    },
                };

                const response = await axios.post(`https://www.googleapis.com/calendar/v3/calendars/${googleCalendarId}/events`, event, {
                    headers: {
                        Authorization: `Bearer ${googleToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                return response.data;
            });

            const createdEvents = await Promise.all(eventPromises);
            console.log('Created Events:', createdEvents);
            setSnackbar({ open: true, message: 'Events synced to Google Calendar successfully', severity: 'success' });
        } catch (error) {
            console.error('Error syncing with Google Calendar:', error);
            setSnackbar({ open: true, message: 'Failed to sync with Google Calendar', severity: 'error' });
        }
    };

    // Fetch event details when the component mounts
    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const eventResponse = await fetch(`http://localhost:5001/api/event/${eventId}`);
                const eventData = await eventResponse.json();
                setEventName(eventData.name); // Set the event name
                console.log('Fetched Event Name:', eventData.name); // Log the fetched event name
            } catch (error) {
                console.error('Error fetching event details:', error);
            }
        };

        fetchEventDetails();
    }, [eventId]); // Dependency array to run effect when eventId changes
    console.log('Event Name:', eventName);

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

    const formatDate = (date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toTimeString().split(' ')[0];
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!answererName || availabilities.length === 0 || !dayPreference || !timePreference) {
            setSnackbar({ open: true, message: 'Please fill in all required fields', severity: 'error' });
            return;
        }

        setIsSubmitting(true);
        const formattedAvailabilities = availabilities.map(av => ({
            date: formatDate(av.date),
            startTime: `${formatDate(av.date)} ${formatTime(av.startTime)}`,
            endTime: `${formatDate(av.date)} ${formatTime(av.endTime)}`
        }));

        const responseData = {
            event_id: eventId,
            name: answererName,
            availability: formattedAvailabilities,
            preference_gap: 0,
            preference_day: dayPreference,
            preference_time: timePreference
        };

        console.log("Submitting response data:", responseData);  // Add this line for debugging

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

    return (
        <div className="home-container" style={{
            minHeight: '100vh',
            padding: '40px 0',
            background: 'linear-gradient(135deg, #e0f7fa 25%, #ffffff 25%, #ffffff 50%, #e0f7fa 50%, #e0f7fa 75%, #ffffff 75%, #ffffff)',
            backgroundSize: '150% 150%',
            animation: 'moveBackground 15s ease infinite'
        }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Container maxWidth="md">
                    <Paper elevation={3} style={{ padding: '30px', backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                        <Typography variant="h4" gutterBottom align="center" style={{ color: '#4caf50', fontWeight: 'bold' }}>
                            Response Form
                        </Typography>
                        <Typography variant="h6" gutterBottom align="center" style={{ marginBottom: '20px' }}>
                            Event: <strong>{eventName}</strong>
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Your Name"
                                value={answererName}
                                onChange={(e) => setAnswererName(e.target.value)}
                                margin="normal"
                                required
                                variant="outlined"
                            />

                            {/* Google Calendar Sync Button */}
                            <Button
                                variant="contained"
                                style={{
                                    backgroundColor: 'gold',
                                    color: 'black',
                                    marginTop: '20px',
                                    fontWeight: 'bold',
                                    border: '2px solid #f39c12', // Border effect
                                    boxShadow: '0 0 10px #f39c12, 0 0 20px #f39c12', // Glowing effect
                                    transition: 'box-shadow 0.2s ease',
                                }}
                                fullWidth
                                onClick={syncWithGoogleCalendar}
                            >
                                Google Calendar Sync
                            </Button>

                            <Box display="flex" justifyContent="space-between" mt={3} mb={2}>
                                <Typography variant="h6" style={{ color: '#1976d2' }}>
                                    <CalendarTodayIcon style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                                    Add Your Availability
                                </Typography>
                            </Box>
                            <Box display="flex" flexWrap="wrap" justifyContent="space-between">
                                <DatePicker
                                    label="Select Date"
                                    value={selectedDate}
                                    onChange={(newValue) => setSelectedDate(newValue)}
                                    renderInput={(params) => <TextField {...params} style={{ width: '100%', marginBottom: '15px' }} required />}
                                />
                                <TimePicker
                                    label="Start Time"
                                    value={startTime}
                                    onChange={(newValue) => setStartTime(newValue)}
                                    renderInput={(params) => <TextField {...params} style={{ width: '48%' }} />}
                                />
                                <TimePicker
                                    label="End Time"
                                    value={endTime}
                                    onChange={(newValue) => setEndTime(newValue)}
                                    renderInput={(params) => <TextField {...params} style={{ width: '48%' }} />}
                                />
                            </Box>
                            <Button onClick={handleAddAvailability} variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
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

                            <Divider style={{ margin: '30px 0' }} />

                            <Typography variant="h6" style={{ color: '#1976d2', marginBottom: '15px' }}>
                                <AccessTimeIcon style={{ verticalAlign: 'middle', marginRight: '10px' }} />
                                Preferences
                            </Typography>

                            <FormControl component="fieldset" margin="normal" fullWidth>
                                <FormLabel component="legend">Day Preference</FormLabel>
                                <RadioGroup
                                    row
                                    value={dayPreference}
                                    onChange={(e) => setDayPreference(e.target.value)}
                                >
                                    <FormControlLabel value="weekdays" control={<Radio color="primary" />} label="Weekdays" />
                                    <FormControlLabel value="weekends" control={<Radio color="primary" />} label="Weekends" />
                                </RadioGroup>
                            </FormControl>

                            <FormControl component="fieldset" margin="normal" fullWidth>
                                <FormLabel component="legend">Time Preference</FormLabel>
                                <RadioGroup
                                    row
                                    value={timePreference}
                                    onChange={(e) => setTimePreference(e.target.value)}
                                >
                                    <FormControlLabel value="morning" control={<Radio color="primary" />} label="Morning (6am-12pm)" />
                                    <FormControlLabel value="afternoon" control={<Radio color="primary" />} label="Afternoon (12pm-5pm)" />
                                    <FormControlLabel value="evening" control={<Radio color="primary" />} label="Evening (5pm-9pm)" />
                                    <FormControlLabel value="night" control={<Radio color="primary" />} label="Night (9pm-2am)" />
                                </RadioGroup>
                            </FormControl>

                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                style={{ marginTop: '30px', padding: '15px', fontSize: '1.1rem' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Response'}
                            </Button>
                        </form>
                    </Paper>

                    <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                            {snackbar.message}
                        </Alert>
                    </Snackbar>
                </Container>
            </LocalizationProvider>
        </div>
    );
}

export default ResponseForm;