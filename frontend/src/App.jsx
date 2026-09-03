import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:3000/api/notes";

function App() {
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [editandoId, setEditandoId] = useState(null);

  async function carregarNotas() {
    try {
      const resposta = await fetch(API_URL);
      const dados = await resposta.json();
      setNotas(dados);
    } catch (erro) {
      console.error("Erro ao carregar notas:", erro);
    }
  }

  useEffect(() => {
    carregarNotas();
  }, []);

  async function salvarNota(evento) {
    evento.preventDefault();

    if (!titulo.trim() || !texto.trim()) {
      alert("Preencha o título e o texto.");
      return;
    }

    if (editandoId) {
      await fetch(`${API_URL}/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          texto,
        }),
      });

      setEditandoId(null);
    } else {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          texto,
        }),
      });
    }

    setTitulo("");
    setTexto("");

    carregarNotas();
  }

  function editarNota(nota) {
    setTitulo(nota.titulo);
    setTexto(nota.texto);
    setEditandoId(nota.id);
  }

  async function excluirNota(id) {
    const confirmar = window.confirm(
      "Deseja realmente excluir esta nota?"
    );

    if (!confirmar) {
      return;
    }

    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    carregarNotas();
  }

  function cancelarEdicao() {
    setTitulo("");
    setTexto("");
    setEditandoId(null);
  }

  return (
    <main className="container">
      <h1>Minhas Notas</h1>

      <p className="subtitulo">
        Aplicação CRUD com React e Express
      </p>

      <form onSubmit={salvarNota} className="formulario">
        <input
          type="text"
          placeholder="Título da nota"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />

        <textarea
          placeholder="Digite o conteúdo da nota..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />

        <div className="botoes-formulario">
          <button type="submit">
            {editandoId ? "Atualizar nota" : "Adicionar nota"}
          </button>

          {editandoId && (
            <button
              type="button"
              className="cancelar"
              onClick={cancelarEdicao}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <section className="lista-notas">
        {notas.length === 0 ? (
          <p>Nenhuma nota cadastrada.</p>
        ) : (
          notas.map((nota) => (
            <article className="nota" key={nota.id}>
              <h2>{nota.titulo}</h2>

              <p>{nota.texto}</p>

              <div className="acoes">
                <button
                  className="editar"
                  onClick={() => editarNota(nota)}
                >
                  Editar
                </button>

                <button
                  className="excluir"
                  onClick={() => excluirNota(nota.id)}
                >
                  Excluir
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default App;