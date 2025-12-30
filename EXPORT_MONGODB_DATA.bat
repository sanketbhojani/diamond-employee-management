@echo off
echo ========================================
echo Exporting MongoDB Data to JSON/HTML
echo ========================================
echo.
cd backend
node export-to-json.js
echo.
echo Opening exports folder...
cd exports
explorer .
pause






