import React from "react";
import { AppBar, Toolbar, Button, Typography, Box } from "@mui/material"; // Adicionado Box
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
      {/* justifyContent: 'center' -> Alinha o conteúdo central (Logo/Links) no meio do Toolbar.
        position: 'relative' -> Permite posicionar o grupo da direita de forma absoluta em relação à barra.
      */}
      <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
        
        {/* GRUPO CENTRAL: Logo + Links de Navegação */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" component="div">
              <Button color="inherit" component={Link} to={isAuthenticated ? "/dashboard" : "/"} sx={{ fontSize: '1.1rem' }}>
                Bibliotech
              </Button>
            </Typography>

            {!isAuthenticated ? (
              <>
                <Button color="inherit" component={Link} to="/">
                  Home
                </Button>
                <Button color="inherit" component={Link} to="/registrar">
                  Criar Conta
                </Button>
                <Button color="inherit" component={Link} to="/login">
                  Login
                </Button>
              </>
            ) : (
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
                    <Button color="inherit" component={Link} to="/categorias">Categorias</Button>
                  </>
                )}
              </>
            )}
        </Box>

        {/* GRUPO DIREITO: Perfil + Sair (Posicionado no canto direito absoluto) */}
        {isAuthenticated && (
          <Box sx={{ position: 'absolute', right: 24, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" component={Link} to="/perfil">
              Perfil
            </Button>
            <Button color="inherit" onClick={handleLogout} sx={{ color: '#ff8a80' }}>
              Sair
            </Button>
          </Box>
        )}

      </Toolbar>
    </AppBar>
  );
}