import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

function SubmittedPage() {
  const navigate = useNavigate();
  const { eventId } = useParams(); // Get the eventId from URL parameters

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Submitted
      </Typography>
      <Typography variant="body1">
        Thank you for submitting your availability!
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate(`/event/${eventId}`)} // Navigate to the event page using the eventId
      >
        View the Event Here
      </Button>
    </Container>
  );
}

export default SubmittedPage;