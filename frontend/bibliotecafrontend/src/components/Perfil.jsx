import React, { useState, useEffect, useCallback } from "react"; 
import { useNavigate } from "react-router-dom"; 
import api from "../services/Api"; 
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Avatar,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert
} from "@mui/material";

// Ícones
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import CakeIcon from '@mui/icons-material/Cake'; // Para idade
import EditIcon from '@mui/icons-material/Edit';
import BookIcon from '@mui/icons-material/Book';

const Perfil = () => {
    const [usuario, setUsuario] = useState({});
    const [emprestimos, setEmprestimos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [erro, setErro] = useState("");
    const token = localStorage.getItem("token"); 
    const navigate = useNavigate(); 

    const fetchDados = useCallback(async () => {
        setLoading(true);
        try {
            const [usuarioRes, emprestimosRes] = await Promise.all([
                api.get("/auth/perfil"),
                api.get("/meus-emprestimos")
            ]);
            
            setUsuario(usuarioRes.data); 
            setEmprestimos(emprestimosRes.data);

        } catch (err) {
            console.error("Erro ao buscar dados:", err);
            setErro("Não foi possível carregar os dados do perfil.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (token) {
            fetchDados();
        } else {
            navigate("/login");
        }
    }, [token, navigate, fetchDados]);

    // Lógica de Status Visual (MUI Chip)
    const getStatusChip = (e) => {
        const hoje = new Date();
        // Conversão segura de data
        const dataEmp = new Date(e.data_emprestimo + "T00:00:00"); 
        const prazo = new Date(dataEmp.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const devolvido = e.status !== "ativo" || !!e.data_devolucao;
        const atrasado = !devolvido && hoje > prazo;

        if (atrasado) {
            return <Chip label="ATRASADO" color="error" size="small" />;
        } else if (devolvido) {
            return <Chip label="Devolvido" color="default" size="small" variant="outlined" />;
        } else {
            return <Chip label="Ativo" color="success" size="small" />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Título */}
            <Box mb={4} display="flex" alignItems="center" gap={2}>
                <AccountCircleIcon color="primary" sx={{ fontSize: 40 }} />
                <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                    Meu Perfil
                </Typography>
            </Box>

            {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

            <Grid container spacing={4}>
                
                {/* === COLUNA DA ESQUERDA: Cartão do Utilizador === */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, textAlign: 'center' }}>
                        <Avatar 
                            sx={{ width: 100, height: 100, margin: '0 auto', mb: 2, bgcolor: 'primary.main' }}
                        >
                            {usuario.nome ? usuario.nome.charAt(0).toUpperCase() : "U"}
                        </Avatar>
                        
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                            {usuario.nome}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            {usuario.role === "FUNCIONARIO" ? "Funcionário da Biblioteca" : "Leitor Registrado"}
                        </Typography>

                        <Divider sx={{ my: 2 }} />

                        <List dense>
                            <ListItem>
                                <ListItemIcon><EmailIcon color="action" /></ListItemIcon>
                                <ListItemText primary="Email" secondary={usuario.email} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><PhoneIcon color="action" /></ListItemIcon>
                                <ListItemText primary="Telefone" secondary={usuario.numero || "Não informado"} />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon><CakeIcon color="action" /></ListItemIcon>
                                <ListItemText primary="Idade" secondary={`${usuario.idade || "-"} anos`} />
                            </ListItem>
                        </List>

                        <Button 
                            variant="contained" 
                            fullWidth 
                            startIcon={<EditIcon />}
                            onClick={() => navigate("/perfil/editar")}
                            sx={{ mt: 2 }}
                        >
                            Editar Dados
                        </Button>
                    </Paper>
                </Grid>

                {/* === COLUNA DA DIREITA: Histórico de Empréstimos === */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom display="flex" alignItems="center" gap={1}>
                            <BookIcon color="primary" />
                            Meus Empréstimos
                        </Typography>
                        
                        {emprestimos.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                Você ainda não realizou nenhum empréstimo.
                            </Alert>
                        ) : (
                            <TableContainer sx={{ mt: 2, maxHeight: 400 }}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Livro</strong></TableCell>
                                            <TableCell><strong>Data Empréstimo</strong></TableCell>
                                            <TableCell><strong>Devolução</strong></TableCell>
                                            <TableCell align="center"><strong>Status</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {emprestimos.map((e) => (
                                            <TableRow key={e.id} hover>
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="500">
                                                        {e.livro ? e.livro.nome : e.livro_nome}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>{e.data_emprestimo}</TableCell>
                                                <TableCell>{e.data_devolucao || "-"}</TableCell>
                                                <TableCell align="center">
                                                    {getStatusChip(e)}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Grid>

            </Grid>
        </Container>
    );
};

export default Perfil;