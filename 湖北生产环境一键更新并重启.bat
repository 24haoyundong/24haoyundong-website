@echo off
cd /d "C:\Users\Administrator\Documents\Codex\2026-07-10\24\website"
echo Pulling latest code from GitHub...
echo.
git pull
if errorlevel 1 (
  echo.
  echo Git pull failed. Please check the error above.
  pause
  exit /b 1
)

echo.
echo Restarting website on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080" ^| findstr "LISTENING"') do (
  taskkill /F /PID %%a >nul 2>nul
)

start "24haoyundong website" cmd /k "cd /d C:\Users\Administrator\Documents\Codex\2026-07-10\24\website && node server.js"

echo.
echo Done.
echo Local:  http://127.0.0.1:8080/index.html
echo Admin:  http://127.0.0.1:8080/admin.html
echo Public: https://50396a1e.r19.cpolar.top/
echo.
pause
