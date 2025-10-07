#!/bin/bash

# 开发服务器启动脚本
# 自动杀死之前的实例并启动新的后台进程

echo "正在启动开发服务器..."

# 查找并杀死之前的 vite 进程
echo "检查并停止之前的开发服务器实例..."
pkill -f "vite.*position-calculator" 2>/dev/null || true

# 等待进程完全停止
sleep 2

# 检查端口 5173 是否被占用
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo "端口 5173 仍被占用，强制杀死占用进程..."
    lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    sleep 1
fi

# 启动开发服务器
echo "启动新的开发服务器实例..."
cd "$(dirname "$0")"
npm run dev > dev-server.log 2>&1 &

# 获取进程 ID
SERVER_PID=$!

# 等待服务器启动
echo "等待服务器启动..."
sleep 3

# 检查服务器是否成功启动
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 开发服务器已成功启动 (PID: $SERVER_PID)"
    echo "📝 日志文件: dev-server.log"
    echo "🌐 访问地址: http://localhost:5173"
    echo ""
    echo "要停止服务器，请运行: kill $SERVER_PID"
    echo "或运行: pkill -f 'vite.*position-calculator'"
else
    echo "❌ 服务器启动失败，请检查 dev-server.log 文件"
    exit 1
fi