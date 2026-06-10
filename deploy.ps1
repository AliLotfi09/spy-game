$script:ConfigPath = "config.json"

function Write-Log {
    param([Parameter(Mandatory=$true)][string]$Message, [Parameter(Mandatory=$true)][ValidateSet("INFO","SUCCESS","WARNING","ERROR")][string]$Level)
    $colors = @{"ERROR"="Red";"SUCCESS"="Green";"WARNING"="Yellow";"INFO"="White"}
    Write-Host "[$(Get-Date -Format HH:mm:ss)] [$Level] $Message" -ForegroundColor $colors[$Level]
}

function Show-AnimatedLoading {
    param([string]$Message="Processing...",[int]$DurationMs=2000,[char[]]$Frames=@('|','/','-','\'))
    $start = Get-Date; $i=0
    while ((Get-Date) -lt $start.AddMilliseconds($DurationMs)) {
        Write-Host "`r$Message $($Frames[$i % $Frames.Length])" -NoNewline -ForegroundColor Cyan; Start-Sleep -Milliseconds 100; $i++
    }
    Write-Host ""
}

function Save-Config { param([hashtable]$config); $config | ConvertTo-Json -Depth 10 | Set-Content -Path $script:ConfigPath -Encoding UTF8 }

function Load-Config {
    if (-not (Test-Path $script:ConfigPath)) { return $null }
    try {
        $content = Get-Content -Path $script:ConfigPath -Raw -Encoding UTF8 -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($content)) { return $null }
        $json = $content | ConvertFrom-Json -ErrorAction Stop
        $hashtable = @{}
        foreach ($prop in $json.PSObject.Properties) {
            $hashtable[$prop.Name] = $prop.Value
        }
        return $hashtable
    } catch {
        Write-Log "Config file corrupted: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Prompt-Config {
    Clear-Host
    Write-Host ""
    Write-Host "Smart cPanel Deployer v3.0 - Configuration Input"
    Write-Host "================================================"
    Write-Host "Please enter your deployment configuration (press Enter to use default values shown in parentheses)."
    Write-Host ""

    $config = @{
        ProjectRoot     = Read-Host "  Project root path (default: $PSScriptRoot)"
        BuildFolder     = Read-Host "  Build folder (default: dist)"
        ZipFileName     = Read-Host "  ZIP filename (default: travel.zip)"
        FtpHost         = Read-Host "  FTP host (e.g. 45.89.237.80)"
        RemoteUser      = Read-Host "  FTP username (e.g. TravelUsr@travel.politest.ir)"
        FtpPassword     = Read-Host "  FTP password (hidden)"
        RemotePath      = Read-Host "  Remote path on server (default: .)"
        ExtractScriptUrl = Read-Host "  Extraction script URL (e.g. http://travel.politest.ir/extract.php)"
    }
    if ([string]::IsNullOrWhiteSpace($config.ProjectRoot)) { $config.ProjectRoot = $PSScriptRoot }
    if ([string]::IsNullOrWhiteSpace($config.BuildFolder)) { $config.BuildFolder = "dist" }
    if ([string]::IsNullOrWhiteSpace($config.ZipFileName)) { $config.ZipFileName = "travel.zip" }
    if ([string]::IsNullOrWhiteSpace($config.RemotePath)) { $config.RemotePath = "." }
    Save-Config $config
    Write-Host ""
    Write-Host "Configuration saved successfully to config.json"
    Write-Host ""
    return $config
}

function Create-Archive {
    param([hashtable]$config)
    Write-Log "Creating archive..." "INFO"; Show-AnimatedLoading "Preparing build files..."
    $buildFolder = Join-Path $config.ProjectRoot $config.BuildFolder
    if (Test-Path $buildFolder) { Remove-Item "$buildFolder\*" -Recurse -Force -ErrorAction SilentlyContinue } else { New-Item -ItemType Directory -Path $buildFolder | Out-Null }
    Write-Log "Running build..." "INFO"; Set-Location $config.ProjectRoot
    if (-not (Get-Command "bun" -ErrorAction SilentlyContinue)) { Write-Log "bun command not found." "ERROR"; return $false }
    $out = & bun run build 2>&1; if ($LASTEXITCODE -ne 0) { Write-Log "Build failed: $out" "ERROR"; return $false }
    $zipPath = Join-Path $config.ProjectRoot $config.ZipFileName; $success = $false
    for ($i=1; $i -le 3; $i++) {
        Write-Log "Attempt $i of 3..." "INFO"
        try {
            if (-not (Test-Path $buildFolder) -or (Get-ChildItem $buildFolder -Force | Measure-Object).Count -eq 0) { throw "Empty folder" }
            Compress-Archive -Path "$buildFolder\*" -DestinationPath $zipPath -Force -ErrorAction Stop
            Write-Log "Archive created: $zipPath" "SUCCESS"; $success = $true; break
        } catch { Write-Log "Attempt $i failed: $($_.Exception.Message)" "WARNING"; if ($i -lt 3) { Start-Sleep -Seconds 3 } }
    }
    return $success
}

function Upload-To-Host {
    param([hashtable]$config, [string]$LocalFilePath)
    Write-Log "Uploading via FTP..." "INFO"
    
    $remotePath = if ($config.RemotePath -eq "." -or [string]::IsNullOrEmpty($config.RemotePath)) { 
        $config.ZipFileName 
    } else { 
        "$($config.RemotePath)/$($config.ZipFileName)" 
    }
    
    $ftpUri = "ftp://$($config.FtpHost)/$remotePath"
    
    try {
        $webClient = New-Object System.Net.WebClient
        $webClient.Credentials = New-Object System.Net.NetworkCredential($config.RemoteUser, $config.FtpPassword)
        
        Write-Log "Uploading to: $ftpUri" "INFO"
        $webClient.UploadFile($ftpUri, "STOR", $LocalFilePath)
        
        Write-Log "FTP upload completed successfully" "SUCCESS"
        return $true
        
    } catch {
        Write-Log "FTP failed: $($_.Exception.Message)" "ERROR"
        Write-Log "Please check your FTP credentials in config.json" "WARNING"
        return $false
    }
}

function Extract-On-Host {
    param([hashtable]$config)
    Write-Log "Requesting extraction..." "INFO"
    
    $filePath = $config.ZipFileName
    
    $url = "$($config.ExtractScriptUrl)?file=$filePath"
    Write-Log "Calling: $url" "INFO"
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $resp = $response.Content.Trim()
        
        Write-Log "Server response: $resp" "INFO"
        
        if ($resp -eq "SUCCESS") { 
            Write-Log "Extraction OK." "SUCCESS"
            return $true 
        } else { 
            throw "Bad response: $resp" 
        }
        
    } catch {
        Write-Log "Extraction failed: $($_.Exception.Message)" "ERROR"
        return $false
    }
}

# Main
Write-Host ""
Write-Host "Smart cPanel Deployer v3.0"
Write-Host "================================"
Write-Host ""

$autoMode = $args -contains "--auto"
$config = Load-Config
if (-not $config) {
    if ($autoMode) { Write-Log "Config missing with --auto." "ERROR"; exit 1 }
    $config = Prompt-Config
}

try { Set-Location $config.ProjectRoot -ErrorAction Stop } catch { Write-Log "Dir error: $($_.Exception.Message)" "ERROR"; exit 1 }

if (Create-Archive $config) {
    if (Upload-To-Host $config (Join-Path $config.ProjectRoot $config.ZipFileName)) {
        if (Extract-On-Host $config) {
            Write-Host ""
            Write-Host "Deployment completed successfully!"
            Write-Host ""
        } else { Write-Log "Deploy failed at extraction." "ERROR"; exit 1 }
    } else { Write-Log "Deploy failed at FTP." "ERROR"; exit 1 }
} else { Write-Log "Deploy failed at archive." "ERROR"; exit 1 }