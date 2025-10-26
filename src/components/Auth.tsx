import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { signIn, signUp } from "../utils/supabase/client";
import { toast } from "sonner@2.0.3";
import { Checkbox } from "./ui/checkbox";

interface AuthProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function Auth({ open, onOpenChange, onSuccess }: AuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signInForm, setSignInForm] = useState({
    email: "",
    password: "",
  });
  const [signUpForm, setSignUpForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    dietaryPreferences: [] as string[],
    skillLevel: "beginner",
    cuisinePreferences: [] as string[],
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await signIn(signInForm.email, signInForm.password);
      toast.success("Signed in successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (signUpForm.password !== signUpForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await signUp(signUpForm.email, signUpForm.password, signUpForm.name, {
        dietaryPreferences: signUpForm.dietaryPreferences,
        skillLevel: signUpForm.skillLevel,
        cuisinePreferences: signUpForm.cuisinePreferences,
      });
      toast.success("Account created successfully! You can now sign in.");
      
      // Auto sign in
      await signIn(signUpForm.email, signUpForm.password);
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePreference = (
    type: "dietaryPreferences" | "cuisinePreferences",
    value: string
  ) => {
    setSignUpForm((prev) => {
      const current = prev[type];
      const updated = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Welcome to Chef Circle</DialogTitle>
          <DialogDescription>
            Sign in to save recipes, join communities, and get personalized
            recommendations.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signInForm.email}
                  onChange={(e) =>
                    setSignInForm({ ...signInForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signInForm.password}
                  onChange={(e) =>
                    setSignInForm({ ...signInForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name">Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signUpForm.name}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signUpForm.email}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input
                  id="signup-confirm"
                  type="password"
                  value={signUpForm.confirmPassword}
                  onChange={(e) =>
                    setSignUpForm({
                      ...signUpForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Dietary Preferences (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Vegan", "Vegetarian", "Keto", "Gluten-free"].map(
                    (pref) => (
                      <div key={pref} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diet-${pref}`}
                          checked={signUpForm.dietaryPreferences.includes(
                            pref.toLowerCase()
                          )}
                          onCheckedChange={() =>
                            togglePreference(
                              "dietaryPreferences",
                              pref.toLowerCase()
                            )
                          }
                        />
                        <label
                          htmlFor={`diet-${pref}`}
                          className="text-sm cursor-pointer"
                        >
                          {pref}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Cuisine Preferences (Optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Italian", "Asian", "Mexican", "Mediterranean"].map(
                    (cuisine) => (
                      <div
                        key={cuisine}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`cuisine-${cuisine}`}
                          checked={signUpForm.cuisinePreferences.includes(
                            cuisine.toLowerCase()
                          )}
                          onCheckedChange={() =>
                            togglePreference(
                              "cuisinePreferences",
                              cuisine.toLowerCase()
                            )
                          }
                        />
                        <label
                          htmlFor={`cuisine-${cuisine}`}
                          className="text-sm cursor-pointer"
                        >
                          {cuisine}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
