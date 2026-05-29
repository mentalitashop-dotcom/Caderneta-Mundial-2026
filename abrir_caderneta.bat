@echo off
cd /d "%~dp0"

set "NODE_EXE=node"
set "USING_SYSTEM_NODE=1"

where node >nul 2>nul
if errorlevel 1 (
  set "NODE_EXE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
  set "USING_SYSTEM_NODE=0"
)

if "%USING_SYSTEM_NODE%"=="0" if not exist "%NODE_EXE%" (
  echo Node.js nao foi encontrado.
  echo Instala o Node.js em https://nodejs.org/ ou abre este projeto pelo Codex.
  pause
  exit /b 1
)

start "" "http://localhost:1312"
"%NODE_EXE%" server.js
