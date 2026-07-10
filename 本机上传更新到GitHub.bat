@echo off
cd /d "C:\Users\ASUS\Documents\Codex\2026-07-09\https-appojxoh2yd3347-h5-xiaoeknow-com"
echo Uploading local changes to GitHub...
echo.

git add .
git commit -m "update website"

echo.
echo Pushing to GitHub...
set TRY=1

:push_retry
echo git push attempt %TRY%/3...
git push
if not errorlevel 1 goto push_ok

if "%TRY%"=="3" goto push_fail
set /a TRY+=1
echo.
echo GitHub connection failed. Retry in 5 seconds...
timeout /t 5 /nobreak >nul
goto push_retry

:push_fail
echo.
echo GitHub push failed after 3 attempts.
echo Please check VPN or network, then run this file again.
pause
exit /b 1

:push_ok
echo.
echo Done. Code has been pushed, or GitHub already has the latest code.
pause
