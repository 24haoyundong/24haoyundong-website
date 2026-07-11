@echo off
setlocal
cd /d "%~dp0..\pocketbase"
if not exist pocketbase.exe (
  echo pocketbase.exe not found.
  echo Download Windows amd64 zip from:
  echo https://github.com/pocketbase/pocketbase/releases
  echo Then put pocketbase.exe into this folder:
  echo %CD%
  pause
  exit /b 1
)
pocketbase.exe serve --http=127.0.0.1:8090

