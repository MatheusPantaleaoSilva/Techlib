import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/Api";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditarPessoa = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome: "",
    idade: "",
    cpf: "",
    email: "",
    numero: "",
    tipo: ""
  });

  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Carregar dados da pessoa
  useEffect(() => {
    const fetchPessoa = async () => {
      try {
        const response = await api.get(`/pessoas/${id}`);
        const pessoa = response.data;
        setForm({
          nome: pessoa.nome || "",
          idade: pessoa.idade || "",
          cpf: pessoa.cpf || "",
          email: pessoa.email || "",
          numero: pessoa.numero || "",
          tipo: pessoa.tipo || ""
        });
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar dados da pessoa.");
      } finally {
        setLoading(false);
      }
    };

    fetchPessoa();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErro("");

    if (!form.nome || !form.idade || !form.cpf || !form.email || !form.numero || !form.tipo) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }

    try {
      await api.put(`/pessoas/${id}`, form);
      navigate("/pessoas");
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar pessoa. Verifique os dados.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/pessoas/${id}`);
      navigate("/pessoas");
    } catch (error) {
      console.error(error);
      setErro("Erro ao apagar pessoa. Pode haver empréstimos ou dados vinculados.");
      setOpenDialog(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={10}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        {/* Cabeçalho com Voltar e Título */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/pessoas")}>
              Voltar
            </Button>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Editar Utilizador
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Excluir
          </Button>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            
            {/* Nome Completo */}
            <Grid item xs={12}>
              <TextField
                label="Nome Completo"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Email */}
            <Grid item xs={12} sm={8}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Idade */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Idade"
                name="idade"
                type="number"
                value={form.idade}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* CPF (Desabilitado para edição direta idealmente, mas mantive editável conforme original) */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPF"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                fullWidth
                required
                disabled // Geralmente não se altera CPF, mas remova esta prop se quiser permitir
                helperText="CPF não pode ser alterado"
              />
            </Grid>

            {/* Telefone */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone / Contato"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Tipo de Utilizador (Select) */}
            <Grid item xs={12}>
              <TextField
                select
                label="Tipo de Perfil"
                name="tipo"
                value={form.tipo}
                onChange={handleChange}
                fullWidth
                required
              >
                <MenuItem value="CLIENTE">Cliente (Leitor)</MenuItem>
                <MenuItem value="FUNCIONARIO">Funcionário (Bibliotecário)</MenuItem>
                <MenuItem value="PROFESSOR">Professor</MenuItem>
              </TextField>
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/pessoas")}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                size="large"
                startIcon={<SaveIcon />}
              >
                Salvar Alterações
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Modal de Confirmação de Exclusão */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja remover o utilizador "{form.nome}"? 
            Esta ação é irreversível e removerá também o acesso de login.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Confirmar Exclusão
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default EditarPessoa;