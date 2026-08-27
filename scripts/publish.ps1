param(
  [Parameter(Position = 0)]
  [string]$Message = "chore: update project"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  throw "Run this script from the repository root."
}

$branch = git branch --show-current
if (-not $branch) {
  throw "Cannot determine current git branch."
}

$origin = git remote get-url origin 2>$null
if (-not $origin) {
  throw "Remote 'origin' is not configured. Add it first with: git remote add origin <repo-url>"
}

git add -A -- . ":(exclude)picture"

$pending = git status --porcelain
if (-not $pending) {
  Write-Host "No changes to commit."
  exit 0
}

git commit -m $Message

git push -u origin $branch
if ($LASTEXITCODE -eq 0) {
  exit 0
}

Write-Host "Direct push failed. Trying GitHub proxy fallback..."

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "GitHub CLI is required for proxy fallback. Install gh or fix network access to github.com."
}

$token = gh auth token
if (-not $token) {
  throw "GitHub CLI is not authenticated. Run: gh auth login"
}

$proxyUrl = $origin -replace "^https://github.com/", "https://gh-proxy.com/https://github.com/"
if ($proxyUrl -eq $origin) {
  throw "Proxy fallback only supports HTTPS GitHub remotes."
}

$pair = "x-access-token:$token"
$bytes = [System.Text.Encoding]::ASCII.GetBytes($pair)
$basic = [Convert]::ToBase64String($bytes)
$header = "Authorization: Basic $basic"

git -c http.extraHeader="$header" push $proxyUrl "${branch}:${branch}"
if ($LASTEXITCODE -ne 0) {
  throw "Proxy push failed."
}

git update-ref "refs/remotes/origin/$branch" HEAD
git branch --set-upstream-to="origin/$branch" $branch
