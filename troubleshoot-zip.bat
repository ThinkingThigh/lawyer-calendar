@echo off
echo ===================================
echo  ZIP解压问题故障排除工具
echo ===================================
echo.

echo 请选择要测试的ZIP文件:
echo.

set ZIP1="LawyerCalendar-Minimal-1.0.0.zip"
set ZIP2="LawyerCalendar-Portable-Windows-1.0.0.zip"
set ZIP3="LawyerCalendar-EXE-Only.zip"

if exist %ZIP1% echo 1. %ZIP1% (最小化版本 - 推荐测试)
if exist %ZIP2% echo 2. %ZIP2% (完整优化版本)
if exist %ZIP3% echo 3. %ZIP3% (仅EXE版本)
echo.

set /p choice="请输入选择 (1-3): "

if "%choice%"=="1" set SELECTED_ZIP=%ZIP1%
if "%choice%"=="2" set SELECTED_ZIP=%ZIP2%
if "%choice%"=="3" set SELECTED_ZIP=%ZIP3%

if not defined SELECTED_ZIP (
    echo 无效选择
    goto :end
)

echo.
echo 正在测试: %SELECTED_ZIP%
echo.

:: 检查ZIP文件是否存在
if not exist %SELECTED_ZIP% (
    echo ✗ ZIP文件不存在: %SELECTED_ZIP%
    goto :error
)

echo ✓ ZIP文件存在

:: 获取文件大小
for %%A in (%SELECTED_ZIP%) do set FILE_SIZE=%%~zA
echo 文件大小: %FILE_SIZE% 字节

:: 尝试不同的解压方法
echo.
echo === 测试解压方法 ===
echo.

echo 1. 测试PowerShell解压...
powershell -ExecutionPolicy Bypass -Command "
try {
    $zipPath = '%SELECTED_ZIP%'
    $testDir = 'zip-test-extract'
    if (Test-Path $testDir) { Remove-Item $testDir -Recurse -Force }
    New-Item -ItemType Directory -Path $testDir | Out-Null
    Expand-Archive -Path $zipPath -DestinationPath $testDir -Force
    Write-Host '✓ PowerShell解压成功' -ForegroundColor Green
    Remove-Item $testDir -Recurse -Force
} catch {
    Write-Host '✗ PowerShell解压失败' -ForegroundColor Red
    Write-Host \"错误: $($_.Exception.Message)\" -ForegroundColor Red
}
" 2>nul

echo.
echo 2. 测试7-Zip兼容性检查...
powershell -ExecutionPolicy Bypass -Command "
try {
    $zipPath = '%SELECTED_ZIP%'
    Add-Type -AssemblyName 'System.IO.Compression.FileSystem'
    $zip = [System.IO.Compression.ZipFile]::OpenRead($zipPath)
    $entries = $zip.Entries | Measure-Object
    Write-Host \"✓ .NET解压测试成功 - 包含 $($entries.Count) 个文件\" -ForegroundColor Green
    $zip.Dispose()
} catch {
    Write-Host '✗ .NET解压测试失败' -ForegroundColor Red
    Write-Host \"错误: $($_.Exception.Message)\" -ForegroundColor Red
}
" 2>nul

echo.
echo === 推荐解决方案 ===
echo.
echo 如果ZIP文件仍然无法解压，请尝试:
echo.
echo 1. 使用不同的电脑测试
echo 2. 下载并使用 7-Zip: https://7-zip.org/
echo 3. 尝试最小化版本: LawyerCalendar-Minimal-1.0.0.zip
echo 4. 检查网络连接是否稳定
echo 5. 尝试使用不同的浏览器下载
echo.
echo 最小化版本只包含核心文件，应该最兼容。
echo.

goto :end

:error
echo.
echo 故障排除失败。
echo.

:end
echo 按任意键退出...
pause >nul
