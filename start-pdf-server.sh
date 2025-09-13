#!/bin/bash

echo "🚀 启动PDF生成服务..."

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装Node.js，请先安装Node.js"
    exit 1
fi

# 进入server目录
cd server

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "📦 安装PDF服务依赖..."
    npm install
fi

# 启动服务
echo "🎯 启动PDF生成服务在端口3001..."
npm start
