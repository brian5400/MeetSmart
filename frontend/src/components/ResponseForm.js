import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Container, Typography, TextField, Button, List, ListItem, ListItemText, 
  IconButton, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel 
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import DeleteIcon from '@mui/icons-material/Delete';

function ResponseForm() {
  const { eventId } = useParams();
  const [answererName, setAnswererName] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [availabilities, setAvailabilities] = useState([]);
  const [dayPreference, setDayPreference] = useState('');
  const [timePreference, setTimePreference] = useState('');

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

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted', { answererName, availabilities, dayPreference, timePreference });
    // We'll add more logic here later
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container>
        <Typography variant="h4" gutterBottom>
          Response Form for Event {eventId}
        </Typography>
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

          <Button type="submit" variant="contained" color="primary" fullWidth style={{ marginTop: '20px' }}>
            Submit
          </Button>
        </form>
      </Container>
    </LocalizationProvider>
  );
}

export default ResponseForm;