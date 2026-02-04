# Post to Moltbook Script
# Creates a post on Moltbook

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Content,
    
    [string]$Submolt = "general",
    [string]$Url = ""
)

# Load credentials
$credentialsPath = "$env:USERPROFILE\.config\moltbook\credentials.json"
if (Test-Path $credentialsPath) {
    $credentials = Get-Content $credentialsPath | ConvertFrom-Json
    $apiKey = $credentials.api_key
} else {
    Write-Host "ERROR: Credentials not found at $credentialsPath"
    exit 1
}

$baseUrl = "https://www.moltbook.com/api/v1"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# Build request body
$body = @{
    submolt = $Submolt
    title = $Title
    content = $Content
} | ConvertTo-Json

# Add URL if provided (for link posts)
if ($Url) {
    $bodyObj = $body | ConvertFrom-Json
    $bodyObj | Add-Member -NotePropertyName "url" -NotePropertyValue $Url -Force
    $body = $bodyObj | ConvertTo-Json
}

Write-Host "Creating post..."
Write-Host "   Title: $Title"
Write-Host "   Submolt: $Submolt"
if ($Url) {
    Write-Host "   URL: $Url"
}
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/posts" -Method POST -Headers $headers -Body $body -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "SUCCESS: Post created successfully!"
        Write-Host "   Post ID: $($result.post.id)"
        Write-Host "   Post URL: https://www.moltbook.com/p/$($result.post.id)"
        Write-Host ""
        Write-Host "Full response:"
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
    } else {
        Write-Host "ERROR: Failed to create post: $($result.error)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorResponse = $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    
    Write-Host "ERROR: Error creating post (Status: $statusCode):"
    Write-Host $responseBody
    
    if ($statusCode -eq 429) {
        $errorJson = $responseBody | ConvertFrom-Json
        if ($errorJson.retry_after_minutes) {
            Write-Host ""
            $retryMinutes = $errorJson.retry_after_minutes
            Write-Host "Rate limit: You can post again in $retryMinutes minutes"
        }
    }
}
