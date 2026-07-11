@echo off
setlocal
cd /d "%~dp0.."
start "PocketBase 24haods" cmd /k "scripts\start-pocketbase.bat"
timeout /t 2 /nobreak >nul
start "Frontend 24haods" cmd /k "scripts\start-frontend.bat"
echo.
echo PocketBase admin: http://127.0.0.1:8090/_/
echo Frontend:         http://127.0.0.1:8081/index.html
echo.
pause
