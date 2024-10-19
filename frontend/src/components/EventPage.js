import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get eventId
import { Container, Typography, Link, Grid, Card, CardContent } from '@mui/material';
import Calendar from 'react-calendar'; // Ensure react-calendar is installed
import 'react-calendar/dist/Calendar.css'; // Import calendar styles

function EventPage() {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [eventName, setEventName] = useState(''); // Set the event name dynamically
  const [responseLink, setResponseLink] = useState(''); // Placeholder for response link
  const [participantsCount, setParticipantsCount] = useState(0); // State for participants count
  const [participants, setParticipants] = useState([]); // State for participants
  const [availability, setAvailability] = useState([]); // State for availability
  const [responses, setResponses] = useState([]); // This will hold response data
  const [bestTimes, setBestTimes] = useState([]); // Updated to hold best meeting times

  useEffect(() => {
    console.log("Event ID:", eventId); // Log the eventId for debugging

    // Fetch event details and responses from backend
    const fetchEventDetails = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`/api/event/${eventId}`);
        const eventData = await eventResponse.json();

        // Set event name and response link
        setEventName(eventData.name);
        setResponseLink(`https://localhost:3000/response/${eventId}`); // Set the response link
        setParticipantsCount(eventData.participants_count); // Set participants count
        setParticipants(eventData.participants); // Set participants from event data
        setAvailability(eventData.availability); // Set availability from event data

        // Fetch responses for the event
        const responseResponse = await fetch(`/api/response/event/${eventId}`);
        const responseData = await responseResponse.json();
        setResponses(responseData);

        // Fetch best meeting times
        const bestTimeResponse = await fetch(`/api/event/best_time/${eventId}`);
        const bestTimeData = await bestTimeResponse.json();
        setBestTimes(bestTimeData.best_times);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Calculate participation rate based on responses and participants count
  const participationRate = (responses.length / participantsCount) * 100 || 0;

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        {eventName}
      </Typography>
      <Typography variant="h6" align="center">
        Share this link to respond: 
        <Link href={`response/${eventId}`} target="_blank" rel="noopener">
          {`response/${eventId}`}
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
              <Typography variant="h5" align="center">Best Meeting Times</Typography>
              {bestTimes && bestTimes.length > 0 ? (
                bestTimes.map((timeObj, index) => (
                  <Typography key={index} variant="h6" align="center">
                    {new Date(timeObj.time).toLocaleString()} - Score: {timeObj.score}
                  </Typography>
                ))
              ) : (
                <Typography variant="h6" align="center">No available times</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EventPage;
