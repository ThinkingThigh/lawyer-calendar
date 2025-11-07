#!/bin/bash
# Lawyer Calendar macOS应用程序启动器
echo "启动Lawyer Calendar应用程序..."
cd "$(dirname "$0")"
exec electron .
