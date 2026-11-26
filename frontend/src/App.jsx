import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/notes";

function formatarData(isoString) {
  if (!isoString) return "Data não informada";
  const data = new Date(isoString);
  if (Number.isNaN(data.getTime())) return isoString;
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function App() {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [notas, setNotas] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [busca, setBusca] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [notaDetalhe, setNotaDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erroApi, setErroApi] = useState("");
  const [erroFormulario, setErroFormulario] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const baseLimpa = apiUrl.trim().replace(/\/+$/, "");

  const carregarNotas = useCallback(async () => {
    setCarregando(true);
    setErroApi("");

    try {
      const resposta = await fetch(baseLimpa);
      if (!resposta.ok) {
        throw new Error(`Erro HTTP ${resposta.status} ao listar notas.`);
      }
      const dados = await resposta.json();
      setNotas(Array.isArray(dados) ? dados : []);
    } catch (erro) {
      setErroApi(
        erro instanceof Error
          ? erro.message
          : "Não foi possível conectar ao servidor Express."
      );
    } finally {
      setCarregando(false);
    }
  }, [baseLimpa]);

  useEffect(() => {
    carregarNotas();
  }, [carregarNotas]);

  function exibirFeedback(msg) {
    setMensagemSucesso(msg);
    setTimeout(() => {
      setMensagemSucesso("");
    }, 3000);
  }

  async function salvarNota(evento) {
    evento.preventDefault();
    setErroFormulario("");

    if (!titulo.trim() || !texto.trim()) {
      setErroFormulario("Preencha o título e o conteúdo da nota antes de salvar.");
      return;
    }

    try {
      if (editandoId) {
        const resposta = await fetch(`${baseLimpa}/${editandoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: titulo.trim(),
            texto: texto.trim(),
          }),
        });

        if (!resposta.ok) {
          throw new Error(`Falha ao atualizar nota (HTTP ${resposta.status}).`);
        }

        setEditandoId(null);
        exibirFeedback("Nota atualizada com sucesso!");
      } else {
        const resposta = await fetch(baseLimpa, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: titulo.trim(),
            texto: texto.trim(),
          }),
        });

        if (!resposta.ok) {
          throw new Error(`Falha ao criar nota (HTTP ${resposta.status}).`);
        }

        exibirFeedback("Nova nota criada com sucesso!");
      }

      setTitulo("");
      setTexto("");
      await carregarNotas();
    } catch (erro) {
      setErroFormulario(
        erro instanceof Error ? erro.message : "Erro ao salvar a nota."
      );
    }
  }

  function editarNota(nota) {
    setTitulo(nota.titulo);
    setTexto(nota.texto);
    setEditandoId(nota.id);
    setErroFormulario("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function inspecionarNotaPorId(id) {
    try {
      const resposta = await fetch(`${baseLimpa}/${id}`);
      if (!resposta.ok) {
        throw new Error(`Nota não encontrada (HTTP ${resposta.status}).`);
      }
      const dados = await resposta.json();
      setNotaDetalhe(dados);
    } catch (erro) {
      setErroApi(
        erro instanceof Error ? erro.message : "Erro ao consultar nota por ID."
      );
    }
  }

  async function excluirNota(id) {
    const confirmar = window.confirm("Deseja realmente excluir esta nota?");
    if (!confirmar) return;

    try {
      const resposta = await fetch(`${baseLimpa}/${id}`, {
        method: "DELETE",
      });
      if (!resposta.ok) {
        throw new Error(`Erro ao excluir nota (HTTP ${resposta.status}).`);
      }

      if (notaDetalhe?.id === id) {
        setNotaDetalhe(null);
      }
      exibirFeedback("Nota excluída com sucesso.");
      await carregarNotas();
    } catch (erro) {
      setErroApi(
        erro instanceof Error ? erro.message : "Erro ao excluir a nota."
      );
    }
  }

  function cancelarEdicao() {
    setTitulo("");
    setTexto("");
    setEditandoId(null);
    setErroFormulario("");
  }

  const notasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return notas;
    return notas.filter(
      (n) =>
        n.titulo.toLowerCase().includes(termo) ||
        n.texto.toLowerCase().includes(termo)
    );
  }, [notas, busca]);

  return (
    <div className="pagina-notas">
      <main className="container">
        <header className="cabecalho">
          <span className="selo-aula">AULA 05 — CRIANDO APIS PARA O FRONT-END</span>
          <h1>Gerenciador de Notas CRUD</h1>
          <p className="subtitulo">
            Integração completa entre <strong>React + Vite</strong> e{" "}
            <strong>Node.js + Express.js</strong> com persistência em{" "}
            <code>data.json</code>.
          </p>
        </header>

        <section className="barra-endpoint" aria-label="Configuração da API">
          <div className="endpoint-topo">
            <label htmlFor="endpoint-input">Endpoint da API REST</label>
            <div className="endpoint-atalhos">
              <button
                type="button"
                className="btn-atalho"
                onClick={() => setApiUrl("http://localhost:3000/api/notes")}
              >
                Local (:3000)
              </button>
              <button
                type="button"
                className="btn-atalho"
                onClick={carregarNotas}
              >
                Recarregar
              </button>
            </div>
          </div>
          <input
            id="endpoint-input"
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="http://localhost:3000/api/notes"
          />
        </section>

        {erroApi && (
          <div className="alerta-erro" role="alert">
            <strong>Falha de conexão com a API:</strong> {erroApi}
          </div>
        )}

        {mensagemSucesso && (
          <div className="alerta-sucesso" role="status">
            {mensagemSucesso}
          </div>
        )}

        <div className="grade-principal">
          <section className="painel-formulario">
            <h2>{editandoId ? "✏️ Editando nota" : "➕ Nova nota"}</h2>

            <form onSubmit={salvarNota} className="formulario">
              <label htmlFor="campo-titulo">Título da nota</label>
              <input
                id="campo-titulo"
                type="text"
                placeholder="Ex.: Revisar rotas Express"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />

              <label htmlFor="campo-texto">Conteúdo</label>
              <textarea
                id="campo-texto"
                placeholder="Digite o conteúdo detalhado da nota..."
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />

              {erroFormulario && (
                <p className="erro-form" role="alert">
                  {erroFormulario}
                </p>
              )}

              <div className="botoes-formulario">
                <button type="submit" className="btn-primario">
                  {editandoId ? "Salvar alterações (PUT)" : "Adicionar nota (POST)"}
                </button>

                {editandoId && (
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={cancelarEdicao}
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="painel-lista">
            <div className="topo-lista">
              <div>
                <h2>Notas armazenadas</h2>
                <span className="contador-notas">
                  {notasFiltradas.length} de {notas.length} registro(s)
                </span>
              </div>

              <input
                type="search"
                className="campo-busca"
                placeholder="Filtrar notas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            {carregando ? (
              <div className="estado-vazio">Carregando notas da API...</div>
            ) : notasFiltradas.length === 0 ? (
              <div className="estado-vazio">
                Nenhuma nota encontrada para o filtro atual.
              </div>
            ) : (
              <div className="lista-notas">
                {notasFiltradas.map((nota) => (
                  <article className="nota" key={nota.id}>
                    <div className="nota-topo">
                      <h3>{nota.titulo}</h3>
                      <span className="nota-id">#{nota.id}</span>
                    </div>

                    <p>{nota.texto}</p>

                    <div className="nota-rodape">
                      <small>Criado em: {formatarData(nota.criadoEm)}</small>

                      <div className="acoes">
                        <button
                          type="button"
                          className="detalhes"
                          onClick={() => inspecionarNotaPorId(nota.id)}
                        >
                          GET /:id
                        </button>
                        <button
                          type="button"
                          className="editar"
                          onClick={() => editarNota(nota)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="excluir"
                          onClick={() => excluirNota(nota.id)}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        {notaDetalhe && (
          <div
            className="modal-fundo"
            onClick={() => setNotaDetalhe(null)}
            role="presentation"
          >
            <div
              className="modal-detalhe"
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes da nota por ID"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-topo">
                <h3>Consulta Individual — GET /api/notes/{notaDetalhe.id}</h3>
                <button type="button" onClick={() => setNotaDetalhe(null)}>
                  Fechar
                </button>
              </div>
              <pre>{JSON.stringify(notaDetalhe, null, 2)}</pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
