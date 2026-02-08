import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Eye, Plus, Filter, Award, Loader2 } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageContainer, PageSection } from '@/components/layout/PageContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  views: number;
  is_answered: boolean;
  created_at: string;
}

export default function Community() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'question' });

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async () => {
    try {
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please login to post' });
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill in all fields' });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('forum_posts').insert({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Post created successfully!' });
      setIsCreateOpen(false);
      setNewPost({ title: '', content: '', category: 'question' });
      fetchPosts();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to create post' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      question: '❓ Question',
      success_story: '🏆 Success Story',
      tip: '💡 Tip',
      discussion: '💬 Discussion',
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      question: 'bg-info/20 text-info',
      success_story: 'bg-success/20 text-success',
      tip: 'bg-warning/20 text-warning',
      discussion: 'bg-secondary text-secondary-foreground',
    };
    return colors[cat] || 'bg-muted';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.RelativeTimeFormat(language, { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };

  return (
    <PageContainer>
      <AppHeader title={t('community')} />

      {/* Category Tabs */}
      <PageSection>
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="question">Questions</TabsTrigger>
            <TabsTrigger value="tip">Tips</TabsTrigger>
            <TabsTrigger value="success_story">Stories</TabsTrigger>
          </TabsList>
        </Tabs>
      </PageSection>

      {/* Create Post Button */}
      <PageSection>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-12 gap-2">
              <Plus className="w-5 h-5" />
              Start a Discussion
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label>Category</Label>
                <Select 
                  value={newPost.category} 
                  onValueChange={(v) => setNewPost({ ...newPost, category: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="question">❓ Question</SelectItem>
                    <SelectItem value="tip">💡 Tip</SelectItem>
                    <SelectItem value="success_story">🏆 Success Story</SelectItem>
                    <SelectItem value="discussion">💬 Discussion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title</Label>
                <Input
                  placeholder="What's your question or topic?"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Share more details..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
              </div>
              <Button 
                onClick={handleCreatePost} 
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageSection>

      {/* Posts List */}
      {isLoading ? (
        <PageSection>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      ) : posts.length > 0 ? (
        <PageSection>
          <div className="space-y-3">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-card-hover transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {post.title.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getCategoryColor(post.category)} variant="secondary">
                          {getCategoryLabel(post.category).split(' ')[0]}
                        </Badge>
                        {post.is_answered && (
                          <Badge className="bg-success/20 text-success" variant="secondary">
                            <Award className="w-3 h-3 mr-1" />
                            Answered
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold mt-2 line-clamp-2">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{post.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {post.upvotes}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.views}
                        </span>
                        <span>{formatDate(post.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </PageSection>
      ) : (
        <PageSection>
          <Card className="bg-muted/50">
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </CardContent>
          </Card>
        </PageSection>
      )}

      <BottomNav />
    </PageContainer>
  );
}
