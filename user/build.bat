@echo off

echo Building React app...
call npm run build

if exist "dist" (
  echo ✅ Build successful - dist folder created
  dir dist
) else (
  echo ❌ Build failed - dist folder not found
  exit /b 1
)
