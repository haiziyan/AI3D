@echo off
echo ========================================
echo   AI 3D CAD Studio - 配置检查
echo ========================================
echo.

REM 检查配置文件
if not exist "js\config.js" (
    echo [X] 配置文件不存在
    echo     请复制 js\config.example.js 为 js\config.js
    echo.
    goto :error
) else (
    echo [√] 配置文件存在
)

REM 检查配置内容
findstr /C:"YOUR_SUPABASE_URL" js\config.js >nul
if %errorlevel% equ 0 (
    echo [X] Supabase URL 未配置
    echo     请编辑 js\config.js 填入真实的 Supabase URL
    echo.
    goto :error
) else (
    echo [√] Supabase URL 已配置
)

findstr /C:"YOUR_SUPABASE_ANON_KEY" js\config.js >nul
if %errorlevel% equ 0 (
    echo [X] Supabase Anon Key 未配置
    echo     请编辑 js\config.js 填入真实的 Supabase Anon Key
    echo.
    goto :error
) else (
    echo [√] Supabase Anon Key 已配置
)

findstr /C:"YOUR_DEEPSEEK_API_KEY" js\config.js >nul
if %errorlevel% equ 0 (
    echo [X] DeepSeek API Key 未配置
    echo     请编辑 js\config.js 填入真实的 DeepSeek API Key
    echo.
    goto :error
) else (
    echo [√] DeepSeek API Key 已配置
)

REM 检查依赖
if not exist "node_modules" (
    echo [X] 依赖未安装
    echo     请运行: npm install
    echo.
    goto :error
) else (
    echo [√] 依赖已安装
)

echo.
echo ========================================
echo   配置检查通过！
echo ========================================
echo.
echo 你可以运行以下命令启动应用：
echo   - Windows: start.bat
echo   - Linux/Mac: ./start.sh
echo   - 或直接运行: npm start
echo.
goto :end

:error
echo ========================================
echo   配置检查失败！
echo ========================================
echo.
echo 请查看 SETUP.md 了解详细配置步骤
echo.

:end
pause
