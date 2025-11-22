import React, { useState, useEffect } from "react";
import api from "../services/Api";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  TextField,
  MenuItem,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Tooltip,
  IconButton
} from "@mui/material";

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';

const GerenciarEmprestimos = () => {
  const [emprestimos, setEmprestimos] = useState([]);
  const [pessoas, setPessoas] = useState([]);
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [pessoaId, setPessoaId] = useState("");
  const [livroId, setLivroId] = useState("");
  const [dataEmprestimo, setDataEmprestimo] = useState(
    new Date().toISOString().slice(0, 10)
  );
  
  const [msg, setMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchDados = async () => {
      try {
        const [empRes, pesRes, livRes] = await Promise.all([
          api.get("/emprestimos"),
          api.get("/pessoas"),
          // CORREÇÃO: Pedir muitos livros para o dropdown não ficar vazio
          api.get("/livros?per_page=1000"), 
        ]);
        setEmprestimos(empRes.data);
        setPessoas(pesRes.data);
        // CORREÇÃO: Acessar a propriedade .livros da resposta paginada
        setLivros(livRes.data.livros || []); 
      } catch (err) {
        console.error("Erro ao buscar dados:", err);
        setMsg({ type: "error", text: "Erro ao carregar dados do servidor." });
      } finally {
        setLoading(false);
      }
    };
    fetchDados();
  }, []);

  const criarEmprestimo = async (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    try {
      const res = await api.post("/emprestimos", {
        pessoa_id: pessoaId,
        livro_id: livroId,
        data_emprestimo: dataEmprestimo
      });
      
      setEmprestimos((prev) => [...prev, res.data.emprestimo]);
      
      setPessoaId("");
      setLivroId("");
      setMsg({ type: "success", text: "Empréstimo registado com sucesso!" });
      
    } catch (err) {
      console.error("Erro ao criar:", err);
      setMsg({ type: "error", text: err.response?.data?.msg || "Erro ao criar empréstimo." });
    }
  };

  const devolverEmprestimo = async (id) => {
    try {
      await api.put(`/emprestimos/${id}/devolver`);
      
      setEmprestimos((prev) =>
        prev.map((e) =>
          e.id === id
            ? { ...e, status: "devolvido", data_devolucao: new Date().toISOString().slice(0, 10) }
            : e
        )
      );
      setMsg({ type: "success", text: "Livro devolvido com sucesso!" });
    } catch (err) {
      console.error("Erro ao devolver:", err);
      setMsg({ type: "error", text: "Não foi possível registar a devolução." });
    }
  };

  const emprestimosFiltrados = emprestimos.filter((e) => {
    const statusMatch = filtro === "Todos" ? true : e.status?.toLowerCase() === filtro.toLowerCase();
    
    const nomePessoa = e.pessoa_nome ? e.pessoa_nome.toLowerCase() : "";
    const nomeLivro = e.livro_nome ? e.livro_nome.toLowerCase() : "";
    const buscaLower = busca.toLowerCase();

    const buscaMatch = nomePessoa.includes(buscaLower) || nomeLivro.includes(buscaLower);
    
    return statusMatch && buscaMatch;
  });

  const getStatusChip = (emprestimo) => {
    const hoje = new Date();
    const dataEmp = new Date(emprestimo.data_emprestimo + "T00:00:00"); 
    const prazo = new Date(dataEmp.getTime() + 7 * 24 * 60 * 60 * 1000); 
    
    const isDevolvido = emprestimo.status === "devolvido" || !!emprestimo.data_devolucao;
    const isAtrasado = !isDevolvido && hoje > prazo;

    if (isDevolvido) return <Chip label="Devolvido" size="small" />;
    if (isAtrasado) return <Chip label="Atrasado" color="error" size="small" />;
    return <Chip label="Ativo" color="success" size="small" variant="outlined" />;
  };

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" color="primary" mb={4}>
        Gestão de Empréstimos
      </Typography>

      {msg.text && (
        <Alert severity={msg.type} sx={{ mb: 3 }} onClose={() => setMsg({ type: "", text: "" })}>
          {msg.text}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            
            <Box display="flex" flexWrap="wrap" gap={2} mb={3} justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={1}>
                {["Todos", "Ativo", "Devolvido"].map((f) => (
                  <Button
                    key={f}
                    variant={filtro === f ? "contained" : "outlined"}
                    size="small"
                    onClick={() => setFiltro(f)}
                    sx={{ borderRadius: 5 }}
                  >
                    {f}
                  </Button>
                ))}
              </Box>
              <TextField
                placeholder="Buscar leitor ou livro..."
                size="small"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                }}
                sx={{ width: { xs: '100%', sm: 250 } }}
              />
            </Box>

            <TableContainer sx={{ maxHeight: 600 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Leitor</strong></TableCell>
                    <TableCell><strong>Livro</strong></TableCell>
                    <TableCell><strong>Datas</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                    <TableCell align="center"><strong>Ação</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {emprestimosFiltrados.length > 0 ? (
                    emprestimosFiltrados.map((e) => (
                      <TableRow key={e.id} hover>
                        <TableCell>#{e.id}</TableCell>
                        <TableCell>{e.pessoa_nome}</TableCell>
                        <TableCell>{e.livro_nome}</TableCell>
                        <TableCell>
                          <Typography variant="caption" display="block">Emp: {e.data_emprestimo}</Typography>
                          <Typography variant="caption" color="text.secondary">Dev: {e.data_devolucao || "-"}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          {getStatusChip(e)}
                        </TableCell>
                        <TableCell align="center">
                          {!e.data_devolucao && (
                            <Tooltip title="Registar Devolução">
                              <IconButton color="success" onClick={() => devolverEmprestimo(e.id)}>
                                <CheckCircleIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        Nenhum empréstimo encontrado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Box display="flex" alignItems="center" gap={1} mb={3}>
              <AddCircleOutlineIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">Novo Empréstimo</Typography>
            </Box>

            <form onSubmit={criarEmprestimo}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="Leitor"
                    fullWidth
                    value={pessoaId}
                    onChange={(e) => setPessoaId(e.target.value)}
                    required
                    helperText="Selecione quem vai levar o livro"
                  >
                    {pessoas.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.nome} (CPF: {p.cpf})
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    select
                    label="Livro"
                    fullWidth
                    value={livroId}
                    onChange={(e) => setLivroId(e.target.value)}
                    required
                  >
                    {livros.map((l) => (
                      <MenuItem key={l.id} value={l.id}>
                        {l.nome}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Data do Empréstimo"
                    type="date"
                    fullWidth
                    value={dataEmprestimo}
                    onChange={(e) => setDataEmprestimo(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    fullWidth 
                    size="large"
                    sx={{ mt: 1 }}
                  >
                    Registar Saída
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

export default GerenciarEmprestimos;