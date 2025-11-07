# Windows安装包验证脚本
Write-Host "=== Lawyer Calendar Windows安装包验证 ===" -ForegroundColor Cyan

$installerPath = "dist-electron\Lawyer Calendar Setup 1.0.0.exe"

if (Test-Path $installerPath) {
    $fileInfo = Get-Item $installerPath
    Write-Host "✓ 安装包存在: $($fileInfo.FullName)" -ForegroundColor Green
    Write-Host "  文件大小: $([math]::Round($fileInfo.Length / 1MB, 2)) MB" -ForegroundColor Green
    Write-Host "  修改时间: $($fileInfo.LastWriteTime)" -ForegroundColor Green

    # 计算文件哈希用于完整性检查
    $hash = Get-FileHash $installerPath -Algorithm SHA256
    Write-Host "  SHA256哈希: $($hash.Hash)" -ForegroundColor Green

    Write-Host "`n=== 故障排除建议 ===" -ForegroundColor Yellow
    Write-Host "如果安装失败，请尝试:" -ForegroundColor Yellow
    Write-Host "1. 以管理员身份运行安装程序" -ForegroundColor White
    Write-Host "2. 关闭所有安全软件" -ForegroundColor White
    Write-Host "3. 确保有足够的磁盘空间" -ForegroundColor White
    Write-Host "4. 检查杀毒软件是否拦截了安装包" -ForegroundColor White
    Write-Host "5. 尝试在不同目录运行安装包" -ForegroundColor White

} else {
    Write-Host "✗ 安装包不存在: $installerPath" -ForegroundColor Red
    Write-Host "请先运行: npm run build-win" -ForegroundColor Red
}
