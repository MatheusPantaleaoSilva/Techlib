import React, { useState, useEffect } from "react";
import api from "../services/Api";
import {
  Container, Grid, Paper, Typography, TextField, Button, 
  List, ListItem, ListItemText, IconButton, Alert, Box
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';

const GerenciarCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    carregarCategorias();
  }, []);

  const carregarCategorias = async () => {
    try {
      const res = await api.get("/categorias");
      setCategorias(res.data);
    } catch (error) {
      console.error("Erro ao carregar categorias");
    }
  };

  const handleAdicionar = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });
    if (!novaCategoria.trim()) return;

    try {
      await api.post("/categorias", { nome: novaCategoria });
      setNovaCategoria("");
      setMsg({ type: "success", text: "Categoria adicionada!" });
      carregarCategorias();
    } catch (error) {
      setMsg({ type: "error", text: error.response?.data?.error || "Erro ao adicionar." });
    }
  };

  const handleDeletar = async (id) => {
    try {
      await api.delete(`/categorias/${id}`);
      carregarCategorias();
    } catch (error) {
      alert(error.response?.data?.error || "Erro ao apagar.");
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" color="primary" fontWeight="bold" mb={4} display="flex" alignItems="center" gap={2}>
        <CategoryIcon fontSize="large" /> Gestão de Categorias
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Nova Categoria</Typography>
            {msg.text && <Alert severity={msg.type} sx={{ mb: 2 }}>{msg.text}</Alert>}
            
            <form onSubmit={handleAdicionar}>
              <TextField 
                label="Nome da Categoria" 
                fullWidth 
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                startIcon={<AddIcon />} 
                sx={{ mt: 2 }}
              >
                Adicionar
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
            <Box p={2} bgcolor="primary.main" color="white">
              <Typography variant="h6">Categorias Existentes</Typography>
            </Box>
            <List sx={{ maxHeight: 400, overflow: 'auto' }}>
              {categorias.map((cat) => (
                <ListItem 
                  key={cat.id}
                  secondaryAction={
                    <IconButton edge="end" color="error" onClick={() => handleDeletar(cat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                  divider
                >
                  <ListItemText primary={cat.nome} />
                </ListItem>
              ))}
              {categorias.length === 0 && (
                <Box p={3} textAlign="center" color="text.secondary">
                  Nenhuma categoria cadastrada.
                </Box>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default GerenciarCategorias;