import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/Api";
import {
  Container, Paper, Typography, Box, Grid, Button, Chip, CircularProgress, Alert, Divider
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ArchiveIcon from '@mui/icons-material/Archive';
import FingerprintIcon from '@mui/icons-material/Fingerprint';

const DetalhesLivro = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [livro, setLivro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");

  const PLACEHOLDER_IMG = "https://via.placeholder.com/300x450?text=Sem+Capa";

  useEffect(() => {
    const fetchLivro = async () => {
      try {
        const res = await api.get(`/livros/${id}`);
        setLivro(res.data);
      } catch (error) {
        console.error("Erro ao carregar livro:", error);
        setErro("Não foi possível carregar os detalhes do livro.");
      } finally {
        setLoading(false);
      }
    };
    fetchLivro();
  }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
  if (erro) return <Container sx={{ mt: 4 }}><Alert severity="error">{erro}</Alert><Button onClick={() => navigate("/livros")} sx={{ mt: 2 }}>Voltar</Button></Container>;
  if (!livro) return <Container sx={{ mt: 4 }}><Alert severity="info">Livro não encontrado.</Alert></Container>;

  const isArquivado = livro.ativo === false;
  const disponivel = livro.quantidade_disponivel > 0;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/livros")} sx={{ mb: 3 }}>
          Voltar para o Catálogo
        </Button>

        <Grid container spacing={4}>
          <Grid item xs={12} sm={5} md={4}>
            <Box
              component="img"
              src={livro.imagem_url || PLACEHOLDER_IMG}
              alt={`Capa de ${livro.nome}`}
              sx={{
                width: "100%",
                borderRadius: 2,
                boxShadow: 4,
                filter: isArquivado ? "grayscale(100%)" : "none",
                maxHeight: 500,
                objectFit: "cover"
              }}
              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
            />
          </Grid>

          <Grid item xs={12} sm={7} md={8}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
               <Typography variant="h4" fontWeight="bold" color="primary" sx={{ lineHeight: 1.2 }}>
                {livro.nome}
              </Typography>
              {isArquivado && <Chip label="ARQUIVADO" color="warning" icon={<ArchiveIcon />} />}
            </Box>
            
            <Typography variant="h6" color="text.secondary" gutterBottom fontStyle="italic" sx={{ mt: 1 }}>
              por {livro.autor}
            </Typography>

            <Box display="flex" gap={1} mb={3} mt={1} flexWrap="wrap">
              {livro.categorias && livro.categorias.length > 0 ? (
                livro.categorias.map(cat => (
                  <Chip key={cat.id} label={cat.nome} color="primary" variant="outlined" size="small" />
                ))
              ) : (
                <Chip label="Geral" variant="outlined" size="small" />
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" fontWeight="bold" gutterBottom>Sinopse</Typography>
            <Typography variant="body1" paragraph color="text.primary" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                {livro.descricao || "Nenhuma descrição disponível para este livro."}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <FingerprintIcon color="action" />
                        <Typography variant="subtitle2" color="text.secondary">ISBN</Typography>
                    </Box>
                    <Typography variant="body1" fontWeight="medium">{livro.isbn}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Inventory2Icon color={isArquivado ? "disabled" : (disponivel ? "success" : "error")} />
                        <Typography variant="subtitle2" color="text.secondary">Disponibilidade</Typography>
                    </Box>
                    
                    {isArquivado ? (
                        <Typography variant="body1" color="text.disabled">Indisponível (Item Arquivado)</Typography>
                    ) : (
                        <Box>
                            <Typography variant="body1" color={disponivel ? "success.main" : "error.main"} fontWeight="bold">
                                {disponivel ? "Disponível para empréstimo" : "Esgotado temporariamente"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {livro.quantidade_disponivel} de {livro.quantidade} exemplares na estante
                            </Typography>
                        </Box>
                    )}
                </Grid>
            </Grid>

          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default DetalhesLivro;