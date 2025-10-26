import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "./ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Share2,
  Plus,
  TrendingUp,
  Flame,
  Clock,
  Award,
  Users,
  Search,
  UserPlus,
  Check,
  Home as HomeIcon,
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  mockCommunities,
  Community,
} from "../data/mockCommunities";
import { PostCard, CommunityCard } from "./CommunityComponents";

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

const mockPosts: CommunityPost[] = [
  {
    id: "1",
    communityId: "2",
    communityName: "r/ItalianHomeCooking",
    userId: "user1",
    user: {
      name: "u/SarahChen",
      avatar: "",
      badge: "Top Chef",
    },
    title:
      "My grandmother's secret Tuscan chicken recipe - finally nailed it!",
    content:
      "After years of trying, I finally recreated my nonna's famous Tuscan garlic chicken. The key is using sun-dried tomatoes and getting that creamy sauce just right. Happy to share the recipe if anyone wants it!",
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
    timestamp: "2h ago",
    upvotes: 1247,
    downvotes: 23,
    userVote: null,
    comments: 89,
  },
  {
    id: "2",
    communityId: "1",
    communityName: "r/VeganWarriors",
    userId: "user2",
    user: {
      name: "u/MarcusJ",
      avatar: "",
    },
    title:
      "Best vegan Buddha bowl I've ever made - meal prep perfection",
    content:
      "Spent my Sunday prepping these beauties. Quinoa, roasted chickpeas, sweet potato, avocado, and a killer tahini dressing. Each bowl is around 450 calories and keeps me full for hours!",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    timestamp: "5h ago",
    upvotes: 892,
    downvotes: 12,
    userVote: "up",
    comments: 67,
  },
  {
    id: "3",
    communityId: "4",
    communityName: "r/BakingBliss",
    userId: "user3",
    user: {
      name: "u/EmmaRodriguez",
      avatar: "",
      badge: "Master Baker",
    },
    title:
      "Chocolate lava cake with molten center - easier than you think!",
    content:
      "Pro tip: slightly underbake these for that perfect gooey center. The secret is using quality chocolate and not overmixing the batter. Recipe in comments!",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    timestamp: "1d ago",
    upvotes: 2563,
    downvotes: 45,
    userVote: null,
    comments: 156,
  },
  {
    id: "4",
    communityId: "5",
    communityName: "r/AsianFusion",
    userId: "user4",
    user: {
      name: "u/AlexKim",
      avatar: "",
      badge: "Verified",
    },
    title:
      "Authentic Korean bibimbap from my grandmother's recipe",
    content:
      "The key to perfect bibimbap is getting that crispy rice layer at the bottom. Use a cast iron pan and let it sit on high heat for a few minutes. Game changer!",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
    timestamp: "1d ago",
    upvotes: 1834,
    downvotes: 28,
    userVote: "up",
    comments: 123,
  },
  {
    id: "5",
    communityId: "8",
    communityName: "r/MealPrepMasters",
    userId: "user5",
    user: {
      name: "u/RachelG",
      avatar: "",
    },
    title:
      "Sunday meal prep complete - 5 days of lunches ready to go!",
    content:
      "Grilled chicken, brown rice, and roasted vegetables. Simple, healthy, and never gets old. Total prep time: 2 hours for 5 meals.",
    image:
      "https://images.unsplash.com/photo-1588768804908-f0c51dc23e5a?w=800&q=80",
    timestamp: "3h ago",
    upvotes: 1456,
    downvotes: 19,
    userVote: null,
    comments: 92,
  },
  {
    id: "6",
    communityId: "1",
    communityName: "r/VeganWarriors",
    userId: "user6",
    user: {
      name: "u/LisaM",
      avatar: "",
    },
    title:
      "Creamy chickpea curry that will convert meat-eaters",
    content:
      "This vegan curry is incredibly creamy thanks to coconut milk. The spices are perfectly balanced and it's ready in 30 minutes. Serve over basmati rice!",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    timestamp: "6h ago",
    upvotes: 2034,
    downvotes: 31,
    userVote: "up",
    comments: 134,
  },
];

type SortOption = "hot" | "new" | "top" | "rising";
type ViewMode = "feed" | "communities";

import { getPosts, getCommunities, createPost, createCommunity, voteOnPost, joinCommunity, leaveCommunity, isAuthenticated } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { useEffect } from "react";

export function CommunityFeed() {
  const [posts, setPosts] =
    useState<CommunityPost[]>([]);
  const [selectedCommunityId, setSelectedCommunityId] =
    useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("hot");
  const [communities, setCommunities] =
    useState<Community[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("feed");
  const [isCreatePostOpen, setIsCreatePostOpen] =
    useState(false);
  const [isCreateCommunityOpen, setIsCreateCommunityOpen] =
    useState(false);
  const [communitySearchQuery, setCommunitySearchQuery] =
    useState("");
  const [newPost, setNewPost] = useState({
    communityId: "",
    title: "",
    content: "",
    image: "",
  });
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "",
    tags: "",
    image: "",
  });

  useEffect(() => {
    loadPosts();
    loadCommunities();
  }, [sortBy, selectedCommunityId]);

  const handleImageUpload = (
    file: File,
    callback: (imageUrl: string) => void
  ) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadPosts = async () => {
    try {
      const data = await getPosts({
        communityId: selectedCommunityId || undefined,
        sort: sortBy as "hot" | "new" | "top",
      });
      setPosts(data);
    } catch (error) {
      console.error("Error loading posts:", error);
    }
  };

  const loadCommunities = async () => {
    try {
      const data = await getCommunities();
      setCommunities(data);
    } catch (error) {
      console.error("Error loading communities:", error);
    }
  };

  const handleVote = async (
    postId: string,
    voteType: "up" | "down",
  ) => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const result = await voteOnPost(postId, voteType);
      
      // Update local state
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              upvotes: result.post.upvotes,
              downvotes: result.post.downvotes,
              userVote: result.userVote,
            };
          }
          return post;
        })
      );
    } catch (error: any) {
      console.error("Error voting:", error);
      toast.error(error.message || "Failed to vote");
    }
  };

  const handleVoteOld = (
    postId: string,
    voteType: "up" | "down",
  ) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          let newUpvotes = post.upvotes;
          let newDownvotes = post.downvotes;
          let newUserVote: "up" | "down" | null = voteType;

          if (post.userVote === voteType) {
            if (voteType === "up") newUpvotes--;
            else newDownvotes--;
            newUserVote = null;
          } else if (post.userVote === null) {
            if (voteType === "up") newUpvotes++;
            else newDownvotes++;
          } else {
            if (voteType === "up") {
              newUpvotes++;
              newDownvotes--;
            } else {
              newDownvotes++;
              newUpvotes--;
            }
          }

          return {
            ...post,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            userVote: newUserVote,
          };
        }
        return post;
      }),
    );
  };

  const handleJoinToggle = async (communityId: string) => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to join communities");
      return;
    }

    try {
      const community = communities.find(c => c.id === communityId);
      if (!community) return;

      if (community.isJoined) {
        await leaveCommunity(communityId);
        toast.success("Left community");
      } else {
        await joinCommunity(communityId);
        toast.success("Joined community!");
      }

      // Reload communities
      await loadCommunities();
    } catch (error: any) {
      console.error("Error toggling community membership:", error);
      toast.error(error.message || "Failed to update membership");
    }
  };

  const handleCreatePost = async () => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to create posts");
      return;
    }

    if (
      !newPost.title ||
      !newPost.content ||
      !newPost.communityId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createPost({
        communityId: newPost.communityId,
        title: newPost.title,
        content: newPost.content,
        image: newPost.image || undefined,
      });
      
      toast.success("Post created successfully!");
      await loadPosts();
      setIsCreatePostOpen(false);
      setNewPost({
        communityId: "",
        title: "",
        content: "",
        image: "",
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error(error.message || "Failed to create post");
    }
  };

  const handleCreateCommunity = async () => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to create communities");
      return;
    }

    if (!newCommunity.name || !newCommunity.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category || "General",
        image: newCommunity.image || undefined,
        tags: newCommunity.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });

      toast.success("Community created successfully!");
      await loadCommunities();
      setIsCreateCommunityOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        category: "",
        tags: "",
        image: "",
      });
    } catch (error: any) {
      console.error("Error creating community:", error);
      toast.error(error.message || "Failed to create community");
    }
  };

  // Filter and sort posts
  let filteredPosts = selectedCommunityId
    ? posts.filter(
        (post) => post.communityId === selectedCommunityId,
      )
    : posts;

  filteredPosts = [...filteredPosts].sort((a, b) => {
    const aScore = a.upvotes - a.downvotes;
    const bScore = b.upvotes - b.downvotes;

    switch (sortBy) {
      case "hot":
        return bScore - aScore;
      case "top":
        return bScore - aScore;
      case "new":
        return b.id.localeCompare(a.id);
      case "rising":
        return (
          bScore / (b.comments + 1) - aScore / (a.comments + 1)
        );
      default:
        return 0;
    }
  });

  // Filter communities for search
  const filteredCommunities = communities.filter(
    (community) =>
      community.name
        .toLowerCase()
        .includes(communitySearchQuery.toLowerCase()) ||
      community.description
        .toLowerCase()
        .includes(communitySearchQuery.toLowerCase()) ||
      community.tags.some((tag) =>
        tag
          .toLowerCase()
          .includes(communitySearchQuery.toLowerCase()),
      ),
  );

  const joinedCommunities = filteredCommunities.filter(
    (c) => c.isJoined,
  );
  const discoverCommunities = filteredCommunities.filter(
    (c) => !c.isJoined,
  );
  const selectedCommunity = communities.find(
    (c) => c.id === selectedCommunityId,
  );
  
  // Filter communities created by the current user
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  
  useEffect(() => {
    const loadCurrentUserName = async () => {
      try {
        const { getCurrentUser } = await import("../utils/supabase/client");
        const user = await getCurrentUser();
        setCurrentUserName(user?.name || null);
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUserName();
  }, []);
  
  const myCommunities = filteredCommunities.filter(
    (c) => currentUserName && c.createdBy === currentUserName,
  );

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* Left Sidebar - Communities */}
      <div className="hidden lg:block w-64 shrink-0">
        <div className="sticky top-6 space-y-4">
          {/* Home Button - Separate from Communities */}
          <Card className="p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10">
            <Button
              variant={
                selectedCommunityId === null
                  ? "default"
                  : "ghost"
              }
              className="w-full justify-start gap-3 rounded-full"
              size="default"
              onClick={() => {
                setSelectedCommunityId(null);
                setViewMode("feed");
              }}
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-md">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span>Home Feed</span>
            </Button>
          </Card>

          {/* Communities List */}
          <Card className="p-4 rounded-3xl">
            <h3 className="mb-3 px-2">Your Communities</h3>
            <div className="space-y-1">
              {joinedCommunities.length > 0 ? (
                <>
                  {joinedCommunities
                    .slice(0, 5)
                    .map((community) => (
                      <Button
                        key={community.id}
                        variant={
                          selectedCommunityId === community.id
                            ? "secondary"
                            : "ghost"
                        }
                        className="w-full justify-start gap-2 rounded-full"
                        size="sm"
                        onClick={() => {
                          setSelectedCommunityId(community.id);
                          setViewMode("feed");
                        }}
                      >
                        <div className="w-6 h-6 rounded-full bg-accent overflow-hidden border-2 border-background shadow-sm">
                          <ImageWithFallback
                            src={community.image}
                            alt={community.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm truncate">
                          {community.name}
                        </span>
                      </Button>
                    ))}
                  {joinedCommunities.length > 5 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-xs rounded-full"
                      onClick={() => setViewMode("communities")}
                    >
                      View all ({joinedCommunities.length})
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Join communities to see them here
                </p>
              )}
            </div>
          </Card>

          <div className="space-y-2">
            <Button
              className="w-full gap-2 rounded-full"
              onClick={() => setIsCreatePostOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Create Post
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2 rounded-full"
              onClick={() => setViewMode("communities")}
            >
              <Search className="w-4 h-4" />
              Browse Communities
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {viewMode === "feed" ? (
          <>
            {/* Feed Header with sort options */}
            <Card className="p-4 rounded-3xl">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant={
                      sortBy === "hot" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSortBy("hot")}
                    className="gap-1 rounded-full"
                  >
                    <Flame className="w-4 h-4" />
                    Hot
                  </Button>
                  <Button
                    variant={
                      sortBy === "new" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSortBy("new")}
                    className="gap-1 rounded-full"
                  >
                    <Clock className="w-4 h-4" />
                    New
                  </Button>
                  <Button
                    variant={
                      sortBy === "top" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSortBy("top")}
                    className="gap-1 rounded-full"
                  >
                    <Award className="w-4 h-4" />
                    Top
                  </Button>
                  <Button
                    variant={
                      sortBy === "rising" ? "default" : "ghost"
                    }
                    size="sm"
                    onClick={() => setSortBy("rising")}
                    className="gap-1 rounded-full"
                  >
                    <TrendingUp className="w-4 h-4" />
                    Rising
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="gap-2 rounded-full"
                    size="sm"
                    onClick={() => setIsCreateCommunityOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Create Community</span>
                    <span className="sm:hidden">Create</span>
                  </Button>
                  <Button
                    className="gap-2 lg:hidden rounded-full"
                    size="sm"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Post
                  </Button>
                </div>
              </div>
            </Card>

            {/* Posts */}
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  onCommentAdded={loadPosts}
                  onPostDeleted={loadPosts}
                />
              ))
            ) : (
              <Card className="p-12 text-center rounded-3xl">
                <p className="text-muted-foreground">
                  No posts yet. Be the first to post!
                </p>
              </Card>
            )}
          </>
        ) : (
          <>
            {/* Communities Browser */}
            <Card className="p-4 rounded-3xl">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("feed")}
                    className="gap-2 rounded-full"
                  >
                    <ArrowUp className="w-4 h-4 rotate-180" />
                    Back to Feed
                  </Button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      type="text"
                      value={communitySearchQuery}
                      onChange={(e) =>
                        setCommunitySearchQuery(e.target.value)
                      }
                      className="pl-10 rounded-full"
                    />
                  </div>
                  <Button
                    onClick={() => setIsCreateCommunityOpen(true)}
                    className="gap-2 rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                    Create Community
                  </Button>
                </div>
              </div>
            </Card>

            {/* Info Banner */}
            {communities.length === 0 && (
              <Card className="p-6 bg-primary/5 border-primary/20 rounded-3xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1">Welcome to Chef Circle Communities!</h3>
                    <p className="text-sm text-muted-foreground">
                      Join communities to connect with other food enthusiasts, share your culinary creations, 
                      and discover new recipes. Can't find what you're looking for? Create your own community!
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Tabs defaultValue="joined" className="w-full">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="joined">
                  My Communities ({joinedCommunities.length})
                </TabsTrigger>
                <TabsTrigger value="discover">
                  Discover ({discoverCommunities.length})
                </TabsTrigger>
                <TabsTrigger value="manage">
                  Manage ({myCommunities.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="joined" className="mt-6">
                {joinedCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {joinedCommunities.map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        onJoinToggle={handleJoinToggle}
                        onViewPosts={() => {
                          setSelectedCommunityId(community.id);
                          setViewMode("feed");
                        }}
                        onCommunityUpdated={loadCommunities}
                      />
                    ))}
                  </div>
                ) : communitySearchQuery ? (
                  <Card className="p-12 text-center rounded-3xl">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">
                      No Communities Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No joined communities match your search. Try different keywords or browse the Discover tab.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setCommunitySearchQuery("")}
                      className="rounded-full"
                    >
                      Clear Search
                    </Button>
                  </Card>
                ) : (
                  <Card className="p-12 text-center rounded-3xl">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">
                      No Communities Joined Yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Join communities to connect with
                      like-minded food enthusiasts!
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="discover" className="mt-6">
                {discoverCommunities.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {discoverCommunities.map((community) => (
                      <CommunityCard
                        key={community.id}
                        community={community}
                        onJoinToggle={handleJoinToggle}
                        onViewPosts={() => {
                          setSelectedCommunityId(community.id);
                          setViewMode("feed");
                        }}
                        onCommunityUpdated={loadCommunities}
                      />
                    ))}
                  </div>
                ) : communitySearchQuery ? (
                  <Card className="p-12 text-center rounded-3xl">
                    <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">
                      No Communities Found
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      No communities match your search. Try different keywords or create a new community!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => setCommunitySearchQuery("")}
                        className="rounded-full"
                      >
                        Clear Search
                      </Button>
                      <Button
                        onClick={() => setIsCreateCommunityOpen(true)}
                        className="rounded-full gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Create Community
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-12 text-center rounded-3xl">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">
                      All Caught Up!
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      You've joined all available communities. Create a new one to expand the Chef Circle!
                    </p>
                    <Button
                      onClick={() => setIsCreateCommunityOpen(true)}
                      className="rounded-full gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Create Community
                    </Button>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="manage" className="mt-6">
                {!isAuthenticated() ? (
                  <Card className="p-12 text-center rounded-3xl border-2 border-dashed">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">Sign In Required</h3>
                    <p className="text-muted-foreground mb-4">
                      Please sign in to manage your communities
                    </p>
                  </Card>
                ) : myCommunities.length > 0 ? (
                  <>
                    <Card className="p-4 bg-blue-50 border-blue-200 rounded-3xl mb-4">
                      <h3 className="text-blue-900 mb-1">Manage Your Communities</h3>
                      <p className="text-sm text-blue-700">
                        View and edit all communities you've created. Click the settings icon (⚙️) on any card to edit or delete.
                      </p>
                    </Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {myCommunities.map((community) => (
                        <CommunityCard
                          key={community.id}
                          community={community}
                          onJoinToggle={handleJoinToggle}
                          onViewPosts={() => {
                            setSelectedCommunityId(community.id);
                            setViewMode("feed");
                          }}
                          onCommunityUpdated={loadCommunities}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <Card className="p-12 text-center rounded-3xl border-2 border-dashed">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="mb-2">No Communities Created Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first community to bring food enthusiasts together!
                    </p>
                    <Button onClick={() => setIsCreateCommunityOpen(true)} className="rounded-full gap-2">
                      <Plus className="w-4 h-4" />
                      Create Community
                    </Button>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Right Sidebar - Community Info */}
      <div className="hidden xl:block w-80 shrink-0">
        <div className="sticky top-6 space-y-4">
          {selectedCommunity ? (
            <Card className="p-4">
              <div className="relative h-24 -m-4 mb-4 overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={selectedCommunity.image}
                  alt={selectedCommunity.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <h3 className="absolute bottom-2 left-4 text-white">
                  r/{selectedCommunity.name.replace(/\s+/g, "")}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {selectedCommunity.description}
              </p>
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Members
                  </span>
                  <span>
                    {selectedCommunity.memberCount.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Posts
                  </span>
                  <span>
                    {selectedCommunity.postCount.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {selectedCommunity.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <Button
                className="w-full"
                variant={
                  selectedCommunity.isJoined
                    ? "outline"
                    : "default"
                }
                onClick={() =>
                  handleJoinToggle(selectedCommunity.id)
                }
              >
                {selectedCommunity.isJoined ? "Joined" : "Join"}
              </Button>
            </Card>
          ) : (
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-primary" />
                <h3>Home Feed</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Your personalized feed from all communities
                you've joined. See the best cooking content from
                across the platform!
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {joinedCommunities.length} communities
                    joined
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-muted-foreground" />
                  <span>{posts.length} posts today</span>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent">
            <h4 className="mb-2">Recipe Community Rules</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li>1. Be respectful and kind</li>
              <li>2. Share your recipes</li>
              <li>3. Credit original sources</li>
              <li>4. No spam or self-promotion</li>
              <li>5. Have fun cooking!</li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Create Post Dialog */}
      <Dialog
        open={isCreatePostOpen}
        onOpenChange={setIsCreatePostOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a Post</DialogTitle>
            <DialogDescription>
              Share your cooking experience, recipe, or tips
              with the community.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="community">Community *</Label>
              <Select
                value={newPost.communityId}
                onValueChange={(value) =>
                  setNewPost({ ...newPost, communityId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {joinedCommunities.map((community) => (
                    <SelectItem
                      key={community.id}
                      value={community.id}
                    >
                      r/{community.name.replace(/\s+/g, "")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    title: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({
                    ...newPost,
                    content: e.target.value,
                  })
                }
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="post-image">Image (Optional)</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="post-image-url"
                    type="text"
                    value={newPost.image}
                    onChange={(e) =>
                      setNewPost({
                        ...newPost,
                        image: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <label htmlFor="post-image-file">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        document
                          .getElementById("post-image-file")
                          ?.click()
                      }
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </label>
                  <input
                    id="post-image-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, (url) =>
                          setNewPost({ ...newPost, image: url })
                        );
                      }
                    }}
                  />
                </div>
                {newPost.image && (
                  <div className="relative">
                    <ImageWithFallback
                      src={newPost.image}
                      alt="Post preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() =>
                        setNewPost({ ...newPost, image: "" })
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Add an image to make your post more engaging
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreatePostOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreatePost}
              disabled={
                !newPost.title ||
                !newPost.content ||
                !newPost.communityId
              }
            >
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Community Dialog */}
      <Dialog
        open={isCreateCommunityOpen}
        onOpenChange={setIsCreateCommunityOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create a Community</DialogTitle>
            <DialogDescription>
              Start your own cooking community and bring food
              lovers together! Share recipes, tips, and culinary experiences.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Community Name *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">
                  r/
                </span>
                <Input
                  id="name"
                  value={newCommunity.name}
                  onChange={(e) =>
                    setNewCommunity({
                      ...newCommunity,
                      name: e.target.value.replace(/\s+/g, ""),
                    })
                  }
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Choose a unique name without spaces (e.g., VeganBaking, SpicyFoodLovers)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newCommunity.description}
                onChange={(e) =>
                  setNewCommunity({
                    ...newCommunity,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Help others understand your community's purpose and culture
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={newCommunity.category}
                onValueChange={(value) =>
                  setNewCommunity({
                    ...newCommunity,
                    category: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cuisine">
                    Cuisine (Italian, Asian, Mexican, etc.)
                  </SelectItem>
                  <SelectItem value="Diet-Specific">
                    Diet-Specific (Vegan, Keto, etc.)
                  </SelectItem>
                  <SelectItem value="Technique">
                    Technique (Baking, Grilling, etc.)
                  </SelectItem>
                  <SelectItem value="Lifestyle">
                    Lifestyle (Quick Meals, Budget Cooking, etc.)
                  </SelectItem>
                  <SelectItem value="General">
                    General Discussion
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">
                Tags (comma-separated)
              </Label>
              <Input
                id="tags"
                value={newCommunity.tags}
                onChange={(e) =>
                  setNewCommunity({
                    ...newCommunity,
                    tags: e.target.value,
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                Add relevant tags to help people discover your community
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="community-image">Community Banner (Optional)</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="community-image-url"
                    type="text"
                    value={newCommunity.image}
                    onChange={(e) =>
                      setNewCommunity({
                        ...newCommunity,
                        image: e.target.value,
                      })
                    }
                    className="flex-1"
                  />
                  <label htmlFor="community-image-file">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2"
                      onClick={() =>
                        document
                          .getElementById("community-image-file")
                          ?.click()
                      }
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </Button>
                  </label>
                  <input
                    id="community-image-file"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file, (url) =>
                          setNewCommunity({ ...newCommunity, image: url })
                        );
                      }
                    }}
                  />
                </div>
                {newCommunity.image && (
                  <div className="relative">
                    <ImageWithFallback
                      src={newCommunity.image}
                      alt="Community banner preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={() =>
                        setNewCommunity({ ...newCommunity, image: "" })
                      }
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Upload a banner image to represent your community (recommended: 1200x300px)
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateCommunityOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCommunity}
              disabled={
                !newCommunity.name || !newCommunity.description
              }
            >
              Create Community
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}