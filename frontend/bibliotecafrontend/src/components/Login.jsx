import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../services/Api';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  InputAdornment,
  CircularProgress
} from '@mui/material';

import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
 
        try {
            const response = await api.post('/auth/login', {
                username: email,
                senha: password
            });

            const { access_token, usuario } = response.data;

            localStorage.setItem("token", access_token);
            localStorage.setItem("usuario", JSON.stringify(usuario));

            navigate("/dashboard"); 

        } catch (err) {
            console.error("Erro no login:", err);
            if (err.response?.data?.msg) {
                setError(err.response.data.msg);
            } else {
                setError("Não foi possível conectar ao servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box 
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // MUDANÇA AQUI: Nome da nova imagem
                backgroundImage: 'url("/background_home.png")', 
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
                <Card 
                    elevation={10} 
                    sx={{ 
                        p: 2, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <CardContent>
                        <Box textAlign="center" mb={3}>
                            <Typography variant="h4" component="h1" color="primary" fontWeight="800">
                                Bem-vindo
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Faça login para acessar a Biblioteca
                            </Typography>
                        </Box>

                        {error && (
                            <Alert severity="error" sx={{ mb: 3 }}>
                                {error}
                            </Alert>
                        )}

                        <form onSubmit={handleLogin}>
                            <TextField
                                label="Email / Username"
                                type="email"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Senha"
                                type="password"
                                fullWidth
                                margin="normal"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                disabled={loading}
                                startIcon={!loading && <LoginIcon />}
                                sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
                            </Button>
                        </form>

                        <Box textAlign="center" mt={2}>
                            <Typography variant="body2" color="text.secondary">
                                Não tem uma conta?{' '}
                                <Link 
                                    component={RouterLink} 
                                    to="/registrar" 
                                    color="primary" 
                                    fontWeight="bold" 
                                    underline="hover"
                                >
                                    Criar Cadastro
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default Login;