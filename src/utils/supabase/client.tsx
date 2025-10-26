import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "./info";

// Create singleton Supabase client
export const supabase = createSupabaseClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// API base URL
const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-7d67a39c`;

// Helper function to get headers with auth token
function getHeaders(includeAuth = false) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (includeAuth) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      // Fall back to anon key if no access token
      headers.Authorization = `Bearer ${publicAnonKey}`;
    }
  } else {
    headers.Authorization = `Bearer ${publicAnonKey}`;
  }
  
  return headers;
}

// ============ AUTH API ============

export async function signUp(email: string, password: string, name: string, options?: {
  dietaryPreferences?: string[];
  skillLevel?: string;
  cuisinePreferences?: string[];
}) {
  const response = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email,
      password,
      name,
      ...options,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign up");
  }
  
  return response.json();
}

export async function signIn(email: string, password: string) {
  const response = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to sign in");
  }
  
  const data = await response.json();
  
  // Store access token
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  }
  
  return data;
}

export async function signOut() {
  localStorage.removeItem("accessToken");
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    return null;
  }
  
  const data = await response.json();
  return data.user;
}

export function isAuthenticated() {
  return !!localStorage.getItem("accessToken");
}

// ============ RECIPE API ============

export async function getRecipes(filters?: {
  cuisine?: string;
  difficulty?: string;
  tags?: string;
}) {
  const params = new URLSearchParams();
  if (filters?.cuisine) params.append("cuisine", filters.cuisine);
  if (filters?.difficulty) params.append("difficulty", filters.difficulty);
  if (filters?.tags) params.append("tags", filters.tags);
  
  const url = `${API_BASE}/recipes${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch recipes");
  }
  
  const data = await response.json();
  return data.recipes;
}

export async function getRecipe(id: string) {
  const response = await fetch(`${API_BASE}/recipes/${id}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch recipe");
  }
  
  const data = await response.json();
  return data.recipe;
}

export async function createRecipe(recipe: any) {
  const response = await fetch(`${API_BASE}/recipes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(recipe),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create recipe");
  }
  
  const data = await response.json();
  return data.recipe;
}

export async function addRecipeComment(recipeId: string, comment: string, rating: number) {
  const response = await fetch(`${API_BASE}/recipes/${recipeId}/comments`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ comment, rating }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add comment");
  }
  
  const data = await response.json();
  return data.comment;
}

// ============ COMMUNITY API ============

export async function getCommunities() {
  const response = await fetch(`${API_BASE}/communities`, {
    headers: getHeaders(true), // Will use access token if available, otherwise anon key
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch communities:", error);
    throw new Error("Failed to fetch communities");
  }
  
  const data = await response.json();
  return data.communities;
}

export async function getCommunity(id: string) {
  const response = await fetch(`${API_BASE}/communities/${id}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch community");
  }
  
  const data = await response.json();
  return data.community;
}

export async function createCommunity(community: any) {
  const response = await fetch(`${API_BASE}/communities`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(community),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create community");
  }
  
  const data = await response.json();
  return data.community;
}

export async function joinCommunity(communityId: string) {
  const response = await fetch(`${API_BASE}/communities/${communityId}/join`, {
    method: "POST",
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to join community");
  }
  
  return response.json();
}

export async function leaveCommunity(communityId: string) {
  const response = await fetch(`${API_BASE}/communities/${communityId}/leave`, {
    method: "POST",
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to leave community");
  }
  
  return response.json();
}

export async function updateCommunity(communityId: string, updates: any) {
  const response = await fetch(`${API_BASE}/communities/${communityId}`, {
    method: "PUT",
    headers: getHeaders(true),
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update community");
  }
  
  const data = await response.json();
  return data.community;
}

export async function deleteCommunity(communityId: string) {
  const response = await fetch(`${API_BASE}/communities/${communityId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete community");
  }
  
  return response.json();
}

// ============ POST API ============

export async function getPosts(filters?: {
  communityId?: string;
  sort?: "hot" | "new" | "top";
}) {
  const params = new URLSearchParams();
  if (filters?.communityId) params.append("communityId", filters.communityId);
  if (filters?.sort) params.append("sort", filters.sort);
  
  const url = `${API_BASE}/posts${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url, {
    headers: getHeaders(true), // Will use access token if available, otherwise anon key
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to fetch posts:", error);
    throw new Error("Failed to fetch posts");
  }
  
  const data = await response.json();
  return data.posts;
}

export async function createPost(post: any) {
  const response = await fetch(`${API_BASE}/posts`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(post),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create post");
  }
  
  const data = await response.json();
  return data.post;
}

export async function voteOnPost(postId: string, voteType: "up" | "down") {
  const response = await fetch(`${API_BASE}/posts/${postId}/vote`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ voteType }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to vote on post");
  }
  
  const data = await response.json();
  return data;
}

export async function getPostComments(postId: string) {
  const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch comments");
  }
  
  const data = await response.json();
  return data.comments;
}

export async function addPostComment(postId: string, content: string) {
  const response = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to add comment");
  }
  
  const data = await response.json();
  return data.comment;
}

// Delete post
export async function deletePost(postId: string) {
  const response = await fetch(`${API_BASE}/posts/${postId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete post");
  }
  
  return response.json();
}

// Vote on comment
export async function voteOnComment(commentId: string, voteType: "up" | "down") {
  const response = await fetch(`${API_BASE}/comments/${commentId}/vote`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify({ voteType }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to vote on comment");
  }
  
  const data = await response.json();
  return data;
}

// Delete comment
export async function deleteComment(commentId: string) {
  const response = await fetch(`${API_BASE}/comments/${commentId}`, {
    method: "DELETE",
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete comment");
  }
  
  return response.json();
}

// ============ USER RECIPES API ============

export async function getUserRecipes() {
  const response = await fetch(`${API_BASE}/user-recipes`, {
    headers: getHeaders(true),
  });
  
  if (!response.ok) {
    throw new Error("Failed to fetch user recipes");
  }
  
  const data = await response.json();
  return data.recipes;
}

export async function shareRecipe(recipe: any) {
  const response = await fetch(`${API_BASE}/user-recipes`, {
    method: "POST",
    headers: getHeaders(true),
    body: JSON.stringify(recipe),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to share recipe");
  }
  
  const data = await response.json();
  return data.recipe;
}

// Update user recipe
export async function updateUserRecipe(recipeId: string, recipe: any) {
  try {
    const response = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify(recipe),
    });
    
    if (!response.ok) {
      throw new Error("Server update failed");
    }
    
    const data = await response.json();
    return data.recipe;
  } catch (error) {
    // Fallback to localStorage if server update fails
    console.warn("Server update failed, using localStorage:", error);
    const updates = JSON.parse(localStorage.getItem('recipeUpdates') || '{}');
    updates[recipeId] = { ...recipe, updatedAt: new Date().toISOString() };
    localStorage.setItem('recipeUpdates', JSON.stringify(updates));
    return { id: recipeId, ...recipe };
  }
}

// Delete user recipe
export async function deleteUserRecipe(recipeId: string) {
  try {
    const response = await fetch(`${API_BASE}/recipes/${recipeId}`, {
      method: "DELETE",
      headers: getHeaders(true),
    });
    
    if (!response.ok) {
      throw new Error("Server delete failed");
    }
    
    return response.json();
  } catch (error) {
    // Fallback to localStorage if server delete fails
    console.warn("Server delete failed, using localStorage:", error);
    const deletions = JSON.parse(localStorage.getItem('recipeDeletions') || '[]');
    if (!deletions.includes(recipeId)) {
      deletions.push(recipeId);
      localStorage.setItem('recipeDeletions', JSON.stringify(deletions));
    }
    return { message: "Recipe marked for deletion" };
  }
}

export async function updateUserProfile(profile: {
  name?: string;
  bio?: string;
  avatar?: string;
  dietaryPreferences?: string[];
  skillLevel?: string;
  cuisinePreferences?: string[];
}) {
  // For now, store profile updates in localStorage until server is deployed
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Not authenticated");
  }
  
  const updatedUser = { ...currentUser, ...profile, updatedAt: new Date().toISOString() };
  localStorage.setItem('profileUpdates', JSON.stringify(profile));
  
  return updatedUser;
}

// ============ SEED DATA ============

export async function seedData(recipes: any[], communities: any[], posts?: any[]) {
  const response = await fetch(`${API_BASE}/seed`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ recipes, communities, posts }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    console.error("Failed to seed data:", error);
    throw new Error("Failed to seed data");
  }
  
  return response.json();
}