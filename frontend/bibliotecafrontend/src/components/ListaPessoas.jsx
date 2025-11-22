import React, { useEffect, useState } from "react";
import api from "../services/Api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Tooltip
} from "@mui/material";

// Agora estamos usando este ícone no botão abaixo
import EditIcon from '@mui/icons-material/Edit';

const ListaPessoas = () => {
  const [pessoas, setPessoas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPessoas = async () => {
      try {
        const response = await api.get("/pessoas");
        setPessoas(response.data);
      } catch (error) {
        console.error(error);
        if (error.response) {
          setErro(error.response.data.msg || "Erro ao carregar pessoas");
        } else {
          setErro("Erro na requisição. Verifique a conexão.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPessoas();
  }, []);

  const handleEditar = (id) => {
    navigate(`/pessoas/editar/${id}`);
  };

  const getTipoColor = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case "FUNCIONARIO":
        return "secondary";
      case "PROFESSOR":
        return "warning";
      case "CLIENTE":
      default:
        return "primary";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
          Gestão de Utilizadores
        </Typography>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      {!erro && pessoas.length === 0 && (
        <Alert severity="info">Nenhuma pessoa encontrada na base de dados.</Alert>
      )}

      {!erro && pessoas.length > 0 && (
        <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2 }}>
          <Table sx={{ minWidth: 650 }} aria-label="tabela de pessoas">
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Nome</strong></TableCell>
                <TableCell><strong>CPF</strong></TableCell>
                <TableCell><strong>Contato</strong></TableCell>
                <TableCell align="center"><strong>Tipo</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pessoas.map((p) => (
                <TableRow
                  key={p.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}
                >
                  <TableCell component="th" scope="row">
                    #{p.id}
                  </TableCell>
                  
                  <TableCell>
                    <Typography variant="body1" fontWeight="500">{p.nome}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.idade} anos</Typography>
                  </TableCell>
                  
                  <TableCell>{p.cpf}</TableCell>
                  
                  <TableCell>
                    <Typography variant="body2" display="block">{p.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{p.numero}</Typography>
                  </TableCell>
                  
                  <TableCell align="center">
                    <Chip 
                      label={p.tipo} 
                      color={getTipoColor(p.tipo)} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </TableCell>
                  
                  <TableCell align="center">
                    <Tooltip title="Editar Utilizador">
                      <Button 
                        variant="contained" 
                        size="small" 
                        color="primary"
                        startIcon={<EditIcon />} 
                        onClick={() => handleEditar(p.id)}
                        sx={{ textTransform: 'none' }}
                      >
                        Editar
                      </Button>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default ListaPessoas;