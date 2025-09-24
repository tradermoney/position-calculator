#!/usr/bin/env node

/**
 * GitHub Pages 配置测试脚本
 * 验证部署配置的正确性
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 颜色定义
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 打印带颜色的消息
function printMessage(color, message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${color}[${timestamp}] ${message}${colors.reset}`);
}

// 测试结果统计
let testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// 执行测试
function runTest(testName, testFunction) {
  testResults.total++;
  try {
    testFunction();
    testResults.passed++;
    printMessage(colors.green, `✓ ${testName}`);
    return true;
  } catch (error) {
    testResults.failed++;
    printMessage(colors.red, `✗ ${testName}: ${error.message}`);
    return false;
  }
}

// 检查文件是否存在
function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${description} 不存在: ${filePath}`);
  }
}

// 检查文件内容
function checkFileContent(filePath, pattern, description) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (!pattern.test(content)) {
    throw new Error(`${description} 内容不正确`);
  }
}

// 测试 GitHub Actions 工作流配置
function testGitHubActionsWorkflow() {
  const workflowPath = '.github/workflows/deploy.yml';
  checkFileExists(workflowPath, 'GitHub Actions 工作流文件');
  
  const content = fs.readFileSync(workflowPath, 'utf8');
  
  // 检查必要的配置项
  const requiredPatterns = [
    /name:\s*部署到\s*GitHub\s*Pages/,
    /on:/,
    /branches:\s*\[\s*main\s*\]/,
    /workflow_dispatch:/,
    /permissions:/,
    /pages:\s*write/,
    /actions\/checkout@v4/,
    /actions\/setup-node@v4/,
    /actions\/configure-pages@v4/,
    /actions\/upload-pages-artifact@v3/,
    /actions\/deploy-pages@v4/,
    /npm run build/
  ];
  
  requiredPatterns.forEach((pattern, index) => {
    if (!pattern.test(content)) {
      throw new Error(`工作流配置缺少必要项 ${index + 1}`);
    }
  });
}

// 测试 Vite 配置
function testViteConfig() {
  const configPath = 'vite.config.ts';
  checkFileExists(configPath, 'Vite 配置文件');
  
  checkFileContent(
    configPath,
    /base:\s*process\.env\.NODE_ENV\s*===\s*['"]production['"].*position-calculator/,
    'Vite base 路径配置'
  );
  
  checkFileContent(
    configPath,
    /manualChunks:\s*{[\s\S]*vendor[\s\S]*mui[\s\S]*router[\s\S]*}/,
    'Vite 代码分割配置'
  );
}

// 测试 package.json 脚本
function testPackageJsonScripts() {
  const packagePath = 'package.json';
  checkFileExists(packagePath, 'package.json 文件');
  
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const requiredScripts = [
    'build',
    'deploy:gh-pages',
    'build:gh-pages',
    'preview:gh-pages'
  ];
  
  requiredScripts.forEach(script => {
    if (!packageJson.scripts[script]) {
      throw new Error(`缺少必要的 npm 脚本: ${script}`);
    }
  });
  
  // 检查是否安装了 @types/node
  if (!packageJson.devDependencies['@types/node']) {
    throw new Error('缺少 @types/node 依赖');
  }
}

// 测试 404.html 文件
function test404Html() {
  const htmlPath = 'public/404.html';
  checkFileExists(htmlPath, '404.html 文件');
  
  checkFileContent(
    htmlPath,
    /GitHub Pages 单页应用路由处理/,
    '404.html 路由处理脚本'
  );
  
  checkFileContent(
    htmlPath,
    /l\.replace\(/,
    '404.html 重定向逻辑'
  );
}

// 测试 index.html 路由脚本
function testIndexHtmlRouting() {
  const htmlPath = 'index.html';
  checkFileExists(htmlPath, 'index.html 文件');
  
  checkFileContent(
    htmlPath,
    /GitHub Pages 单页应用路由处理/,
    'index.html 路由处理注释'
  );
  
  checkFileContent(
    htmlPath,
    /window\.history\.replaceState/,
    'index.html 路由重定向脚本'
  );
}

// 测试部署脚本
function testDeployScript() {
  const scriptPath = 'scripts/deploy-github-pages.sh';
  checkFileExists(scriptPath, '部署脚本文件');
  
  // 检查脚本是否可执行
  const stats = fs.statSync(scriptPath);
  if (!(stats.mode & parseInt('111', 8))) {
    throw new Error('部署脚本没有执行权限');
  }
  
  checkFileContent(
    scriptPath,
    /GitHub Pages 部署脚本/,
    '部署脚本标题'
  );
  
  checkFileContent(
    scriptPath,
    /npm run build/,
    '部署脚本构建命令'
  );
}

// 测试文档
function testDocumentation() {
  const docPath = 'docs/GITHUB_PAGES_DEPLOYMENT.md';
  checkFileExists(docPath, '部署文档');
  
  checkFileContent(
    docPath,
    /# GitHub Pages 部署指南/,
    '文档标题'
  );
  
  checkFileContent(
    docPath,
    /自动部署.*推荐/,
    '自动部署说明'
  );
}

// 测试构建输出
function testBuildOutput() {
  const distPath = 'dist';
  if (!fs.existsSync(distPath)) {
    throw new Error('dist 目录不存在，请先运行构建');
  }
  
  const requiredFiles = [
    'dist/index.html',
    'dist/404.html',
    'dist/assets'
  ];
  
  requiredFiles.forEach(file => {
    checkFileExists(file, `构建输出文件: ${file}`);
  });
  
  // 检查 index.html 中的资源路径
  const indexContent = fs.readFileSync('dist/index.html', 'utf8');
  if (!/\/position-calculator\/assets\//.test(indexContent)) {
    throw new Error('构建输出中的资源路径不正确');
  }
}

// 测试 TypeScript 编译
function testTypeScriptCompilation() {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
  } catch (error) {
    throw new Error('TypeScript 编译失败');
  }
}

// 主测试函数
function runAllTests() {
  printMessage(colors.blue, '=== GitHub Pages 配置测试开始 ===');
  
  // 运行所有测试
  runTest('GitHub Actions 工作流配置', testGitHubActionsWorkflow);
  runTest('Vite 配置', testViteConfig);
  runTest('package.json 脚本', testPackageJsonScripts);
  runTest('404.html 文件', test404Html);
  runTest('index.html 路由脚本', testIndexHtmlRouting);
  runTest('部署脚本', testDeployScript);
  runTest('部署文档', testDocumentation);
  runTest('构建输出', testBuildOutput);
  runTest('TypeScript 编译', testTypeScriptCompilation);
  
  // 输出测试结果
  printMessage(colors.blue, '=== 测试结果 ===');
  printMessage(colors.green, `通过: ${testResults.passed}`);
  printMessage(colors.red, `失败: ${testResults.failed}`);
  printMessage(colors.blue, `总计: ${testResults.total}`);
  
  if (testResults.failed === 0) {
    printMessage(colors.green, '🎉 所有测试通过！GitHub Pages 配置正确。');
    process.exit(0);
  } else {
    printMessage(colors.red, '❌ 部分测试失败，请检查配置。');
    process.exit(1);
  }
}

// 运行测试
runAllTests();
