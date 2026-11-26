const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const FILE = path.join(__dirname, "data.json");

app.use(cors());
app.use(bodyParser.json());

// Função para ler as notas do arquivo JSON
function readNotes() {
  try {
    const data = fs.readFileSync(FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Função para salvar as notas no arquivo JSON
function saveNotes(notes) {
  fs.writeFileSync(FILE, JSON.stringify(notes, null, 2), "utf-8");
}

// GET - Listar todas as notas
app.get("/api/notes", (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

// GET - Buscar uma nota específica pelo ID
app.get("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const nota = notes.find((n) => n.id === req.params.id);

  if (!nota) {
    return res.status(404).json({
      erro: "Nota não encontrada",
    });
  }

  res.json(nota);
});

// POST - Criar uma nova nota
app.post("/api/notes", (req, res) => {
  const titulo = (req.body.titulo || "").trim();
  const texto = (req.body.texto || "").trim();

  if (!titulo || !texto) {
    return res.status(400).json({
      erro: "Os campos 'titulo' e 'texto' são obrigatórios.",
    });
  }

  const notes = readNotes();

  const novaNota = {
    id: Date.now().toString(),
    titulo,
    texto,
    criadoEm: new Date().toISOString(),
  };

  notes.push(novaNota);
  saveNotes(notes);

  res.status(201).json(novaNota);
});

// PUT - Editar uma nota existente pelo ID
app.put("/api/notes/:id", (req, res) => {
  const titulo = (req.body.titulo || "").trim();
  const texto = (req.body.texto || "").trim();

  if (!titulo || !texto) {
    return res.status(400).json({
      erro: "Os campos 'titulo' e 'texto' são obrigatórios.",
    });
  }

  const notes = readNotes();
  const index = notes.findIndex((n) => n.id === req.params.id);

  if (index >= 0) {
    notes[index].titulo = titulo;
    notes[index].texto = texto;
    notes[index].atualizadoEm = new Date().toISOString();

    saveNotes(notes);
    res.json(notes[index]);
  } else {
    res.status(404).json({
      erro: "Nota não encontrada",
    });
  }
});

// DELETE - Excluir uma nota pelo ID
app.delete("/api/notes/:id", (req, res) => {
  const notes = readNotes();
  const existe = notes.some((n) => n.id === req.params.id);

  if (!existe) {
    return res.status(404).json({
      erro: "Nota não encontrada",
    });
  }

  const novasNotas = notes.filter((n) => n.id !== req.params.id);
  saveNotes(novasNotas);

  res.json({
    mensagem: "Nota removida",
  });
});

// Rota inicial de status
app.get("/", (req, res) => {
  res.json({
    mensagem: "API CRUD de Notas funcionando!",
    endpoints: [
      "GET /api/notes",
      "GET /api/notes/:id",
      "POST /api/notes",
      "PUT /api/notes/:id",
      "DELETE /api/notes/:id",
    ],
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
}

module.exports = app;
