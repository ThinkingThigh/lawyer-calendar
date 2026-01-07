#!/bin/bash
# Git历史清理脚本 - 移除大文件夹

echo "==================================="
echo "Git历史清理 - 移除大文件夹"
echo "==================================="
echo ""

# 检查是否在Git仓库中
if [ ! -d .git ]; then
    echo "错误: 当前目录不是Git仓库"
    exit 1
fi

echo "⚠️  警告: 此操作将重写Git历史记录"
echo "⚠️  请确保已备份重要数据"
echo ""
read -p "是否继续? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "操作已取消"
    exit 0
fi

echo ""
echo "正在从Git历史中移除大文件夹..."
echo ""

# 使用git filter-branch移除这些文件夹
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch node_modules dist dist-electron dist-ssr" \
  --prune-empty --tag-name-filter cat -- --all

echo ""
echo "清理Git引用..."
git for-each-ref --format='delete %(refname)' refs/original | git update-ref --stdin
git reflog expire --expire=now --all
git gc --prune=now --aggressive

echo ""
echo "==================================="
echo "清理完成!"
echo "==================================="
echo ""
echo "下一步:"
echo "1. 检查仓库大小: du -sh .git"
echo "2. 如果满意，强制推送到GitHub:"
echo "   git push origin --force --all"
echo "   git push origin --force --tags"
echo ""
echo "⚠️  注意: 强制推送会覆盖远程历史，请确保团队成员已同步"
echo ""
