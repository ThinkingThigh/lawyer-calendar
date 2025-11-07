@echo off
echo === Lawyer Calendar Windows安装包验证 ===
echo.

set INSTALLER_PATH=dist-electron\Lawyer Calendar Setup 1.0.0.exe

if exist "%INSTALLER_PATH%" (
    echo ✓ 安装包存在: %INSTALLER_PATH%
    for %%A in ("%INSTALLER_PATH%") do echo   文件大小: %%~zA 字节
    echo.

    echo === 故障排除建议 ===
    echo 如果安装失败，请尝试:
    echo 1. 以管理员身份运行安装程序
    echo 2. 关闭所有安全软件
    echo 3. 确保有足够的磁盘空间
    echo 4. 检查杀毒软件是否拦截了安装包
    echo 5. 尝试在不同目录运行安装包
    echo.
    echo 如需计算文件哈希，请运行 PowerShell 脚本: verify-installer.ps1
) else (
    echo ✗ 安装包不存在: %INSTALLER_PATH%
    echo 请先运行: npm run build-win
)

pause
