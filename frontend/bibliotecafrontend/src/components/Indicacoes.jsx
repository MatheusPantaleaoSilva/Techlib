import React, { useEffect, useState } from "react";
import api from "../services/Api";

const LivrosIndicados = () => {
  const [livros, setLivros] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchLivros = async () => {
      try {
        const res = await api.get("/indicacoes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLivros(res.data);
      } catch (err) {
        console.error("Erro ao buscar livros indicados:", err);
      }
    };
    fetchLivros();
  }, [token]);

  if (!livros.length) return <p>Nenhum livro indicado nesta semana</p>;

  return (
    <div>
      <h3>Livros Indicados da Semana</h3>
      <ul>
        {livros.map((l) => (
          <li key={l.id}>{l.nome} - {l.autor}</li>
        ))}
      </ul>
    </div>
  );
};

export default LivrosIndicados;
