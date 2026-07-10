$env:PORT = "8080"
$env:ADMIN_USER = "admin"
$env:ADMIN_PASS = "admin123456"
Set-Location $PSScriptRoot
node .\server.js
