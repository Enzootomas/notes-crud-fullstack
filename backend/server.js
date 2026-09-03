const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;
const FILE = "data.json";

app.use(cors());
app.use(bodyParser.json());

// Função para ler as notas
function readNotes() {
  try {
    const data = fs.readFileSync(FILE);
    return JSON.parse(data);
  } catch {
    return [];
  }
}

// Função para salvar as notas
function saveNotes(notes) {
  fs.writeFileSync(FILE, JSON.stringify(notes, null, 2));
}

// GET - Listar todas as notas
app.get("/api/notes", (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

// GET - Buscar uma nota pelo ID
app.get("/api/notes/:id", (req, res) => {
  const notes = readNotes();

  const nota = notes.find(
    (n) => n.id === req.params.id
  );

  if (!nota) {
    return res.status(404).json({
      erro: "Nota não encontrada"
    });
  }

  res.json(nota);
});

// POST - Criar uma nova nota
app.post("/api/notes", (req, res) => {
  const notes = readNotes();

  const novaNota = {
    id: Date.now().toString(),
    titulo: req.body.titulo,
    texto: req.body.texto,
    criadoEm: new Date().toISOString()
  };

  notes.push(novaNota);

  saveNotes(notes);

  res.json(novaNota);
});

// PUT - Editar uma nota
app.put("/api/notes/:id", (req, res) => {
  const notes = readNotes();

  const index = notes.findIndex(
    (n) => n.id === req.params.id
  );

  if (index >= 0) {
    notes[index].titulo = req.body.titulo;
    notes[index].texto = req.body.texto;

    saveNotes(notes);

    res.json(notes[index]);
  } else {
    res.status(404).json({
      erro: "Nota não encontrada"
    });
  }
});

// DELETE - Excluir uma nota
app.delete("/api/notes/:id", (req, res) => {
  const notes = readNotes();

  const novasNotas = notes.filter(
    (n) => n.id !== req.params.id
  );

  saveNotes(novasNotas);

  res.json({
    mensagem: "Nota removida"
  });
});

// Rota inicial
app.get("/", (req, res) => {
  res.send("API de Notas funcionando!");
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(
    `Servidor rodando em http://localhost:${PORT}`
  );
});