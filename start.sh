#!/bin/bash

echo "==================================="
echo "   配色分析器 - 本地启动"
echo "==================================="
echo ""
echo "正在启动本地服务器..."
echo ""

# Get script directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# Check for Python
if command -v python3 &> /dev/null; then
    echo "✓ 使用 Python3 启动服务器"
    echo "请访问: http://localhost:8080"
    echo ""
    python3 -m http.server 8080
    exit
elif command -v python &> /dev/null; then
    echo "✓ 使用 Python 启动服务器"
    echo "请访问: http://localhost:8080"
    echo ""
    python -m http.server 8080
    exit
fi

# Check for Node.js
if command -v npx &> /dev/null; then
    echo "✓ 使用 Node.js 启动服务器"
    echo "请访问: http://localhost:8080"
    echo ""
    npx serve -p 8080
    exit
fi

echo "❌ 错误: 未检测到 Python 或 Node.js"
echo "请安装其中之一后重试"
