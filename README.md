# Caderneta Mundial 2026

Site online para gerir a caderneta do Mundial 2026 com login, MongoDB Atlas e deploy no Render.

Este projeto esta configurado para funcionar online. Por defeito, o servidor exige `MONGODB_URI`; sem essa variavel o servico nao deve arrancar em producao.

## Ficheiros principais

- `caderneta_mundial_2026.html`: interface da app.
- `server.js`: servidor Node e API online.
- `cromos_base.txt`: caderneta base sincronizada para MongoDB.
- `render.yaml`: blueprint de deploy no Render.
- `.env.example`: exemplo das variaveis de ambiente.

Os ficheiros `cromos.txt` e `backup_cromos.txt` sao progresso local/backup pessoal. Nao sao necessarios no Render e estao no `.gitignore`.

## Variaveis obrigatorias no Render

- `MONGODB_URI`: connection string do MongoDB Atlas, de preferencia `mongodb+srv://...`.
- `MONGODB_DB`: nome da base de dados. Valor recomendado: `caderneta`.
- `REGISTER_PIN`: PIN secreto para criar contas por convite.
- `ONLINE_REQUIRED`: manter como `true`.
- `NODE_ENV`: manter como `production`.
- `NODE_VERSION`: manter como `22`.

Variavel opcional:

- `MONGO_CONNECT_TIMEOUT_MS`: tempo maximo de ligacao ao MongoDB. Valor recomendado: `8000`.

## MongoDB Atlas

1. Cria um cluster no MongoDB Atlas.
2. Cria um utilizador de base de dados com password forte.
3. Copia a connection string SRV.
4. No Network Access, permite o acesso do Render ao cluster.
5. Usa essa string em `MONGODB_URI` no Render.

Se estiveres no plano gratuito do Render e nao tiveres IP fixo de saida, podes precisar de permitir `0.0.0.0/0` no Atlas. Isso permite ligacoes de qualquer IP, por isso usa uma password forte e um utilizador dedicado so para esta app.

## Deploy no Render

1. Sobe estes ficheiros para um repositorio Git.
2. No Render, cria um Blueprint ou Web Service a partir do repositorio.
3. Se usares o Blueprint, o `render.yaml` ja define:
   - `buildCommand: npm install`
   - `startCommand: npm start`
   - `healthCheckPath: /api/health`
4. No Render, define `MONGODB_URI` e `REGISTER_PIN` como variaveis secretas.
5. Faz deploy.
6. Abre `/api/health`; deve devolver `onlineReady: true`.

## Convites

Para criar uma conta, abre:

```text
https://o-teu-site.onrender.com/?convite=O_TEU_REGISTER_PIN
```

Depois de criada a conta, o utilizador entra pelo login normal. O progresso fica guardado no MongoDB por utilizador.

## Teste local opcional

O objetivo principal e online. Ainda assim, podes testar antes do deploy:

1. Copia `.env.example` para `.env`.
2. Preenche `MONGODB_URI` e `REGISTER_PIN`.
3. Corre `npm install`.
4. Corre `npm start`.
5. Abre `http://localhost:1312`.
