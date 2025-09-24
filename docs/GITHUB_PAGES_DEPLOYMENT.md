# GitHub Pages 部署指南

本文档介绍如何将合约计算器项目部署到 GitHub Pages。

## 自动部署（推荐）

项目已配置 GitHub Actions 自动部署，当代码推送到 `main` 分支时会自动触发部署。

### 设置步骤

1. **启用 GitHub Pages**
   - 进入 GitHub 仓库设置页面
   - 找到 "Pages" 选项
   - 在 "Source" 中选择 "GitHub Actions"

2. **推送代码**
   ```bash
   git add .
   git commit -m "feat: 添加 GitHub Pages 自动部署"
   git push origin main
   ```

3. **查看部署状态**
   - 在 GitHub 仓库的 "Actions" 标签页查看部署进度
   - 部署完成后，网站将在 `https://用户名.github.io/仓库名/` 可访问

### 工作流程说明

GitHub Actions 工作流程 (`.github/workflows/deploy.yml`) 包含以下步骤：

1. **代码检出** - 获取最新代码
2. **环境设置** - 安装 Node.js 和依赖
3. **代码检查** - 运行 ESLint
4. **测试运行** - 执行单元测试
5. **项目构建** - 生成生产版本
6. **部署发布** - 发布到 GitHub Pages

## 手动部署

如果需要手动部署，可以使用提供的部署脚本。

### 使用部署脚本

```bash
# 构建并部署
npm run deploy:gh-pages

# 仅构建
npm run build:gh-pages

# 预览构建结果
npm run preview:gh-pages
```

### 手动部署步骤

1. **构建项目**
   ```bash
   npm run build
   ```

2. **部署到 gh-pages 分支**
   ```bash
   # 使用 git subtree 推送 dist 目录
   git subtree push --prefix dist origin gh-pages
   ```

## 配置说明

### Vite 配置

项目的 `vite.config.ts` 已配置 GitHub Pages 支持：

```typescript
export default defineConfig({
  // GitHub Pages 部署路径
  base: process.env.NODE_ENV === 'production' ? '/position-calculator/' : '/',
  
  build: {
    outDir: 'dist',
    // 代码分割优化
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          router: ['react-router-dom']
        }
      }
    }
  }
})
```

### 路由处理

为了支持单页应用的客户端路由，项目包含：

1. **404.html** - 处理 GitHub Pages 的 404 重定向
2. **index.html** - 包含路由重定向脚本

这确保了直接访问子路径（如 `/entry-price`）时能正确加载应用。

## 环境变量

部署时可以设置以下环境变量：

- `NODE_ENV=production` - 启用生产模式
- `VITE_APP_TITLE` - 应用标题（可选）
- `VITE_APP_DESCRIPTION` - 应用描述（可选）

## 故障排除

### 常见问题

1. **部署失败**
   - 检查 GitHub Actions 日志
   - 确保 GitHub Pages 已启用
   - 验证仓库权限设置

2. **页面无法访问**
   - 确认 GitHub Pages 设置正确
   - 检查 DNS 传播（可能需要几分钟）
   - 验证 base 路径配置

3. **路由不工作**
   - 确保 404.html 文件存在
   - 检查 index.html 中的路由脚本
   - 验证 React Router 配置

4. **资源加载失败**
   - 检查 base 路径配置
   - 确认静态资源路径正确
   - 验证构建输出

### 调试步骤

1. **本地测试**
   ```bash
   # 构建并预览
   npm run build
   npm run preview
   ```

2. **检查构建输出**
   ```bash
   # 查看 dist 目录结构
   ls -la dist/
   
   # 检查 index.html
   cat dist/index.html
   ```

3. **验证路径配置**
   ```bash
   # 检查 vite 配置
   cat vite.config.ts
   ```

## 性能优化

### 构建优化

- **代码分割** - 将第三方库分离到独立 chunk
- **资源压缩** - 自动压缩 JS、CSS 和图片
- **缓存策略** - 静态资源添加版本哈希

### 加载优化

- **预加载** - 关键资源预加载
- **懒加载** - 路由组件按需加载
- **CDN** - 利用 GitHub Pages CDN

## 监控和分析

### 部署监控

- GitHub Actions 提供详细的部署日志
- 可以设置邮件通知部署状态
- 支持 Slack 等第三方通知集成

### 性能分析

建议使用以下工具分析网站性能：

- **Lighthouse** - 综合性能评估
- **WebPageTest** - 详细加载分析
- **Google Analytics** - 用户行为分析

## 安全考虑

### HTTPS

GitHub Pages 自动提供 HTTPS 支持，确保：

- 所有资源使用 HTTPS 加载
- 避免混合内容警告
- 启用安全头部设置

### 内容安全

- 定期更新依赖包
- 使用 npm audit 检查安全漏洞
- 避免在客户端存储敏感信息

## 更多资源

- [GitHub Pages 官方文档](https://docs.github.com/en/pages)
- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
