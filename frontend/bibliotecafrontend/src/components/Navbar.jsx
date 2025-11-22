import React from "react";
import { AppBar, Toolbar, Button, Typography } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  // Verifica o status de autenticação e role diretamente do localStorage
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
    <AppBar position="static" sx={{ backgroundColor: '#2c3e50' }}> {/* Usei uma cor mais escura */}
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Button color="inherit" component={Link} to={isAuthenticated ? "/dashboard" : "/"} sx={{ fontSize: '1.1rem' }}>
            Biblioteca
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
            <Button color="inherit" component={Link} to="/dashboard">
              Dashboard
            </Button>
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

            <Button color="inherit" component={Link} to="/perfil">
              Perfil
            </Button>
            <Button color="inherit" onClick={handleLogout} sx={{ color: '#ff8a80' }}> {/* Botão de Sair em destaque */}
              Logout
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}