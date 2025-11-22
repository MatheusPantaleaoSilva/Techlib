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
  MenuItem,
  InputAdornment
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Ícone de estoque

const NovoLivro = () => {
  const navigate = useNavigate();
  
  // Estados
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    autor: "",
    isbn: "",
    categoria_id: "", // Agora guardamos o ID, não o nome
    dataAquisicao: "",
    imagemUrl: "",
    quantidade: 1
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  // Carregar categorias ao iniciar
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categorias");
        setCategorias(res.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setErro("Não foi possível carregar a lista de categorias.");
      }
    };
    fetchCategorias();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    // Validação simples
    if (!form.nome || !form.autor || !form.isbn || !form.categoria_id || !form.dataAquisicao || !form.quantidade) {
      setErro("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/livros", {
        nome: form.nome,
        autor: form.autor,
        isbn: form.isbn,
        categoria_id: parseInt(form.categoria_id), // Envia o ID da categoria
        data_aquisicao: form.dataAquisicao,
        imagem_url: form.imagemUrl,
        quantidade: parseInt(form.quantidade)
      });

      navigate("/livros");
    } catch (error) {
      console.error(error);
      setErro("Erro ao cadastrar livro. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate("/livros")}
            color="inherit"
          >
            Voltar
          </Button>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Cadastrar Novo Livro
          </Typography>
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                label="Título do Livro"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>
            
            {/* Autor */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Autor"
                name="autor"
                value={form.autor}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Categoria (Dropdown) */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categoria"
                name="categoria_id"
                value={form.categoria_id}
                onChange={handleChange}
                fullWidth
                required
                helperText={categorias.length === 0 ? "Crie categorias primeiro" : ""}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* ISBN */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="ISBN"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            {/* Data de Aquisição */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Data de Aquisição"
                type="date"
                name="dataAquisicao"
                value={form.dataAquisicao}
                onChange={handleChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Quantidade */}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Quantidade"
                type="number"
                name="quantidade"
                value={form.quantidade}
                onChange={handleChange}
                fullWidth
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Inventory2Icon fontSize="small" />
                    </InputAdornment>
                  ),
                  inputProps: { min: 1 }
                }}
              />
            </Grid>

            {/* Imagem */}
            <Grid item xs={12}>
              <TextField
                label="URL da Imagem (Capa)"
                name="imagemUrl"
                value={form.imagemUrl}
                onChange={handleChange}
                fullWidth
                placeholder="https://exemplo.com/capa.jpg"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={() => navigate("/livros")}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                startIcon={<SaveIcon />}
                disabled={loading}
              >
                {loading ? "A Guardar..." : "Salvar Livro"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NovoLivro;