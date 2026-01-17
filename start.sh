#!/bin/bash

echo "========================================"
echo "  AI 3D CAD Studio - 启动脚本"
echo "========================================"
echo ""

# 检查配置文件是否存在
if [ ! -f "js/config.js" ]; then
    echo "[错误] 配置文件不存在！"
    echo ""
    echo "请按照以下步骤配置："
    echo "1. 复制 js/config.example.js 为 js/config.js"
    echo "2. 编辑 js/config.js 填入你的 Supabase 和 DeepSeek 配置"
    echo "3. 详细说明请查看 SETUP.md"
    echo ""
    exit 1
fi

# 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "[提示] 首次运行，正在安装依赖..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[错误] 依赖安装失败！"
        exit 1
    fi
    echo ""
    echo "[成功] 依赖安装完成！"
    echo ""
fi

echo "[启动] 正在启动开发服务器..."
echo ""
echo "服务器地址: http://localhost:8080"
echo "按 Ctrl+C 停止服务器"
echo ""
echo "========================================"
echo ""

npx http-server -p 8080 -c-1 -o
