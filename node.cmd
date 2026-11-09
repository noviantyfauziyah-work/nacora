@echo off
setlocal
where node.exe >nul 2>nul
if %ERRORLEVEL% EQU 0 (
  node.exe %*
  exit /b %ERRORLEVEL%
)
set "ELECTRON_RUN_AS_NODE=1"
"%LOCALAPPDATA%\Programs\Antigravity IDE\Antigravity IDE.exe" %*
exit /b %ERRORLEVEL%

