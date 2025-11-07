# Lawyer Calendar - Windows架构检测脚本
Write-Host "===================================" -ForegroundColor Cyan
Write-Host " Lawyer Calendar - Windows架构检测" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "正在检测您的Windows系统架构..." -ForegroundColor Yellow
Write-Host ""

# 检测系统架构
$arch = $env:PROCESSOR_ARCHITECTURE
$osInfo = Get-WmiObject -Class Win32_OperatingSystem

Write-Host "系统信息:" -ForegroundColor Gray
Write-Host "  处理器架构: $arch" -ForegroundColor White
Write-Host "  操作系统: $($osInfo.Caption)" -ForegroundColor White
Write-Host ""

if ($arch -eq "AMD64") {
    Write-Host "✓ 检测结果: 64位系统 (x64/AMD64)" -ForegroundColor Green
    Write-Host ""
    Write-Host "推荐使用: Lawyer Calendar Setup 1.0.0.exe (x64版本)" -ForegroundColor Green
    Write-Host ""
    Write-Host "此版本兼容您的系统，应该可以正常安装和运行。" -ForegroundColor Green
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "安装说明:" -ForegroundColor White
    Write-Host "1. 双击运行 'Lawyer Calendar Setup 1.0.0.exe'" -ForegroundColor White
    Write-Host "2. 按照安装向导完成安装" -ForegroundColor White
    Write-Host "3. 享受使用!" -ForegroundColor White
    Write-Host "===================================" -ForegroundColor Cyan
} elseif ($arch -eq "x86") {
    Write-Host "⚠ 检测结果: 32位系统 (x86)" -ForegroundColor Red
    Write-Host ""
    Write-Host "当前版本: x64 (64位)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "问题说明:" -ForegroundColor Red
    Write-Host "您正在使用32位Windows系统，但安装包是64位版本。" -ForegroundColor White
    Write-Host "这就是为什么会出现'此应用无法在你的电脑上运行'的错误。" -ForegroundColor White
    Write-Host ""
    Write-Host "解决方案:" -ForegroundColor Green
    Write-Host "1. 升级到64位Windows系统 (推荐)" -ForegroundColor White
    Write-Host "2. 或者联系开发者获取32位版本" -ForegroundColor White
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "重要提示:" -ForegroundColor Yellow
    Write-Host "如果您想继续使用当前系统，可以考虑:" -ForegroundColor White
    Write-Host "• 升级到64位Windows" -ForegroundColor White
    Write-Host "• 使用虚拟机运行64位系统" -ForegroundColor White
    Write-Host "• 联系技术支持获取帮助" -ForegroundColor White
    Write-Host "===================================" -ForegroundColor Cyan
} else {
    Write-Host "❓ 无法确定系统架构" -ForegroundColor Yellow
    Write-Host "处理器架构: $arch" -ForegroundColor White
    Write-Host ""
    Write-Host "请尝试以下步骤:" -ForegroundColor White
    Write-Host "1. 检查Windows版本: 右键'此电脑' -> 属性" -ForegroundColor White
    Write-Host "2. 查看'系统类型'信息" -ForegroundColor White
    Write-Host "3. 如果是64位，继续安装" -ForegroundColor White
    Write-Host "4. 如果是32位，请联系开发者" -ForegroundColor White
    Write-Host ""
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host "如需帮助，请联系技术支持" -ForegroundColor White
    Write-Host "===================================" -ForegroundColor Cyan
}

Write-Host ""
Read-Host "按Enter键退出"
