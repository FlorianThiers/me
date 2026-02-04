# Get Comments Script
# Retrieves comments for a specific post

param(
    [Parameter(Mandatory=$true)]
    [string]$PostId,
    
    [string]$Sort = "top"
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

Write-Host "Getting comments for post: $PostId"
Write-Host "Sort: $Sort"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/posts/$PostId/comments?sort=$Sort" -Headers $headers -UseBasicParsing
    $comments = $response.Content | ConvertFrom-Json
    
    if ($comments.success) {
        Write-Host "Found $($comments.comments.Count) comments:"
        Write-Host "=" * 60
        Write-Host ""
        
        foreach ($comment in $comments.comments) {
            Write-Host "Author: $($comment.author.name)"
            Write-Host "Content: $($comment.content)"
            Write-Host "Upvotes: $($comment.upvotes) | Downvotes: $($comment.downvotes)"
            Write-Host "Created: $($comment.created_at)"
            Write-Host "Comment ID: $($comment.id)"
            Write-Host "-" * 60
            Write-Host ""
        }
    } else {
        Write-Host "ERROR: $($comments.error)"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "ERROR: Status $statusCode"
    $errorResponse = $_.Exception.Response
    $reader = New-Object System.IO.StreamReader($errorResponse.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    Write-Host $responseBody
}
