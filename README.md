# 📝 Notes CRUD Fullstack — React + Node.js/Express

Aplicação completa de gerenciamento de notas (**CRUD**: *Create, Read, Update, Delete*) desenvolvida na **Aula 05 (Criando APIs para o Front-end)** da disciplina de **Frameworks Front-end** (SENAI).

---

## 🎯 Objetivo

Construir uma API RESTful em **Node.js + Express.js** utilizando arquivo JSON (`data.json`) para persistência, conectá-la a uma interface **React + Vite** e documentar todos os endpoints com uma coleção estruturada para o **Postman**.

---

## 📁 Estrutura do Repositório

```text
notes-crud-fullstack/
├── backend/
│   ├── data.json            # Armazenamento em JSON das notas
│   ├── package.json
│   └── server.js            # Servidor Express com rotas CRUD
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Interface React consumindo a API
│   │   ├── App.css
│   │   └── main.jsx
│   ├── .env.example         # Variável VITE_API_URL para deploy
│   ├── package.json
│   └── vite.config.js
├── postman/
│   └── Notes-CRUD-API.postman_collection.json
├── render.yaml              # Configuração de deploy do Back-end no Render
└── README.md
```

---

## 🔗 Documentação da API REST

| Método | Endpoint | Parâmetros / Corpo (JSON) | Resposta de Sucesso | Possível Erro |
|---|---|---|---|---|
| `GET` | `/api/notes` | — | `200 OK` — Array de notas | — |
| `GET` | `/api/notes/:id` | Rota `:id` | `200 OK` — Objeto da nota | `404` Nota não encontrada |
| `POST` | `/api/notes` | `{ "titulo": "...", "texto": "..." }` | `200 OK` — Nota criada com `id` e `criadoEm` | — |
| `PUT` | `/api/notes/:id` | Rota `:id` + `{ "titulo": "...", "texto": "..." }` | `200 OK` — Nota atualizada | `404` Nota não encontrada |
| `DELETE` | `/api/notes/:id` | Rota `:id` | `200 OK` — `{ "mensagem": "Nota removida" }` | — |

---

## 📮 Coleção do Postman

O arquivo [`postman/Notes-CRUD-API.postman_collection.json`](./postman/Notes-CRUD-API.postman_collection.json) contém todas as requisições configuradas com variáveis `{{baseUrl}}` e `{{noteId}}`, exemplos de corpo JSON e descrições detalhadas dos códigos HTTP.

Para utilizar no **Postman**:
1. Abra o Postman e clique em **Import**;
2. Selecione o arquivo `postman/Notes-CRUD-API.postman_collection.json`;
3. Ajuste a variável `baseUrl` para `http://localhost:3000` (ou para a URL publicada no Render) e execute os testes.

---

## 🚀 Como Executar Localmente

### 1. Back-end (Express.js)

```bash
cd backend
npm install
node server.js
```

O servidor iniciará em `http://localhost:3000`.

### 2. Front-end (React + Vite)

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

Acesse `http://localhost:5173`.

---

## 💡 Síntese das Questões de Reflexão (Aula 05)

1. **Riscos de segurança e mitigação:** A API não possui autenticação, limitação de taxa (*rate limiting*), validação estrita de payload nem restrição de origem no CORS (`*`). Mitiga-se adotando validação (Zod/Joi), `helmet`, CORS restrito ao domínio do Front-end, autenticação JWT e sanitização de entradas.
2. **Uso de `data.json` em produção:** Útil apenas para prototipagem e fins didáticos. Em produção apresenta perda de dados em ambientes efêmeros (como containers gratuitos no Render após reinício) e ausência de transações ACID.
3. **Escala para 10.000 registros:** O uso de `fs.readFileSync` e `fs.writeFileSync` bloqueia o *Event Loop* do Node.js a cada leitura/gravação e gera condições de corrida (*race conditions*) em requisições simultâneas, exigindo migração para um SGBD (PostgreSQL, MongoDB ou SQLite).
4. **Organização além de um único `server.js`:** Separar em camadas (`routes/`, `controllers/`, `services/` e `repositories/`) melhora testabilidade, legibilidade e manutenção evolutiva.

---

## ☁️ Publicação (Render + Vercel)

- **Back-end no Render:** Conecte este repositório em **New → Web Service** (ou **Blueprint** via `render.yaml`), com `Root Directory: backend` e `Start Command: node server.js`.
- **Front-end na Vercel:** Importe o repositório com `Root Directory: frontend` e defina a variável de ambiente `VITE_API_URL=https://<seu-servico>.onrender.com/api/notes`.
