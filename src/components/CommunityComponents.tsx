import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Users,
  TrendingUp,
  Check,
  UserPlus,
  Send,
  Trash2,
  MoreVertical,
  Edit,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Community } from "../data/mockCommunities";
import { useState, useEffect } from "react";
import { getCurrentUser, deletePost, voteOnComment, deleteComment, getPostComments, updateCommunity, deleteCommunity } from "../utils/supabase/client";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner@2.0.3";

interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
  };
  content: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: "up" | "down" | null;
  createdAt: string;
}

interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string;
  userId: string;
  user: {
    name: string;
    avatar: string;
    badge?: string;
  };
  title: string;
  content: string;
  image?: string;
  timestamp: string;
  upvotes: number;
  downvotes: number;
  userVote: "up" | "down" | null;
  comments: number;
}

// Add state to track actual comment count from database
interface PostCardProps {
  post: CommunityPost;
  onVote: (id: string, voteType: "up" | "down") => void;
  onCommentAdded?: () => void;
  onPostDeleted?: () => void;
}

export function PostCard({
  post,
  onVote,
  onCommentAdded,
  onPostDeleted,
}: {
  post: CommunityPost;
  onVote: (id: string, voteType: "up" | "down") => void;
  onCommentAdded?: () => void;
  onPostDeleted?: () => void;
}) {
  const score = post.upvotes - post.downvotes;
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  const [actualCommentCount, setActualCommentCount] = useState(post.comments);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  // Update actual comment count when post prop changes
  useEffect(() => {
    setActualCommentCount(post.comments);
  }, [post.comments]);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      // Fetch comments publicly - no auth required to view
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7d67a39c`;
      const response = await fetch(
        `${API_BASE}/posts/${post.id}/comments`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        const fetchedComments = data.comments || [];
        setComments(fetchedComments);
        // Update the actual comment count based on fetched data
        setActualCommentCount(fetchedComments.length);
      } else {
        console.error("Failed to fetch comments:", response.status, response.statusText);
        // Silently fail - don't show error to user for comment fetch failures
        setComments([]);
      }
    } catch (error) {
      // Network error or server unavailable - silently fail
      console.error("Error fetching comments:", error);
      setComments([]);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7d67a39c`;
      const response = await fetch(
        `${API_BASE}/posts/${post.id}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Refresh comments to get the complete list with updated count
        await fetchComments();
        setNewComment("");
        toast.success("Comment posted!");
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Failed to post comment");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      toast.success("Post deleted successfully");
      setShowDeleteDialog(false);
      if (onPostDeleted) {
        onPostDeleted();
      }
    } catch (error: any) {
      console.error("Delete post error:", error);
      if (error.message.includes("404") || error.message.includes("not found")) {
        toast.error("This feature is being updated. Please try again later.");
      } else {
        toast.error(error.message || "Failed to delete post");
      }
    }
  };

  const handleVoteComment = async (commentId: string, voteType: "up" | "down") => {
    if (!localStorage.getItem("accessToken")) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const result = await voteOnComment(commentId, voteType);
      setComments(
        comments.map((c) =>
          c.id === commentId
            ? {
                ...c,
                upvotes: result.comment.upvotes || 0,
                downvotes: result.comment.downvotes || 0,
                userVote: result.userVote,
              }
            : c
        )
      );
    } catch (error: any) {
      toast.error(error.message || "Failed to vote");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      // Refresh comments to get updated count
      await fetchComments();
      setDeletingCommentId(null);
      toast.success("Comment deleted successfully");
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isPostOwner = currentUser && post.userId === currentUser.id;

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl border-2">
        {/* Post Image - Full Width at Top */}
        {post.image && (
          <div className="relative h-72 overflow-hidden group">
            <ImageWithFallback
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        )}

        <CardContent className="p-6 space-y-4">
          {/* Post Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                <AvatarImage src={post.user.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white">
                  {post.user.name.charAt(2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm">{post.user.name}</span>
                  {post.user.badge && (
                    <Badge variant="secondary" className="text-xs rounded-full px-2 py-0">
                      {post.user.badge}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="rounded-full px-3 border-primary/30">
                    {post.communityName.replace("r/", "")}
                  </Badge>
                  <span>•</span>
                  <span>{post.timestamp}</span>
                </div>
              </div>
            </div>

            {/* Post Options Menu */}
            {isPostOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Post Title */}
          <h3 className="cursor-pointer hover:text-primary transition-colors leading-snug">
            {post.title}
          </h3>

          {/* Post Content */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {post.content}
          </p>

          {/* Post Actions & Stats */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center gap-2">
              {/* Like/Dislike Buttons */}
              <div className="flex items-center gap-1 bg-accent/50 rounded-full px-2 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 rounded-full ${
                    post.userVote === "up"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground"
                  } hover:bg-primary hover:text-primary-foreground`}
                  onClick={() => onVote(post.id, "up")}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2 min-w-[3rem] text-center">
                  {score > 1000 ? `${(score / 1000).toFixed(1)}k` : score}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 w-8 p-0 rounded-full ${
                    post.userVote === "down"
                      ? "bg-destructive text-destructive-foreground"
                      : "text-muted-foreground"
                  } hover:bg-destructive/90 hover:text-destructive-foreground`}
                  onClick={() => onVote(post.id, "down")}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="gap-2 text-muted-foreground hover:bg-accent rounded-full px-4"
                onClick={() => setShowComments(true)}
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-xs">{actualCommentCount}</span>
              </Button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:bg-accent rounded-full px-4"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Post Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its
              comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Comments Dialog */}
      <Dialog open={showComments} onOpenChange={setShowComments}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments ({actualCommentCount})</DialogTitle>
            <DialogDescription>
              View and add comments to this post
            </DialogDescription>
          </DialogHeader>

          {/* Comments List */}
          <ScrollArea className="flex-1 pr-4">
            {isLoadingComments ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                <p>No comments yet</p>
                <p className="text-xs mt-1">Be the first to comment!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => {
                  const commentScore = (comment.upvotes || 0) - (comment.downvotes || 0);
                  const isCommentOwner = currentUser && comment.userId === currentUser.id;

                  return (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white text-xs">
                          {comment.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{comment.user.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {comment.content}
                            </p>
                          </div>
                          {isCommentOwner && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => setDeletingCommentId(comment.id)}
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>

                        {/* Comment voting */}
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              comment.userVote === "up"
                                ? "text-primary"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => handleVoteComment(comment.id, "up")}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <span className="text-xs min-w-[2rem] text-center">
                            {commentScore}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 w-6 p-0 ${
                              comment.userVote === "down"
                                ? "text-destructive"
                                : "text-muted-foreground"
                            }`}
                            onClick={() => handleVoteComment(comment.id, "down")}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {/* Add Comment */}
          <div className="border-t pt-4 space-y-3">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isSubmittingComment}
                className="gap-2 rounded-full"
              >
                <Send className="w-4 h-4" />
                {isSubmittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Dialog */}
      <AlertDialog
        open={!!deletingCommentId}
        onOpenChange={(open) => !open && setDeletingCommentId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCommentId && handleDeleteComment(deletingCommentId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function CommunityCard({
  community,
  onJoinToggle,
  onViewPosts,
  onCommunityUpdated,
}: {
  community: Community;
  onJoinToggle: (id: string) => void;
  onViewPosts: () => void;
  onCommunityUpdated?: () => void;
}) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    name: community.name,
    description: community.description,
    category: community.category,
    tags: community.tags.join(", "),
    image: community.image,
  });

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  const isOwner = currentUser && community.createdBy === currentUser.name;

  const handleUpdateCommunity = async () => {
    if (!editForm.name || !editForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUpdating(true);
    try {
      await updateCommunity(community.id, {
        name: editForm.name,
        description: editForm.description,
        category: editForm.category,
        tags: editForm.tags.split(",").map(tag => tag.trim()).filter(Boolean),
        image: editForm.image,
      });
      
      toast.success("Community updated successfully!");
      setShowEditDialog(false);
      if (onCommunityUpdated) onCommunityUpdated();
    } catch (error: any) {
      console.error("Error updating community:", error);
      toast.error(error.message || "Failed to update community");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteCommunity = async () => {
    setIsDeleting(true);
    try {
      await deleteCommunity(community.id);
      toast.success("Community deleted successfully!");
      setShowDeleteDialog(false);
      if (onCommunityUpdated) onCommunityUpdated();
    } catch (error: any) {
      console.error("Error deleting community:", error);
      toast.error(error.message || "Failed to delete community");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 rounded-3xl group border-2">
        <div
          className="relative h-40 overflow-hidden cursor-pointer"
          onClick={onViewPosts}
        >
          <ImageWithFallback
            src={community.image}
            alt={community.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4">
            <h3 className="text-white line-clamp-1 mb-1">{community.name}</h3>
            <div className="flex items-center gap-3 text-white/90 text-xs">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{community.memberCount.toLocaleString()}</span>
              </div>
              <span>•</span>
              <span>{community.postCount.toLocaleString()} posts</span>
            </div>
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <Badge className="rounded-full px-3 bg-white/90 text-gray-800 backdrop-blur-sm">
              {community.category}
            </Badge>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-full bg-white/90 hover:bg-white"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowEditDialog(true);
                  }}>
                    <Edit className="w-3 h-3 mr-2" />
                    Edit Community
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete Community
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
              {community.description}
            </p>
            {isOwner && (
              <Badge variant="outline" className="text-xs rounded-full px-2 py-0.5 bg-primary/10 text-primary border-primary/20 shrink-0">
                Creator
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="pb-3">
          <div className="flex flex-wrap gap-2">
            {community.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs rounded-full px-3">
                {tag}
              </Badge>
            ))}
            {community.tags.length > 3 && (
              <Badge variant="outline" className="text-xs rounded-full px-3">
                +{community.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="pt-3 border-t flex gap-2">
          <Button
            className="flex-1 gap-2 rounded-full"
            variant={community.isJoined ? "secondary" : "default"}
            onClick={() => onJoinToggle(community.id)}
          >
            {community.isJoined ? (
              <>
                <Check className="w-4 h-4" />
                Joined
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Join
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onViewPosts} className="rounded-full px-6">
            View
          </Button>
        </CardFooter>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update your community details. All fields are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm">Community Name</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Enter community name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Description</label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="min-h-[100px]"
                placeholder="Describe your community"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Category</label>
              <input
                type="text"
                value={editForm.category}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., Cuisine, Diet-Specific"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Tags (comma-separated)</label>
              <input
                type="text"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="e.g., vegan, healthy, quick"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm">Image URL</label>
              <input
                type="text"
                value={editForm.image}
                onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCommunity} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Community"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Community?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the community
              "{community.name}", all its posts, and remove all members.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommunity}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Community"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}