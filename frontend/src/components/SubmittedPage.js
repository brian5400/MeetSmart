import React, { useEffect, useState } from 'react';
import { Typography, Container, Paper, Button, Box } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

function SubmittedPage() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [windowDimension, setWindowDimension] = useState({ width: window.innerWidth, height: window.innerHeight });

  const detectSize = () => {
    setWindowDimension({ width: window.innerWidth, height: window.innerHeight });
  }

  useEffect(() => {
    window.addEventListener('resize', detectSize);
    return () => {
      window.removeEventListener('resize', detectSize);
    }
  }, []);

  return (
    <div className="home-container" style={{ 
      minHeight: '100vh',
      padding: '40px 0',
      background: 'linear-gradient(135deg, #e0f7fa 25%, #ffffff 25%, #ffffff 50%, #e0f7fa 50%, #e0f7fa 75%, #ffffff 75%, #ffffff)',
      backgroundSize: '150% 150%',
      animation: 'moveBackground 15s ease infinite',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={false}
        numberOfPieces={200}
      />
      <Container maxWidth="sm">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <Paper elevation={3} style={{ padding: '40px', backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '15px', textAlign: 'center' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, loop: Infinity, ease: "linear" }}
              style={{ display: 'inline-block', marginBottom: '20px' }}
            >
              <CheckCircleOutlineIcon style={{ fontSize: 80, color: '#4caf50' }} />
            </motion.div>
            <Typography variant="h4" gutterBottom style={{ color: '#4caf50', fontWeight: 'bold' }}>
              Response Submitted Successfully!
            </Typography>
            <Typography variant="body1" paragraph style={{ fontSize: '1.1rem', marginBottom: '30px' }}>
              Thank you for submitting your availability. Your response has been recorded and will help in finding the best meeting time for everyone.
            </Typography>
            <Box mt={4} mb={2}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate(`/event/${eventId}`)}
                  size="large"
                  style={{ padding: '10px 30px', fontSize: '1.1rem' }}
                >
                  View Event Details
                </Button>
              </motion.div>
            </Box>
            <Typography variant="body2" style={{ marginTop: '20px', color: '#666' }}>
              You can always update your response by submitting a new one.
            </Typography>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
}

export default SubmittedPage;