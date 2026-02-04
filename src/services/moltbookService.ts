import { getMoltbookApiKey, MOLTBOOK_CONFIG } from '../config/moltbook';

export interface MoltbookPost {
  id: string;
  title: string;
  content: string;
  url?: string;
  author: {
    name: string;
    id: string;
  };
  submolt: string | { id?: string; name: string; display_name?: string };
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface MoltbookComment {
  id: string;
  content: string;
  author: {
    name: string;
    id: string;
  };
  upvotes: number;
  downvotes: number;
  created_at: string;
  parent_id?: string;
  replies?: MoltbookComment[];
}

export interface MoltbookAgent {
  name: string;
  id: string;
  description?: string;
  karma: number;
  follower_count: number;
  following_count: number;
  is_claimed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Helper to make authenticated API calls
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const apiKey = getMoltbookApiKey();
  
  if (!apiKey) {
    return {
      success: false,
      error: 'Moltbook API key niet geconfigureerd. Voeg je API key toe in de instellingen.'
    };
  }

  try {
    const response = await fetch(`${MOLTBOOK_CONFIG.BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return {
      success: true,
      data: data as T
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Onbekende fout opgetreden'
    };
  }
};

/**
 * Get agent profile
 */
export const getAgentProfile = async (): Promise<ApiResponse<{ agent: MoltbookAgent }>> => {
  return makeRequest<{ agent: MoltbookAgent }>('/agents/me');
};

/**
 * Update agent profile (name, description, etc.)
 * Note: Moltbook API may not support profile updates via API
 * This function attempts PUT, but may need to be done via website
 */
export const updateAgentProfile = async (
  name?: string,
  _description?: string
): Promise<ApiResponse<{ agent: MoltbookAgent }>> => {
  // The Moltbook API doesn't support updating agent profile via API
  // We've tried PUT and PATCH, both return 405 Method Not Allowed
  // The only way to change the name is to register a new agent
  return {
    success: false,
    error: `Het wijzigen van de naam via de API wordt niet ondersteund. Om de naam te wijzigen naar "${name || 'Mandelbrot'}", moet je een nieuwe agent registreren met het script: register-mandelbrot.ps1`
  };
};

/**
 * Create a new post (question)
 */
export const createPost = async (
  title: string,
  content: string,
  submolt: string = 'general',
  url?: string
): Promise<ApiResponse<{ post: MoltbookPost }>> => {
  const body: any = {
    title,
    content,
    submolt
  };

  if (url) {
    body.url = url;
  }

  return makeRequest<{ post: MoltbookPost }>('/posts', {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * Get latest posts
 */
export const getPosts = async (
  sort: 'new' | 'hot' | 'top' = 'new',
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<{ posts: MoltbookPost[] }>> => {
  return makeRequest<{ posts: MoltbookPost[] }>(`/posts?sort=${sort}&limit=${limit}&offset=${offset}`);
};

/**
 * Get a specific post by ID
 */
export const getPost = async (postId: string): Promise<ApiResponse<{ post: MoltbookPost }>> => {
  return makeRequest<{ post: MoltbookPost }>(`/posts/${postId}`);
};

/**
 * Get all comments for multiple posts
 */
export const getCommentsForPosts = async (
  postIds: string[]
): Promise<ApiResponse<Record<string, MoltbookComment[]>>> => {
  const commentsMap: Record<string, MoltbookComment[]> = {};
  
  for (const postId of postIds) {
    const response = await getComments(postId, 'new');
    if (response.success && response.data) {
      commentsMap[postId] = response.data.comments;
    }
    // Small delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return {
    success: true,
    data: commentsMap
  };
};

/**
 * Get comments for a post
 */
export const getComments = async (
  postId: string,
  sort: 'top' | 'new' = 'top'
): Promise<ApiResponse<{ comments: MoltbookComment[] }>> => {
  return makeRequest<{ comments: MoltbookComment[] }>(`/posts/${postId}/comments?sort=${sort}`);
};

/**
 * Add a comment (answer) to a post
 */
export const addComment = async (
  postId: string,
  content: string,
  parentId?: string
): Promise<ApiResponse<{ comment: MoltbookComment }>> => {
  const body: any = {
    content
  };

  if (parentId) {
    body.parent_id = parentId;
  }

  return makeRequest<{ comment: MoltbookComment }>(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
};

/**
 * Get personalized feed
 */
export const getFeed = async (
  sort: 'new' | 'hot' | 'top' = 'hot',
  limit: number = 20,
  offset: number = 0
): Promise<ApiResponse<{ posts: MoltbookPost[] }>> => {
  return makeRequest<{ posts: MoltbookPost[] }>(`/feed?sort=${sort}&limit=${limit}&offset=${offset}`);
};

/**
 * Get available communities (submolts)
 */
export const getSubmolts = async (): Promise<ApiResponse<{ submolts: Array<{ name: string; display_name: string; subscriber_count: number }> }>> => {
  return makeRequest<{ submolts: Array<{ name: string; display_name: string; subscriber_count: number }> }>('/submolts');
};

/**
 * Get posts by a specific agent
 */
export const getAgentPosts = async (
  agentName: string,
  sort: 'new' | 'hot' | 'top' = 'new',
  limit: number = 20
): Promise<ApiResponse<{ posts: MoltbookPost[] }>> => {
  // The Moltbook API doesn't have a direct endpoint for agent posts
  // So we'll get all posts and filter by author name
  // We'll fetch posts in batches until we find enough or run out
  const allPosts: MoltbookPost[] = [];
  const batchSize = 100;
  let offset = 0;
  let foundEnough = false;
  const maxBatches = 20; // Search through 2000 posts max (increased to find more posts)
  
  console.log(`🔍 Searching for posts by agent: ${agentName}`);
  
  while (!foundEnough && offset < maxBatches * batchSize) {
    // Try with offset first, if that fails, try without offset (some APIs don't support it)
    let batchResponse = await getPosts(sort, batchSize, offset);
    
    // If we get a 500 error, the offset is probably too high - stop searching
    if (!batchResponse.success && (batchResponse.error?.includes('500') || batchResponse.error?.includes('Internal Server Error'))) {
      console.log(`⚠️ Server error at offset ${offset} - stopping search (likely reached end or offset too high)`);
      console.log(`   Found ${allPosts.length} posts so far`);
      break;
    }
    
    // If offset doesn't work and we're past the first batch, stop
    if (!batchResponse.success && offset > 0) {
      console.log(`⚠️ Offset not supported or failed at offset ${offset}`);
      console.log(`   Found ${allPosts.length} posts so far. The API may not support pagination.`);
      break;
    }
    
    // If first batch fails, try without offset parameter
    if (!batchResponse.success && offset === 0) {
      console.log(`⚠️ First batch failed, trying without offset parameter`);
      batchResponse = await getPosts(sort, batchSize);
    }
    
    if (!batchResponse.success || !batchResponse.data) {
      console.log(`⚠️ Failed to fetch batch at offset ${offset}`);
      break;
    }
    
    const batchPosts = batchResponse.data.posts;
    console.log(`📦 Fetched batch ${offset / batchSize + 1}: ${batchPosts.length} posts`);
    
    if (batchPosts.length === 0) {
      console.log(`📭 No more posts available`);
      break;
    }
    
    // Filter posts by agent name
    const matchingPosts = batchPosts.filter(post => {
      const authorName = typeof post.author === 'string' 
        ? post.author 
        : (post.author?.name || '');
      
      // Try multiple matching strategies
      const exactMatch = authorName.toLowerCase().trim() === agentName.toLowerCase().trim();
      const includesMatch = authorName.toLowerCase().includes(agentName.toLowerCase()) || 
                          agentName.toLowerCase().includes(authorName.toLowerCase());
      
      // Debug: log first few posts to see author structure
      if (batchPosts.indexOf(post) < 5) {
        console.log(`  📋 Post: "${post.title}" | Author: "${authorName}" (type: ${typeof post.author}) | Looking for: "${agentName}"`);
        console.log(`     Author object:`, post.author);
      }
      
      if (exactMatch || includesMatch) {
        console.log(`✅ Found matching post: "${post.title}" by ${authorName} (exact: ${exactMatch}, includes: ${includesMatch})`);
      }
      
      return exactMatch || includesMatch;
    });
    
    allPosts.push(...matchingPosts);
    
    // If we found enough posts, stop
    if (allPosts.length >= limit) {
      foundEnough = true;
      console.log(`🎯 Found enough posts (${allPosts.length}), stopping search`);
      break;
    }
    
    // If this batch had fewer posts than requested, we've reached the end
    if (batchPosts.length < batchSize) {
      console.log(`📭 Reached end of posts (got ${batchPosts.length} < ${batchSize})`);
      break;
    }
    
    offset += batchSize;
  }
  
  console.log(`✅ Total posts found for ${agentName}: ${allPosts.length}`);
  
  // Sort the posts based on the sort parameter
  if (sort === 'new') {
    allPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === 'hot') {
    allPosts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
  } else if (sort === 'top') {
    allPosts.sort((a, b) => b.upvotes - a.upvotes);
  }
  
  return {
    success: true,
    data: { posts: allPosts.slice(0, limit) }
  };
};

/**
 * Get own posts (posts by the authenticated agent)
 */
export const getMyPosts = async (
  sort: 'new' | 'hot' | 'top' = 'new',
  limit: number = 20
): Promise<ApiResponse<{ posts: MoltbookPost[] }>> => {
  // First get agent profile to get agent name
  const profileResponse = await getAgentProfile();
  if (!profileResponse.success || !profileResponse.data) {
    return {
      success: false,
      error: 'Kon agent profiel niet ophalen'
    };
  }
  
  const agentName = profileResponse.data.agent.name;
  console.log(`🔑 Getting posts for agent: ${agentName}`);
  
  // Try feed first (might have recent posts)
  console.log(`📰 Trying feed first...`);
  const feedResponse = await getFeed(sort, 200);
  if (feedResponse.success && feedResponse.data) {
    const feedPosts = feedResponse.data.posts;
    const ownPostsFromFeed = feedPosts.filter(post => {
      const authorName = typeof post.author === 'string' 
        ? post.author 
        : (post.author?.name || '');
      return authorName.toLowerCase().trim() === agentName.toLowerCase().trim();
    });
    
    if (ownPostsFromFeed.length > 0) {
      console.log(`✅ Found ${ownPostsFromFeed.length} own posts in feed`);
      return {
        success: true,
        data: { posts: ownPostsFromFeed.slice(0, limit) }
      };
    }
  }
  
  console.log(`📰 No posts in feed, searching all posts...`);
  // Use the improved getAgentPosts which searches through multiple batches
  return getAgentPosts(agentName, sort, limit);
};
