Param(
  [Parameter(Mandatory = $true)]
  [string] $ProjectId,

  [Parameter(Mandatory = $false)]
  [string] $ApiBase = "http://localhost:3000/v1/api"
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$jsonPath = Join-Path $scriptDir "bugs-dashboard-seed.json"

if (-not (Test-Path $jsonPath)) {
  Write-Error "Could not find bugs-dashboard-seed.json next to the script."
  exit 1
}

Write-Host "Seeding bugs for project $ProjectId using $jsonPath" -ForegroundColor Cyan

$bugs = Get-Content $jsonPath -Raw | ConvertFrom-Json

foreach ($bug in $bugs) {
  $body = $bug | ConvertTo-Json -Depth 6
  try {
    $response = Invoke-RestMethod -Method Post -Uri "$ApiBase/projects/$ProjectId/bugs" -ContentType "application/json" -Body $body
    Write-Host "Created bug:" $response.bugId "-" $response.title
  }
  catch {
    Write-Warning "Failed to create bug '$($bug.title)': $($_.Exception.Message)"
  }
}

Write-Host "Done." -ForegroundColor Green

