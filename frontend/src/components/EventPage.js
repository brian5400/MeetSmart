import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get eventId
import { Container, Typography, Link, Grid, Card, CardContent } from '@mui/material';
import Calendar from 'react-calendar'; // Ensure react-calendar is installed
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

function EventPage() {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [eventName, setEventName] = useState(''); // Set the event name dynamically
  const [responseLink, setResponseLink] = useState(''); // Placeholder for response link
  const [participants, setParticipants] = useState([]); // This will hold participant data
  const [availability, setAvailability] = useState([]); // Placeholder for member availability
  const [bestTime, setBestTime] = useState(''); // Placeholder for best meeting time

  useEffect(() => {
    // Fetch event details and responses from backend
    const fetchEventDetails = async () => {
      // This is where you would call your API
      // For example:
      // const response = await fetch(`/api/event/${eventId}`); 
      // const data = await response.json();

      // Mock data for demonstration
      setEventName('Team Meeting');
      setResponseLink(`/response/${eventId}`); // Set response link dynamically
      setParticipants(['Alice', 'Bob', 'Charlie']); // Mock participants
      setAvailability([
        { name: 'Alice', availableTimes: ['2024-10-20T10:00:00Z', '2024-10-20T14:00:00Z'] },
        { name: 'Bob', availableTimes: ['2024-10-20T11:00:00Z'] },
        { name: 'Charlie', availableTimes: ['2024-10-20T10:00:00Z', '2024-10-20T12:00:00Z'] }
      ]);
      setBestTime('2024-10-20T10:00:00Z'); // Mock best time
    };

    fetchEventDetails();
  }, [eventId]);

  const participationRate = (participants.length / 3) * 100; // Example participation rate calculation

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        {eventName}
      </Typography>
      <Typography variant="h6" align="center">
        Share this link to respond: 
        <Link href={responseLink} target="_blank" rel="noopener">
          {responseLink}
        </Link>
      </Typography>
      <Typography variant="h6" align="center">
        Participation Rate: {participationRate.toFixed(0)}%
      </Typography>
      
      <Grid container spacing={2} justifyContent="center" style={{ marginTop: '20px' }}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">Availability Calendar</Typography>
              <Calendar />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">Best Meeting Time</Typography>
              <Typography variant="h6" align="center">
                {bestTime ? new Date(bestTime).toLocaleString() : 'N/A'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EventPage;