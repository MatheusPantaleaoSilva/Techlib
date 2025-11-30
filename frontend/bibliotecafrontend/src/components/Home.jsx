import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Stack
} from "@mui/material";

import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const Home = () => {
    const navigate = useNavigate();

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
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                    zIndex: 0
                }
            }}
        >
            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                
                <Box 
                    component="img"
                    src="marca_dagua_logo.png" 
                    alt="Logo Bibliotech"
                    sx={{ 
                        width: 120,   
                        height: 'auto',
                        mb: 2,       
                        filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.5))' 
                    }}
                />

                <Typography 
                    variant="h2" 
                    component="h1" 
                    fontWeight="800" 
                    color="white" 
                    gutterBottom
                    sx={{ textShadow: '0px 4px 20px rgba(0,0,0,0.5)' }}
                >
                    Biblioteca Digital
                </Typography>
                
                <Typography 
                    variant="h6" 
                    color="grey.300" 
                    paragraph 
                    sx={{ mb: 6, maxWidth: '400px', mx: 'auto', lineHeight: 1.6 }}
                >
                    Gerencie acervos, empréstimos e leitores de forma simples, rápida e moderna.
                </Typography>

                <Stack spacing={2} direction="column" sx={{ maxWidth: '300px', mx: 'auto' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginIcon />}
                        onClick={() => navigate("/login")}
                        sx={{ py: 1.5, fontSize: '1.1rem' }}
                    >
                        Acessar Sistema
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        startIcon={<PersonAddIcon />}
                        onClick={() => navigate("/registrar")}
                        sx={{ 
                            py: 1.5, 
                            fontSize: '1.1rem',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.5)',
                            '&:hover': {
                                borderColor: 'white',
                                backgroundColor: 'rgba(255,255,255,0.1)'
                            }
                        }}
                    >
                        Criar Nova Conta
                    </Button>
                </Stack>

                <Box mt={8} pt={4} borderTop="1px solid rgba(255,255,255,0.1)">
                    <Typography variant="caption" color="grey.500">
                        © 2025 Sistema de Biblioteca - Projeto de Extensão
                    </Typography>
                </Box>

            </Container>
        </Box>
    );
};

export default Home;