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

- `MONGODB_URI`: connection string do MongoDB Atlas, de preferencia sem nome da base no caminho.
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

Formato recomendado para o Render:

```text
mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Depois define a base em separado:

```text
MONGODB_DB=caderneta
```

Se usares `/caderneta` dentro do URI e receberes `bad auth : authentication failed`, remove `/caderneta` do URI ou acrescenta `authSource=admin`.

Se estiveres no plano gratuito do Render e nao tiveres IP fixo de saida, podes precisar de permitir `0.0.0.0/0` no Atlas. Isso permite ligacoes de qualquer IP, por isso usa uma password forte e um utilizador dedicado so para esta app.

## Deploy no Render

1. Sobe estes ficheiros para um repositorio Git.
2. No Render, cria um Blueprint ou Web Service a partir do repositorio.
3. Se usares o Blueprint, o `render.yaml` ja define:
   - `buildCommand: npm install`
   - `startCommand: npm start`
   - `healthCheckPath: /`
4. No Render, define `MONGODB_URI` e `REGISTER_PIN` como variaveis secretas.
5. Faz deploy.
6. Abre `/api/health`; deve devolver `version`.
7. Abre `/api/ready`; deve devolver `mongoConnected: true`.

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
4. Corre `npm run test:mongodb`.
5. Se o teste da MongoDB passar, corre `npm start`.
6. Abre `http://localhost:1312`.

O teste `npm run test:mongodb` faz `ping` e uma escrita pequena em `_connection_test`. Se falhar com `bad auth`, o problema esta no utilizador/password do Atlas. Se falhar com timeout, o problema costuma estar em Network Access/IP allowlist.
