@echo off
title Fix cpolar service
echo.
echo Checking administrator permission...
net session >nul 2>nul
if errorlevel 1 (
  echo Please right click this file and choose Run as administrator.
  echo.
  pause
  exit /b 1
)
echo.
echo Checking cpolar service...
sc query cpolar >nul 2>nul
if errorlevel 1 (
  echo cpolar service not found. Nothing to clean.
  echo.
  pause
  exit /b 0
)
echo.
echo Stopping cpolar service...
sc stop cpolar >nul 2>nul
timeout /t 2 /nobreak >nul
echo.
echo Deleting broken cpolar service...
sc delete cpolar
if errorlevel 1 (
  echo.
  echo Delete failed. Please make sure this window is running as administrator.
  echo.
  pause
  exit /b 1
)
echo.
echo Done. Broken cpolar service has been deleted.
echo Now reinstall cpolar, then open http://localhost:9200
echo.
pause
