import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/Api";
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, CircularProgress,
  Paper, Divider, List, ListItem, ListItemAvatar, Avatar, ListItemText, Alert, Chip
} from "@mui/material"; // <--- Card e CardContent incluídos aqui
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

const Dashboard = () => {
  // Removido "setUsuario" pois não é usado
  const [usuario] = useState(JSON.parse(localStorage.getItem("usuario")) || {});
  const [livrosIndicados, setLivrosIndicados] = useState([]);
  const [meusEmprestimos, setMeusEmprestimos] = useState([]);
  const [relatorio, setRelatorio] = useState(null);
  const [loading, setLoading] = useState(true);
  
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
          const resMeus = await api.get("/meus-emprestimos");
          setMeusEmprestimos(resMeus.data);
        }

      } catch (err) {
        console.error("Erro ao carregar dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [usuario.role]);

  const pieData = relatorio ? [
    { name: "Ativos", value: relatorio.ativos },
    { name: "Devolvidos", value: relatorio.devolvidos },
    { name: "Atrasados", value: relatorio.atrasados }
  ] : [];
  
  const barData = relatorio?.livros_mais_emprestados?.slice(0, 5) || [];

  // Verifica se há dados reais para mostrar (evita gráfico vazio)
  const temDados = relatorio && relatorio.total_emprestimos > 0;

  const meusAtivos = meusEmprestimos.filter(e => e.status === "ativo").length;
  const meusAtrasados = meusEmprestimos.filter(e => e.status === "atrasado").length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4} textAlign="center">
        <Typography variant="h3" fontWeight="bold" color="primary" gutterBottom>
          Olá, {usuario.nome || usuario.username}!
        </Typography>
        <Typography variant="h6" color="text.secondary">
          {usuario.role === "FUNCIONARIO" ? "Painel Administrativo" : "Sua Área do Leitor"}
        </Typography>
      </Box>

      <Grid container spacing={4}>
        
        {/* ESQUERDA: Menu e Indicações */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">Acesso Rápido</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              {usuario.role === "FUNCIONARIO" ? (
                <>
                  <Button variant="contained" startIcon={<PeopleIcon />} component={Link} to="/pessoas" fullWidth>Gerenciar Pessoas</Button>
                  <Button variant="contained" color="secondary" startIcon={<AssignmentIcon />} component={Link} to="/emprestimos" fullWidth>Gerenciar Empréstimos</Button>
                  {/* Botão de Categorias */}
                  <Button variant="contained" color="warning" startIcon={<MenuBookIcon />} component={Link} to="/categorias" fullWidth>Gerenciar Categorias</Button>
                  <Button variant="outlined" startIcon={<StarIcon />} component={Link} to="/indicacoes" fullWidth>Gerenciar Indicações</Button>
                </>
              ) : (
                <Button variant="contained" startIcon={<AssignmentIcon />} component={Link} to="/perfil" fullWidth>
                  Ver Meus Empréstimos
                </Button>
              )}
              <Button variant="contained" color="info" startIcon={<MenuBookIcon />} component={Link} to="/livros" fullWidth>
                Consultar Acervo
              </Button>
              <Button variant="outlined" component={Link} to="/perfil" fullWidth>Meu Perfil</Button>
            </Box>
          </Paper>

          {/* Indicações */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold" color="warning.main">
               <StarIcon sx={{ verticalAlign: 'middle', mb: 0.5, mr: 1 }} /> Destaques
            </Typography>
            {livrosIndicados.length === 0 ? (
              <Typography variant="body2" color="text.secondary">Nenhuma indicação.</Typography>
            ) : (
              <List>
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
        </Grid>

        {/* DIREITA: Conteúdo Principal */}
        <Grid item xs={12} md={8}>
          {usuario.role === "FUNCIONARIO" ? (
            // CONTEÚDO FUNCIONÁRIO (GRÁFICOS)
            <Grid container spacing={3}>
              <Grid item xs={12}>
                 <Alert severity="info" icon={<AssignmentIcon />}>Total de Empréstimos: <strong>{relatorio?.total_emprestimos || 0}</strong></Alert>
              </Grid>
              
              {/* Gráfico 1: Status */}
              <Grid item xs={12} lg={6}>
                <Paper elevation={3} sx={{ p: 2, height: '400px', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" align="center" fontWeight="bold" mb={2}>Status dos Empréstimos</Typography>
                  
                  <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {temDados ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie 
                            data={pieData} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={60} 
                            outerRadius={90}
                            fill="#8884d8" 
                            paddingAngle={5} 
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                          </Pie>
                          <RechartsTooltip />
                          <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box textAlign="center" color="text.secondary">
                        <AssessmentIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                        <Typography variant="body2">Sem dados para exibir</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>

              {/* Gráfico 2: Populares */}
              <Grid item xs={12} lg={6}>
                <Paper elevation={3} sx={{ p: 2, height: '400px', borderRadius: 2, display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="subtitle1" align="center" fontWeight="bold" mb={2}>Livros Mais Populares</Typography>
                  
                  <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {temDados && barData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={barData} 
                          layout="vertical" 
                          margin={{ left: 0, right: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="nome" 
                            type="category" 
                            width={120} 
                            tick={{fontSize: 11}} 
                          />
                          <RechartsTooltip />
                          <Bar 
                            dataKey="qtd" 
                            fill="#8884d8" 
                            radius={[0, 4, 4, 0]} 
                            barSize={30}
                            name="Empréstimos"
                          >
                            {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#1976d2" : "#42a5f5"} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <Box textAlign="center" color="text.secondary">
                        <MenuBookIcon sx={{ fontSize: 60, opacity: 0.2 }} />
                        <Typography variant="body2">Nenhum empréstimo registado</Typography>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          ) : (
            // CONTEÚDO CLIENTE (RESUMO)
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 4, 
                    borderRadius: 2, 
                    background: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)',
                    color: 'white'
                  }}
                >
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Situação Atual
                  </Typography>
                  <Box display="flex" justifyContent="space-around" mt={3} textAlign="center">
                    <Box>
                      <Typography variant="h2" fontWeight="800">{meusAtivos}</Typography>
                      <Typography variant="body2">Empréstimos Ativos</Typography>
                    </Box>
                    <Box>
                      <Typography variant="h2" fontWeight="800" color={meusAtrasados > 0 ? '#ff8a80' : 'inherit'}>
                        {meusAtrasados}
                      </Typography>
                      <Typography variant="body2">Atrasados</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom display="flex" alignItems="center" gap={1}>
                      <BookmarkIcon color="primary" /> Últimas Leituras
                    </Typography>
                    {meusEmprestimos.length === 0 ? (
                      <Typography color="text.secondary" align="center" py={2}>
                        Você ainda não tem histórico de leitura. Visite o acervo!
                      </Typography>
                    ) : (
                      <List>
                        {meusEmprestimos.slice(0, 3).map((emp) => (
                          <ListItem key={emp.id} divider>
                            <ListItemText 
                              primary={emp.livro_nome} 
                              secondary={`Retirado em: ${emp.data_emprestimo}`} 
                            />
                            <Chip 
                              label={emp.status === "ativo" ? "Com você" : "Devolvido"} 
                              color={emp.status === "ativo" ? "success" : "default"} 
                              size="small" 
                            />
                          </ListItem>
                        ))}
                      </List>
                    )}
                    {meusEmprestimos.length > 0 && (
                      <Box textAlign="center" mt={2}>
                        <Button component={Link} to="/perfil">Ver Histórico Completo</Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;