@echo off
echo ===================================
echo    配色分析器 - 本地启动
echo ===================================
echo.
echo 正在启动本地服务器...
echo 请稍后自动打开浏览器
echo.
echo 如果浏览器未自动打开，请访问:
echo http://localhost:8080
echo.

:: Check for Python
python --version >nul 2>&1
if %errorlevel% == 0 (
    start http://localhost:8080
    python -m http.server 8080
    exit
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% == 0 (
    start http://localhost:8080
    npx serve -p 8080
    exit
)

echo.
echo [错误] 未检测到 Python 或 Node.js
echo 请安装其中之一后重试
echo.
pause
