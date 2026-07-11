@echo off
setlocal
cd /d "%~dp0..\frontend"
node -v >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed or not in PATH.
  pause
  exit /b 1
)
set PORT=8081
node server.js
