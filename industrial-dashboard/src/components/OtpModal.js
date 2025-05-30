import React, { useState } from 'react';
import { Modal, TextField, Button, Typography, Box } from '@mui/material';

export default function OtpModal({ open, onVerify, onClose, error }) {
  const [otp, setOtp] = useState('');

  const handleSubmit = () => {
    // Validate OTP length before submission
    if (otp.length === 6) {
      onVerify(otp);
      setOtp(''); // Clear input after submission
    } else {
      console.error('OTP must be 6 digits');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ 
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        bgcolor: 'background.paper',
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h6" gutterBottom>
          Enter OTP
        </Typography>

        <TextField
          fullWidth
          label="OTP"
          value={otp}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
            setOtp(value);
          }}
          inputProps={{
            inputMode: 'numeric',
            pattern: '[0-9]*',
            maxLength: 6,
            type: 'tel'
          }}
          sx={{ mb: 2 }}
          error={!!error}
          helperText={error || 'Enter the 6-digit code sent to you'}
        />
        <Button 
          variant="contained" 
          fullWidth
          onClick={handleSubmit}
          disabled={otp.length !== 6} // Disable button if OTP is incomplete
        >
          Verify
        </Button>
      </Box>
    </Modal>
  );
}
