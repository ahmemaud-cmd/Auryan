@echo off
cd /d "%~dp0"
REM install dependencies (only if needed)
if not exist node_modules (
  echo Installing dependencies...
  npm install
)
echo Starting Orian server...
node server.js
pause
