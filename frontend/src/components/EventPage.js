import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Link, Grid, Card, CardContent, CircularProgress } from '@mui/material';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

function EventPage() {
  const { eventId } = useParams();
  const [eventName, setEventName] = useState('');
  const [responseLink, setResponseLink] = useState('');
  const [participants, setParticipants] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [bestTime, setBestTime] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        // This is where you would call your API
        // const response = await fetch(`/api/event/${eventId}`);
        // const data = await response.json();

        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data
        setEventName('Team Meeting');
        setResponseLink(`${window.location.origin}/response/${eventId}`);
        setParticipants(['Alice', 'Bob', 'Charlie']);
        setAvailability([
          { name: 'Alice', availableTimes: ['2024-10-20T10:00:00Z', '2024-10-20T14:00:00Z'] },
          { name: 'Bob', availableTimes: ['2024-10-20T11:00:00Z'] },
          { name: 'Charlie', availableTimes: ['2024-10-20T10:00:00Z', '2024-10-20T12:00:00Z'] }
        ]);
        setBestTime('2024-10-20T10:00:00Z');
      } catch (err) {
        setError('Failed to fetch event details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const participationRate = participants.length > 0 ? (participants.length / 3) * 100 : 0;

  if (isLoading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

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