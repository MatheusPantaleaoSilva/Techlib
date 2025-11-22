import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditarPerfil = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    nome: "",
    email: "",
    numero: "",
    idade: "",
    cpf: "",
    senha: ""
  });
  
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // Carregar dados do utilizador logado
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const res = await api.get("/auth/perfil");
        setForm({
          nome: res.data.nome || "",
          email: res.data.email || "",
          numero: res.data.numero || "",
          idade: res.data.idade || "",
          cpf: res.data.cpf || "",
          senha: "" 
        });
      } catch (err) {
        console.error("Erro ao buscar perfil:", err);
        setMsg({ type: "error", text: "Erro ao carregar os seus dados." });
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    try {
      await api.put("/auth/perfil", {
        nome: form.nome,
        email: form.email,
        numero: form.numero,
        idade: form.idade,
        senha: form.senha 
      });

      setMsg({ type: "success", text: "Perfil atualizado com sucesso!" });
      setTimeout(() => navigate("/perfil"), 1500);

    } catch (err) {
      console.error("Erro ao atualizar:", err);
      setMsg({ 
        type: "error", 
        text: err.response?.data?.msg || "Erro ao atualizar perfil." 
      });
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        {/* Cabeçalho */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate("/perfil")}
            color="inherit"
          >
            Voltar
          </Button>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Editar Meus Dados
          </Typography>
        </Box>

        {msg.text && (
          <Alert severity={msg.type} sx={{ mb: 3 }}>
            {msg.text}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Nome */}
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

            {/* CPF e Idade */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="CPF"
                value={form.cpf}
                fullWidth
                disabled 
                helperText="O CPF não pode ser alterado."
              />
            </Grid>
            <Grid item xs={12} sm={6}>
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

            {/* Contatos */}
            <Grid item xs={12} sm={6}>
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
            <Grid item xs={12} sm={6}>
              <TextField
                label="Telefone"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Alterar Senha (LINHA INTEIRA PARA ELE) */}
            <Grid item xs={12}>
              <Box mt={2} p={2} bgcolor="#f9f9f9" borderRadius={1}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Segurança (Opcional)
                </Typography>
                <TextField
                  label="Nova Senha"
                  name="senha"
                  type="password"
                  value={form.senha}
                  onChange={handleChange}
                  fullWidth
                  placeholder="Deixe em branco para manter a senha atual"
                  helperText="Preencha apenas se desejar alterar sua senha."
                />
              </Box>
            </Grid>

            {/* Botões (NOVA LINHA INTEIRA, ALINHADOS À DIREITA) */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/perfil")}
                // Botão Cancelar simples
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                // Botão Salvar padrão
              >
                Salvar Alterações
              </Button>
            </Grid>
            
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditarPerfil;