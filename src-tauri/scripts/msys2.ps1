$target = $args[0]
$downloadUrl = "https://mirrors.tuna.tsinghua.edu.cn/msys2/distrib/msys2-x86_64-latest.sfx.exe"
$mirror = 'sed -i "s#https\?://mirror.msys2.org/#https://mirrors.tuna.tsinghua.edu.cn/msys2/#g" /etc/pacman.d/mirrorlist*'

$installer = "$($env:TEMP)\msys2.exe"


if (!(Test-Path $installer -PathType Leaf)) {
  Write-Host "Download file to $($installer)"
  Invoke-WebRequest -Uri $downloadUrl -OutFile $installer 
}

& $installer "-y", "-o$($target)"

$msys2 = "$($target)/msys64/usr/bin/bash.exe"

& $msys2 "-l", "-c", $mirror
& $msys2 "-l", "-c", "pacman --noconfirm -S mingw-w64-ucrt-x86_64-clang-tools-extra mingw-w64-ucrt-x86_64-gcc"

Write-Host "Tools were installed to $($target)/msys64/ucrt64/bin"

$report = @{
  'gcc'    = "$($target)\msys64\ucrt64\bin\g++.exe"
  'clangd' = "$($target)\msys64\ucrt64\bin\clangd.exe"
}

# $report | ConvertTo-Json | Out-File "$($target)/msys2.json" -Encoding UTF8NoBOM 
$reportJson = $report | ConvertTo-Json
[IO.File]::WriteAllLines("$($target)\msys2.json", $reportJson)
Remove-Item $installer