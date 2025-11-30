import React, { useEffect, useState } from "react";
import api from "../services/Api";
import { useNavigate } from "react-router-dom";
import {
  Container, Grid, Card, CardMedia, CardContent, CardActions, Typography, Button, Box, CircularProgress, Alert, Chip, TextField, InputAdornment, Pagination, IconButton, FormControlLabel, Switch
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArchiveIcon from '@mui/icons-material/Archive'; 
import VisibilityIcon from '@mui/icons-material/Visibility';

const ListaLivros = () => {
  const [livros, setLivros] = useState([]);
  
  const [busca, setBusca] = useState("");
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const [mostrarArquivados, setMostrarArquivados] = useState(false);
  const [meusFavoritosIds, setMeusFavoritosIds] = useState([]);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isFuncionario = usuario?.role === "FUNCIONARIO";
  const PLACEHOLDER_IMG = "https://via.placeholder.com/300x450?text=Sem+Capa";

  const fetchLivros = async (pagina, termo, apenasFav, verArquivados) => {
    setLoading(true);
    try {
      const endpoint = `/livros?page=${pagina}&per_page=8&q=${termo}&apenas_favoritos=${apenasFav}&ver_arquivados=${verArquivados}`;
      const response = await api.get(endpoint);
      setLivros(response.data.livros);
      setTotalPages(response.data.total_paginas);
    } catch (error) { setErro("Erro ao carregar livros."); } 
    finally { setLoading(false); }
  };

  const fetchMeusFavoritosIds = async () => {
    try {
      const res = await api.get("/livros/meus-favoritos-ids");
      setMeusFavoritosIds(res.data);
    } catch (error) { console.error("Erro favoritos:", error); }
  };

  useEffect(() => { fetchMeusFavoritosIds(); }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLivros(page, busca, mostrarFavoritos, mostrarArquivados);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, busca, mostrarFavoritos, mostrarArquivados]);

  const handleBuscaChange = (e) => { setBusca(e.target.value); setPage(1); };
  const handlePageChange = (event, value) => { setPage(value); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const toggleFiltroFavoritos = () => { setMostrarFavoritos(!mostrarFavoritos); setPage(1); };

  const handleFavoritar = async (e, id) => {
    e.stopPropagation(); 
    try {
      await api.post(`/livros/${id}/favoritar`);
      if (meusFavoritosIds.includes(id)) {
        setMeusFavoritosIds(prev => prev.filter(favId => favId !== id));
        if (mostrarFavoritos) setLivros(prev => prev.filter(l => l.id !== id));
      } else {
        setMeusFavoritosIds(prev => [...prev, id]);
      }
    } catch (error) { console.error(error); }
  };

  const irParaDetalhes = (id) => {
    navigate(`/livros/detalhes/${id}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" fontWeight="bold" color="primary">
          {mostrarArquivados ? "Livros Arquivados" : (mostrarFavoritos ? "Meus Favoritos" : "Catálogo de Livros")}
        </Typography>
        
        <Box display="flex" gap={2} alignItems="center">
            {isFuncionario && (
              <FormControlLabel
                control={<Switch checked={mostrarArquivados} onChange={() => { setMostrarArquivados(!mostrarArquivados); setPage(1); }} color="warning" />}
                label="Ver Arquivados" sx={{ mr: 2, color: 'text.secondary', fontWeight: 'bold' }}
              />
            )}
            <Button variant={mostrarFavoritos ? "contained" : "outlined"} color="error" onClick={toggleFiltroFavoritos} disabled={mostrarArquivados} startIcon={mostrarFavoritos ? <FavoriteIcon /> : <FavoriteBorderIcon />}>
                {mostrarFavoritos ? "Ver Todos" : "Meus Favoritos"}
            </Button>
            {isFuncionario && (
            <Button variant="contained" color="success" onClick={() => navigate("/livros/novo")} sx={{ fontWeight: 'bold' }}>+ Novo Livro</Button>
            )}
        </Box>
      </Box>

      <Box mb={4}>
        <TextField fullWidth variant="outlined" placeholder="Pesquisar..." value={busca} onChange={handleBuscaChange} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} sx={{ backgroundColor: 'background.paper', borderRadius: 1 }} />
      </Box>

      {erro && <Alert severity="error" sx={{ mb: 3 }}>{erro}</Alert>}

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh"><CircularProgress /></Box>
      ) : (
        <>
          {!erro && livros.length === 0 && (
            <Alert severity="info">Nenhum livro encontrado.</Alert>
          )}

          <Grid container spacing={3} alignItems="stretch">
            {livros.map((livro) => {
              const total = livro.quantidade || 0;
              const disponiveis = livro.quantidade_disponivel !== undefined ? livro.quantidade_disponivel : total;
              const estaDisponivel = disponiveis > 0;
              const isFavorito = meusFavoritosIds.includes(livro.id);
              const isArquivado = livro.ativo === false; 

              return (
                <Grid item key={livro.id} xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
                  <Card 
                    onClick={() => irParaDetalhes(livro.id)}
                    sx={{ 
                        height: '480px', 
                        width: '100%',
                        display: 'flex', 
                        flexDirection: 'column', 
                        position: 'relative', 
                        transition: 'transform 0.2s', 
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.02)', boxShadow: 6 }, 
                        opacity: isArquivado ? 0.8 : (estaDisponivel ? 1 : 0.8), 
                        border: isArquivado ? '2px dashed #ed6c02' : 'none', 
                        backgroundColor: isArquivado ? '#fff3e0' : 'white' 
                    }}
                  >
                    {!isArquivado && (
                        <Box sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
                            <IconButton 
                                onClick={(e) => handleFavoritar(e, livro.id)}
                                sx={{ backgroundColor: 'rgba(255,255,255,0.7)', '&:hover': { backgroundColor: 'white' } }}
                            >
                                {isFavorito ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon color="action" />}
                            </IconButton>
                        </Box>
                    )}
                    {isArquivado && <Chip label="ARQUIVADO" color="warning" size="small" icon={<ArchiveIcon />} sx={{ position: 'absolute', top: 10, right: 10, zIndex: 10, fontWeight: 'bold' }} />}

                    <CardMedia 
                        component="img" 
                        height="220" 
                        image={livro.imagem_url || PLACEHOLDER_IMG} 
                        alt={`Capa de ${livro.nome}`} 
                        sx={{ objectFit: "cover", objectPosition: "top", filter: isArquivado ? 'grayscale(100%)' : 'none' }} 
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} 
                    />
                    
                    <CardContent sx={{ flexGrow: 1, pb: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} sx={{ height: '35px', overflow: 'hidden' }}>
                          <Box display="flex" gap={0.5} flexWrap="wrap" sx={{ height: '100%', overflow: 'hidden', alignItems: 'center' }}>
                            {livro.categorias && livro.categorias.length > 0 ? (
                                livro.categorias.slice(0, 2).map((cat) => <Chip key={cat.id} label={cat.nome} size="small" color="primary" variant="outlined" />)
                            ) : (<Chip label="Geral" size="small" variant="outlined" />)}
                            {livro.categorias && livro.categorias.length > 2 && <Typography variant="caption" color="text.secondary">+{livro.categorias.length - 2}</Typography>}
                          </Box>
                          
                          {!isArquivado && (
                            <Chip 
                                icon={<Inventory2Icon fontSize="small" />} 
                                label={
                                    isFuncionario 
                                    ? `${disponiveis}/${total}` 
                                    : (estaDisponivel ? `${disponiveis} disp.` : "Esgotado")
                                } 
                                size="small" 
                                color={estaDisponivel ? (isFuncionario ? "default" : "success") : "error"} 
                                variant={estaDisponivel && !isFuncionario ? "filled" : "outlined"}
                                sx={{ ml: 1, flexShrink: 0 }}
                            />
                          )}
                      </Box>
                      
                      <Typography 
                        gutterBottom 
                        variant="h6" 
                        component="div" 
                        lineHeight={1.2} 
                        mt={1}
                        title={livro.nome}
                        sx={{ 
                            height: '2.6em',
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {livro.nome}
                      </Typography>

                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        fontStyle="italic" 
                        noWrap 
                        sx={{ height: '1.5em', mt: 0.5 }}
                      >
                        {livro.autor}
                      </Typography>
                    </CardContent>

                    <CardActions sx={{ 
                        p: 2, 
                        pt: 0, 
                        mt: 'auto',
                        height: '60px',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Button 
                            size="small" 
                            startIcon={<VisibilityIcon />} 
                            onClick={(e) => { e.stopPropagation(); irParaDetalhes(livro.id); }}
                            fullWidth={!isFuncionario}
                            variant={!isFuncionario ? "contained" : "outlined"}
                            color={!isFuncionario ? "primary" : "primary"}
                        >
                            Detalhes
                        </Button>

                        {isFuncionario && (
                            <Button 
                                size="small" 
                                variant="contained" 
                                onClick={(e) => { e.stopPropagation(); navigate(`/livros/editar/${livro.id}`); }}
                            >
                                Gerenciar
                            </Button>
                        )}
                    </CardActions>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={5}>
              <Pagination count={totalPages} page={page} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default ListaLivros;