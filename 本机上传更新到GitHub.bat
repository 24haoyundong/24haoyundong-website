@echo off
cd /d "C:\Users\ASUS\Documents\Codex\2026-07-09\https-appojxoh2yd3347-h5-xiaoeknow-com"
echo Uploading local changes to GitHub...
echo.
git add .
git commit -m "update website"
git push
echo.
echo Done. If Git says nothing to commit, it means there are no local changes.
pause
