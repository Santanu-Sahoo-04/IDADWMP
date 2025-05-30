import React, { useState, useRef } from 'react';
import { TextField, Button, Container, Typography, InputAdornment, IconButton, Box } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import VirtualKeyboard from '../components/VirtualKeyboard';
import Captcha from '../components/Captcha';
import OtpModal from '../components/OtpModal';

export default function Login1() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [captchaError, setCaptchaError] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [activeField, setActiveField] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaMessage, setCaptchaMessage] = useState('');
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpWarning, setOtpWarning] = useState('');

  const navigate = useNavigate();
  const captchaRef = useRef(null);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setCaptchaError('');
    setOtpError('');
    setCaptchaMessage('');

    // Email validation
    try {
      const emailRes = await fetch('http://localhost:5000/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'senior' })
      });
      const emailData = await emailRes.json();
      if (!emailRes.ok) throw new Error(emailData.error || '❌ Unauthorized email');
    } catch (err) {
      setEmailError(err.message);
      return;
    }

    // Password validation
    try {
      const pwdRes = await fetch('http://localhost:5000/api/auth/check-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const pwdData = await pwdRes.json();
      if (!pwdRes.ok) throw new Error(pwdData.error || '❌ Invalid password');
    } catch (err) {
      setPasswordError(err.message);
      return;
    }

    // CAPTCHA check
    if (!captchaVerified) {
      setCaptchaError('❌ Please complete CAPTCHA verification');
      return;
    }

    // Generate OTP
    try {
      const otpRes = await fetch('http://localhost:5000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), role: 'senior' })
      });

      const otpData = await otpRes.json();
      if (!otpRes.ok) throw new Error(otpData.error || 'OTP generation failed');
      alert(`Your OTP is: ${otpData.otp}\n\nCopy this to proceed!`); // <--- Add this
      
      setOtpModalOpen(true);
      setCaptchaMessage('✅ Go for OTP Verification');
    } catch (err) {
      setCaptchaError(`❌ ${err.message}`);
    }
  };

  const handleOtpResult = async (otp) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email.trim(),
          otp: otp.toString().trim() // Force string and trim
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // Hard redirect to clear all state
      window.location.href = data.redirect;
    } catch (err) {
      // Full reset
      setEmail('');
      setPassword('');
      setCaptchaVerified(false);
      setOtpModalOpen(false);
      setOtpError(`❌ ${err.message}. Please restart.`);
      
      // Reset CAPTCHA
      if (captchaRef.current) {
        captchaRef.current.reset();
      }
    }
  };




  const handleVirtualKeyboardChange = (newValue) => {
    if (activeField === 'email') setEmail(newValue);
    else setPassword(newValue);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center">
        Senior Management Login
      </Typography>
      
      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <TextField
          fullWidth
          label="Email"
          value={email}
          error={!!emailError}
          helperText={emailError}
          onFocus={() => setActiveField('email')}
          onChange={(e) => setEmail(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => {
                    setShowKeyboard(!showKeyboard);
                    setActiveField('email');
                  }}
                  aria-label="toggle keyboard"
                >
                  ⌨️
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* Password Field */}
        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          error={!!passwordError}
          helperText={passwordError}
          onFocus={() => setActiveField('password')}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="toggle password visibility"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
                <IconButton 
                  onClick={() => {
                    setShowKeyboard(!showKeyboard);
                    setActiveField('password');
                  }}
                  aria-label="toggle keyboard"
                >
                  ⌨️
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ mb: 2 }}
        />

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <VirtualKeyboard
            value={activeField === 'email' ? email : password}
            onChange={handleVirtualKeyboardChange}
          />
        )}

        {/* CAPTCHA Component */}
        <Box sx={{ mt: 2 }}>
          <Captcha 
            onVerified={() => setCaptchaVerified(true)}
            frozen={captchaVerified}
            ref={captchaRef}
          />
        </Box>
        {captchaError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {captchaError}
          </Typography>
        )}
        {captchaMessage && (
          <Typography color="success.main" sx={{ mt: 1 }}>
            {captchaMessage}
          </Typography>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 2, py: 1.5 }}
        >
          Continue to OTP Verification
        </Button>

        {/* Place the warning here, before OTP Modal */}
      {otpWarning && (
        <Typography color="warning.main" sx={{ mt: 2 }}>
          {otpWarning}
        </Typography>
      )}

        {/* OTP Modal */}
        <OtpModal 
          open={otpModalOpen}
          onVerify={handleOtpResult}
          onClose={() => setOtpModalOpen(false)}
          error={otpError}
        />
        {otpError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {otpError}
          </Typography>
        )}
      </form>
    </Container>
  );
}
