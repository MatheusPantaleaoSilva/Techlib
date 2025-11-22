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
  MenuItem,
  InputAdornment
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const EditarLivro = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estados
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    autor: "",
    isbn: "",
    categoria_id: "",
    dataAquisicao: "",
    imagemUrl: "",
    quantidade: 1
  });
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  // Carregar Livro e Categorias
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Faz as duas requisições em paralelo para ser mais rápido
        const [resLivro, resCats] = await Promise.all([
          api.get(`/livros/${id}`),
          api.get("/categorias")
        ]);

        setCategorias(resCats.data);
        
        const livro = resLivro.data;
        setForm({
          nome: livro.nome || "",
          autor: livro.autor || "",
          isbn: livro.isbn || "",
          // Se o backend retornar categoria_id, usa-o. Se não, tenta encontrar pelo nome (fallback)
          categoria_id: livro.categoria_id || "", 
          dataAquisicao: livro.data_aquisicao || "",
          imagemUrl: livro.imagem_url || "",
          quantidade: livro.quantidade || 1
        });

      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar dados. Verifique a conexão.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    try {
      await api.put(`/livros/${id}`, {
        nome: form.nome,
        autor: form.autor,
        isbn: form.isbn,
        categoria_id: parseInt(form.categoria_id),
        data_aquisicao: form.dataAquisicao,
        imagem_url: form.imagemUrl,
        quantidade: parseInt(form.quantidade)
      });
      navigate("/livros");
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar livro.");
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/livros/${id}`);
      navigate("/livros");
    } catch (error) {
      console.error(error);
      setErro("Erro ao excluir livro. Verifique se não há empréstimos ativos.");
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
        
        {/* Cabeçalho */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/livros")}>
              Voltar
            </Button>
            <Typography variant="h5" fontWeight="bold" color="primary">
              Editar Livro
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
            
            {/* Título */}
            <Grid item xs={12}>
              <TextField
                label="Título"
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
                label="URL da Capa"
                name="imagemUrl"
                value={form.imagemUrl}
                onChange={handleChange}
                fullWidth
                helperText="Link para imagem externa"
              />
            </Grid>

            {/* Botões */}
            <Grid item xs={12} display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={() => navigate("/livros")}
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
            Tem a certeza que deseja apagar o livro "{form.nome}"? Esta ação não pode ser desfeita.
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

export default EditarLivro;