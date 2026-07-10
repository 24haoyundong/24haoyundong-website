@echo off
cd /d "%~dp0"
set PORT=8080
set ADMIN_USER=admin
set ADMIN_PASS=admin123456
node server.js
pause
