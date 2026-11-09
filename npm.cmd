@echo off
setlocal
if "%1"=="install" (
  echo Dependensi lokal NACORA sudah siap ^(tanpa paket eksternal^).
  exit /b 0
)
if "%1"=="test" (
  call "%~dp0node.cmd" "%~dp0scripts\run-tests.mjs"
  exit /b %ERRORLEVEL%
)
if "%1"=="run" (
  if "%2"=="data" (
    call "%~dp0node.cmd" "%~dp0scripts\convert-data.mjs"
    exit /b %ERRORLEVEL%
  )
  if "%2"=="dev" (
    call "%~dp0node.cmd" "%~dp0scripts\dev-server.mjs" %3 %4 %5
    exit /b %ERRORLEVEL%
  )
  if "%2"=="build" (
    call "%~dp0node.cmd" "%~dp0scripts\build.mjs"
    exit /b %ERRORLEVEL%
  )
  if "%2"=="test" (
    call "%~dp0node.cmd" "%~dp0scripts\run-tests.mjs"
    exit /b %ERRORLEVEL%
  )
)
echo Perintah npm yang tersedia: npm install, npm run data, npm run dev, npm test, npm run build
exit /b 1

