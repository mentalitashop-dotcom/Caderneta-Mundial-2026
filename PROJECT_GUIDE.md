# Guia tecnico — Caderneta Mundial 2026

## Visao geral

A aplicacao e um servico Node.js sem framework web. O mesmo processo serve o frontend, implementa a API e comunica com MongoDB Atlas. O Render instala as dependencias, arranca `server.js` e faz novos deploys automaticamente quando o repositorio GitHub associado recebe alteracoes.

Fluxo principal:

```text
Browser/PWA -> server.js no Render -> MongoDB Atlas
GitHub push -> Render autoDeploy -> npm ci --omit=dev -> npm start
GitHub Actions (5 min) -> /healthz e /api/health
```

## Ficheiros e responsabilidades

- `server.js`: servidor HTTP, autenticacao, API, MongoDB, seguranca, ficheiros estaticos, health checks e injecao da versao.
- `app.js`: toda a logica do browser, navegacao, renderizacao, caderneta, amigos, listas, reservas, historico, trocas, temas, login e sincronizacao.
- `styles.css`: layout desktop/mobile, temas e componentes visuais.
- `caderneta_mundial_2026.html`: estrutura da interface e placeholders de build/versao.
- `cromos_base.txt`: catalogo base em formato CSV. E sincronizado com `album_stickers` no arranque/utilizacao da base.
- `sw.js`: service worker network-first e limpeza de caches antigos.
- `manifest.webmanifest`: configuracao da PWA, icones e atalhos.
- `render.yaml`: infraestrutura do servico no Render.
- `.github/workflows/keep-render-awake.yml`: pedidos periodicos ao Render.
- `package.json`: dependencias, comandos e fonte unica da versao publica no campo `appVersion`.

## Arranque e utilizacao

1. `server.js` carrega `.env` local quando existe.
2. Valida a configuracao online.
3. Abre o servidor na porta de `PORT`.
4. O browser consulta `/api/auth/status`; enquanto o Render acorda, o frontend repete a tentativa.
5. Sem sessao valida, a interface fica bloqueada no login/registo por convite.
6. Depois do login, o frontend carrega `/api/base-cromos` e `/api/live/state`.
7. Alteracoes individuais sao agrupadas e enviadas para `/api/live/stickers`; sincronizacoes completas usam `/api/live/state`.
8. O frontend atualiza periodicamente perfis, trocas e estado online.

## Autenticacao e seguranca

- Registo apenas com `REGISTER_PIN`, normalmente recebido por `?convite=...`.
- Passwords guardadas com `scrypt`, salt individual e comparacao segura.
- Sessao em cookie `HttpOnly`, `SameSite=Lax` e `Secure` em producao.
- Sessao renovada por atividade no servidor; o frontend tambem termina a sessao apos inatividade.
- Rate limit em memoria para falhas de login, registo e mudanca de password.
- Headers CSP, anti-frame, `nosniff`, permissions policy e HSTS em producao.
- Limite de 5 MB para pedidos.

## MongoDB

Colecoes:

- `users`: contas, cor e foto.
- `sessions`: sessoes com indice TTL.
- `album_stickers`: catalogo global sincronizado de `cromos_base.txt`.
- `user_stickers`: estado normalizado de cada cromo por utilizador.
- `collection_snapshots`: copia CSV e contagens para leituras rapidas.
- `trade_proposals`: propostas e estados de troca.
- `activity_logs`: historico.
- `colecoes`: formato antigo, lido apenas para migracao.

As trocas aceites usam transacoes MongoDB, atualizam repetidos/obtidos dos dois utilizadores e regeneram snapshots e historico.

### Trocas reservadas

Na area de repetidos existe a vista `Trocas reservadas`. Cada troca tem um identificador unico, pessoa, data do acordo, cromos a dar e cromos a receber. Isto permite ter varias trocas com a mesma pessoa ou no mesmo dia sem misturar reservas.

- Os cromos a dar deixam de contar como repetidos livres.
- Os cromos a receber continuam oficialmente em falta.
- Os cromos a receber ficam excluidos da lista copiada/exportada.
- `Editar` abre o formulario preenchido e substitui apenas a troca selecionada.
- `Concluir troca` retira os repetidos entregues e marca os recebidos como obtidos.
- `Cancelar troca` liberta ambos os lados sem alterar os cromos obtidos.

## API

Publica:

- `GET /api/health` e `/healthz`: processo ativo, configuracao e versao.
- `GET /api/ready` e `/readyz`: MongoDB pronto.
- `GET /api/version`: versao publica, build e commit Render quando disponivel.
- `GET /api/auth/status`: estado de login.
- `GET /api/auth/invite`: valida convite.
- `POST /api/auth/login`, `/register`, `/logout`, `/change-password`.

Autenticada:

- `GET|POST /api/auth/settings`.
- `GET /api/base-cromos`.
- `GET|POST /api/live/state`.
- `PATCH|POST /api/live/stickers`.
- `GET /api/live/profiles`, `/compatibility`, `/backup`.
- `GET|POST /api/live/trades`.
- `POST /api/live/trades/status`.
- `GET|POST /api/live/history`.

## Estado no browser

O MongoDB e a fonte de verdade online. O `localStorage` guarda preferencias, cache/compatibilidade local, tema, ordenacao, perfil lembrado e historico auxiliar. O `sessionStorage` guarda temporariamente o convite. O service worker nao interceta pedidos `/api/`.

## Render

Configuracao atual:

- Build: `npm ci --omit=dev`
- Start: `npm start`
- Health check: `/api/ready`
- Node: 22
- `autoDeploy: true`

Variaveis obrigatorias/sensiveis:

- `MONGODB_URI`
- `REGISTER_PIN`

Restantes:

- `MONGODB_DB=caderneta`
- `ONLINE_REQUIRED=true`
- `MONGO_CONNECT_TIMEOUT_MS=8000`
- `SESSION_IDLE_MINUTES=43200`
- `NODE_ENV=production`

## Versoes e cache

O campo `appVersion` de `package.json` e a fonte unica da versao visivel. A aplicacao usa quatro blocos, por exemplo `1.3.23.5`. O campo npm `version` conserva apenas os tres primeiros blocos (`1.3.23`) para continuar compativel com SemVer, `npm ci` e o Render. O servidor:

- apresenta `Versao X.Y.Z` no footer;
- devolve a versao em `/api/version` e `/api/health`;
- cria um build separado com versao + data do ativo mais recente;
- injeta o build nos URLs de CSS, JavaScript, manifest e icones;
- usa o build no nome do cache do service worker.

Para uma correcao compativel:

```text
npm run version:patch
```

Para funcionalidade nova compativel:

```text
npm run version:minor
```

Para alteracao incompatível:

```text
npm run version:major
```

Os comandos atualizam `appVersion`, a versao npm e o `package-lock.json` sem criar automaticamente commit ou tag. `patch` aumenta o quarto bloco, `minor` aumenta o terceiro e `major` aumenta o segundo. A sequencia recomendada e:

```text
npm run version:patch
npm run check
git add .
git commit -m "release: vX.Y.Z"
git push
```

Depois do push, confirmar:

- deploy concluido no Render;
- `/api/ready` devolve 200;
- `/api/version` mostra a versao esperada;
- footer mostra a mesma versao;
- PWA recarrega os novos ativos.

## Cuidados para futuras alteracoes

- Nao publicar `.env`, URI MongoDB, passwords ou `REGISTER_PIN`.
- Manter `package.json` e `package-lock.json` com a mesma versao.
- Alterar o catalogo apenas em `cromos_base.txt`; o servidor trata da sincronizacao.
- Preservar compatibilidade dos campos CSV e da migracao legada.
- Testar desktop e mobile, sobretudo footer, modais e barra inferior.
- O projeto ainda nao tem testes automatizados; `npm run check` valida a sintaxe do servidor e frontend.
- `app.js` e `styles.css` sao ficheiros grandes e centralizados; alteracoes devem ser pequenas e verificadas visualmente.
