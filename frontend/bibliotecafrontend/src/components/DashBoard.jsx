import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/Api";
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress,
  Paper, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip, CardMedia, CardActions, IconButton, Alert 
} from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, Legend, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";

import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AssessmentIcon from '@mui/icons-material/Assessment';
import CategoryIcon from '@mui/icons-material/Category';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ArchiveIcon from '@mui/icons-material/Archive';
import VisibilityIcon from '@mui/icons-material/Visibility';

const Dashboard = () => {
  const [usuario] = useState(JSON.parse(localStorage.getItem("usuario")) || {});
  const [livrosIndicados, setLivrosIndicados] = useState([]);
  const [meusEmprestimos, setMeusEmprestimos] = useState([]);
  const [meusFavoritosIds, setMeusFavoritosIds] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const PLACEHOLDER_IMG = "https://via.placeholder.com/300x450?text=Sem+Capa";
  const COLORS = ["#0088FE", "#00C49F", "#FF8042"]; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const resIndicacoes = await api.get("/indicacoes");
        setLivrosIndicados(resIndicacoes.data);

        if (usuario.role === "FUNCIONARIO") {
          const resRelatorio = await api.get("/relatorios");
          setRelatorio(resRelatorio.data);
        } else {
          const [resMeus, resFavs] = await Promise.all([
            api.get("/meus-emprestimos"),
            api.get("/livros/meus-favoritos-ids")
          ]);
          setMeusEmprestimos(resMeus.data);
          setMeusFavoritosIds(resFavs.data);
        }

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario.role]);

  const handleFavoritar = async (e, id) => {
    e.stopPropagation(); 
    try {
      await api.post(`/livros/${id}/favoritar`);
      if (meusFavoritosIds.includes(id)) {
        setMeusFavoritosIds(prev => prev.filter(favId => favId !== id));
      } else {
        setMeusFavoritosIds(prev => [...prev, id]);
      }
    } catch (error) { console.error(error); }
  };

  const irParaDetalhes = (id) => {
    navigate(`/livros/detalhes/${id}`);
  };

  const pieData = relatorio ? [
    { name: "Ativos", value: relatorio.ativos },
    { name: "Devolvidos", value: relatorio.devolvidos },
    { name: "Atrasados", value: relatorio.atrasados }
  ] : [];
  
  const barData = relatorio?.livros_mais_emprestados?.slice(0, 5) || [];
  const temDados = relatorio && relatorio.total_emprestimos > 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  const CardAcessoRapido = () => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom fontWeight="bold">Menu Rápido</Typography>
      <Box display="flex" flexDirection="column" gap={2} mt={2} sx={{ flexGrow: 1 }}>
        {usuario.role === "FUNCIONARIO" ? (
          <>
            <Button variant="contained" startIcon={<PeopleIcon />} component={Link} to="/pessoas" fullWidth>Gerenciar Pessoas</Button>
            <Button variant="contained" color="secondary" startIcon={<AssignmentIcon />} component={Link} to="/emprestimos" fullWidth>Gerenciar Empréstimos</Button>
            <Button variant="contained" color="warning" startIcon={<CategoryIcon />} component={Link} to="/categorias" fullWidth>Gerenciar Categorias</Button>
            <Button variant="contained" color="primary" startIcon={<StarIcon />} component={Link} to="/indicacoes" fullWidth sx={{ bgcolor: '#9c27b0', '&:hover': { bgcolor: '#7b1fa2' } }}>Gerenciar Indicações</Button>
            <Divider sx={{ my: 1 }} />
            <Button variant="outlined" startIcon={<MenuBookIcon />} component={Link} to="/livros" fullWidth>Consultar Acervo</Button>
          </>
        ) : (
          <>
            <Button variant="contained" startIcon={<AssignmentIcon />} component={Link} to="/perfil" fullWidth>Meus Empréstimos</Button>
            <Button variant="contained" color="info" startIcon={<MenuBookIcon />} component={Link} to="/livros" fullWidth>Explorar Acervo</Button>
            <Button variant="outlined" component={Link} to="/perfil" fullWidth>Meu Perfil</Button>
          </>
        )}
      </Box>
    </Paper>
  );

  const ListaDestaquesSimples = () => (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom fontWeight="bold" color="warning.main">
          <StarIcon sx={{ verticalAlign: 'middle', mb: 0.5, mr: 1 }} /> Destaques Ativos
      </Typography>
      {livrosIndicados.length === 0 ? (
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">Nenhuma indicação configurada.</Typography>
        </Box>
      ) : (
        <List sx={{ maxHeight: 300, overflow: 'auto', flexGrow: 1 }}>
          {livrosIndicados.map((livro) => (
            <React.Fragment key={livro.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar variant="rounded" src={livro.imagem_url} sx={{ width: 50, height: 70 }}><MenuBookIcon /></Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={livro.nome}
                  secondary={<Typography variant="caption" color="text.secondary">{livro.autor}</Typography>}
                />
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );

  const CardUltimasLeituras = () => (
    <Card elevation={3} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
          <BookmarkIcon color="primary" /> Histórico Recente
        </Typography>
        {meusEmprestimos.length === 0 ? (
          <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
            <Typography color="text.secondary" align="center">Você ainda não leu nada.</Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1 }}>
            {meusEmprestimos.slice(0, 3).map((emp) => (
              <ListItem key={emp.id} divider>
                <ListItemText primary={emp.livro_nome} secondary={`Retirado: ${emp.data_emprestimo}`} />
                <Chip label={emp.status === "ativo" ? "Lendo" : "Devolvido"} color={emp.status === "ativo" ? "success" : "default"} size="small" />
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          Olá, {usuario.nome || usuario.username}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {usuario.role === "FUNCIONARIO" ? "Painel Administrativo" : "Bem-vindo à sua Biblioteca"}
        </Typography>
      </Box>

      {usuario.role === "FUNCIONARIO" ? (
        <Grid container spacing={3} alignItems="stretch" justifyContent="center">
          <Grid item xs={12} md={6} lg={3}><CardAcessoRapido /></Grid>
          <Grid item xs={12} md={6} lg={3}><ListaDestaquesSimples /></Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
              <Typography variant="subtitle1" align="center" fontWeight="bold" mb={2}>Status dos Empréstimos</Typography>
              <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {temDados ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} fill="#8884d8" paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <RechartsTooltip /><Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (<Box textAlign="center" color="text.secondary"><AssessmentIcon sx={{ fontSize: 60, opacity: 0.2 }} /><Typography variant="body2">Sem dados</Typography></Box>)}
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Paper elevation={3} sx={{ p: 2, height: '100%', borderRadius: 2, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
              <Typography variant="subtitle1" align="center" fontWeight="bold" mb={2}>Populares</Typography>
              <Box sx={{ width: '100%', flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {temDados && barData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} /><XAxis type="number" hide /><YAxis dataKey="nome" type="category" width={80} tick={{fontSize: 10}} /><RechartsTooltip />
                      <Bar dataKey="qtd" fill="#8884d8" radius={[0, 4, 4, 0]} barSize={30} name="Empréstimos">{barData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1976d2" : "#42a5f5"} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (<Box textAlign="center" color="text.secondary"><MenuBookIcon sx={{ fontSize: 60, opacity: 0.2 }} /><Typography variant="body2">Sem dados</Typography></Box>)}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Box>
            
            <Box mb={5}>
                <Typography variant="h5" fontWeight="bold" color="warning.main" mb={3} display="flex" alignItems="center" gap={1}>
                    <StarIcon /> Destaques da Semana
                </Typography>
                
                {livrosIndicados.length === 0 ? (
                    <Alert severity="info">Não há livros em destaque no momento. Explore o acervo completo!</Alert>
                ) : (
                    <Grid container spacing={3}>
                        {livrosIndicados.map((livro) => {
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
                                                        label={estaDisponivel ? `${disponiveis} disp.` : "Esgotado"} 
                                                        size="small" 
                                                        color={estaDisponivel ? "success" : "error"} 
                                                        variant={estaDisponivel ? "outlined" : "filled"}
                                                        sx={{ ml: 1, flexShrink: 0 }}
                                                    />
                                                )}
                                            </Box>
                                            <Typography gutterBottom variant="h6" component="div" lineHeight={1.2} mt={1} title={livro.nome} sx={{ height: '2.6em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {livro.nome}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontStyle="italic" noWrap sx={{ height: '1.5em', mt: 0.5 }}>
                                                {livro.autor}
                                            </Typography>
                                        </CardContent>

                                        <CardActions sx={{ p: 2, pt: 0, mt: 'auto', height: '60px', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Button 
                                                size="small" 
                                                startIcon={<VisibilityIcon />} 
                                                onClick={(e) => { e.stopPropagation(); irParaDetalhes(livro.id); }}
                                                fullWidth
                                                variant="contained"
                                                color="primary"
                                            >
                                                Detalhes
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                )}
            </Box>

            <Divider sx={{ my: 4 }} />
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <CardAcessoRapido />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CardUltimasLeituras />
                </Grid>
            </Grid>
        </Box>
      )}
    </Container>
  );
};

export default Dashboard;