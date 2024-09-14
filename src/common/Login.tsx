import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const apiUrl = process.env.REACT_APP_API_URL;

interface LoginProps {
  sendData: (data: { login: boolean; href: string; level: any }) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const [id, setId] = useState<string | undefined>(undefined);
  const [pw, setPw] = useState<string | undefined>(undefined);
  const [loginState, setLoginState] = useState<string | undefined>(undefined);

  async function checkLogin(id: string | FormDataEntryValue | null, pw: string | FormDataEntryValue | null) {
    let query = `select level from usertable where id='${id}' and password='${pw}'`;

    const data = await getPromise('/gy/sql?query=' + query);
    // console.log({ id: id, pw: pw ,data:data})
    if (data.length > 0) {
      setLoginState('login');
      props.sendData({ login: true, href: 'order', level: data[0] });
    }
  }

  async function getPromise(param: string) {
    return await new Promise<any[]>(async (resolve, reject) => {
      try {
        const response = await fetch(apiUrl + param);
        const data = await response.json();
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    checkLogin(data.get('id'), data.get('password'));
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          {/* <LockOutlinedIcon /> */}
        </Avatar>
        <Typography component="h1" variant="h5">
          GYULWANG ADMIN
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="ID"
            name="id"
            autoComplete="id"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
          />
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 1, mb: 2, height: 50 }}
          >
            Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;
