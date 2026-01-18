@echo off
echo ========================================
echo   AI 3D Studio - 启动脚本
echo ========================================
echo.

REM 检查配置文件是否存在
if not exist "js\config.js" (
    echo [错误] 配置文件不存在！
    echo.
    echo 请按照以下步骤配置：
    echo 1. 复制 js\config.example.js 为 js\config.js
    echo 2. 编辑 js\config.js 填入你的 Supabase 和 DeepSeek 配置
    echo 3. 详细说明请查看 SETUP.md
    echo.
    pause
    exit /b 1
)

REM 检查 node_modules 是否存在
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    echo.
    call npm install
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        pause
        exit /b 1
    )
    echo.
    echo [成功] 依赖安装完成！
    echo.
)

echo [启动] 正在启动开发服务器...
echo.
echo 服务器地址: http://localhost:8080
echo 按 Ctrl+C 停止服务器
echo.
echo ========================================
echo.

npx http-server -p 8080 -c-1 -o

pause
