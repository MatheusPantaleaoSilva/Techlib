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
  Grid,
  InputAdornment,
  CircularProgress
} from '@mui/material';

import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import PhoneIcon from '@mui/icons-material/Phone';
import LockIcon from '@mui/icons-material/Lock';
import CakeIcon from '@mui/icons-material/Cake';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';

const CadastroCliente = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [idade, setIdade] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleCpfChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        value = value.replace(/(\d{3})(\d)/, "$1.$2"); 
        value = value.replace(/(\d{3})(\d)/, "$1.$2"); 
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2"); 
        if (value.length > 14) value = value.substring(0, 14);
        setCpf(value);
    };

    const handlePhoneChange = (e) => {
        let value = e.target.value.replace(/\D/g, ""); 
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2"); 
        value = value.replace(/(\d)(\d{4})$/, "$1-$2"); 
        if (value.length > 15) value = value.substring(0, 15);
        setPhone(value);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (!name || !email || !cpf || !idade || !phone || !password || !confirmPassword) {
            setMessage("Por favor, preencha todos os campos obrigatórios.");
            setIsError(true);
            return;
        }

        if (password !== confirmPassword) {
            setMessage("As senhas digitadas não coincidem!");
            setIsError(true);
            return;
        }
        
        try {
            setLoading(true);
            await api.post('/auth/registrar', {
                nome: name,
                email: email,
                cpf: cpf.replace(/\D/g, ""),
                idade: parseInt(idade),
                numero: phone.replace(/\D/g, ""),
                senha: password,
                username: email
            });

            setMessage("Cadastro realizado com sucesso! Redirecionando...");
            setIsError(false);

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error("Erro no registro:", err);
            const errorMsg = err.response?.data?.msg || "Erro ao tentar registrar.";
            setMessage(errorMsg);
            setIsError(true);
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
                backgroundImage: 'url("/background_home.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                py: 4,
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
                <Card 
                    elevation={10} 
                    sx={{ 
                        p: 3, 
                        borderRadius: 3,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <CardContent>
                        <Box textAlign="center" mb={3}>
                            <Typography variant="h4" component="h1" color="primary" fontWeight="800">
                                Criar Conta
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Preencha os dados abaixo para começar
                            </Typography>
                        </Box>

                        {message && (
                            <Alert severity={isError ? "error" : "success"} sx={{ mb: 3 }}>
                                {message}
                            </Alert>
                        )}

                        <form onSubmit={handleRegister}>
                            <Grid container spacing={2}>
                                
                                <Grid item xs={12}>
                                    <TextField
                                        label="Nome Completo"
                                        fullWidth
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={8}>
                                    <TextField
                                        label="CPF"
                                        fullWidth
                                        value={cpf}
                                        onChange={handleCpfChange}
                                        required
                                        placeholder="000.000.000-00"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        label="Idade"
                                        type="number"
                                        fullWidth
                                        value={idade}
                                        onChange={(e) => setIdade(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><CakeIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        label="Telefone"
                                        fullWidth
                                        value={phone}
                                        onChange={handlePhoneChange}
                                        required
                                        placeholder="(99) 99999-9999"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><PhoneIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Senha"
                                        type="password"
                                        fullWidth
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        label="Confirmar Senha"
                                        type="password"
                                        fullWidth
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><LockIcon color="action" /></InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sx={{ mt: 2 }}> 
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        size="large"
                                        disabled={loading}
                                        startIcon={!loading && <AppRegistrationIcon />}
                                        sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                                    >
                                        {loading ? <CircularProgress size={24} color="inherit" /> : "Finalizar Cadastro"}
                                    </Button>
                                </Grid>

                            </Grid>
                        </form>

                        <Box textAlign="center" mt={3}>
                            <Typography variant="body2" color="text.secondary">
                                Já tem uma conta?{' '}
                                <Link 
                                    component={RouterLink} 
                                    to="/login" 
                                    color="primary" 
                                    fontWeight="bold" 
                                    underline="hover"
                                >
                                    Fazer Login
                                </Link>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </Box>
    );
};

export default CadastroCliente;