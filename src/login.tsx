import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { useAuth } from './utils/AuthContext'; // 로그인 상태를 관리하는 Context 훅
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); // "기억하기" 체크박스 상태
  const [error, setError] = useState(false);
  const { login } = useAuth(); // 로그인 상태 관리
  const navigate = useNavigate();

  // 로컬 스토리지에서 이메일 불러오기
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async () => {
    try {
      const res = await axios.get(`${apiUrl}/login?id=${email}&pw=${password}`);
      console.log({ res: res });
      if (res.data === true) {
        login(); // 로그인 성공 시 상태 변경

        // "기억하기" 체크박스가 활성화되어 있으면 이메일 저장
        if (rememberMe) {
          localStorage.setItem('savedEmail', email);
        } else {
          localStorage.removeItem('savedEmail');
        }

        navigate('/schedules/Schedule'); // 메인 페이지로 이동
      } else {
        alert("Incorrect username or password");
        setError(true); // 로그인 실패 시 에러 처리
      }
    } catch (err) {
      console.error('Error fetching login:', err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="50vh"
    >
      <Typography variant="h4" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        variant="outlined"
        error={error}
        sx={{ mb: 2, width: '300px' }}
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        variant="outlined"
        error={error}
        helperText={error ? 'Invalid email or password' : ''}
        sx={{ mb: 2, width: '300px' }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
        }
        label="Remember Me"
      />
      <Button variant="contained" onClick={handleLogin} sx={{ width: '300px' }}>
        Login
      </Button>
    </Box>
  );
};

export default LoginPage;
