# Caderneta Mundial 2026

App online para gerir a caderneta do Mundial 2026 com login, MongoDB Atlas, amigos, repetidos, listas, trocas, reservas e instalacao como PWA no telemovel/PC.

A app esta pensada para funcionar online no Render. O MongoDB e a fonte de verdade dos dados; os ficheiros `.txt` pessoais antigos ja nao sao usados para guardar progresso.

## Estado atual

- Versao da app: vem de `appVersion` no `package.json`.
- Servidor: Node.js sem framework, em `server.js`.
- Frontend: `caderneta_mundial_2026.html`, `styles.css` e `app.js`.
- Base de cromos: `cromos_base.txt`, sincronizada para MongoDB.
- Deploy: Render com auto deploy a partir do GitHub.
- Dados online: MongoDB Atlas.
- PWA: `manifest.webmanifest`, `sw.js` e icones `app-icon-*`.

## Funcionalidades principais

- Login e registo por convite.
- Caderneta por utilizador, guardada online.
- Cromos obtidos, em falta e repetidos.
- Repetidos livres e trocas reservadas.
- Reservar cromos para pessoas externas a app.
- Concluir/cancelar reservas sem misturar repetidos livres.
- Amigos, ranking e consulta da caderneta de outros users.
- Criacao e gestao de propostas de troca.
- Comparacao de listas coladas.
- Adicionar cromos em massa por lista.
- Exportar/copiar lista de cromos em falta e repetidos.
- Historico/logs de acoes.
- Temas, cor de utilizador e foto de perfil.
- Instalacao como app no Android, iPhone e PC quando o browser permitir.

## Ficheiros principais

- `server.js`: servidor HTTP, API, MongoDB, autenticacao, sessoes, seguranca, ficheiros estaticos e health checks.
- `app.js`: logica do browser, renderizacao da app, caderneta, amigos, trocas, listas, reservas, historico, temas e sincronizacao.
- `styles.css`: layout, responsive/mobile, dark/light mode e componentes visuais.
- `caderneta_mundial_2026.html`: estrutura HTML da app.
- `cromos_base.txt`: catalogo base de todos os cromos.
- `manifest.webmanifest`: configuracao PWA.
- `sw.js`: service worker e cache da app.
- `render.yaml`: configuracao do servico no Render.
- `.github/workflows/keep-render-awake.yml`: workflow que faz ping ao Render.
- `.env.example`: exemplo das variaveis de ambiente.
- `PROJECT_GUIDE.md`: guia tecnico mais completo.

## Ficheiros para subir ao GitHub

Sobe estes ficheiros/pastas:

```text
.github/
.env.example
.gitignore
app-icon-192.png
app-icon-512.png
app-icon.png
app.js
caderneta_mundial_2026.html
cromos_base.txt
icon.svg
manifest.webmanifest
package-lock.json
package.json
PROJECT_GUIDE.md
README.md
render.yaml
server.js
styles.css
sw.js
```

Nao subas ficheiros com dados pessoais, passwords, `.env`, exports privados ou backups antigos. Os ficheiros `cromos.txt` e `backup_cromos.txt` eram do modo local antigo e nao fazem falta no Render.

## Variaveis no Render

No Render, cria estas environment variables:

```text
NODE_ENV=production
NODE_VERSION=22
ONLINE_REQUIRED=true
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&authSource=admin
MONGODB_DB=caderneta
MONGO_CONNECT_TIMEOUT_MS=8000
SESSION_IDLE_MINUTES=43200
REGISTER_PIN=usa-um-pin-secreto-e-longo
```

Notas:

- `MONGODB_URI` e `REGISTER_PIN` nunca devem ser publicados no GitHub.
- `SESSION_IDLE_MINUTES=43200` mantem a sessao ativa ate 30 dias de inatividade.
- O registo usa o `REGISTER_PIN` pelo link de convite.

## MongoDB Atlas

1. Cria um cluster no MongoDB Atlas.
2. Cria um user em Database Access.
3. Da permissao `readWrite` a base `caderneta`.
4. Em Network Access, permite o acesso do Render.
5. Coloca a connection string completa em `MONGODB_URI`.

Se o Render nao tiver IP fixo, pode ser necessario permitir `0.0.0.0/0` no Atlas. Usa sempre um utilizador dedicado e password forte.

## Deploy no Render

O `render.yaml` ja define a configuracao certa:

```text
Build Command: npm ci --omit=dev
Start Command: npm start
Health Check Path: /api/ready
```

Depois de ligares o repositorio ao Render:

1. Confirma as environment variables.
2. Faz deploy.
3. Abre `/api/health` para confirmar que o servidor esta ativo.
4. Abre `/api/ready` para confirmar que o MongoDB esta pronto.

## Convites

Para criar conta atraves de convite:

```text
https://caderneta-mundial-2026.onrender.com/?convite=O_TEU_REGISTER_PIN
```

Quem entra sem convite valido nao consegue criar conta. Depois do registo, a app faz login automaticamente e passa a guardar tudo no MongoDB.

## Correr localmente

Precisas de Node.js 20 ou superior.

```text
npm install
npm start
```

Por defeito, a app abre na porta `1312`:

```text
http://localhost:1312
```

Para testar o modo online localmente, cria um `.env` com base no `.env.example` e coloca as variaveis do MongoDB e do convite.

## Scripts

```text
npm start
npm run dev
npm run check
npm run version:patch
npm run version:minor
npm run version:major
```

- `npm run check`: valida a sintaxe de `server.js`, `app.js` e `scripts/bump-version.js`.
- `version:*`: atualiza a versao/appVersion quando o script existir no projeto.

## Publicar uma nova versao

1. Faz as alteracoes.
2. Corre `npm run check`.
3. Atualiza a versao se fizer sentido.
4. Faz commit/push para o GitHub.
5. O Render faz deploy automatico.

A versao aparece no footer, em `/api/version`, em `/api/health` e tambem e usada para renovar o cache da PWA.

## Keep Render Awake

Existe um workflow em `.github/workflows/keep-render-awake.yml` que faz ping ao Render a cada 5 minutos:

```text
https://caderneta-mundial-2026.onrender.com/healthz
https://caderneta-mundial-2026.onrender.com/api/health
```

Isto ajuda a reduzir o tempo em que o Render gratuito demora a acordar, mas nao garante 100% que o servico nunca durma porque depende das regras do plano gratuito.

## Documentacao tecnica

Para detalhes de arquitetura, colecoes MongoDB, endpoints da API, seguranca, reservas e deploy, ve `PROJECT_GUIDE.md`.

