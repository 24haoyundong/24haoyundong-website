$dataDir = Join-Path $PSScriptRoot "outputs\data"
$configPath = Join-Path $dataDir "admin-config.json"

function Convert-SecureStringToText($secureText) {
  $ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureText)
  try {
    [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
  }
}

Write-Host ""
Write-Host "修改网站管理后台密码"
Write-Host "账号默认是：admin"
Write-Host ""

$user = Read-Host "请输入后台账号，直接回车就是 admin"
if ([string]::IsNullOrWhiteSpace($user)) {
  $user = "admin"
}

$password1 = Convert-SecureStringToText (Read-Host "请输入新密码" -AsSecureString)
$password2 = Convert-SecureStringToText (Read-Host "请再输入一次新密码" -AsSecureString)

if ([string]::IsNullOrWhiteSpace($password1)) {
  Write-Host "密码不能为空，未修改。"
  exit 1
}

if ($password1 -ne $password2) {
  Write-Host "两次密码不一致，未修改。"
  exit 1
}

New-Item -ItemType Directory -Force -Path $dataDir | Out-Null
$config = @{
  user = $user
  pass = $password1
}
$config | ConvertTo-Json | Set-Content -Path $configPath -Encoding UTF8

Write-Host ""
Write-Host "后台密码已修改。"
Write-Host "请关闭网站启动窗口，然后重新双击 start-website.bat。"
