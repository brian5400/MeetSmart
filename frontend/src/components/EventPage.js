import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams to get eventId
import { Container, Typography, Link, Grid, Card, CardContent, Paper, Button, Box, Chip} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar'; // Importing react-big-calendar
import moment from 'moment'; // Importing moment for date localization
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Calendar styles
import ShareIcon from '@mui/icons-material/Share'; // Importing ShareIcon
import AccessTimeIcon from '@mui/icons-material/AccessTime'; // Importing AccessTimeIcon

const localizer = momentLocalizer(moment);

function EventPage() {
  const { eventId } = useParams(); // Get the event ID from the URL
  const [eventName, setEventName] = useState(''); // Set the event name dynamically
  const [responseLink, setResponseLink] = useState(''); // Placeholder for response link
  const [participantsCount, setParticipantsCount] = useState(0); // State for participants count
  const [responses, setResponses] = useState([]); // This will hold response data
  const [bestTimes, setBestTimes] = useState([]); // Updated to hold best meeting times
  const [events, setEvents] = useState([]); // Events for the calendar

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        // Fetch event details
        const eventResponse = await fetch(`http://localhost:5001/api/event/${eventId}`);
        const eventData = await eventResponse.json();

        // Set event name and response link
        setEventName(eventData.name);
        setResponseLink(`https://localhost:3000/response/${eventId}`); // Set the response link
        setParticipantsCount(eventData.participants_count); // Set participants count

        // Fetch responses for the event
        const responseResponse = await fetch(`http://localhost:5001/api/response/event/${eventId}`);
        const responseData = await responseResponse.json();
        setResponses(responseData.responses); // Set the responses

        // Map responses to calendar events
        const mappedEvents = responseData.responses.flatMap(response => 
          response.availability.map(slot => ({
            title: `${response.name} is available`,
            start: new Date(`${slot.date}T${slot.startTime}`),
            end: new Date(`${slot.date}T${slot.endTime}`),
          }))
        );
        setEvents(mappedEvents);

        // Fetch best meeting times
        const bestTimeResponse = await fetch(`http://localhost:5001/api/event/best_time/${eventId}`);
        const bestTimeData = await bestTimeResponse.json();
        setBestTimes(bestTimeData.best_times);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  // Calculate participation rate based on responses count and participants count
  console.log("Participants Count:", participantsCount);  // Log the participants count
  console.log("Responses Count:", responses.length);  // Log the number of responses  

  const participationRate = participantsCount > 0 ? (responses.length / participantsCount) * 100 : 0;

  return (
    <Container maxWidth="md" className="home-container">
      <Paper elevation={3} style={{ padding: '30px', marginTop: '20px', backgroundColor: '#f5f5f5' }}>
        <Typography variant="h3" align="center" gutterBottom style={{ color: '#1976d2', fontWeight: 'bold' }}>
          {eventName}
        </Typography>
        
        <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ShareIcon />}
            href={`response/${eventId}`}
            target="_blank"
            rel="noopener"
            size="small"
          >
            Share Response Link
          </Button>
        </Box>

        <Box display="flex" justifyContent="center" mb={2}>
          <Chip
            label={`Participation Rate: ${participationRate.toFixed(0)}%`}
            style={{ 
              fontSize: '1rem', 
              padding: '15px', 
              backgroundColor: '#4caf50',
              color: 'white'
            }}
          />
        </Box>
        
        <Grid container spacing={3} style={{ marginTop: '30px' }}>
  <Grid item xs={12} md={7}>
    <Paper elevation={3} style={{ padding: '25px', height: '100%' }}>
      <Typography 
        variant="h5" 
        align="center" 
        gutterBottom 
        style={{ fontWeight: 'bold', color: '#388e3c' }} // Make heading bold and green
      >
        Availability Calendar
      </Typography>
      <div style={{ height: '400px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={['week']}
          style={{ height: '100%', border: '1px solid #ccc', borderRadius: '8px' }} // Add border and rounded corners
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: '#4caf50', // Green background for availability events
              color: 'white', 
              borderRadius: '5px', 
              padding: '5px',
              border: 'none'
            },
          })}
          popup
          tooltipAccessor={(event) => `${event.title}: ${moment(event.start).format('hh:mm A')} - ${moment(event.end).format('hh:mm A')}`}
        />
      </div>
    </Paper>
  </Grid>
  <Grid item xs={12} md={5}>
    <Paper elevation={2} style={{ padding: '20px', height: '100%', backgroundColor: '#e3f2fd' }}>
      <Typography 
        variant="h6" 
        align="center" 
        gutterBottom 
        style={{ color: '#1976d2' }}
      >
        <AccessTimeIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
        Best Meeting Times
      </Typography>
      {bestTimes && bestTimes.length > 0 ? (
        bestTimes.map((timeObj, index) => {
          const [startDateTime, endDateTime] = timeObj.time.split('~');
          const startDate = new Date(startDateTime);
          const endDate = new Date(endDateTime);
          return (
            <Box 
              key={index} 
              mb={2} 
              p={2} 
              bgcolor="white" 
              borderRadius={2} 
              boxShadow={1}
              style={{ border: '1px solid #ddd' }} // Add border for each best time box
            >
              <Typography 
                variant="subtitle1" 
                align="center" 
                style={{ color: '#4caf50', fontWeight: 'bold' }}
              >
                {startDate.toLocaleDateString()}
              </Typography>
              <Typography variant="body2" align="center">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </Box>
          );
        })
      ) : (
        <Typography variant="h6" align="center">No available times</Typography>
      )}
    </Paper>
  </Grid>
</Grid>
      </Paper>
    </Container>
  );
}

export default EventPage;