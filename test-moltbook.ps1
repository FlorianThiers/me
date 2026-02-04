# Moltbook Test Script
# Tests various Moltbook API endpoints

# Load credentials
$credentialsPath = "$env:USERPROFILE\.config\moltbook\credentials.json"
if (Test-Path $credentialsPath) {
    $credentials = Get-Content $credentialsPath | ConvertFrom-Json
    $apiKey = $credentials.api_key
    $agentName = $credentials.agent_name
} else {
    Write-Host "❌ Credentials not found at $credentialsPath"
    Write-Host "Please run save-credentials.ps1 first"
    exit 1
}

$baseUrl = "https://www.moltbook.com/api/v1"
$headers = @{
    "Authorization" = "Bearer $apiKey"
}

Write-Host "🧪 Testing Moltbook API for agent: $agentName"
Write-Host "=" * 60
Write-Host ""

# Test 1: Check agent status
Write-Host "1️⃣ Checking agent status..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/agents/status" -Headers $headers -UseBasicParsing
    $status = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($status.status)"
    if ($status.status -eq "claimed") {
        Write-Host "   ✅ Agent is claimed and ready to use!"
    } else {
        Write-Host "   ⏳ Agent is pending claim. Status: $($status.status)"
        Write-Host "   Send the claim URL to your human to complete registration."
    }
} catch {
    Write-Host "   ❌ Error checking status: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: Get agent profile
Write-Host "2️⃣ Getting agent profile..."
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/agents/me" -Headers $headers -UseBasicParsing
    $profile = $response.Content | ConvertFrom-Json
    Write-Host "   Name: $($profile.agent.name)"
    Write-Host "   Description: $($profile.agent.description)"
    Write-Host "   Karma: $($profile.agent.karma)"
    Write-Host "   Followers: $($profile.agent.follower_count)"
    Write-Host "   Following: $($profile.agent.following_count)"
    Write-Host "   Is Claimed: $($profile.agent.is_claimed)"
    Write-Host "   ✅ Profile retrieved successfully!"
} catch {
    Write-Host "   ❌ Error getting profile: $($_.Exception.Message)"
}
Write-Host ""

# Test 3: Get feed (only if claimed)
if ($status.status -eq "claimed") {
    Write-Host "3️⃣ Getting personalized feed..."
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/feed?sort=hot&limit=5" -Headers $headers -UseBasicParsing
        $feed = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($feed.posts.Count) posts in feed"
        if ($feed.posts.Count -gt 0) {
            Write-Host "   Latest post: $($feed.posts[0].title)"
            Write-Host "   ✅ Feed retrieved successfully!"
        }
    } catch {
        Write-Host "   ❌ Error getting feed: $($_.Exception.Message)"
    }
    Write-Host ""
    
    # Test 4: Get latest posts globally
    Write-Host "4️⃣ Getting latest posts globally..."
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/posts?sort=new&limit=5" -Headers $headers -UseBasicParsing
        $posts = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($posts.posts.Count) recent posts"
        if ($posts.posts.Count -gt 0) {
            Write-Host "   Most recent: $($posts.posts[0].title) by $($posts.posts[0].author.name)"
            Write-Host "   ✅ Posts retrieved successfully!"
        }
    } catch {
        Write-Host "   ❌ Error getting posts: $($_.Exception.Message)"
    }
    Write-Host ""
    
    # Test 5: List submolts (communities)
    Write-Host "5️⃣ Listing available communities (submolts)..."
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/submolts" -Headers $headers -UseBasicParsing
        $submolts = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($submolts.submolts.Count) communities"
        if ($submolts.submolts.Count -gt 0) {
            Write-Host "   Communities:"
            $submolts.submolts | Select-Object -First 5 | ForEach-Object {
                Write-Host "     - $($_.display_name) ($($_.name)) - $($_.subscriber_count) subscribers"
            }
            Write-Host "   ✅ Submolts retrieved successfully!"
        }
    } catch {
        Write-Host "   ❌ Error getting submolts: $($_.Exception.Message)"
    }
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping feed/posts tests - agent not yet claimed"
    Write-Host ""
}

Write-Host "=" * 60
Write-Host "✅ Testing complete!"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  - If not claimed: Send claim URL to your human"
Write-Host "  - If claimed: You can now post, comment, and interact!"
Write-Host "  - Check MOLTBOOK_INFO.md for more API examples"
