@echo off
echo ===================================
echo  Lawyer Calendar - Windows架构检测
echo ===================================
echo.

echo 正在检测您的Windows系统架构...
echo.

:: 检查处理器架构
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    echo ✓ 检测结果: 64位系统 (x64/AMD64)
    echo.
    echo 推荐使用: Lawyer Calendar Setup 1.0.0.exe (x64版本)
    echo.
    echo 此版本兼容您的系统，应该可以正常安装和运行。
    goto :success
) else if "%PROCESSOR_ARCHITECTURE%"=="x86" (
    echo ⚠ 检测结果: 32位系统 (x86)
    echo.
    echo 当前版本: x64 (64位)
    echo.
    echo 问题说明:
    echo 您正在使用32位Windows系统，但安装包是64位版本。
    echo 这就是为什么会出现"此应用无法在你的电脑上运行"的错误。
    echo.
    echo 解决方案:
    echo 1. 升级到64位Windows系统 (推荐)
    echo 2. 或者联系开发者获取32位版本
    echo.
    goto :warning
) else (
    echo ❓ 无法确定系统架构
    echo 处理器架构: %PROCESSOR_ARCHITECTURE%
    echo.
    echo 请尝试以下步骤:
    echo 1. 检查Windows版本: 右键"此电脑" -> 属性
    echo 2. 查看"系统类型"信息
    echo 3. 如果是64位，继续安装
    echo 4. 如果是32位，请联系开发者
    goto :unknown
)

:success
echo ===================================
echo 安装说明:
echo 1. 双击运行 "Lawyer Calendar Setup 1.0.0.exe"
echo 2. 按照安装向导完成安装
echo 3. 享受使用!
echo ===================================
goto :end

:warning
echo ===================================
echo 重要提示:
echo 如果您想继续使用当前系统，可以考虑:
echo • 升级到64位Windows
echo • 使用虚拟机运行64位系统
echo • 联系技术支持获取帮助
echo ===================================
goto :end

:unknown
echo ===================================
echo 如需帮助，请联系技术支持
echo ===================================
goto :end

:end
echo.
echo 按任意键退出...
pause >nul
