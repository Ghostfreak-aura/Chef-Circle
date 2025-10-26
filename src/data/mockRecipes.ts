export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  cuisine: string;
  difficulty: string;
  cookTime: string;
  servings: string;
  rating: number;
  reviews: number;
  popularity: string;
  tags: string[];
  ingredients: string[];
  instructions: string[];
  comments: {
    id: string;
    user: string;
    avatar: string;
    comment: string;
    date: string;
    rating: number;
  }[];
}

export const mockRecipes: Recipe[] = [
  {
    id: "1",
    title: "Creamy Tuscan Garlic Chicken",
    description:
      "Tender chicken breasts in a creamy garlic sauce with sun-dried tomatoes and spinach. A restaurant-quality meal ready in 30 minutes!",
    image:
      "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
    cuisine: "Italian",
    difficulty: "intermediate",
    cookTime: "30 min",
    servings: "4",
    rating: 4.8,
    reviews: 234,
    popularity: "Trending",
    tags: ["gluten-free", "high-protein", "keto"],
    ingredients: [
      "4 boneless chicken breasts",
      "2 tbsp olive oil",
      "4 cloves garlic, minced",
      "1 cup heavy cream",
      "1/2 cup chicken broth",
      "1/2 cup sun-dried tomatoes",
      "2 cups fresh spinach",
      "1/2 cup parmesan cheese",
      "Salt and pepper to taste",
      "Italian seasoning",
    ],
    instructions: [
      "Season chicken breasts with salt, pepper, and Italian seasoning.",
      "Heat olive oil in a large skillet over medium-high heat. Cook chicken until golden brown on both sides, about 6-8 minutes per side. Remove and set aside.",
      "In the same skillet, add minced garlic and cook for 1 minute until fragrant.",
      "Add heavy cream, chicken broth, and sun-dried tomatoes. Bring to a simmer.",
      "Stir in parmesan cheese until melted and sauce is smooth.",
      "Add spinach and cook until wilted, about 2 minutes.",
      "Return chicken to the skillet and simmer for 5 minutes until cooked through.",
      "Serve hot with pasta, rice, or vegetables.",
    ],
    comments: [
      {
        id: "1",
        user: "Maria G.",
        avatar: "",
        comment:
          "This was absolutely delicious! My family loved it. The sauce is incredible!",
        date: "2 days ago",
        rating: 5,
      },
      {
        id: "2",
        user: "John D.",
        avatar: "",
        comment:
          "Made this for dinner tonight. Pro tip: add a splash of white wine to the sauce for extra flavor!",
        date: "1 week ago",
        rating: 5,
      },
    ],
  },
  {
    id: "2",
    title: "Vegan Buddha Bowl",
    description:
      "A colorful and nutritious bowl packed with roasted vegetables, quinoa, chickpeas, and a creamy tahini dressing.",
    image:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    cuisine: "Mediterranean",
    difficulty: "beginner",
    cookTime: "40 min",
    servings: "2",
    rating: 4.7,
    reviews: 189,
    popularity: "Popular",
    tags: ["vegan", "vegetarian", "gluten-free", "healthy"],
    ingredients: [
      "1 cup quinoa",
      "1 can chickpeas, drained",
      "1 sweet potato, cubed",
      "2 cups kale",
      "1 avocado, sliced",
      "1/4 cup tahini",
      "2 tbsp lemon juice",
      "1 tbsp maple syrup",
      "Olive oil",
      "Salt, pepper, cumin, paprika",
    ],
    instructions: [
      "Preheat oven to 400°F (200°C).",
      "Cook quinoa according to package instructions.",
      "Toss sweet potato cubes and chickpeas with olive oil, cumin, paprika, salt, and pepper.",
      "Spread on a baking sheet and roast for 25-30 minutes until golden.",
      "Massage kale with a bit of olive oil and lemon juice.",
      "Make tahini dressing by mixing tahini, lemon juice, maple syrup, and water until smooth.",
      "Assemble bowls with quinoa, roasted vegetables, chickpeas, kale, and avocado.",
      "Drizzle with tahini dressing and serve.",
    ],
    comments: [
      {
        id: "1",
        user: "Lisa M.",
        avatar: "",
        comment:
          "Perfect meal prep recipe! I make this every Sunday.",
        date: "3 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "3",
    title: "Spicy Korean Bibimbap",
    description:
      "Traditional Korean rice bowl topped with seasoned vegetables, a fried egg, and spicy gochujang sauce.",
    image:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80",
    cuisine: "Korean",
    difficulty: "intermediate",
    cookTime: "45 min",
    servings: "4",
    rating: 4.9,
    reviews: 312,
    popularity: "Trending",
    tags: ["spicy", "gluten-free", "vegetarian"],
    ingredients: [
      "3 cups cooked white rice",
      "2 cups spinach",
      "1 cup bean sprouts",
      "1 large carrot, julienned",
      "1 zucchini, julienned",
      "4 eggs",
      "3 tbsp gochujang",
      "2 tbsp sesame oil",
      "Soy sauce",
      "Sesame seeds",
      "Green onions",
    ],
    instructions: [
      "Cook rice and keep warm.",
      "Blanch spinach and bean sprouts separately, then squeeze out excess water.",
      "Sauté carrot and zucchini separately with a bit of sesame oil until tender.",
      "Season each vegetable with a touch of sesame oil and salt.",
      "Fry eggs sunny-side up.",
      "Mix gochujang with sesame oil and a bit of water to make the sauce.",
      "Divide rice among bowls, arrange vegetables on top in sections.",
      "Top with a fried egg, drizzle with sauce, and garnish with sesame seeds and green onions.",
    ],
    comments: [
      {
        id: "1",
        user: "Alex K.",
        avatar: "",
        comment:
          "Authentic recipe! Reminds me of my grandmother's cooking.",
        date: "1 day ago",
        rating: 5,
      },
    ],
  },
  {
    id: "4",
    title: "Classic Margherita Pizza",
    description:
      "Homemade pizza with a crispy crust, fresh tomato sauce, mozzarella, and basil. Perfect for pizza night!",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
    cuisine: "Italian",
    difficulty: "intermediate",
    cookTime: "90 min",
    servings: "4",
    rating: 4.6,
    reviews: 445,
    popularity: "Popular",
    tags: ["vegetarian", "italian"],
    ingredients: [
      "3 cups all-purpose flour",
      "1 packet active dry yeast",
      "1 cup warm water",
      "2 tbsp olive oil",
      "1 tsp sugar",
      "1 tsp salt",
      "1 can crushed tomatoes",
      "2 cloves garlic",
      "8 oz fresh mozzarella",
      "Fresh basil leaves",
    ],
    instructions: [
      "Mix warm water, yeast, and sugar. Let sit for 5 minutes until foamy.",
      "Add flour, olive oil, and salt. Knead for 10 minutes until smooth.",
      "Let dough rise in a warm place for 1 hour until doubled.",
      "Make sauce by simmering crushed tomatoes with garlic, salt, and herbs for 20 minutes.",
      "Preheat oven to 475°F (245°C) with pizza stone if available.",
      "Roll out dough into desired shape.",
      "Spread sauce, add torn mozzarella, and bake for 12-15 minutes until crust is golden.",
      "Top with fresh basil leaves and drizzle with olive oil before serving.",
    ],
    comments: [
      {
        id: "1",
        user: "Tony R.",
        avatar: "",
        comment:
          "Best homemade pizza I've ever made! The dough recipe is perfect.",
        date: "5 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "5",
    title: "Thai Green Curry",
    description:
      "Aromatic and creamy Thai curry with vegetables, tofu, and fragrant herbs. Customize with your favorite protein!",
    image:
      "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=80",
    cuisine: "Thai",
    difficulty: "beginner",
    cookTime: "25 min",
    servings: "4",
    rating: 4.8,
    reviews: 267,
    popularity: "Trending",
    tags: ["vegan", "vegetarian", "gluten-free", "spicy"],
    ingredients: [
      "2 tbsp green curry paste",
      "1 can coconut milk",
      "1 block firm tofu, cubed",
      "1 bell pepper, sliced",
      "1 zucchini, sliced",
      "1 cup bamboo shoots",
      "2 tbsp soy sauce",
      "1 tbsp brown sugar",
      "Thai basil",
      "Lime",
      "Jasmine rice for serving",
    ],
    instructions: [
      "Cook jasmine rice according to package instructions.",
      "Heat a large pan over medium heat and add curry paste. Cook for 1-2 minutes until fragrant.",
      "Add half the coconut milk and stir until combined.",
      "Add tofu and vegetables. Cook for 5 minutes.",
      "Add remaining coconut milk, soy sauce, and brown sugar. Simmer for 10 minutes.",
      "Stir in bamboo shoots and Thai basil.",
      "Taste and adjust seasoning with soy sauce or sugar as needed.",
      "Serve over jasmine rice with lime wedges.",
    ],
    comments: [
      {
        id: "1",
        user: "Sophie T.",
        avatar: "",
        comment:
          "So easy and delicious! I add extra veggies for more nutrition.",
        date: "4 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "6",
    title: "Chocolate Lava Cake",
    description:
      "Decadent individual chocolate cakes with a molten chocolate center. The ultimate chocolate dessert!",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80",
    cuisine: "French",
    difficulty: "advanced",
    cookTime: "20 min",
    servings: "4",
    rating: 4.9,
    reviews: 523,
    popularity: "Popular",
    tags: ["dessert", "chocolate", "vegetarian"],
    ingredients: [
      "6 oz dark chocolate",
      "1/2 cup butter",
      "2 eggs",
      "2 egg yolks",
      "1/4 cup sugar",
      "2 tbsp flour",
      "Pinch of salt",
      "Butter for ramekins",
      "Cocoa powder for dusting",
      "Vanilla ice cream for serving",
    ],
    instructions: [
      "Preheat oven to 450°F (230°C). Butter and dust 4 ramekins with cocoa powder.",
      "Melt chocolate and butter together in a double boiler. Let cool slightly.",
      "Whisk eggs, egg yolks, and sugar until thick and pale.",
      "Fold melted chocolate into egg mixture.",
      "Gently fold in flour and salt.",
      "Divide batter among prepared ramekins.",
      "Bake for 12 minutes until edges are set but center is still soft.",
      "Let cool for 1 minute, then invert onto plates. Serve immediately with ice cream.",
    ],
    comments: [
      {
        id: "1",
        user: "Emma R.",
        avatar: "",
        comment:
          "Restaurant quality! The timing is crucial - don't overbake!",
        date: "1 week ago",
        rating: 5,
      },
    ],
  },
  {
    id: "7",
    title: "Mediterranean Grain Salad",
    description:
      "Fresh and healthy grain salad with farro, cucumbers, tomatoes, feta, and a zesty lemon dressing.",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
    cuisine: "Mediterranean",
    difficulty: "beginner",
    cookTime: "35 min",
    servings: "6",
    rating: 4.5,
    reviews: 156,
    popularity: "New",
    tags: ["vegetarian", "healthy", "salad"],
    ingredients: [
      "1 cup farro",
      "2 cups cherry tomatoes, halved",
      "1 cucumber, diced",
      "1/2 red onion, thinly sliced",
      "1 cup feta cheese, crumbled",
      "1/2 cup kalamata olives",
      "1/4 cup fresh parsley",
      "1/4 cup olive oil",
      "2 tbsp lemon juice",
      "Salt and pepper",
    ],
    instructions: [
      "Cook farro according to package instructions. Drain and let cool.",
      "In a large bowl, combine cooled farro, tomatoes, cucumber, red onion, and olives.",
      "Add crumbled feta and fresh parsley.",
      "Whisk together olive oil, lemon juice, salt, and pepper.",
      "Pour dressing over salad and toss gently.",
      "Refrigerate for at least 30 minutes to let flavors meld.",
      "Serve chilled or at room temperature.",
    ],
    comments: [
      {
        id: "1",
        user: "Rachel B.",
        avatar: "",
        comment:
          "Perfect for summer! So refreshing and filling.",
        date: "2 days ago",
        rating: 4,
      },
    ],
  },
  {
    id: "8",
    title: "Beef Tacos with Pico de Gallo",
    description:
      "Classic Mexican tacos with seasoned ground beef, fresh pico de gallo, and all your favorite toppings.",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80",
    cuisine: "Mexican",
    difficulty: "beginner",
    cookTime: "20 min",
    servings: "4",
    rating: 4.7,
    reviews: 389,
    popularity: "Trending",
    tags: ["gluten-free", "mexican", "quick"],
    ingredients: [
      "1 lb ground beef",
      "1 packet taco seasoning",
      "8 corn tortillas",
      "3 tomatoes, diced",
      "1/2 onion, diced",
      "1 jalapeño, minced",
      "1/4 cup cilantro",
      "Lime juice",
      "Shredded cheese",
      "Sour cream",
      "Lettuce",
    ],
    instructions: [
      "Brown ground beef in a large skillet over medium-high heat.",
      "Drain excess fat and add taco seasoning with water according to package directions.",
      "Make pico de gallo by combining diced tomatoes, onion, jalapeño, cilantro, lime juice, and salt.",
      "Warm tortillas in a dry skillet or microwave.",
      "Assemble tacos with seasoned beef, pico de gallo, cheese, lettuce, and sour cream.",
      "Serve with lime wedges on the side.",
    ],
    comments: [
      {
        id: "1",
        user: "Carlos M.",
        avatar: "",
        comment:
          "Taco Tuesday essential! My kids request this every week.",
        date: "3 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "9",
    title: "Japanese Ramen Bowl",
    description:
      "Rich and flavorful ramen with tender pork, soft-boiled eggs, and perfectly cooked noodles in a savory broth.",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
    cuisine: "Japanese",
    difficulty: "advanced",
    cookTime: "2 hours",
    servings: "4",
    rating: 4.9,
    reviews: 412,
    popularity: "Trending",
    tags: ["asian", "comfort-food", "noodles"],
    ingredients: [
      "1 lb pork belly",
      "4 packs ramen noodles",
      "4 eggs",
      "8 cups chicken broth",
      "4 cups pork broth",
      "1/4 cup soy sauce",
      "2 tbsp miso paste",
      "1 tbsp sesame oil",
      "Green onions",
      "Nori sheets",
      "Bamboo shoots",
      "Corn kernels",
    ],
    instructions: [
      "Roast pork belly at 350°F for 1.5 hours until tender. Slice thinly.",
      "Soft-boil eggs for 6.5 minutes, then marinate in soy sauce mixture.",
      "Combine chicken and pork broth in a large pot with miso paste and sesame oil.",
      "Bring broth to a simmer and season with soy sauce.",
      "Cook ramen noodles according to package instructions.",
      "Divide noodles among bowls and ladle hot broth over them.",
      "Top with pork slices, halved eggs, green onions, nori, bamboo shoots, and corn.",
      "Serve immediately while hot.",
    ],
    comments: [
      {
        id: "1",
        user: "Kenji L.",
        avatar: "",
        comment:
          "This is the real deal! The broth is incredibly rich and flavorful.",
        date: "2 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "11",
    title: "Crispy Fish Tacos",
    description:
      "Beer-battered fish tacos with crunchy cabbage slaw and zesty lime crema. Perfect for taco night!",
    image:
      "https://images.unsplash.com/photo-1512838243191-e81e8f66f1fd?w=800&q=80",
    cuisine: "Mexican",
    difficulty: "intermediate",
    cookTime: "35 min",
    servings: "4",
    rating: 4.7,
    reviews: 367,
    popularity: "Trending",
    tags: ["seafood", "mexican", "quick"],
    ingredients: [
      "1 lb white fish fillets",
      "1 cup flour",
      "1 cup beer",
      "1 tsp baking powder",
      "8 corn tortillas",
      "2 cups shredded cabbage",
      "1/2 cup sour cream",
      "2 limes",
      "1/4 cup cilantro",
      "Oil for frying",
      "Salt and pepper",
      "Hot sauce",
    ],
    instructions: [
      "Mix flour, beer, baking powder, salt, and pepper to make batter. Let rest for 10 minutes.",
      "Make lime crema by mixing sour cream with lime juice and zest.",
      "Prepare cabbage slaw with shredded cabbage, lime juice, and cilantro.",
      "Heat oil in a deep skillet to 375°F.",
      "Dip fish pieces in batter and fry until golden and crispy, about 3-4 minutes.",
      "Drain on paper towels.",
      "Warm tortillas and fill with crispy fish.",
      "Top with cabbage slaw, lime crema, cilantro, and hot sauce.",
    ],
    comments: [
      {
        id: "1",
        user: "Diego R.",
        avatar: "",
        comment:
          "Better than any restaurant! The batter is perfectly crispy.",
        date: "3 days ago",
        rating: 5,
      },
    ],
  },
  {
    id: "13",
    title: "Honey Garlic Salmon",
    description:
      "Pan-seared salmon fillets glazed with a sweet and savory honey garlic sauce. Ready in 20 minutes!",
    image:
      "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80",
    cuisine: "American",
    difficulty: "beginner",
    cookTime: "20 min",
    servings: "4",
    rating: 4.9,
    reviews: 445,
    popularity: "Trending",
    tags: [
      "seafood",
      "healthy",
      "gluten-free",
      "quick",
      "high-protein",
    ],
    ingredients: [
      "4 salmon fillets",
      "4 cloves garlic, minced",
      "1/4 cup honey",
      "3 tbsp soy sauce",
      "2 tbsp lemon juice",
      "1 tbsp olive oil",
      "1 tsp ginger, grated",
      "Sesame seeds",
      "Green onions",
      "Salt and pepper",
    ],
    instructions: [
      "Pat salmon fillets dry and season with salt and pepper.",
      "Heat olive oil in a large skillet over medium-high heat.",
      "Place salmon skin-side up and cook for 4-5 minutes until golden.",
      "Flip and cook for another 3-4 minutes.",
      "In a small bowl, mix honey, soy sauce, garlic, lemon juice, and ginger.",
      "Remove salmon and set aside. Pour sauce into the skillet.",
      "Simmer sauce for 2 minutes until slightly thickened.",
      "Return salmon to pan and coat with sauce.",
      "Garnish with sesame seeds and green onions. Serve with rice and vegetables.",
    ],
    comments: [
      {
        id: "1",
        user: "Jennifer W.",
        avatar: "",
        comment:
          "This is my weeknight staple! So easy and the flavor is amazing.",
        date: "1 day ago",
        rating: 5,
      },
      {
        id: "2",
        user: "Mark T.",
        avatar: "",
        comment:
          "The glaze is perfect - not too sweet, just right!",
        date: "4 days ago",
        rating: 5,
      },
    ],
  },
];