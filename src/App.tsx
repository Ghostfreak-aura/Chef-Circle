import { useState, useEffect } from "react";
import { RecipeRecommendations } from "./components/RecipeRecommendations";
import { CommunityFeed } from "./components/CommunityFeed";
import { AIChef } from "./components/AIChef";
import { Profile } from "./components/Profile";
import { Auth } from "./components/Auth";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { ChefHat, LogIn, LogOut, User } from "lucide-react";
import { getCurrentUser, signOut, isAuthenticated, seedData } from "./utils/supabase/client";
import { mockRecipes } from "./data/mockRecipes";
import { mockCommunities } from "./data/mockCommunities";
import { mockPosts } from "./data/mockPosts";
import { toast } from "sonner@2.0.3";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [showAuth, setShowAuth] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSeeded, setIsSeeded] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated()) {
      loadUser();
    }

    // Seed initial data if not already seeded
    const seeded = localStorage.getItem("dataSeeded");
    if (!seeded) {
      seedInitialData();
    } else {
      setIsSeeded(true);
    }
  }, []);

  const loadUser = async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const seedInitialData = async () => {
    try {
      await seedData(mockRecipes, mockCommunities, mockPosts);
      localStorage.setItem("dataSeeded", "true");
      setIsSeeded(true);
      console.log("Initial data seeded successfully");
    } catch (error) {
      console.error("Error seeding data:", error);
      toast.error("Failed to load initial data. Please refresh the page.");
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setCurrentUser(null);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-2xl">
                <ChefHat className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1>Chef Circle</h1>
                <p className="text-sm text-muted-foreground">
                  AI-Powered Recipe Discovery
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm">{currentUser.name}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button variant="default" size="sm" onClick={() => setShowAuth(true)}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <Auth 
        open={showAuth} 
        onOpenChange={setShowAuth}
        onSuccess={loadUser}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="discover" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="discover">For You</TabsTrigger>
            <TabsTrigger value="community">
              Community
            </TabsTrigger>
            <TabsTrigger value="ai-chef">AI Chef</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="discover" className="mt-6">
            <RecipeRecommendations />
          </TabsContent>

          <TabsContent value="community" className="mt-6">
            <CommunityFeed />
          </TabsContent>

          <TabsContent value="ai-chef" className="mt-6">
            <AIChef />
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Profile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}