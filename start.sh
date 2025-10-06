#!/bin/bash

# Position Calculator 一键启动脚本
# 功能：启动前端开发服务器，支持单实例启动，自动杀死之前的进程

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
FRONTEND_PORT=5173
FRONTEND_PID_FILE=".frontend.pid"
LOG_DIR="logs"
FRONTEND_LOG="$LOG_DIR/frontend.log"

# 创建日志目录
mkdir -p "$LOG_DIR"

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # 端口被占用
    else
        return 1  # 端口未被占用
    fi
}

# 杀死指定端口的进程
kill_port_process() {
    local port=$1
    local service_name=$2
    
    if check_port $port; then
        print_message $YELLOW "检测到端口 $port 被占用，正在杀死相关进程..."
        local pids=$(lsof -ti :$port)
        if [ ! -z "$pids" ]; then
            echo $pids | xargs kill -9
            print_message $GREEN "已杀死端口 $port 上的进程: $pids"
        fi
    fi
}

# 杀死PID文件中记录的进程
kill_pid_file_process() {
    local pid_file=$1
    local service_name=$2
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if [ ! -z "$pid" ] && kill -0 "$pid" 2>/dev/null; then
            print_message $YELLOW "正在杀死之前的$service_name进程 (PID: $pid)..."
            kill -TERM "$pid" 2>/dev/null || true
            sleep 2
            if kill -0 "$pid" 2>/dev/null; then
                kill -KILL "$pid" 2>/dev/null || true
            fi
            print_message $GREEN "已杀死$service_name进程 (PID: $pid)"
        fi
        rm -f "$pid_file"
    fi
}

# 启动前端服务
start_frontend() {
    print_message $BLUE "正在启动前端服务..."
    
    # 检查依赖是否安装
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "检测到依赖未安装，正在安装..."
        npm install
    fi
    
    # 启动前端开发服务器
    print_message $BLUE "启动前端开发服务器 (端口: $FRONTEND_PORT)..."
    
    # 修改vite配置以使用指定端口
    export VITE_PORT=$FRONTEND_PORT
    
    # 后台启动前端服务并记录PID
    nohup npm run dev -- --port $FRONTEND_PORT --host 0.0.0.0 > "$FRONTEND_LOG" 2>&1 &
    local frontend_pid=$!
    echo $frontend_pid > "$FRONTEND_PID_FILE"
    
    print_message $GREEN "前端服务已启动 (PID: $frontend_pid)"
    print_message $BLUE "前端访问地址: http://localhost:$FRONTEND_PORT"
    print_message $BLUE "前端日志文件: $FRONTEND_LOG"
}

# 等待服务启动
wait_for_service() {
    local port=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    print_message $YELLOW "等待$service_name服务启动..."
    
    while [ $attempt -le $max_attempts ]; do
        if check_port $port; then
            print_message $GREEN "$service_name服务已成功启动！"
            return 0
        fi
        
        echo -n "."
        sleep 1
        attempt=$((attempt + 1))
    done
    
    print_message $RED "$service_name服务启动失败或超时"
    return 1
}

# 显示服务状态
show_status() {
    print_message $BLUE "=== 服务状态 ==="
    
    if check_port $FRONTEND_PORT; then
        print_message $GREEN "✓ 前端服务运行中 (端口: $FRONTEND_PORT)"
    else
        print_message $RED "✗ 前端服务未运行"
    fi
    
    echo ""
    print_message $BLUE "=== 访问地址 ==="
    print_message $BLUE "前端: http://localhost:$FRONTEND_PORT"
    
    echo ""
    print_message $BLUE "=== 日志文件 ==="
    print_message $BLUE "前端日志: $FRONTEND_LOG"
}

# 停止所有服务
stop_services() {
    print_message $YELLOW "正在停止所有服务..."
    
    # 停止前端服务
    kill_pid_file_process "$FRONTEND_PID_FILE" "前端"
    kill_port_process $FRONTEND_PORT "前端"
    
    print_message $GREEN "所有服务已停止"
}

# 主函数
main() {
    print_message $BLUE "=== Position Calculator 启动脚本 ==="
    
    case "${1:-start}" in
        "start")
            # 停止之前的服务
            stop_services
            
            # 启动服务
            start_frontend
            
            # 等待服务启动
            wait_for_service $FRONTEND_PORT "前端"
            
            # 显示状态
            show_status
            
            print_message $GREEN "=== 所有服务启动完成 ==="
            ;;
            
        "stop")
            stop_services
            ;;
            
        "restart")
            stop_services
            sleep 2
            $0 start
            ;;
            
        "status")
            show_status
            ;;
            
        "logs")
            if [ -f "$FRONTEND_LOG" ]; then
                print_message $BLUE "=== 前端日志 ==="
                tail -f "$FRONTEND_LOG"
            else
                print_message $RED "日志文件不存在"
            fi
            ;;
            
        *)
            echo "用法: $0 {start|stop|restart|status|logs}"
            echo ""
            echo "命令说明:"
            echo "  start   - 启动所有服务 (默认)"
            echo "  stop    - 停止所有服务"
            echo "  restart - 重启所有服务"
            echo "  status  - 显示服务状态"
            echo "  logs    - 查看前端日志"
            exit 1
            ;;
    esac
}

# 捕获退出信号，确保清理资源
trap 'print_message $YELLOW "收到退出信号，正在清理..."; stop_services; exit 0' INT TERM

# 执行主函数
main "$@"
