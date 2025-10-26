export interface CommunityPost {
  id: string;
  communityId: string;
  communityName: string;
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
  createdAt?: string;
}

export const mockPosts: CommunityPost[] = [
  {
    id: "1",
    communityId: "2",
    communityName: "r/ItalianHomeCooking",
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
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    communityId: "1",
    communityName: "r/VeganWarriors",
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
    userVote: null,
    comments: 67,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    communityId: "4",
    communityName: "r/BakingBliss",
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
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    communityId: "5",
    communityName: "r/AsianFusion",
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
    userVote: null,
    comments: 123,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    communityId: "8",
    communityName: "r/MealPrepMasters",
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
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "6",
    communityId: "1",
    communityName: "r/VeganWarriors",
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
    userVote: null,
    comments: 134,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
];
