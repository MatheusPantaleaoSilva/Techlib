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
  InputAdornment,
  Chip
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import DescriptionIcon from '@mui/icons-material/Description'; // Novo ícone

const NovoLivro = () => {
  const navigate = useNavigate();
  
  const [categorias, setCategorias] = useState([]);
  
  const [form, setForm] = useState({
    nome: "",
    autor: "",
    isbn: "",
    categoria_ids: [],
    descricao: "", // Novo campo de estado
    imagemUrl: "",
    quantidade: 1
  });
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!form.nome || !form.autor || !form.isbn || form.categoria_ids.length === 0 || !form.quantidade) {
      setErro("Todos os campos obrigatórios devem ser preenchidos.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/livros", {
        nome: form.nome,
        autor: form.autor,
        isbn: form.isbn,
        categoria_ids: form.categoria_ids,
        descricao: form.descricao, // Envia a descrição
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

            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Categorias"
                name="categoria_ids"
                value={form.categoria_ids}
                onChange={handleChange}
                fullWidth
                required
                helperText={categorias.length === 0 ? "Crie categorias primeiro" : "Selecione uma ou mais"}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                         const cat = categorias.find(c => c.id === value);
                         return <Chip key={value} label={cat ? cat.nome : value} size="small" />;
                      })}
                    </Box>
                  ),
                }}
              >
                {categorias.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* CAMPO DE DESCRIÇÃO NOVO */}
            <Grid item xs={12}>
              <TextField
                label="Descrição / Sinopse"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                placeholder="Escreva um breve resumo do livro (máximo 500 caracteres)"
                inputProps={{ maxLength: 500 }}
                helperText={`${form.descricao.length}/500 caracteres`}
                InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{alignSelf: 'flex-start', mt: 1.5}}>
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="ISBN"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
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