import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import theme from "./theme";

import Dashboard from "./components/DashBoard";
import ListaPessoas from "./components/ListaPessoas";
import ListaLivros from "./components/ListaLivros";
import NovoLivro from "./components/NovoLivro";
import EditarLivro from "./components/EditarLivro";
import DetalhesLivro from "./components/DetalhesLivro"; 
import EditarPessoa from "./components/EditarPessoa";
import Login from "./components/Login";
import CadastroCliente from "./components/CadastroCliente";
import GerenciarEmprestimos from "./components/GerenciarEmprestimos";
import Home from "./components/Home";
import Perfil from "./components/Perfil";
import EditarPerfil from "./components/EditarPerfil";
import GerenciarIndicacoes from "./components/GerenciarIndicacoes";
import GerenciarCategorias from "./components/GerenciarCategorias";
import Navbar from "./components/Navbar";

const isAuthenticated = () => !!localStorage.getItem("token");

const getUserRole = () => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  return usuario ? usuario.role : null;
};

const PrivateRoute = ({ children, role }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  if (role && getUserRole() !== role) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<CadastroCliente />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/emprestimos" element={<PrivateRoute role="FUNCIONARIO"><GerenciarEmprestimos /></PrivateRoute>} />
        <Route path="/pessoas" element={<PrivateRoute role="FUNCIONARIO"><ListaPessoas /></PrivateRoute>} />
        <Route path="/pessoas/editar/:id" element={<PrivateRoute role="FUNCIONARIO"><EditarPessoa /></PrivateRoute>} />
        <Route path="/indicacoes" element={<PrivateRoute role="FUNCIONARIO"><GerenciarIndicacoes /></PrivateRoute>} />
        <Route path="/categorias" element={<PrivateRoute role="FUNCIONARIO"><GerenciarCategorias /></PrivateRoute>} />
        <Route path="/livros" element={<PrivateRoute><ListaLivros /></PrivateRoute>} />
        <Route path="/livros/novo" element={<PrivateRoute><NovoLivro /></PrivateRoute>} />
        <Route path="/livros/editar/:id" element={<PrivateRoute><EditarLivro /></PrivateRoute>} />
        <Route path="/livros/detalhes/:id" element={<PrivateRoute><DetalhesLivro /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
        <Route path="/perfil/editar" element={<PrivateRoute><EditarPerfil /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <Box component="img" src="/marca_dagua_logo.png" alt="Logo" sx={{ position: 'fixed', bottom: 20, right: 20, height: 60, width: 'auto', opacity: 0.5, pointerEvents: 'none', zIndex: 9999, userSelect: 'none' }} />
    </Router>
  </ThemeProvider>
);

export default App;