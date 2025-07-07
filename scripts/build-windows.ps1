# Windows-specific build script to handle Prisma file locking issues
# Run this script if you encounter EPERM errors during build

Write-Host "Starting Windows-specific build process..." -ForegroundColor Green

# Function to safely remove directories with retry logic
function Remove-DirectoryWithRetry {
    param(
        [string]$Path,
        [int]$MaxRetries = 3,
        [int]$DelaySeconds = 2
    )
    
    for ($i = 1; $i -le $MaxRetries; $i++) {
        try {
            if (Test-Path $Path) {
                Write-Host "Attempting to remove $Path (attempt $i/$MaxRetries)..." -ForegroundColor Yellow
                Remove-Item -Path $Path -Recurse -Force -ErrorAction Stop
                Write-Host "Successfully removed $Path" -ForegroundColor Green
                return $true
            } else {
                Write-Host "$Path does not exist, skipping..." -ForegroundColor Gray
                return $true
            }
        }
        catch {
            Write-Host "Failed to remove $Path (attempt $i/$MaxRetries): $($_.Exception.Message)" -ForegroundColor Red
            if ($i -lt $MaxRetries) {
                Write-Host "Waiting $DelaySeconds seconds before retry..." -ForegroundColor Yellow
                Start-Sleep -Seconds $DelaySeconds
            }
        }
    }
    return $false
}

# Function to kill processes that might be locking Prisma files
function Stop-PrismaProcesses {
    Write-Host "Checking for processes that might be locking Prisma files..." -ForegroundColor Yellow
    
    $processNames = @("node", "next", "prisma", "query-engine*")
    
    foreach ($processName in $processNames) {
        try {
            $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
            if ($processes) {
                Write-Host "Found $($processes.Count) $processName process(es), attempting to stop..." -ForegroundColor Yellow
                $processes | Stop-Process -Force -ErrorAction SilentlyContinue
                Start-Sleep -Seconds 1
            }
        }
        catch {
            # Ignore errors when stopping processes
        }
    }
}

# Main build process
try {
    # Step 1: Stop any processes that might be locking files
    Stop-PrismaProcesses
    
    # Step 2: Clean Prisma generated files
    Write-Host "Cleaning Prisma generated files..." -ForegroundColor Yellow
    
    $prismaDirectories = @(
        "node_modules\.prisma",
        "prisma\generated",
        ".next"
    )
    
    foreach ($dir in $prismaDirectories) {
        Remove-DirectoryWithRetry -Path $dir
    }
    
    # Step 3: Clear npm cache
    Write-Host "Clearing npm cache..." -ForegroundColor Yellow
    npm cache clean --force
    
    # Step 4: Generate Prisma client
    Write-Host "Generating Prisma client..." -ForegroundColor Yellow
    $env:PRISMA_GENERATE_SKIP_AUTOINSTALL = "true"
    npm run prisma:generate
    
    if ($LASTEXITCODE -ne 0) {
        throw "Prisma generation failed"
    }
    
    # Step 5: Build Next.js application
    Write-Host "Building Next.js application..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        throw "Next.js build failed"
    }
    
    Write-Host "Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Build failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Try the following manual steps:" -ForegroundColor Yellow
    Write-Host "1. Close all terminals and IDEs" -ForegroundColor White
    Write-Host "2. Delete node_modules\.prisma folder manually" -ForegroundColor White
    Write-Host "3. Run: npm run prisma:generate" -ForegroundColor White
    Write-Host "4. Run: npm run build" -ForegroundColor White
    exit 1
}
