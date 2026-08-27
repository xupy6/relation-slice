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
