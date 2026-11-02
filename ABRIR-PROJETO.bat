@echo off
setlocal
title Intellecta - Portfolio
cd /d "%~dp0"

where php.exe >nul 2>&1
if errorlevel 1 (
    echo PHP nao encontrado.
    echo Instale o PHP 8.2 ou superior e adicione sua pasta ao PATH.
    echo Depois, feche esta janela e abra este arquivo novamente.
    echo Consulte tambem o README.md.
    pause
    exit /b 1
)

php -r "exit(PHP_VERSION_ID >= 80200 ? 0 : 1);"
if errorlevel 1 (
    echo Este projeto precisa do PHP 8.2 ou superior.
    pause
    exit /b 1
)

if not exist "frontend\public\index.php" (
    echo Arquivos do projeto nao encontrados.
    echo Extraia o ZIP inteiro antes de abrir este arquivo.
    pause
    exit /b 1
)

echo Abrindo http://127.0.0.1:8080
echo Mantenha esta janela aberta enquanto usa o projeto.
echo Para encerrar o servidor, pressione Ctrl+C ou feche esta janela.
echo.
start "" "http://127.0.0.1:8080"
php -S 127.0.0.1:8080 -t frontend/public frontend/router.php
echo.
echo Servidor encerrado. Se a porta 8080 estiver ocupada, feche o outro servidor.
pause
endlocal
