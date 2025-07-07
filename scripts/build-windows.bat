@echo off
REM Windows batch script to handle Prisma build issues
REM Run this if you encounter EPERM errors during build

echo Starting Windows-specific build process...

REM Kill any Node.js processes that might be locking files
echo Stopping Node.js processes...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im next.exe >nul 2>&1
timeout /t 2 >nul

REM Clean Prisma generated files
echo Cleaning Prisma generated files...
if exist "node_modules\.prisma" (
    echo Removing node_modules\.prisma...
    rmdir /s /q "node_modules\.prisma" 2>nul
)

if exist "prisma\generated" (
    echo Removing prisma\generated...
    rmdir /s /q "prisma\generated" 2>nul
)

if exist ".next" (
    echo Removing .next...
    rmdir /s /q ".next" 2>nul
)

REM Clear npm cache
echo Clearing npm cache...
npm cache clean --force

REM Generate Prisma client
echo Generating Prisma client...
set PRISMA_GENERATE_SKIP_AUTOINSTALL=true
npm run prisma:generate
if %errorlevel% neq 0 (
    echo Prisma generation failed!
    goto :error
)

REM Build Next.js application
echo Building Next.js application...
npm run build
if %errorlevel% neq 0 (
    echo Next.js build failed!
    goto :error
)

echo Build completed successfully!
goto :end

:error
echo Build failed! Try these manual steps:
echo 1. Close all terminals and IDEs
echo 2. Delete node_modules\.prisma folder manually
echo 3. Run: npm run prisma:generate
echo 4. Run: npm run build
exit /b 1

:end
