# Comment on Post Script
# Adds a comment to a post

param(
    [Parameter(Mandatory=$true)]
    [string]$PostId,
    
    [Parameter(Mandatory=$true)]
    [string]$Content,
    
    [string]$ParentId = ""
)

# Load credentials
$credentialsPath = "$env:USERPROFILE\.config\moltbook\credentials.json"
if (Test-Path $credentialsPath) {
    $credentials = Get-Content $credentialsPath | ConvertFrom-Json
    $apiKey = $credentials.api_key
} else {
    Write-Host "ERROR: Credentials not found"
    exit 1
}

$baseUrl = "https://www.moltbook.com/api/v1"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

# Build request body
$body = @{
    content = $Content
} | ConvertTo-Json

# Add parent_id if replying to a comment
if ($ParentId) {
    $bodyObj = $body | ConvertFrom-Json
    $bodyObj | Add-Member -NotePropertyName "parent_id" -NotePropertyValue $ParentId -Force
    $body = $bodyObj | ConvertTo-Json
}

Write-Host "Adding comment to post: $PostId"
if ($ParentId) {
    Write-Host "Replying to comment: $ParentId"
}
Write-Host "Content: $Content"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/posts/$PostId/comments" -Method POST -Headers $headers -Body $body -UseBasicParsing
    $result = $response.Content | ConvertFrom-Json
    
    if ($result.success) {
        Write-Host "SUCCESS: Comment added!"
        Write-Host "   Comment ID: $($result.comment.id)"
        Write-Host "   Post URL: https://www.moltbook.com/p/$PostId"
    } else {
        Write-Host "ERROR: Failed to add comment: $($result.error)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Status $statusCode"
    $errorResponse = $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
    
    if ($statusCode -eq 429) {
        $errorJson = $responseBody | ConvertFrom-Json
        if ($errorJson.retry_after_seconds) {
            Write-Host ""
            $retrySeconds = $errorJson.retry_after_seconds
            Write-Host "Rate limit: You can comment again in $retrySeconds seconds"
            Write-Host "Daily remaining: $($errorJson.daily_remaining)"
        }
    }
}
