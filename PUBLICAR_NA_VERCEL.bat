@echo off
setlocal
cd /d "%~dp0"
chcp 65001 >nul
where npx >nul 2>&1
if errorlevel 1 (
  echo Node.js nao encontrado.
  echo Instale a versao LTS em https://nodejs.org/ e execute este arquivo novamente.
  pause
  exit /b 1
)
echo.
echo ===== PUBLICAR EVORA NA VERCEL =====
echo 1. Entre na sua conta Vercel na janela do navegador que abrir.
echo 2. Se solicitado, confirme a equipe evora1.
echo 3. Quando perguntar se deseja criar um novo projeto, confirme.
echo.
call npx --yes vercel login
if errorlevel 1 (
  echo Falha no login Vercel. Verifique conexao e tente novamente.
  pause
  exit /b 1
)
call npx --yes vercel --prod --scope evora1
if errorlevel 1 (
  echo A publicacao nao foi concluida. Veja a mensagem acima.
) else (
  echo.
  echo A Vercel mostrou acima o endereco publico da EVORA.
)
pause
