import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

function SubmittedPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const location = useLocation();
  const submissionData = location.state?.submissionData;

  const handleViewEvent = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate('/'); // Navigate to home page if eventId is not available
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4} textAlign="center">
        <Typography variant="h4" gutterBottom>
          Submission Successful
        </Typography>
        <Typography variant="body1" paragraph>
          Thank you for submitting your availability!
        </Typography>

        {submissionData && (
          <Box my={3} textAlign="left">
            <Typography variant="h6" gutterBottom>
              Submission Summary:
            </Typography>
            <Typography variant="body2">Name: {submissionData.name}</Typography>
            <Typography variant="body2">
              Availabilities: {submissionData.availabilities.length} time slot(s)
            </Typography>
            <Typography variant="body2">Day Preference: {submissionData.dayPreference}</Typography>
            <Typography variant="body2">Time Preference: {submissionData.timePreference}</Typography>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleViewEvent}
          size="large"
          sx={{ mt: 2 }}
        >
          {eventId ? 'View the Event' : 'Return to Home'}
        </Button>
      </Box>
    </Container>
  );
}

export default SubmittedPage;