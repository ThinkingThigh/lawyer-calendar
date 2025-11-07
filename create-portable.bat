@echo off
echo ===================================
echo  Lawyer Calendar 便携版创建器
echo ===================================
echo.

echo 这个脚本将为Windows用户创建最兼容的便携版ZIP文件。
echo.

set SOURCE_DIR=dist-electron\win-unpacked
set OUTPUT_ZIP=dist-electron\LawyerCalendar-Portable-Compatible-1.0.0.zip

echo 检查源文件目录...
if not exist "%SOURCE_DIR%" (
    echo ✗ 错误: 源文件目录不存在 - %SOURCE_DIR%
    echo 请先运行: npm run build-win
    goto :error
)

echo ✓ 源文件目录存在

echo 检查主程序文件...
if not exist "%SOURCE_DIR%\Lawyer Calendar.exe" (
    echo ✗ 错误: 主程序文件不存在
    goto :error
)

echo ✓ 主程序文件存在

echo 创建兼容的ZIP文件...
powershell -ExecutionPolicy Bypass -Command "
try {
    Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
    $sourcePath = '%SOURCE_DIR%'
    $zipPath = '%OUTPUT_ZIP%'

    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }

    [System.IO.Compression.ZipFile]::CreateFromDirectory($sourcePath, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

    $fileSize = [math]::Round((Get-Item $zipPath).Length / 1MB, 2)
    Write-Host \"✓ ZIP文件创建成功: $zipPath\" -ForegroundColor Green
    Write-Host \"  文件大小: $fileSize MB\" -ForegroundColor Green

} catch {
    Write-Host \"✗ ZIP文件创建失败: $($_.Exception.Message)\" -ForegroundColor Red
    exit 1
}
"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================
    echo  ZIP文件创建完成!
    echo ===================================
    echo.
    echo 文件位置: %OUTPUT_ZIP%
    echo.
    echo 这个ZIP文件应该在Windows上完全兼容。
    echo 建议分发这个版本给Windows用户。
    echo.
    goto :success
) else (
    echo.
    echo ===================================
    echo  ZIP文件创建失败
    echo ===================================
    echo.
    goto :error
)

:success
echo 下一步:
echo 1. 复制ZIP文件到Windows电脑
echo 2. 右键ZIP文件 -^> "全部提取"
echo 3. 运行解压后的 Lawyer Calendar.exe
echo.
pause
goto :end

:error
echo.
echo 故障排除:
echo • 确保源文件目录存在
echo • 检查磁盘空间是否足够
echo • 以管理员身份运行此脚本
echo.
pause
goto :end

:end
