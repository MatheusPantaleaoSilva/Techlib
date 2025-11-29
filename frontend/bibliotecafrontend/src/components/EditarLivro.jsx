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
  InputAdornment,
  Chip
} from "@mui/material";

// Ícones
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import UnarchiveIcon from '@mui/icons-material/Unarchive';
import DescriptionIcon from '@mui/icons-material/Description'; // Novo ícone

const EditarLivro = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    autor: "",
    isbn: "",
    categoria_ids: [],
    descricao: "", // Novo campo de estado
    dataAquisicao: "",
    imagemUrl: "",
    quantidade: 1,
    ativo: true
  });
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resLivro, resCats] = await Promise.all([
          api.get(`/livros/${id}`),
          api.get("/categorias")
        ]);

        setCategorias(resCats.data);
        
        const livro = resLivro.data;
        
        // Extrai apenas os IDs da lista de objetos categoria
        const idsCats = livro.categorias ? livro.categorias.map(c => c.id) : [];

        setForm({
          nome: livro.nome || "",
          autor: livro.autor || "",
          isbn: livro.isbn || "",
          categoria_ids: idsCats,
          descricao: livro.descricao || "", // Carrega descrição
          dataAquisicao: livro.data_aquisicao || "",
          imagemUrl: livro.imagem_url || "",
          quantidade: livro.quantidade || 1,
          ativo: livro.ativo !== false
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
    setMsg({ type: "", text: "" });
    setErro("");
    
    try {
      await api.put(`/livros/${id}`, {
        nome: form.nome,
        autor: form.autor,
        isbn: form.isbn,
        categoria_ids: form.categoria_ids,
        descricao: form.descricao, // Envia descrição atualizada
        imagem_url: form.imagemUrl,
        quantidade: parseInt(form.quantidade),
        ativo: form.ativo
      });
      setMsg({ type: "success", text: "Livro atualizado com sucesso!" });
      setTimeout(() => navigate("/livros"), 1500);
    } catch (error) {
      console.error(error);
      setErro("Erro ao atualizar livro.");
    }
  };

  const handleArquivar = async () => {
    try {
      await api.delete(`/livros/${id}`);
      setMsg({ type: "success", text: "Livro arquivado com sucesso!" });
      setForm({ ...form, ativo: false });
      setOpenDialog(false);
    } catch (error) {
      console.error(error);
      setErro("Erro ao arquivar livro.");
      setOpenDialog(false);
    }
  };

  const handleReativar = async () => {
    try {
      await api.put(`/livros/${id}`, {
        ...form,
        ativo: true 
      });
      setForm({ ...form, ativo: true });
      setMsg({ type: "success", text: "Livro reativado e voltou para o acervo!" });
    } catch (error) {
      console.error(error);
      setErro("Erro ao reativar livro.");
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
          
          {!form.ativo && (
             <Chip label="ARQUIVADO" color="warning" icon={<UnarchiveIcon />} />
          )}
        </Box>

        {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}
        {msg.text && <Alert severity={msg.type} sx={{ mb: 3 }}>{msg.text}</Alert>}

        {!form.ativo && (
            <Alert 
                severity="warning" 
                variant="filled"
                action={
                    <Button color="inherit" size="small" onClick={handleReativar} sx={{ fontWeight: 'bold' }}>
                        REATIVAR AGORA
                    </Button>
                }
                sx={{ mb: 4 }}
            >
                Este livro está arquivado. Ele não aparece para novos empréstimos.
            </Alert>
        )}

        <form onSubmit={handleUpdate}>
          <Grid container spacing={3}>
            
            <Grid item xs={12}>
              <TextField
                label="Título"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                fullWidth
                required
                disabled={!form.ativo}
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
                disabled={!form.ativo}
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
                disabled={!form.ativo}
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((val) => {
                          const c = categorias.find(cat => cat.id === val);
                          return <Chip key={val} label={c ? c.nome : val} size="small" />;
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

            {/* CAMPO DE DESCRIÇÃO EDITÁVEL */}
            <Grid item xs={12}>
              <TextField
                label="Descrição / Sinopse"
                name="descricao"
                value={form.descricao}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                inputProps={{ maxLength: 500 }}
                helperText={`${form.descricao.length}/500 caracteres`}
                disabled={!form.ativo}
                InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{alignSelf: 'flex-start', mt: 1.5}}>
                        <DescriptionIcon color="action" />
                      </InputAdornment>
                    ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="ISBN"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                fullWidth
                required
                disabled={!form.ativo}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Data de Aquisição"
                type="date"
                name="dataAquisicao"
                value={form.dataAquisicao}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                disabled={true} 
                helperText="Fixo"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                label="Quantidade"
                type="number"
                name="quantidade"
                value={form.quantidade}
                onChange={handleChange}
                fullWidth
                required
                disabled={!form.ativo}
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
                label="URL da Capa"
                name="imagemUrl"
                value={form.imagemUrl}
                onChange={handleChange}
                fullWidth
                helperText="Link para imagem externa"
                disabled={!form.ativo}
              />
            </Grid>

            <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              
              {form.ativo ? (
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => setOpenDialog(true)}
                  >
                    Arquivar Livro
                  </Button>
              ) : (
                  <Button 
                    variant="contained" 
                    color="success" 
                    startIcon={<UnarchiveIcon />}
                    onClick={handleReativar}
                  >
                    Reativar Livro
                  </Button>
              )}

              <Box display="flex" gap={2}>
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
                    disabled={!form.ativo}
                >
                    Salvar Alterações
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Confirmar Arquivamento</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem a certeza que deseja arquivar este livro?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleArquivar} color="error" autoFocus>
            Confirmar e Arquivar
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default EditarLivro;