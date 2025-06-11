import React, { forwardRef, useState, useEffect, useRef, useImperativeHandle } from 'react';
import { useTheme } from '@mui/material/styles'; // Add this import
import { Typography, TextField, IconButton, Button, CircularProgress } from '@mui/material';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Helper to describe each character for audio
function describeChar(char) {
  if (/[A-Z]/.test(char)) return `capital ${char}`;
  if (/[a-z]/.test(char)) return `small ${char}`;
  if (/[0-9]/.test(char)) return `number ${char}`;
  if (char === '/') return 'slash';
  if (char === '-') return 'dash';
  if (char === '*') return 'star';
  if (char === '#') return 'hash';
  if (char === '@') return 'at symbol';
  if (char === '$') return 'dollar sign';
  if (char === '%') return 'percent sign';
  if (char === '&') return 'ampersand';
  if (char === '+') return 'plus';
  if (char === '=') return 'equals';
  if (char === '!') return 'exclamation mark';
  if (char === '?') return 'question mark';
  // Add more as needed
  return char;
}

const Captcha = forwardRef(({ onVerified, frozen = false }, ref) => {
  const theme = useTheme(); // Get theme from MUI
  const isDarkMode = theme.palette.mode === 'dark';
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const speechRef = useRef(null);
// Expose reset method via ref
  useImperativeHandle(ref, () => ({
    reset: () => {
      generateCaptcha();
      onVerified(false);
    }
  }));

  // Handle frozen prop changes
  useEffect(() => {
    if (frozen) {
      setIsVerified(true);
    } else {
      setIsVerified(false);
      generateCaptcha();
    }
  }, [frozen]);

  // Generate a new CAPTCHA
  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789/-*#@$%&+=!?";
    const text = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    setCaptchaText(text);
    setUserInput('');
    setError('');
    setIsVerified(false);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  };

  useEffect(() => {
    if (window.speechSynthesis) {
      generateCaptcha();
    } else {
      setError('Browser does not support speech synthesis');
    }
    // Cancel speech on unmount
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line
  }, []);

  const playAudio = () => {
    if (!captchaText || !window.speechSynthesis || isVerified) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    // Describe each character for clarity in audio
    const spoken = captchaText.split('').map(describeChar).join(', ');
    const utterance = new window.SpeechSynthesisUtterance(spoken);
    utterance.rate = 0.75;
    utterance.pitch = 0.9;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setError('Audio playback failed. Please try again.');
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleVerify = () => {
    if (userInput === captchaText) {
      setIsVerified(true);
      onVerified(true);
    } else {
      setError('Incorrect CAPTCHA');
      onVerified(false);
    }
  };

  return (
    <div style={{ margin: '20px 0', textAlign: 'center' }}>
      <Typography variant="h6" gutterBottom 
      sx={{ 
        fontFamily: 'monospace',
        letterSpacing: '8px',
        userSelect: 'none',
        mb: 2,
        padding: '10px',
        backgroundColor: isDarkMode ? '#23293a' : '#dae6dd', // Use theme-based dark mode
        borderRadius: '4px',
        color: isVerified ? 'green' : (isDarkMode ? '#09998B' : 'inherit') // Dark blue text in dark mode
      }}>
        CAPTCHA Verification
        <IconButton 
          onClick={playAudio} 
          disabled={isSpeaking || isVerified}
          color="primary"
          size="large"
          sx={{ ml: 1 }}
        >
          {isSpeaking ? <CircularProgress size={24} /> : <VolumeUpIcon />}
        </IconButton>
        <IconButton 
          onClick={generateCaptcha}
          color="primary"
          size="large"
          disabled={isVerified}
        >
          <RefreshIcon />
        </IconButton>
      </Typography>

      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        CAPTCHA is <b>case- and symbol-sensitive</b>. Listen carefully!
      </Typography>

      <Typography variant="h4" sx={{ 
        fontFamily: 'monospace',
        letterSpacing: '8px',
        userSelect: 'none',
        mb: 2,
        padding: '10px',
        backgroundColor: isDarkMode ? '#23293a' : '#dae6dd', // Use theme-based dark mode
        borderRadius: '4px',
        color: isVerified ? 'green' : (isDarkMode ? '#09998B' : 'inherit') // Dark blue text in dark mode
      }}>
        {isVerified ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <CheckCircleIcon /> Accepted
          </span>
        ) : captchaText}
      </Typography>

      <TextField
        fullWidth
        label="Type the CAPTCHA"
        value={userInput}
        onChange={(e) => !isVerified && setUserInput(e.target.value)}
        disabled={isVerified}
        sx={{ mb: 2, maxWidth: '300px' }}
        inputProps={{ style: { letterSpacing: '5px', textAlign: 'center' } }}
        autoComplete="off"
      />

      {!isVerified && (
        <Button 
          variant="contained" 
          onClick={handleVerify}
          sx={{ mt: 1 }}
        >
          Verify CAPTCHA
        </Button>
      )}

      {error && (
        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
    </div>
);
});

export default Captcha;