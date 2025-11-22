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
  Pagination // <--- Componente novo
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import Inventory2Icon from '@mui/icons-material/Inventory2';

const ListaLivros = () => {
  const [livros, setLivros] = useState([]);
  
  // Estados de Paginação e Busca
  const [busca, setBusca] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const isFuncionario = usuario?.role === "FUNCIONARIO";

  const PLACEHOLDER_IMG = "https://via.placeholder.com/300x450?text=Sem+Capa";

  // Função de carregamento (reutilizável)
  const fetchLivros = async (pagina, termo) => {
    setLoading(true);
    try {
      // Envia página e termo de busca para o backend
      const response = await api.get(`/livros?page=${pagina}&per_page=8&q=${termo}`);
      
      // O Backend agora retorna { livros: [], total_paginas: X, ... }
      setLivros(response.data.livros);
      setTotalPages(response.data.total_paginas);
    } catch (error) {
      console.error(error);
      setErro("Erro ao carregar livros.");
    } finally {
      setLoading(false);
    }
  };

  // Efeito para carregar quando a página ou busca mudam
  useEffect(() => {
    // Pequeno delay na busca para não chamar a API a cada letra (debounce simples)
    const delayDebounceFn = setTimeout(() => {
      fetchLivros(page, busca);
    }, 300); 

    return () => clearTimeout(delayDebounceFn);
  }, [page, busca]);

  // Reseta para a página 1 quando o usuário começa a pesquisar
  const handleBuscaChange = (e) => {
    setBusca(e.target.value);
    setPage(1); 
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    // Scroll suave para o topo ao mudar de página
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditar = (id) => {
    navigate(`/livros/editar/${id}`);
  };

  const handleNovoLivro = () => {
    navigate("/livros/novo");
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
        <Typography variant="h4" component="h2" fontWeight="bold" color="primary">
          Catálogo de Livros
        </Typography>
        
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
            <Alert severity="info">Nenhum livro encontrado na sua pesquisa.</Alert>
          )}

          <Grid container spacing={3}>
            {livros.map((livro) => {
              const estoque = livro.quantidade || 0;
              const disponivel = estoque > 0;

              return (
                <Grid item key={livro.id} xs={12} sm={6} md={4} lg={3}>
                  <Card 
                    sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      transition: 'transform 0.2s',
                      '&:hover': { transform: 'scale(1.02)', boxShadow: 6 },
                      opacity: disponivel ? 1 : 0.8 
                    }}
                  >
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
                              label={`${estoque} ex.`} 
                              size="small" 
                              color={disponivel ? "default" : "error"}
                            />
                          ) : (
                            <Chip 
                              label={disponivel ? "Disponível" : "Esgotado"} 
                              size="small" 
                              color={disponivel ? "success" : "error"}
                              variant={disponivel ? "filled" : "outlined"}
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

          {/* PAGINAÇÃO */}
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