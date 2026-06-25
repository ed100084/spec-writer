param(
  [Parameter(Mandatory = $true)]
  [string]$InputPath,

  [string]$OutputPath = "",

  [switch]$Recurse,

  [switch]$Overwrite
)

$ErrorActionPreference = "Stop"

$resolvedInput = Resolve-Path -LiteralPath $InputPath
$inputItem = Get-Item -LiteralPath $resolvedInput

if ($OutputPath -eq "") {
  $OutputPath = if ($inputItem.PSIsContainer) {
    Join-Path $inputItem.FullName "docx"
  } else {
    $inputItem.DirectoryName
  }
}

if (-not (Test-Path -LiteralPath $OutputPath)) {
  New-Item -ItemType Directory -Path $OutputPath | Out-Null
}

$searchRoot = if ($inputItem.PSIsContainer) { $inputItem.FullName } else { $inputItem.DirectoryName }
$files = if ($inputItem.PSIsContainer) {
  Get-ChildItem -LiteralPath $searchRoot -Filter "*.doc" -File -Recurse:$Recurse |
    Where-Object { $_.Extension -ieq ".doc" -and $_.Name -notlike "~$*" }
} else {
  @($inputItem) | Where-Object { $_.Extension -ieq ".doc" }
}

if ($files.Count -eq 0) {
  Write-Host "No .doc files found."
  exit 0
}

$word = $null
$converted = 0
$skipped = 0
$failed = 0

try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  foreach ($file in $files) {
    $relativeDir = if ($inputItem.PSIsContainer) {
      $file.DirectoryName.Substring($searchRoot.Length).TrimStart("\")
    } else {
      ""
    }
    $targetDir = if ($relativeDir) { Join-Path $OutputPath $relativeDir } else { $OutputPath }
    if (-not (Test-Path -LiteralPath $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir | Out-Null
    }

    $targetFile = Join-Path $targetDir ($file.BaseName + ".docx")
    if ((Test-Path -LiteralPath $targetFile) -and -not $Overwrite) {
      Write-Host "SKIP  $($file.FullName)"
      $skipped++
      continue
    }

    $doc = $null
    try {
      Write-Host "CONVERT  $($file.FullName)"
      $doc = $word.Documents.Open($file.FullName, $false, $true)
      $doc.SaveAs2($targetFile, 16)
      $converted++
    } catch {
      Write-Warning "FAILED $($file.FullName): $($_.Exception.Message)"
      $failed++
    } finally {
      if ($doc -ne $null) {
        $doc.Close($false)
      }
    }
  }
} finally {
  if ($word -ne $null) {
    $word.Quit()
  }
}

Write-Host ""
Write-Host "Converted: $converted"
Write-Host "Skipped:   $skipped"
Write-Host "Failed:    $failed"
Write-Host "Output:    $OutputPath"

if ($failed -gt 0) {
  exit 1
}
