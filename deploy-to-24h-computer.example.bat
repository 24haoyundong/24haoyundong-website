@echo off
chcp 65001 >nul
setlocal

rem 使用方法：
rem 1. 先在 24 小时电脑上创建网站目录，例如：D:\website
rem 2. 把这个目录设置为 Windows 共享，例如共享名叫 website
rem 3. 把下面这一行改成你的 24 小时电脑共享路径
rem    示例：\\192.168.1.25\website
rem    示例：\\DESKTOP-ABC123\website
set "TARGET=\\192.168.1.25\website"

echo.
echo 正在同步网站文件到：%TARGET%
echo.

if not exist "%TARGET%" (
  echo 找不到目标目录：%TARGET%
  echo 请确认 24 小时电脑已开机、在同一网络、并且已经共享网站目录。
  pause
  exit /b 1
)

robocopy "%~dp0outputs" "%TARGET%\outputs" /MIR /XD .git node_modules /XF *.log
copy /Y "%~dp0server.js" "%TARGET%\server.js" >nul
copy /Y "%~dp0start-website.bat" "%TARGET%\start-website.bat" >nul
copy /Y "%~dp0start-website-hidden.ps1" "%TARGET%\start-website-hidden.ps1" >nul
copy /Y "%~dp0install-startup-task.ps1" "%TARGET%\install-startup-task.ps1" >nul
copy /Y "%~dp0change-admin-password.bat" "%TARGET%\change-admin-password.bat" >nul
copy /Y "%~dp0change-admin-password.ps1" "%TARGET%\change-admin-password.ps1" >nul

echo.
echo 同步完成。
echo 现在到 24 小时电脑上双击 start-website.bat 启动网站。
echo.
pause
