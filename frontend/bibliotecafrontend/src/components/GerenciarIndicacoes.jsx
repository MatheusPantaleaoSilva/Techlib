import React, { useState, useEffect } from "react";
import api from "../services/Api";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  IconButton,
  Divider,
  ListItemSecondaryAction,
  Tooltip
} from "@mui/material";

// Ícones
import StarIcon from '@mui/icons-material/Star';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import BookIcon from '@mui/icons-material/Book';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

const GerenciarIndicacoes = () => {
  const [livros, setLivros] = useState([]);
  const [indicacoes, setIndicacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [livroSelecionado, setLivroSelecionado] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [livrosRes, indicacoesRes] = await Promise.all([
          api.get("/livros?per_page=1000"),
          api.get("/indicacoes"),
        ]);
        setLivros(livrosRes.data.livros || []); 
        setIndicacoes(indicacoesRes.data);
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setErro("Erro ao carregar dados. Verifique a conexão.");
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  const criarIndicacao = async (e) => {
    e.preventDefault();
    setErro("");

    if (!livroSelecionado || !dataInicio || !dataFim) {
      setErro("Preencha todos os campos.");
      return;
    }

    try {
      await api.post("/indicacoes", {
        livro_id: parseInt(livroSelecionado),
        data_inicio: dataInicio,
        data_fim: dataFim
      });

      const res = await api.get("/indicacoes");
      setIndicacoes(res.data);

      setLivroSelecionado("");
      setDataInicio("");
      setDataFim("");
      
    } catch (err) {
      console.error("Erro ao criar indicação:", err);
      setErro(err.response?.data?.msg || "Erro ao criar indicação.");
    }
  };

  const deletarIndicacao = async (id) => {
    try {
      await api.delete(`/indicacoes/${id}`);
      setIndicacoes((prev) => prev.filter((i) => i.id_indicacao !== id));
    } catch (err) {
      console.error("Erro ao deletar:", err);
      setErro("Não foi possível remover a indicação.");
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
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
      <Box mb={4} display="flex" alignItems="center" gap={2}>
        <StarIcon color="warning" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight="bold" color="primary">
          Destaques da Semana
        </Typography>
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      <Grid container spacing={4}>
        
        <Grid item xs={12} md={7}>
          <Paper elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box p={2} bgcolor="primary.main" color="white">
              <Typography variant="h6">Livros em Destaque</Typography>
            </Box>
            
            {indicacoes.length === 0 ? (
              <Box p={4} textAlign="center">
                <Typography color="text.secondary">
                  Nenhum livro indicado para esta semana.
                </Typography>
              </Box>
            ) : (
              <List>
                {indicacoes.map((ind, index) => (
                  <React.Fragment key={ind.id_indicacao || ind.id}> 
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          src={ind.imagem_url} 
                          variant="rounded"
                          sx={{ width: 60, height: 90, mr: 2 }}
                        >
                          <BookIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Typography variant="h6" color="primary.dark">
                            {ind.nome}
                          </Typography>
                        }
                        secondary={
                          <Box mt={1}>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {ind.autor}
                            </Typography>
                            <Box display="flex" alignItems="center" gap={1} mt={1}>
                              <CalendarTodayIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {formatarData(ind.data_inicio)} até {formatarData(ind.data_fim)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                      
                      <ListItemSecondaryAction>
                        <Tooltip title="Remover Destaque">
                          <IconButton edge="end" color="error" onClick={() => deletarIndicacao(ind.id_indicacao)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < indicacoes.length - 1 && <Divider variant="inset" component="li" />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <AddCircleOutlineIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Nova Indicação</Typography>
            </Box>

            <form onSubmit={criarIndicacao}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Selecione o Livro"
                    fullWidth
                    value={livroSelecionado}
                    onChange={(e) => setLivroSelecionado(e.target.value)}
                    required
                  >
                    {livros.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data Início"
                    type="date"
                    fullWidth
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Data Fim"
                    type="date"
                    fullWidth
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    fullWidth 
                    size="large"
                    startIcon={<StarIcon />}
                    sx={{ mt: 1 }}
                  >
                    Destacar Livro
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  );
};

export default GerenciarIndicacoes;