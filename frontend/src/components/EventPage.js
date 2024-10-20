import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Link, Grid, Card, CardContent } from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

function EventPage() {
  const { eventId } = useParams();
  const [eventName, setEventName] = useState('');
  const [responseLink, setResponseLink] = useState('');
  const [participantsCount, setParticipantsCount] = useState(0);
  const [responses, setResponses] = useState([]);
  const [bestTimes, setBestTimes] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await fetch(`http://localhost:5001/api/event/${eventId}`);
        const eventData = await eventResponse.json();

        setEventName(eventData.name);
        setResponseLink(`https://localhost:3000/response/${eventId}`);
        setParticipantsCount(eventData.participants_count);

        const responseResponse = await fetch(`http://localhost:5001/api/response/event/${eventId}`);
        const responseData = await responseResponse.json();
        setResponses(responseData.responses);

        // Map responses to calendar events
        const mappedEvents = responseData.responses.flatMap((response) => 
          response.availability.map((slot) => ({
            start: new Date(`${slot.date}T${slot.startTime}`),
            end: new Date(`${slot.date}T${slot.endTime}`),
            title: `${response.name} is available`,
          }))
        );
        setEvents(mappedEvents);

        const bestTimeResponse = await fetch(`http://localhost:5001/api/event/best_time/${eventId}`);
        const bestTimeData = await bestTimeResponse.json();
        setBestTimes(bestTimeData.best_times);
      } catch (error) {
        console.error('Error fetching event details:', error);
      }
    };

    fetchEventDetails();
  }, [eventId]);

  const participationRate = participantsCount > 0 ? (responses.length / participantsCount) * 100 : 0;

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
              <Typography variant="h5" align="center">Availability Calendar (Week View)</Typography>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                defaultView="week"
                views={['week']}
                style={{ height: 500 }}
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" align="center">Best Meeting Times</Typography>
              {bestTimes && bestTimes.length > 0 ? (
                bestTimes.map((timeObj, index) => {
                  const [startTime, endTime] = timeObj.time.split('~');
                  return (
                    <Typography key={index} variant="h6" align="center">
                      {new Date(startTime).toLocaleString()} - {new Date(endTime).toLocaleString()} - Score: {timeObj.score}
                    </Typography>
                  );
                })
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