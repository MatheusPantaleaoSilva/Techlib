import React, { useEffect, useState } from "react";
import api from "../services/Api";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Pagination,
  IconButton,
} from "@mui/material";

// Ícones
import SearchIcon from '@mui/icons-material/Search';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

const ListaLivros = () => {
  const [livros, setLivros] = useState([]);
  
  // Estados de Filtros
  const [busca, setBusca] = useState("");
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false); // Toggle filtro
  const [meusFavoritosIds, setMeusFavoritosIds] = useState([]); // Lista de IDs favoritados (1, 5, 9)

  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isFuncionario = usuario?.role === "FUNCIONARIO";

  const PLACEHOLDER_IMG = "https://via.placeholder.com/300x450?text=Sem+Capa";

  // --- Funções de Carregamento ---

  // 1. Carrega os livros (com ou sem filtro de favoritos)
  const fetchLivros = async (pagina, termo, apenasFav) => {
    setLoading(true);
    try {
      const endpoint = `/livros?page=${pagina}&per_page=8&q=${termo}&apenas_favoritos=${apenasFav}`;
      const response = await api.get(endpoint);
      
      setLivros(response.data.livros);
      setTotalPages(response.data.total_paginas);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar livros.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Carrega APENAS os IDs que o usuário favoritou (para pintar o coração)
  const fetchMeusFavoritosIds = async () => {
    try {
      const res = await api.get("/livros/meus-favoritos-ids");
      setMeusFavoritosIds(res.data); // Ex: [1, 4, 10]
    } catch (error) {
      console.error("Erro ao carregar favoritos:", error);
    }
  };

  // --- Efeitos ---

  // Carrega IDs dos favoritos uma vez na montagem
  useEffect(() => {
    fetchMeusFavoritosIds();
  }, []);

  // Recarrega livros sempre que mudar página, busca ou o filtro "mostrarFavoritos"
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLivros(page, busca, mostrarFavoritos);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [page, busca, mostrarFavoritos]);


  // --- Handlers ---

  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPage(1); 
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFiltroFavoritos = () => {
    setMostrarFavoritos(!mostrarFavoritos);
    setPage(1); // Volta pra pagina 1 ao mudar o modo
  };

  // Ação de clicar no Coração
  const handleFavoritar = async (id) => {
    try {
      // Chama API
      await api.post(`/livros/${id}/favoritar`);
      
      // Atualiza estado local visualmente (sem precisar recarregar tudo)
      if (meusFavoritosIds.includes(id)) {
        // Se já estava, remove
        setMeusFavoritosIds(prev => prev.filter(favId => favId !== id));
        // Se estamos no modo "Só Favoritos", remove o livro da lista visualmente também
        if (mostrarFavoritos) {
          setLivros(prev => prev.filter(l => l.id !== id));
        }
      } else {
        // Se não estava, adiciona
        setMeusFavoritosIds(prev => [...prev, id]);
      }
    } catch (error) {
      console.error("Erro ao favoritar:", error);
    }
  };

  const handleEditar = (id) => {
    navigate(`/livros/editar/${id}`);
  };

  const handleNovoLivro = () => {
    navigate("/livros/novo");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      {/* Cabeçalho */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
          {mostrarFavoritos ? "Meus Favoritos" : "Catálogo de Livros"}
        </Typography>
        
        <Box display="flex" gap={2}>
            {/* Botão de Toggle Favoritos */}
            <Button 
                variant={mostrarFavoritos ? "contained" : "outlined"} 
                color="error" 
                onClick={toggleFiltroFavoritos}
                startIcon={mostrarFavoritos ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            >
                {mostrarFavoritos ? "Ver Todos" : "Meus Favoritos"}
            </Button>

            {isFuncionario && (
            <Button 
                variant="contained" 
                color="success" 
                onClick={handleNovoLivro}
                sx={{ fontWeight: 'bold' }}
            >
                + Novo Livro
            </Button>
            )}
        </Box>
      </Box>

      {/* Barra de Busca */}
      <Box mb={4}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Pesquisar por título, autor ou categoria..."
          value={busca}
          onChange={handleBuscaChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ backgroundColor: 'background.paper', borderRadius: 1 }}
        />
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {!erro && livros.length === 0 && (
            <Alert severity="info">
                {mostrarFavoritos 
                    ? "Você ainda não tem livros favoritos." 
                    : "Nenhum livro encontrado na sua pesquisa."}
            </Alert>
          )}

          <Grid container spacing={3}>
            {livros.map((livro) => {
              // Lógica de Disponibilidade
              const total = livro.quantidade || 0;
              const disponiveis = livro.quantidade_disponivel !== undefined ? livro.quantidade_disponivel : total;
              const estaDisponivel = disponiveis > 0;
              
              // Verifica se este livro está na lista de favoritos do usuário
              const isFavorito = meusFavoritosIds.includes(livro.id);

              return (
                <Grid item key={livro.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      position: 'relative', // Para posicionar o coração
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                      opacity: estaDisponivel ? 1 : 0.8
                    }}
                  >
                    {/* Botão de Favoritar Flutuante na Capa */}
                    <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                        <IconButton 
                            onClick={() => handleFavoritar(livro.id)}
                            sx={{ 
                                backgroundColor: 'rgba(255,255,255,0.7)', 
                                '&:hover': { backgroundColor: 'white' } 
                            }}
                        >
                            {isFavorito ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="action" />}
                        </IconButton>
                    </Box>

                    <CardMedia
                      component="img"
                      height="250"
                      image={livro.imagem_url || PLACEHOLDER_IMG}
                      alt={`Capa de ${livro.nome}`}
                      sx={{ objectFit: "cover", objectPosition: "top" }}
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                    
                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip 
                            label={livro.categoria_nome || "Geral"} 
                            size="small" 
                            color="primary" 
                            variant="outlined" 
                          />
                          
                          {isFuncionario ? (
                            <Chip 
                              icon={<Inventory2Icon fontSize="small" />}
                              label={`${disponiveis}/${total} ex.`} 
                              size="small" 
                              color={estaDisponivel ? "default" : "error"}
                            />
                          ) : (
                            <Chip 
                              label={estaDisponivel ? "Disponível" : "Esgotado"} 
                              size="small" 
                              color={estaDisponivel ? "success" : "error"}
                              variant={estaDisponivel ? "filled" : "outlined"}
                            />
                          )}
                      </Box>
                      
                      <Typography gutterBottom variant="h6" component="div" lineHeight={1.2} mt={1}>
                        {livro.nome}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" fontStyle="italic">
                        {livro.autor}
                      </Typography>
                    </CardContent>

                    {isFuncionario && (
                      <CardActions sx={{ p: 2, pt: 0 }}>
                        <Button 
                          size="small" 
                          variant="contained" 
                          fullWidth 
                          onClick={() => handleEditar(livro.id)}
                        >
                          Gerenciar
                        </Button>
                      </CardActions>
                    )}
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {/* Paginação */}
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={5}>
              <Pagination 
                count={totalPages} 
                page={page} 
                onChange={handlePageChange} 
                color="primary" 
                size="large"
                showFirstButton 
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ListaLivros;