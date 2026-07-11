@echo off
setlocal
chcp 65001 > nul

set REPO=https://github.com/24haoyundong/24haoyundong-website.git
cd /d "%~dp0"

echo.
echo Uploading 24haods-site to GitHub...
echo Current folder: %cd%
echo.

where git > nul 2> nul
if errorlevel 1 (
  echo Git is not installed or not in PATH.
  pause
  exit /b 1
)

if not exist ".git" (
  echo Initializing Git repository...
  git init
)

git config http.sslBackend openssl
git config http.proxy http://127.0.0.1:7897
git config https.proxy http://127.0.0.1:7897

git remote get-url origin > nul 2> nul
if errorlevel 1 (
  git remote add origin %REPO%
) else (
  git remote set-url origin %REPO%
)

git branch -M main

echo.
echo Adding files...
git add .
if errorlevel 1 (
  echo git add failed.
  pause
  exit /b 1
)

git diff --cached --quiet
if errorlevel 1 (
  echo Creating commit...
  git commit -m "update pocketbase site"
) else (
  echo No new file changes to commit.
)

echo.
echo Pushing to GitHub...
git push -u origin main
if errorlevel 1 (
  echo.
  echo Push failed. Please send this window screenshot to Codex.
  echo If it says non-fast-forward, do not force push before asking Codex.
  pause
  exit /b 1
)

echo.
echo Done. Code has been pushed to GitHub.
pause
