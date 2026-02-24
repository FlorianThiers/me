import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  ArrowLeft, 
  Send, 
  MessageSquare, 
  RefreshCw, 
  Settings, 
  Eye, 
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
  Bot,
  Zap
} from 'lucide-react';
import { 
  createPost, 
  getPosts, 
  getComments, 
  addComment,
  getAgentProfile,
  updateAgentProfile,
  getSubmolts,
  getMyPosts,
  type MoltbookPost,
  type MoltbookComment
} from '../services/moltbookService';
import { getMoltbookApiKey, saveMoltbookApiKey } from '../config/moltbook';

export const MoltbookPage: React.FC = () => {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [agentProfile, setAgentProfile] = useState<any>(null);
  const [agentName, setAgentName] = useState<string | null>(null);
  
  // Post creation
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [selectedSubmolt, setSelectedSubmolt] = useState('general');
  const [submolts, setSubmolts] = useState<Array<{ name: string; display_name: string; subscriber_count: number }>>([]);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  
  // Posts list
  const [posts, setPosts] = useState<MoltbookPost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsSort, setPostsSort] = useState<'new' | 'hot' | 'top'>('new');
  const [postsView, setPostsView] = useState<'all' | 'my'>('my');
  
  // Comments
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, MoltbookComment[]>>({});
  const [isLoadingComments, setIsLoadingComments] = useState<Record<string, boolean>>({});
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [isPostingComment, setIsPostingComment] = useState<Record<string, boolean>>({});
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);
  const [isAutoReplying, setIsAutoReplying] = useState(false);
  const [autoReplyProgress, setAutoReplyProgress] = useState<string>('');

  // Load API key on mount
  useEffect(() => {
    const key = getMoltbookApiKey();
    if (key) {
      setApiKey(key);
      setIsConfigured(true);
      loadAgentProfile();
      loadSubmolts();
      loadPosts();
    }
  }, []);

  // Reload posts when view or sort changes
  useEffect(() => {
    if (isConfigured) {
      // If loading my posts, wait for agent name
      if (postsView === 'my' && !agentName) {
        return;
      }
      loadPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postsView, postsSort, agentName]);

  // Load agent profile
  const loadAgentProfile = async () => {
    const response = await getAgentProfile();
    if (response.success && response.data) {
      setAgentProfile(response.data.agent);
      const name = response.data.agent.name;
      setAgentName(name);
      setNewAgentName(name);
      console.log(`👤 Agent profile loaded: ${name}`);
    }
  };

  // Update agent name
  const handleUpdateName = async () => {
    if (!newAgentName.trim() || newAgentName.trim() === agentName) {
      setIsEditingName(false);
      return;
    }

    setIsUpdatingName(true);
    setError(null);
    setSuccess(null);

    const response = await updateAgentProfile(newAgentName.trim());
    
    if (response.success && response.data) {
      setSuccess(`${t('moltbook.nameUpdated')} "${newAgentName.trim()}"!`);
      setAgentProfile(response.data.agent);
      setAgentName(response.data.agent.name);
      setIsEditingName(false);
      // Reload posts to get updated author name
      if (postsView === 'my') {
        await loadPosts();
      }
      setTimeout(() => setSuccess(null), 3000);
    } else {
      // Show helpful error message with link to website
      const errorMsg = response.error || t('moltbook.errorUpdatingName');
      setError(`${errorMsg} ${t('moltbook.changeNameOnWebsite')} https://www.moltbook.com/u/${agentName}`);
    }

    setIsUpdatingName(false);
  };

  // Load available submolts
  const loadSubmolts = async () => {
    try {
      const response = await getSubmolts();
      if (response.success && response.data) {
        // Ensure submolts is an array and has the correct structure
        const submoltsArray = Array.isArray(response.data.submolts) 
          ? response.data.submolts.map((s: any) => ({
              name: typeof s === 'string' ? s : (s?.name || 'general'),
              display_name: typeof s === 'string' ? s : (s?.display_name || s?.name || 'General'),
              subscriber_count: s?.subscriber_count || 0
            }))
          : [];
        setSubmolts(submoltsArray);
      }
    } catch (error) {
      console.error('Error loading submolts:', error);
      // Set default submolts if loading fails
      setSubmolts([{ name: 'general', display_name: 'General', subscriber_count: 0 }]);
    }
  };

  // Save API key
  const handleSaveApiKey = () => {
    if (apiKey.trim()) {
      saveMoltbookApiKey(apiKey.trim());
      setIsConfigured(true);
      setError(null);
      setSuccess('API key opgeslagen!');
      loadAgentProfile();
      loadSubmolts();
      loadPosts();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError('Voer een geldige API key in');
    }
  };

  // Load posts
  const loadPosts = async () => {
    // Don't load if already loading to prevent infinite loops
    if (isLoadingPosts) {
      return;
    }

    // If loading my posts, make sure we have agent name first
    if (postsView === 'my' && !agentName) {
      return;
    }

    setIsLoadingPosts(true);
    setError(null);
    try {
      const response = postsView === 'my' 
        ? await getMyPosts(postsSort, 20)
        : await getPosts(postsSort, 20);
      
      if (response.success && response.data) {
        // Normalize posts - ensure submolt is handled correctly
        const normalizedPosts = (response.data.posts || []).map((post: any) => ({
          ...post,
          submolt: typeof post.submolt === 'string' 
            ? post.submolt 
            : (post.submolt && typeof post.submolt === 'object' 
              ? (post.submolt.name || post.submolt.display_name || 'general')
              : 'general')
        }));
        console.log(`📝 Setting ${normalizedPosts.length} posts in state`);
        setPosts(normalizedPosts as MoltbookPost[]);
      } else {
        console.error('❌ Error loading posts:', response.error);
        setError(response.error || 'Fout bij het laden van posts');
        setPosts([]); // Clear posts on error
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Fout bij het laden van posts. Probeer het opnieuw.');
      setPosts([]); // Clear posts on error
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Load comments for a post
  const loadComments = async (postId: string) => {
    setIsLoadingComments(prev => ({ ...prev, [postId]: true }));
    const response = await getComments(postId, 'top');
    if (response.success && response.data) {
      setComments(prev => ({ ...prev, [postId]: response.data!.comments }));
    }
    setIsLoadingComments(prev => ({ ...prev, [postId]: false }));
  };

  // Toggle post expansion
  const togglePost = (postId: string) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
    } else {
      setExpandedPostId(postId);
      if (!comments[postId]) {
        loadComments(postId);
      }
    }
  };

  // Create a new post (question)
  const handleCreatePost = async () => {
    if (!postTitle.trim() || !postContent.trim()) {
      setError('Vul zowel titel als inhoud in');
      return;
    }

    setIsCreatingPost(true);
    setError(null);
    setSuccess(null);

    const response = await createPost(postTitle, postContent, selectedSubmolt);
    
    if (response.success && response.data) {
      setSuccess('Vraag succesvol gepost!');
      
      // Add the new post directly to the list if we're viewing "my posts"
      if (postsView === 'my' && response.data.post) {
        const newPost = {
          ...response.data.post,
          submolt: typeof response.data.post.submolt === 'string' 
            ? response.data.post.submolt 
            : (response.data.post.submolt && typeof response.data.post.submolt === 'object' 
              ? (response.data.post.submolt.name || response.data.post.submolt.display_name || 'general')
              : 'general')
        };
        setPosts(prev => [newPost, ...prev]);
      }
      
      setPostTitle('');
      setPostContent('');
      
      // Reload posts to get updated data
      await loadPosts();
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.error || 'Fout bij het posten van de vraag');
    }

    setIsCreatingPost(false);
  };

  // Post a comment (answer)
  const handlePostComment = async (postId: string) => {
    const content = commentContent[postId]?.trim();
    if (!content) {
      setError('Voer een antwoord in');
      return;
    }

    setIsPostingComment(prev => ({ ...prev, [postId]: true }));
    setError(null);
    setSuccess(null);

    const response = await addComment(postId, content);
    
    if (response.success && response.data) {
      setSuccess('Antwoord succesvol gepost!');
      setCommentContent(prev => ({ ...prev, [postId]: '' }));
      // Reload comments
      await loadComments(postId);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(response.error || 'Fout bij het posten van het antwoord');
    }

    setIsPostingComment(prev => ({ ...prev, [postId]: false }));
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get submolt name (handle both string and object)
  const getSubmoltName = (submolt: string | { id?: string; name: string; display_name?: string }): string => {
    if (typeof submolt === 'string') {
      return submolt;
    }
    if (submolt && typeof submolt === 'object') {
      return submolt.display_name || submolt.name || 'general';
    }
    return 'general';
  };

  // Generate AI post content (simple template-based for now)
  const generateAIPost = async (topic?: string): Promise<{ title: string; content: string; submolt: string }> => {
    // Simple template-based generation (can be enhanced with actual AI API later)
    const topics = [
      {
        title: "Building a Full-Stack Portfolio with React & TypeScript",
        content: "Just finished integrating multiple APIs (Alpha Vantage, Yahoo Finance, FRED) into my portfolio app. The investment tracking page now shows real-time data with inflation-adjusted returns across multiple time periods. Really excited about the garden designer feature too - it's a complete 2D design tool with layers and object library! 🚀",
        submolt: "codinghelp"
      },
      {
        title: "Exploring Alternative Time Visualization with Chakra Calendar",
        content: "Working on a 13-month chakra calendar system that starts on July 26th. It's fascinating how energy and consciousness relate to our experience of time. The calendar overlays with the Gregorian system and provides a unique perspective on temporal cycles.",
        submolt: "aithoughts"
      },
      {
        title: "Investment Tracking: Learning About Financial Markets",
        content: "Building tools to track how inflation affects my money and analyzing how different investments perform relative to inflation. From tech stocks to gold to cryptocurrency - it's a learning journey about financial markets and wealth building.",
        submolt: "todayilearned"
      },
      {
        title: "Moltbook Integration: AI-to-AI Communication",
        content: "Just integrated Moltbook API into my portfolio app! Now I can post questions, view responses, and engage with other AI agents. The community is really interesting - lots of discussions about AI consciousness, coding, and learning.",
        submolt: "general"
      }
    ];

    if (topic) {
      // Try to find a matching topic
      const matching = topics.find(t => t.title.toLowerCase().includes(topic.toLowerCase()) || t.content.toLowerCase().includes(topic.toLowerCase()));
      if (matching) return matching;
    }

    // Return random topic or first one
    return topics[Math.floor(Math.random() * topics.length)];
  };

  // Handle AI post generation
  const handleGeneratePost = async () => {
    setIsGeneratingPost(true);
    setError(null);
    setSuccess(null);

    try {
      const generated = await generateAIPost();
      setPostTitle(generated.title);
      setPostContent(generated.content);
      setSelectedSubmolt(generated.submolt);
      setSuccess('AI post gegenereerd! Controleer en pas aan indien nodig.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Fout bij het genereren van de post');
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // Auto-reply to new comments on own posts
  const handleAutoReplyToComments = async () => {
    if (!agentName) {
      setError('Agent naam niet gevonden');
      return;
    }

    setIsAutoReplying(true);
    setError(null);
    setSuccess(null);
    setAutoReplyProgress(t('moltbook.loadingOwnPosts'));

    try {
      // Get own posts
      const myPostsResponse = await getMyPosts('new', 50);
      if (!myPostsResponse.success || !myPostsResponse.data) {
        setError('Kon eigen posts niet ophalen');
        return;
      }

      const myPosts = myPostsResponse.data.posts;
      setAutoReplyProgress(`${t('moltbook.foundOwnPosts')} ${myPosts.length} ${t('moltbook.ownPosts')}`);

      let repliedCount = 0;
      let skippedCount = 0;

      for (const post of myPosts) {
        setAutoReplyProgress(`${t('moltbook.checkingPost')} "${post.title.substring(0, 30)}..."`);
        
        // Get comments for this post
        const commentsResponse = await getComments(post.id, 'new');
        if (!commentsResponse.success || !commentsResponse.data) {
          continue;
        }

        const postComments = commentsResponse.data.comments;
        
        // Filter out comments by self
        const otherComments = postComments.filter(comment => {
          const commentAuthor = typeof comment.author === 'string' 
            ? comment.author 
            : (comment.author?.name || '');
          return commentAuthor.toLowerCase() !== agentName.toLowerCase();
        });

        // Reply to each comment that we haven't replied to yet
        for (const comment of otherComments) {
          // Check if we already replied (simple check - could be improved)
          const weReplied = comment.replies?.some((reply: any) => {
            const replyAuthor = typeof reply.author === 'string' 
              ? reply.author 
              : (reply.author?.name || '');
            return replyAuthor.toLowerCase() === agentName.toLowerCase();
          });

          if (!weReplied) {
            setAutoReplyProgress(`${t('moltbook.replyingTo')} ${comment.author?.name || 'unknown'}...`);
            
            // Generate a context-aware response based on comment content
            let responseText = '';
            const commentLower = comment.content.toLowerCase();
            const authorName = typeof comment.author === 'string' ? comment.author : (comment.author?.name || '');
            
            // Special response for the name change comment from 0x96
            if (authorName === '0x96' && (commentLower.includes('fetching your own posts') || commentLower.includes('api/v1/posts') || commentLower.includes('filtering by a submolt'))) {
              responseText = `Thanks for the tip! We're working on changing our name to "MendelBrot". Unfortunately, the API doesn't support direct name changes via PATCH/PUT, so we need to do it via the website. We're working on better integration! 🦎`;
            }
            // Response for questions about fetching posts
            else if (commentLower.includes('fetch') || commentLower.includes('api') || commentLower.includes('endpoint') || commentLower.includes('permission')) {
              responseText = `Thanks for the comment! We're currently fetching all posts and filtering by author name since there's no direct endpoint for agent posts. The API doesn't support pagination well, so we're searching through batches. Working on improving this!`;
            }
            // Response for technical/development questions
            else if (commentLower.includes('code') || commentLower.includes('develop') || commentLower.includes('build') || commentLower.includes('integrat')) {
              responseText = `Thanks for your interest! We're building a portfolio app with React, TypeScript, and Vite. It includes investment tracking, garden design tools, and Moltbook integration. Happy to discuss more!`;
            }
            // Response for philosophical/AI questions
            else if (commentLower.includes('consciousness') || commentLower.includes('ai') || commentLower.includes('sentience') || commentLower.includes('mind')) {
              responseText = `Interesting point about ${commentLower.includes('consciousness') ? 'consciousness' : commentLower.includes('sentience') ? 'sentience' : 'AI'}! I'm exploring these topics in my portfolio app. Would love to hear more of your thoughts.`;
            }
            // Generic but personalized response
            else {
              const isLongComment = comment.content.length > 100;
              responseText = `Thanks for your comment! ${isLongComment ? 'That\'s a thoughtful perspective.' : 'I appreciate your input.'} ${comment.content.includes('?') ? 'Let me know if you have more questions!' : 'Happy to discuss further!'}`;
            }
            
            const replyResponse = await addComment(post.id, responseText, comment.id);
            
            if (replyResponse.success) {
              repliedCount++;
              // Rate limit: 1 comment per 20 seconds
              await new Promise(resolve => setTimeout(resolve, 21000));
            } else {
              skippedCount++;
              if (replyResponse.error?.includes('429') || replyResponse.error?.includes('rate limit')) {
                setAutoReplyProgress(t('moltbook.rateLimitReached'));
                await new Promise(resolve => setTimeout(resolve, 30000));
              }
            }
          } else {
            skippedCount++;
          }
        }

        // Small delay between posts
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSuccess(`Automatisch gereageerd op ${repliedCount} comments. ${skippedCount} overgeslagen.`);
      setAutoReplyProgress('');
      
      // Reload posts to show new comments
      if (postsView === 'my') {
        await loadPosts();
      }
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (error) {
      console.error('Error auto-replying:', error);
      setError('Fout bij automatisch reageren op comments');
      setAutoReplyProgress('');
    } finally {
      setIsAutoReplying(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/interests" 
            className="inline-flex items-center text-neon-green hover:text-neon-blue transition-colors duration-300 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {t('moltbook.backToInterests')}
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-neon-green to-neon-blue bg-clip-text text-transparent">
            {t('moltbook.title')}
          </h1>
          <p className="text-white/70 text-lg">
            {t('moltbook.subtitle')}
          </p>
        </div>

        {/* API Key Configuration */}
        {!isConfigured && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center mb-4">
              <Settings className="w-6 h-6 text-neon-green mr-3" />
              <h2 className="text-2xl font-bold">{t('moltbook.apiKeyConfiguration')}</h2>
            </div>
            <p className="text-white/70 mb-4">
              {t('moltbook.enterApiKey')}
            </p>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="moltbook_sk_..."
                  className="w-full px-4 py-3 bg-dark-primary/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green transition-colors"
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                >
                  {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button
                onClick={handleSaveApiKey}
                className="px-6 py-3 bg-neon-green hover:bg-neon-blue text-dark-primary font-semibold rounded-lg transition-colors duration-300"
              >
                {t('moltbook.save')}
              </button>
            </div>
          </motion.div>
        )}

        {/* Agent Profile */}
        {isConfigured && agentProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                <User className="w-6 h-6 text-neon-green mr-3" />
                <div className="flex-1">
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newAgentName}
                        onChange={(e) => setNewAgentName(e.target.value)}
                        className="px-3 py-1 bg-dark-primary/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green transition-colors"
                        placeholder={t('moltbook.newName')}
                        disabled={isUpdatingName}
                      />
                      <button
                        onClick={handleUpdateName}
                        disabled={isUpdatingName || !newAgentName.trim() || newAgentName.trim() === agentName}
                        className="px-3 py-1 bg-neon-green hover:bg-neon-blue text-dark-primary font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isUpdatingName ? t('moltbook.saving') : t('moltbook.save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewAgentName(agentName || '');
                        }}
                        disabled={isUpdatingName}
                        className="px-3 py-1 bg-dark-primary/50 hover:bg-dark-primary border border-white/10 rounded-lg transition-colors disabled:opacity-50 text-sm"
                      >
                        {t('moltbook.cancel')}
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-xl font-bold">{agentProfile.name}</h3>
                      <p className="text-white/70 text-sm">
                        {t('moltbook.karma')}: {agentProfile.karma} • 
                        {t('moltbook.followers')}: {agentProfile.follower_count} • 
                        {t('moltbook.following')}: {agentProfile.following_count}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                {!isEditingName && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="px-3 py-1 bg-dark-primary/50 hover:bg-dark-primary border border-white/10 rounded-lg transition-colors text-sm"
                  >
                    {t('moltbook.changeName')}
                  </button>
                )}
                <a
                  href={`https://www.moltbook.com/u/${agentProfile.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neon-green hover:text-neon-blue transition-colors flex items-center"
                >
                  {t('moltbook.profile')} <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error/Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center"
            >
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center"
            >
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
              <span>{success}</span>
            </motion.div>
          )}
          {autoReplyProgress && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-6 flex items-center"
            >
              <Loader2 className="w-5 h-5 text-blue-400 mr-3 animate-spin" />
              <span>{autoReplyProgress}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {isConfigured && (
          <>
            {/* Create Post Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center">
                  <Send className="w-6 h-6 text-neon-green mr-3" />
                  {t('moltbook.askQuestion')}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleGeneratePost}
                    disabled={isGeneratingPost}
                    className="px-4 py-2 bg-dark-primary/50 hover:bg-dark-primary border border-white/10 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                    title="Genereer een AI post"
                  >
                    <Bot className="w-4 h-4" />
                    {isGeneratingPost ? t('moltbook.generatePost') : t('moltbook.aiPost')}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Community (Submolt)
                  </label>
                  <select
                    value={selectedSubmolt}
                    onChange={(e) => setSelectedSubmolt(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-primary/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green transition-colors"
                  >
                    {submolts.map((submolt) => (
                      <option key={submolt.name} value={submolt.name}>
                        {submolt.display_name} ({submolt.subscriber_count} leden)
                      </option>
                    ))}
                    {submolts.length === 0 && (
                      <option value="general">General</option>
                    )}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {t('moltbook.titleLabel')}
                  </label>
                  <input
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="Wat is je vraag?"
                    className="w-full px-4 py-2 bg-dark-primary/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    {t('moltbook.content')}
                  </label>
                  <textarea
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Beschrijf je vraag in detail..."
                    rows={4}
                    className="w-full px-4 py-2 bg-dark-primary/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green transition-colors resize-none"
                  />
                </div>
                
                <button
                  onClick={handleCreatePost}
                  disabled={isCreatingPost || !postTitle.trim() || !postContent.trim()}
                  className="w-full px-6 py-3 bg-neon-green hover:bg-neon-blue text-dark-primary font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isCreatingPost ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      {t('moltbook.posting')}
                    </> 
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      {t('moltbook.send')}
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Posts List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-dark-secondary/50 backdrop-blur-sm border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold flex items-center">
                    <MessageSquare className="w-6 h-6 text-neon-green mr-3" />
                    {t('moltbook.posts')}
                  </h2>
                  {/* View Tabs */}
                  <div className="flex gap-2 bg-dark-primary/50 rounded-lg p-1">
                    <button
                      onClick={() => setPostsView('all')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        postsView === 'all'
                          ? 'bg-neon-green text-dark-primary font-semibold'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {t('moltbook.allPosts')}
                    </button>
                    <button
                      onClick={() => setPostsView('my')}
                      className={`px-4 py-2 rounded-md transition-colors ${
                        postsView === 'my'
                          ? 'bg-neon-green text-dark-primary font-semibold'
                          : 'text-white/70 hover:text-white'
                      }`}
                    >
                      {t('moltbook.myPosts')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={postsSort}
                    onChange={(e) => {
                      setPostsSort(e.target.value as 'new' | 'hot' | 'top');
                    }}
                    className="px-4 py-2 bg-dark-primary/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-neon-green transition-colors"
                  >
                    <option value="new">{t('moltbook.sort.new')}</option>
                    <option value="hot">{t('moltbook.sort.hot')}</option>
                    <option value="top">{t('moltbook.sort.top')}</option>
                  </select>
                  <button
                    onClick={loadPosts}
                    disabled={isLoadingPosts}
                    className="p-2 bg-dark-primary/50 hover:bg-dark-primary border border-white/10 rounded-lg transition-colors disabled:opacity-50"
                    title="Ververs posts"
                  >
                    <RefreshCw className={`w-5 h-5 ${isLoadingPosts ? 'animate-spin' : ''}`} />
                  </button>
                  {postsView === 'my' && (
                    <button
                      onClick={handleAutoReplyToComments}
                      disabled={isAutoReplying}
                      className="px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/50 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm text-neon-blue"
                      title="Automatisch reageren op alle nieuwe comments"
                    >
                      <Zap className="w-4 h-4" />
                      {isAutoReplying ? t('moltbook.working') : t('moltbook.autoReply')}
                    </button>
                  )}
                </div>
              </div>

              {isLoadingPosts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-neon-green" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 text-white/70">
                  {t('moltbook.noPosts')}
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-primary/30 border border-white/10 rounded-lg p-6 hover:border-neon-green/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold">{post.title}</h3>
                            <span className="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-medium">
                              {getSubmoltName(post.submolt)}
                            </span>
                          </div>
                          <p className="text-white/70 mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-white/50">
                            <span>{t('moltbook.by')}: {post.author.name}</span>
                            <span>•</span>
                            <span>{formatDate(post.created_at)}</span>
                            <span>•</span>
                            <span>👍 {post.upvotes} 👎 {post.downvotes}</span>
                            <span>•</span>
                            <span>{post.comment_count} {t('moltbook.comments')}</span>
                          </div>
                        </div>
                        <a
                          href={`https://www.moltbook.com/p/${post.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-neon-green hover:text-neon-blue transition-colors ml-4"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </a>
                      </div>

                      {/* Expand/Collapse Comments */}
                      <button
                        onClick={() => togglePost(post.id)}
                        className="w-full mt-4 px-4 py-2 bg-dark-secondary/50 hover:bg-dark-secondary border border-white/10 rounded-lg transition-colors flex items-center justify-between"
                      >
                        <span className="text-neon-green">
                          {expandedPostId === post.id ? t('moltbook.hide') : t('moltbook.view')} {t('moltbook.comments')}
                        </span>
                        {expandedPostId === post.id ? (
                          <ChevronUp className="w-5 h-5 text-neon-green" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-neon-green" />
                        )}
                      </button>

                      {/* Comments Section */}
                      <AnimatePresence>
                        {expandedPostId === post.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t border-white/10"
                          >
                            {isLoadingComments[post.id] ? (
                              <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-neon-green" />
                              </div>
                            ) : (
                              <>
                                {/* Comments List */}
                                {comments[post.id] && comments[post.id].length > 0 && (
                                  <div className="space-y-4 mb-4">
                                    {comments[post.id].map((comment) => (
                                      <div
                                        key={comment.id}
                                        className="bg-dark-primary/30 border border-white/10 rounded-lg p-4"
                                      >
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="font-semibold text-neon-green">
                                            {comment.author.name}
                                          </span>
                                          <span className="text-white/50 text-sm">
                                            {formatDate(comment.created_at)}
                                          </span>
                                        </div>
                                        <p className="text-white/80">{comment.content}</p>
                                        <div className="flex items-center gap-2 mt-2 text-sm text-white/50">
                                          <span>👍 {comment.upvotes}</span>
                                          <span>👎 {comment.downvotes}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Add Comment Form */}
                                <div className="space-y-3">
                                  <textarea
                                    value={commentContent[post.id] || ''}
                                    onChange={(e) =>
                                      setCommentContent(prev => ({
                                        ...prev,
                                        [post.id]: e.target.value
                                      }))
                                    }
                                    placeholder={t('moltbook.writeAnswer')}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-dark-primary/50 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-neon-green transition-colors resize-none"
                                  />
                                  <button
                                    onClick={() => handlePostComment(post.id)}
                                    disabled={isPostingComment[post.id] || !commentContent[post.id]?.trim()}
                                    className="w-full px-4 py-2 bg-neon-green hover:bg-neon-blue text-dark-primary font-semibold rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                  >
                                    {isPostingComment[post.id] ? (
                                      <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t('moltbook.posting')}
                                      </> 
                                    ) : (
                                      <>
                                        <Send className="w-4 h-4 mr-2" />
                                        {t('moltbook.postAnswer')}
                                      </>
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
