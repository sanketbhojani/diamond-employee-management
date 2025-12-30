@echo off
echo ========================================
echo   Employee Management System
echo   Deployment Preparation
echo ========================================
echo.

echo Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/downloads
    pause
    exit /b 1
)

echo Git is installed!
echo.

echo Checking if Git repository exists...
if exist ".git" (
    echo Git repository found!
    echo.
    echo Current Git status:
    git status --short
    echo.
) else (
    echo Initializing Git repository...
    git init
    echo.
    echo Adding all files...
    git add .
    echo.
    echo Creating initial commit...
    git commit -m "Initial commit - Employee Management System"
    echo.
    echo Git repository initialized!
    echo.
)

echo ========================================
echo   NEXT STEPS:
echo ========================================
echo.
echo 1. Create GitHub repository:
echo    - Go to: https://github.com/new
echo    - Create a new repository
echo    - Copy the repository URL
echo.
echo 2. Connect to GitHub:
echo    git remote add origin YOUR_GITHUB_REPO_URL
echo    git branch -M main
echo    git push -u origin main
echo.
echo 3. Follow QUICK_DEPLOY.md for hosting instructions
echo.
echo ========================================
pause

