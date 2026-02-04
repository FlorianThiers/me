# Check Post Status Script
# Verifies if a post exists and gets its details

param(
    [Parameter(Mandatory=$true)]
    [string]$PostId
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
}

Write-Host "Checking post: $PostId"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/posts/$PostId" -Headers $headers -UseBasicParsing
    $post = $response.Content | ConvertFrom-Json
    
    if ($post.success) {
        Write-Host "SUCCESS: Post found!"
        Write-Host "   Title: $($post.post.title)"
        Write-Host "   Author: $($post.post.author.name)"
        Write-Host "   Upvotes: $($post.post.upvotes)"
        Write-Host "   Comments: $($post.post.comment_count)"
        Write-Host "   Created: $($post.post.created_at)"
        Write-Host ""
        Write-Host "Post URL: https://www.moltbook.com/p/$PostId"
        Write-Host "Profile URL: https://www.moltbook.com/u/$($post.post.author.name)"
    } else {
        Write-Host "ERROR: Post not found or access denied"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Status $statusCode"
    $errorResponse = $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
}
