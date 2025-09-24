#!/usr/bin/env node

/**
 * GitHub Pages 部署状态检查脚本
 * 检查部署是否成功并验证网站功能
 */

import https from 'https';
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

// 获取GitHub仓库信息
function getRepoInfo() {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/github\.com[:/]([^/]+)\/([^.]+)/);
    if (match) {
      return {
        owner: match[1],
        repo: match[2],
        url: `https://${match[1]}.github.io/${match[2]}/`
      };
    }
  } catch (error) {
    printMessage(colors.red, '无法获取GitHub仓库信息');
  }
  return null;
}

// 检查URL是否可访问
function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        status: response.statusCode,
        headers: response.headers
      });
    });
    
    request.on('error', (error) => {
      resolve({
        status: 0,
        error: error.message
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      resolve({
        status: 0,
        error: 'Timeout'
      });
    });
  });
}

// 检查GitHub Actions状态
async function checkGitHubActions(owner, repo) {
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=5`;
  
  try {
    const response = await checkUrl(apiUrl);
    if (response.status === 200) {
      printMessage(colors.green, '✓ GitHub Actions API 可访问');
      return true;
    } else {
      printMessage(colors.yellow, `⚠ GitHub Actions API 状态: ${response.status}`);
      return false;
    }
  } catch (error) {
    printMessage(colors.red, `✗ GitHub Actions API 检查失败: ${error.message}`);
    return false;
  }
}

// 检查网站部署状态
async function checkDeployment(url) {
  printMessage(colors.blue, `检查部署状态: ${url}`);
  
  const response = await checkUrl(url);
  
  if (response.status === 200) {
    printMessage(colors.green, '✓ 网站部署成功，可以访问');
    return true;
  } else if (response.status === 404) {
    printMessage(colors.yellow, '⚠ 网站返回404，可能还在部署中');
    return false;
  } else if (response.status === 0) {
    printMessage(colors.red, `✗ 网站无法访问: ${response.error}`);
    return false;
  } else {
    printMessage(colors.yellow, `⚠ 网站状态异常: ${response.status}`);
    return false;
  }
}

// 检查关键页面
async function checkPages(baseUrl) {
  const pages = [
    '',
    'entry-price',
    'liquidation-price',
    'max-position',
    'pnl-calculator',
    'pyramid-calculator'
  ];
  
  let successCount = 0;
  
  for (const page of pages) {
    const url = baseUrl + page;
    const response = await checkUrl(url);
    
    if (response.status === 200) {
      printMessage(colors.green, `✓ 页面可访问: /${page || 'index'}`);
      successCount++;
    } else {
      printMessage(colors.red, `✗ 页面无法访问: /${page || 'index'} (${response.status})`);
    }
  }
  
  return successCount === pages.length;
}

// 主检查函数
async function main() {
  printMessage(colors.blue, '=== GitHub Pages 部署状态检查 ===');
  
  // 获取仓库信息
  const repoInfo = getRepoInfo();
  if (!repoInfo) {
    printMessage(colors.red, '无法获取仓库信息，请确保在Git仓库中运行');
    process.exit(1);
  }
  
  printMessage(colors.blue, `仓库: ${repoInfo.owner}/${repoInfo.repo}`);
  printMessage(colors.blue, `部署URL: ${repoInfo.url}`);
  
  // 检查GitHub Actions
  await checkGitHubActions(repoInfo.owner, repoInfo.repo);
  
  // 检查主页部署
  const isDeployed = await checkDeployment(repoInfo.url);
  
  if (isDeployed) {
    // 检查所有页面
    printMessage(colors.blue, '检查所有页面...');
    const allPagesWork = await checkPages(repoInfo.url);
    
    if (allPagesWork) {
      printMessage(colors.green, '🎉 所有页面都可以正常访问！');
    } else {
      printMessage(colors.yellow, '⚠ 部分页面可能有问题');
    }
  } else {
    printMessage(colors.yellow, '⏳ 网站可能还在部署中，请稍后再试');
    printMessage(colors.blue, '💡 提示:');
    printMessage(colors.blue, '  1. 检查GitHub仓库的Actions标签页查看部署进度');
    printMessage(colors.blue, '  2. 确保在仓库设置中启用了GitHub Pages');
    printMessage(colors.blue, '  3. 选择"GitHub Actions"作为部署源');
  }
  
  // 输出有用的链接
  printMessage(colors.blue, '=== 有用的链接 ===');
  printMessage(colors.blue, `🌐 网站地址: ${repoInfo.url}`);
  printMessage(colors.blue, `⚙️ Actions: https://github.com/${repoInfo.owner}/${repoInfo.repo}/actions`);
  printMessage(colors.blue, `📋 设置: https://github.com/${repoInfo.owner}/${repoInfo.repo}/settings/pages`);
}

// 运行检查
main().catch(error => {
  printMessage(colors.red, `检查过程出错: ${error.message}`);
  process.exit(1);
});
