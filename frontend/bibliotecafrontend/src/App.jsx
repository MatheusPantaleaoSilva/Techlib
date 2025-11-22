import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material"; // <--- IMPORT NOVO
import theme from "./theme"; // <--- IMPORT NOVO

import Dashboard from "./components/DashBoard";
import ListaPessoas from "./components/ListaPessoas";
import ListaLivros from "./components/ListaLivros";
import NovoLivro from "./components/NovoLivro";
import EditarLivro from "./components/EditarLivro";
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
  // Envolvemos tudo com o ThemeProvider
  <ThemeProvider theme={theme}>
    <CssBaseline /> {/* Reseta o CSS do navegador para ficar igual em todo lado */}
    <Router>
      <Navbar />
      <Routes>
        {/* Página inicial pública */}
        <Route path="/" element={<Home />} />

        {/* Login / Registro */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<CadastroCliente />} />

        {/* Dashboard protegido */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/emprestimos"
          element={
            <PrivateRoute role="FUNCIONARIO">
              <GerenciarEmprestimos />
            </PrivateRoute>
          }
        />

        {/* Pessoas */}
        <Route
          path="/pessoas"
          element={
            <PrivateRoute role="FUNCIONARIO">
              <ListaPessoas />
            </PrivateRoute>
          }
        />
        <Route
          path="/pessoas/editar/:id"
          element={
            <PrivateRoute role="FUNCIONARIO">
              <EditarPessoa />
            </PrivateRoute>
          }
        />

        {/* Livros */}
        <Route
          path="/livros"
          element={
            <PrivateRoute>
              <ListaLivros />
            </PrivateRoute>
          }
        />
        <Route
          path="/livros/novo"
          element={
            <PrivateRoute>
              <NovoLivro />
            </PrivateRoute>
          }
        />
        <Route
          path="/livros/editar/:id"
          element={
            <PrivateRoute>
              <EditarLivro />
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil"
          element={
            <PrivateRoute>
              <Perfil />
            </PrivateRoute>
          }
        />

        <Route
          path="/perfil/editar"
          element={
            <PrivateRoute>
              <EditarPerfil />
            </PrivateRoute>
          }
        />

        <Route
          path="/indicacoes"
          element={
            <PrivateRoute role="FUNCIONARIO">
              <GerenciarIndicacoes />
            </PrivateRoute>
          }
        />

        {/* Categorias */}
        <Route
          path="/categorias"
          element={
            <PrivateRoute role="FUNCIONARIO">
              <GerenciarCategorias />
            </PrivateRoute>
          }
        />

        {/* Rota coringa */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  </ThemeProvider>
);

export default App;