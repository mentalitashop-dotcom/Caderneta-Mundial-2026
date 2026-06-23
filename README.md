# Caderneta Mundial 2026

Site online para gerir a caderneta do Mundial 2026 com login, MongoDB Atlas e deploy no Render.

A versao apresentada no footer vem sempre do campo `appVersion` do `package.json`.

As `Trocas reservadas` permitem registar pessoa, data, cromos a dar e a receber. Os cromos a receber continuam em falta, mas ficam automaticamente fora das listas copiadas enquanto a troca estiver pendente.

## Ficheiros principais

- `caderneta_mundial_2026.html`: interface da app.
- `server.js`: servidor Node e API online.
- `cromos_base.txt`: caderneta base sincronizada para MongoDB.
- `render.yaml`: configuracao de deploy no Render.
- `.env.example`: exemplo das variaveis de ambiente.
- `PROJECT_GUIDE.md`: arquitetura, dados, API, deploy e processo de versoes.

Os ficheiros `cromos.txt` e `backup_cromos.txt` sao progresso/backup pessoal. Nao sao necessarios no Render e estao no `.gitignore`.

## Variaveis no Render

```text
MONGODB_URI=mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0&authSource=admin
MONGODB_DB=caderneta
REGISTER_PIN=usa-um-pin-secreto-e-longo
ONLINE_REQUIRED=true
NODE_ENV=production
NODE_VERSION=22
SESSION_IDLE_MINUTES=43200
```

`SESSION_IDLE_MINUTES=43200` faz logout automatico apos 30 dias de inatividade.

## MongoDB Atlas

1. Cria um cluster no MongoDB Atlas.
2. Cria um utilizador em Database Access.
3. Da permissao `readWrite` para `caderneta`, ou `readWriteAnyDatabase` durante testes.
4. Em Network Access, permite o acesso do Render.
5. Usa a connection string em `MONGODB_URI`.

Se usares Render sem IP fixo, podes precisar de permitir `0.0.0.0/0` no Atlas. Usa um utilizador dedicado e password forte.

## Deploy no Render

1. Sobe os ficheiros do projeto para o GitHub.
2. No Render, usa:

```text
Build Command: npm install
Start Command: npm start
Health Check Path: /api/ready
```

3. Define as variaveis de ambiente.
4. Faz deploy.
5. Abre `/api/health` para confirmar que o servidor esta ativo.

## Convites

Para criar uma conta:

```text
https://o-teu-site.onrender.com/?convite=O_TEU_REGISTER_PIN
```

Depois do registo, a app entra automaticamente. O progresso fica guardado no MongoDB por utilizador.

Nunca publiques o valor real de `REGISTER_PIN`, passwords ou a connection string do MongoDB no GitHub.

## Publicar uma nova versao

Escolhe o tipo de alteracao:

```text
npm run version:patch
npm run version:minor
npm run version:major
```

Depois corre `npm run check`, faz commit/push para o GitHub e o Render faz o deploy automatico. O footer, `/api/version`, `/api/health` e o cache da PWA passam a usar a nova versao.
