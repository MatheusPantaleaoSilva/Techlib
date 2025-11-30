import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material"; 
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const usuarioItem = localStorage.getItem("usuario");
  const usuario = usuarioItem ? JSON.parse(usuarioItem) : null;
  const isAuthenticated = !!token;
  const role = usuario ? usuario.role : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
    window.location.reload(); 
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}>
      {/* justifyContent: 'space-between' -> Empurra o primeiro filho para a esquerda
         e o último filho para a direita.
      */}
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        
        {/* --- CANTO ESQUERDO: Apenas o Logo --- */}
        <Typography variant="h6" component="div">
          <Button 
            color="inherit" 
            component={Link} 
            to={isAuthenticated ? "/dashboard" : "/"} 
            sx={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: 1 }}
          >
            Bibliotech
          </Button>
        </Typography>

        {/* --- CANTO DIREITO: Todo o resto (Links + Perfil + Sair) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            
            {!isAuthenticated ? (
              // Visitante (Não logado)
              <>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/registrar">
                  Criar Conta
                </Button>
                <Button 
                    color="inherit" 
                    component={Link} 
                    to="/login" 
                    variant="outlined" 
                    sx={{ borderColor: 'rgba(255,255,255,0.5)', ml: 1 }}
                >
                  Login
                </Button>
              </>
            ) : (
              // Utilizador Logado
              <>
                <Button color="inherit" component={Link} to="/livros">
                  Livros
                </Button>

                {role === "FUNCIONARIO" && (
                  <>
                    <Button color="inherit" component={Link} to="/pessoas">
                      Pessoas
                    </Button>
                    <Button color="inherit" component={Link} to="/emprestimos">
                      Empréstimos
                    </Button>
                    <Button color="inherit" component={Link} to="/indicacoes">
                      Indicações
                    </Button>
                    <Button color="inherit" component={Link} to="/categorias">
                      Categorias
                    </Button>
                  </>
                )}

                {/* Separador Visual Pequeno */}
                <Box sx={{ height: '24px', width: '1px', bgcolor: 'rgba(255,255,255,0.3)', mx: 2 }} />

                <Button color="inherit" component={Link} to="/perfil">
                  Perfil
                </Button>
                <Button color="inherit" onClick={handleLogout} sx={{ color: '#ff8a80', fontWeight: 'bold' }}>
                  Sair
                </Button>
              </>
            )}
        </Box>

      </Toolbar>
    </AppBar>
  );
}