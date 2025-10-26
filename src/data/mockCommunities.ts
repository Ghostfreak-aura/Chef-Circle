export interface Community {
  id: string;
  name: string;
  description: string;
  image: string;
  category: string;
  memberCount: number;
  postCount: number;
  isJoined: boolean;
  createdBy: string;
  tags: string[];
}

export const mockCommunities: Community[] = [
  {
    id: "1",
    name: "Vegan Warriors",
    description:
      "A community for plant-based cooking enthusiasts sharing creative vegan recipes and tips.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    category: "Diet-Specific",
    memberCount: 12500,
    postCount: 3420,
    isJoined: true,
    createdBy: "Sarah Chen",
    tags: ["vegan", "plant-based", "healthy"],
  },
  {
    id: "2",
    name: "Italian Home Cooking",
    description:
      "Traditional Italian recipes passed down through generations. From pasta to pizza!",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    category: "Cuisine",
    memberCount: 18700,
    postCount: 5680,
    isJoined: true,
    createdBy: "Marco Rossi",
    tags: ["italian", "pasta", "traditional"],
  },
  {
    id: "3",
    name: "Keto Kitchen",
    description:
      "Low-carb, high-fat recipes for the keto lifestyle. Share your macros and wins!",
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
    category: "Diet-Specific",
    memberCount: 9800,
    postCount: 2340,
    isJoined: false,
    createdBy: "Alex Johnson",
    tags: ["keto", "low-carb", "healthy"],
  },
  {
    id: "4",
    name: "Baking Bliss",
    description:
      "Everything from cookies to croissants. Share your best bakes and techniques!",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    category: "Technique",
    memberCount: 15300,
    postCount: 4120,
    isJoined: false,
    createdBy: "Emma Wilson",
    tags: ["baking", "desserts", "bread"],
  },
  {
    id: "5",
    name: "Asian Fusion",
    description:
      "Exploring the diverse flavors of Asian cuisine from Thai to Japanese to Korean.",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
    category: "Cuisine",
    memberCount: 14200,
    postCount: 3890,
    isJoined: true,
    createdBy: "Kim Lee",
    tags: ["asian", "fusion", "spicy"],
  },
  {
    id: "6",
    name: "Quick Weeknight Meals",
    description:
      "Delicious recipes ready in 30 minutes or less. Perfect for busy weeknights!",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    category: "Lifestyle",
    memberCount: 22100,
    postCount: 6780,
    isJoined: false,
    createdBy: "Lisa Martinez",
    tags: ["quick", "easy", "weeknight"],
  },
  {
    id: "7",
    name: "BBQ & Grilling Masters",
    description:
      "Fire up the grill! Share your smoking techniques, rubs, and BBQ secrets.",
    image:
      "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
    category: "Technique",
    memberCount: 11400,
    postCount: 2950,
    isJoined: false,
    createdBy: "Mike Thompson",
    tags: ["bbq", "grilling", "smoking"],
  },
  {
    id: "8",
    name: "Meal Prep Masters",
    description:
      "Plan, prep, and conquer your week with organized meal preparation strategies.",
    image:
      "https://images.unsplash.com/photo-1588768804908-f0c51dc23e5a?w=800&q=80",
    category: "Lifestyle",
    memberCount: 19600,
    postCount: 5120,
    isJoined: true,
    createdBy: "Rachel Green",
    tags: ["meal-prep", "organization", "healthy"],
  },
];