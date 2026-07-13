@echo off
chcp 65001 >nul
title 清理 cpolar 残留服务

echo.
echo 正在检查 cpolar 服务...
sc query cpolar >nul 2>nul
if errorlevel 1 (
  echo 没有发现 cpolar 服务，不需要清理。
  echo.
  pause
  exit /b 0
)

echo.
echo 正在停止 cpolar 服务...
sc stop cpolar >nul 2>nul
timeout /t 2 /nobreak >nul

echo.
echo 正在删除 cpolar 残留服务...
sc delete cpolar
if errorlevel 1 (
  echo.
  echo 删除失败。请确认你是右键“以管理员身份运行”这个文件。
  echo.
  pause
  exit /b 1
)

echo.
echo cpolar 残留服务已删除。
echo 现在请重新安装 cpolar，然后重新登录/配置隧道。
echo.
pause
