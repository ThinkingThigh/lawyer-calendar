@echo off
echo ===================================
echo  Lawyer Calendar 便携版解压助手
echo ===================================
echo.

set ZIP_FILE1="Lawyer Calendar Portable 1.0.0.zip"
set ZIP_FILE2="LawyerCalendar-Portable-1.0.0.zip"
set TAR_FILE="LawyerCalendar-Portable-1.0.0.tar.gz"

echo 这个脚本将帮助您解压便携版应用程序。
echo.

:: 检查可用的文件
set FOUND_FILE=0
if exist %ZIP_FILE1% (
    echo ✓ 找到原始ZIP文件: %ZIP_FILE1%
    set FOUND_FILE=1
    set TARGET_FILE=%ZIP_FILE1%
) else if exist %ZIP_FILE2% (
    echo ✓ 找到无空格ZIP文件: %ZIP_FILE2%
    set FOUND_FILE=1
    set TARGET_FILE=%ZIP_FILE2%
) else if exist %TAR_FILE% (
    echo ✓ 找到TAR.GZ文件: %TAR_FILE%
    set FOUND_FILE=1
    set TARGET_FILE=%TAR_FILE%
) else (
    echo ⚠ 未找到任何压缩文件
    echo 请确保有以下文件之一:
    echo   - Lawyer Calendar Portable 1.0.0.zip
    echo   - LawyerCalendar-Portable-1.0.0.zip
    echo   - LawyerCalendar-Portable-1.0.0.tar.gz
    echo.
    goto :show_manual_steps
)

if %FOUND_FILE%==1 (
    echo.
    echo 文件大小:
    for %%A in (%TARGET_FILE%) do echo   %%~zA 字节
    echo.
)

:show_manual_steps
echo 手动解压步骤:
echo ==============================
echo.
echo 方法1 - 使用Windows内置解压:
echo ------------------------------
echo 1. 找到下载的ZIP文件
echo 2. 右键点击ZIP文件
echo 3. 选择 "全部提取..." 或 "Extract All..."
echo 4. 选择解压目标文件夹（建议桌面或Documents）
echo 5. 点击 "提取" 按钮
echo 6. 等待解压完成
echo 7. 打开解压的文件夹
echo 8. 双击 "Lawyer Calendar.exe" 运行
echo.

echo 方法2 - 如果内置解压失败:
echo ------------------------------
echo 1. 下载并安装 7-Zip: https://7-zip.org/
echo 2. 用7-Zip打开ZIP文件
echo 3. 选择 "提取" 或 "Extract"
echo 4. 选择解压目标文件夹
echo 5. 等待解压完成
echo 6. 运行 Lawyer Calendar.exe
echo.

echo 方法3 - 对于TAR.GZ文件:
echo ------------------------------
echo 1. 下载并安装 7-Zip: https://7-zip.org/
echo 2. 用7-Zip打开TAR.GZ文件
echo 3. 提取到文件夹
echo 4. 再次用7-Zip打开提取的TAR文件
echo 5. 再次提取
echo 6. 运行 Lawyer Calendar.exe
echo.

echo 故障排除:
echo ==============================
echo.
echo 如果仍然无法解压:
echo • 尝试将文件复制到其他磁盘位置
echo • 关闭所有安全软件临时
echo • 检查磁盘空间（需要约200MB）
echo • 尝试在不同文件夹中解压
echo.

echo 如果解压后无法运行:
echo • 确保解压到非系统文件夹
echo • 右键exe文件，选择"以管理员身份运行"
echo • 检查Windows版本（需要Win10/11）
echo.

echo 文件名说明:
echo ==============================
echo.
echo 原始文件名: Lawyer Calendar Portable 1.0.0.zip
echo 无空格文件名: LawyerCalendar-Portable-1.0.0.zip
echo TAR格式: LawyerCalendar-Portable-1.0.0.tar.gz
echo.
echo 如果文件名含空格导致问题，请使用无空格版本。
echo.

pause
