@echo off
echo ===================================
echo  Lawyer Calendar 便携版测试
echo ===================================
echo.

set ZIP_FILE="dist-electron\Lawyer Calendar Portable 1.0.0.zip"
set TEST_DIR="test-portable-extract"

echo 正在测试便携版ZIP文件...
echo.

if not exist %ZIP_FILE% (
    echo ✗ 错误: ZIP文件不存在 - %ZIP_FILE%
    goto :error
)

echo ✓ ZIP文件存在: %ZIP_FILE%

:: 检查PowerShell是否可用
powershell -Command "Write-Host 'PowerShell可用'" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo ✓ PowerShell可用
) else (
    echo ⚠ PowerShell不可用，但不影响基本功能
)

:: 创建测试目录
if exist %TEST_DIR% rmdir /s /q %TEST_DIR%
mkdir %TEST_DIR%

echo ✓ 创建测试目录: %TEST_DIR%

:: 测试解压 (只解压主要文件)
powershell -Command "& { try { Expand-Archive -Path %ZIP_FILE% -DestinationPath %TEST_DIR% -Force; Write-Host '✓ ZIP解压成功' } catch { Write-Host '✗ ZIP解压失败'; exit 1 } }" 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ✗ PowerShell解压失败，尝试使用tar...
    tar -xf %ZIP_FILE% -C %TEST_DIR%
    if %ERRORLEVEL% NEQ 0 (
        echo ✗ 所有解压方法都失败了
        goto :error
    )
)

:: 检查主要文件是否存在
if exist "%TEST_DIR%\dist-electron\win-unpacked\Lawyer Calendar.exe" (
    echo ✓ 主程序文件存在
) else (
    echo ✗ 主程序文件不存在
    goto :error
)

:: 清理测试目录
rmdir /s /q %TEST_DIR%

echo.
echo ===================================
echo  测试结果: 便携版ZIP文件正常 ✓
echo ===================================
echo.
echo 便携版特点:
echo • 无需管理员权限安装
echo • 可以解压到任意文件夹
echo • 双击 Lawyer Calendar.exe 即可运行
echo • 删除文件夹即可完全卸载
echo.
goto :success

:error
echo.
echo ===================================
echo  测试失败 ✗
echo ===================================
echo.
echo 可能的原因:
echo 1. ZIP文件损坏
echo 2. 权限不足
echo 3. 磁盘空间不足
echo.
goto :end

:success
echo 建议的分发方式:
echo 1. 上传ZIP文件到下载服务器
echo 2. 提供清晰的解压和使用说明
echo 3. 建议用户解压到非系统盘目录
echo.

:end
pause
