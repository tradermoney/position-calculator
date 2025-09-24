#!/bin/bash

# GitHub Pages 部署脚本
# 用于本地测试和手动部署到 GitHub Pages

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date '+%Y-%m-%d %H:%M:%S')] $message${NC}"
}

# 检查是否在 git 仓库中
check_git_repo() {
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_message $RED "错误：当前目录不是 Git 仓库"
        exit 1
    fi
}

# 检查是否有未提交的更改
check_clean_working_tree() {
    if ! git diff-index --quiet HEAD --; then
        print_message $YELLOW "警告：工作目录有未提交的更改"
        read -p "是否继续部署？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_message $YELLOW "部署已取消"
            exit 1
        fi
    fi
}

# 构建项目
build_project() {
    print_message $BLUE "正在构建项目..."
    
    # 设置生产环境
    export NODE_ENV=production
    
    # 安装依赖
    if [ ! -d "node_modules" ]; then
        print_message $YELLOW "安装依赖..."
        npm ci
    fi
    
    # 运行代码检查
    print_message $BLUE "运行代码检查..."
    npm run lint || print_message $YELLOW "代码检查发现问题，但继续构建"
    
    # 运行测试
    print_message $BLUE "运行测试..."
    npm run test:run || print_message $YELLOW "测试失败，但继续构建"
    
    # 构建项目
    print_message $BLUE "构建生产版本..."
    npm run build
    
    print_message $GREEN "项目构建完成"
}

# 部署到 GitHub Pages
deploy_to_github_pages() {
    print_message $BLUE "准备部署到 GitHub Pages..."
    
    # 检查 dist 目录是否存在
    if [ ! -d "dist" ]; then
        print_message $RED "错误：dist 目录不存在，请先构建项目"
        exit 1
    fi
    
    # 获取当前分支
    current_branch=$(git branch --show-current)
    
    # 创建临时分支用于部署
    temp_branch="temp-gh-pages-$(date +%s)"
    
    print_message $BLUE "创建临时分支: $temp_branch"
    git checkout -b $temp_branch
    
    # 添加 dist 目录到 git（通常被 .gitignore 忽略）
    git add -f dist/
    git commit -m "部署到 GitHub Pages - $(date '+%Y-%m-%d %H:%M:%S')"
    
    # 推送到 gh-pages 分支
    print_message $BLUE "推送到 gh-pages 分支..."
    git subtree push --prefix dist origin gh-pages || {
        print_message $YELLOW "subtree push 失败，尝试强制推送..."
        git push origin `git subtree split --prefix dist $temp_branch`:gh-pages --force
    }
    
    # 切换回原分支并删除临时分支
    git checkout $current_branch
    git branch -D $temp_branch
    
    print_message $GREEN "部署完成！"
    print_message $BLUE "GitHub Pages 地址: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"
}

# 预览构建结果
preview_build() {
    print_message $BLUE "启动预览服务器..."
    
    if [ ! -d "dist" ]; then
        print_message $RED "错误：dist 目录不存在，请先构建项目"
        exit 1
    fi
    
    # 使用 vite preview 预览构建结果
    npm run preview
}

# 显示帮助信息
show_help() {
    echo "GitHub Pages 部署脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build    - 仅构建项目"
    echo "  deploy   - 构建并部署到 GitHub Pages"
    echo "  preview  - 预览构建结果"
    echo "  help     - 显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build    # 仅构建项目"
    echo "  $0 deploy   # 构建并部署"
    echo "  $0 preview  # 预览构建结果"
}

# 主函数
main() {
    print_message $BLUE "=== GitHub Pages 部署脚本 ==="
    
    # 检查 git 仓库
    check_git_repo
    
    case "${1:-deploy}" in
        "build")
            build_project
            ;;
            
        "deploy")
            check_clean_working_tree
            build_project
            deploy_to_github_pages
            ;;
            
        "preview")
            preview_build
            ;;
            
        "help"|"-h"|"--help")
            show_help
            ;;
            
        *)
            print_message $RED "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
