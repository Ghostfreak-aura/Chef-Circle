import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();


const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

app.use("*", logger(console.log));


app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  })
);


async function getUserFromToken(request: Request) {
  const accessToken = request.headers.get("Authorization")?.split(" ")[1];
  if (!accessToken) {
    return null;
  }
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  return user;
}


function generateId() {
  return crypto.randomUUID();
}


app.get("/make-server-7d67a39c/health", (c) => {
  return c.json({ status: "ok" });
});




app.post("/make-server-7d67a39c/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, dietaryPreferences, skillLevel, cuisinePreferences } = body;


    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
    
      email_confirm: true,
    });

    if (error) {
      console.error("Error creating user in Supabase Auth:", error);
      return c.json({ error: error.message }, 400);
    }

   
    const userId = data.user.id;
    await kv.set(`user:${userId}`, {
      id: userId,
      email,
      name,
      avatar: "",
      dietaryPreferences: dietaryPreferences || [],
      skillLevel: skillLevel || "beginner",
      cuisinePreferences: cuisinePreferences || [],
      createdAt: new Date().toISOString(),
    });

    return c.json({ 
      user: { id: userId, email, name },
      message: "User created successfully"
    });
  } catch (error) {
    console.error("Error in signup:", error);
    return c.json({ error: "Failed to create user" }, 500);
  }
});


app.post("/make-server-7d67a39c/auth/signin", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Error signing in:", error);
      return c.json({ error: error.message }, 401);
    }

  
    const userData = await kv.get(`user:${data.user.id}`);

    return c.json({
      accessToken: data.session.access_token,
      user: userData || { id: data.user.id, email: data.user.email },
    });
  } catch (error) {
    console.error("Error in signin:", error);
    return c.json({ error: "Failed to sign in" }, 500);
  }
});


app.get("/make-server-7d67a39c/auth/me", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const userData = await kv.get(`user:${user.id}`);
  return c.json({ user: userData || { id: user.id, email: user.email } });
});


app.get("/make-server-7d67a39c/recipes", async (c) => {
  try {
    const cuisine = c.req.query("cuisine");
    const difficulty = c.req.query("difficulty");
    const tags = c.req.query("tags");

    const recipes = await kv.getByPrefix("recipe:");
    
    let filteredRecipes = recipes;
    
    if (cuisine) {
      filteredRecipes = filteredRecipes.filter((r: any) => 
        r.cuisine.toLowerCase() === cuisine.toLowerCase()
      );
    }
    
    if (difficulty) {
      filteredRecipes = filteredRecipes.filter((r: any) => 
        r.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    if (tags) {
      const tagArray = tags.split(",");
      filteredRecipes = filteredRecipes.filter((r: any) => 
        tagArray.some((tag: string) => r.tags?.includes(tag))
      );
    }

    return c.json({ recipes: filteredRecipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return c.json({ error: "Failed to fetch recipes" }, 500);
  }
});


app.get("/make-server-7d67a39c/recipes/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const recipe = await kv.get(`recipe:${id}`);
    
    if (!recipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }

    
    const allComments = await kv.getByPrefix("recipe_comment:");
    const recipeComments = allComments.filter((comment: any) => comment.recipeId === id);

    return c.json({ recipe: { ...recipe, comments: recipeComments } });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return c.json({ error: "Failed to fetch recipe" }, 500);
  }
});

app.post("/make-server-7d67a39c/recipes", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const recipeId = generateId();
    
    const recipe = {
      id: recipeId,
      ...body,
      createdBy: user.id,
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`recipe:${recipeId}`, recipe);
    return c.json({ recipe });
  } catch (error) {
    console.error("Error creating recipe:", error);
    return c.json({ error: "Failed to create recipe" }, 500);
  }
});


app.put("/make-server-7d67a39c/recipes/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const recipeId = c.req.param("id");
    const recipe = await kv.get(`recipe:${recipeId}`);
    
    if (!recipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }

    if (recipe.createdBy !== user.id) {
      return c.json({ error: "Only the recipe creator can update it" }, 403);
    }

    const body = await c.req.json();

    const updatedRecipe = {
      ...recipe,
      title: body.title !== undefined ? body.title : recipe.title,
      description: body.description !== undefined ? body.description : recipe.description,
      image: body.image !== undefined ? body.image : recipe.image,
      cuisine: body.cuisine !== undefined ? body.cuisine : recipe.cuisine,
      difficulty: body.difficulty !== undefined ? body.difficulty : recipe.difficulty,
      cookTime: body.cookTime !== undefined ? body.cookTime : recipe.cookTime,
      servings: body.servings !== undefined ? body.servings : recipe.servings,
      tags: body.tags !== undefined ? body.tags : recipe.tags,
      ingredients: body.ingredients !== undefined ? body.ingredients : recipe.ingredients,
      instructions: body.instructions !== undefined ? body.instructions : recipe.instructions,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`recipe:${recipeId}`, updatedRecipe);

    return c.json({ recipe: updatedRecipe });
  } catch (error) {
    console.error("Error updating recipe:", error);
    return c.json({ error: "Failed to update recipe" }, 500);
  }
});


app.delete("/make-server-7d67a39c/recipes/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const recipeId = c.req.param("id");
    const recipe = await kv.get(`recipe:${recipeId}`);
    
    if (!recipe) {
      return c.json({ error: "Recipe not found" }, 404);
    }


    if (recipe.createdBy !== user.id) {
      return c.json({ error: "Only the recipe creator can delete it" }, 403);
    }


    await kv.del(`recipe:${recipeId}`);


    const allComments = await kv.getByPrefix("recipe_comment:");
    const recipeComments = allComments.filter((c: any) => c.recipeId === recipeId);
    for (const comment of recipeComments) {
      await kv.del(`recipe_comment:${comment.id}`);
    }

    return c.json({ message: "Recipe deleted successfully" });
  } catch (error) {
    console.error("Error deleting recipe:", error);
    return c.json({ error: "Failed to delete recipe" }, 500);
  }
});


app.post("/make-server-7d67a39c/recipes/:id/comments", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const recipeId = c.req.param("id");
    const body = await c.req.json();
    const commentId = generateId();

    const userData = await kv.get(`user:${user.id}`);
    
    const comment = {
      id: commentId,
      recipeId,
      userId: user.id,
      user: userData?.name || "Anonymous",
      avatar: userData?.avatar || "",
      comment: body.comment,
      rating: body.rating || 0,
      date: new Date().toISOString(),
    };

    await kv.set(`recipe_comment:${commentId}`, comment);


    const recipe = await kv.get(`recipe:${recipeId}`);
    if (recipe) {
      const allComments = await kv.getByPrefix("recipe_comment:");
      const recipeComments = allComments.filter((c: any) => c.recipeId === recipeId);
      
      const totalRating = recipeComments.reduce((sum: number, c: any) => sum + (c.rating || 0), 0);
      const avgRating = totalRating / recipeComments.length;

      recipe.rating = avgRating;
      recipe.reviews = recipeComments.length;
      await kv.set(`recipe:${recipeId}`, recipe);
    }

    return c.json({ comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ error: "Failed to add comment" }, 500);
  }
});


app.get("/make-server-7d67a39c/communities", async (c) => {
  try {
    const user = await getUserFromToken(c.req.raw);
    const communities = await kv.getByPrefix("community:");
  
    if (user) {
      const memberships = await kv.getByPrefix(`community_member:${user.id}:`);
      const joinedCommunityIds = memberships.map((m: any) => m.communityId);
      
      const communitiesWithJoinStatus = communities.map((c: any) => ({
        ...c,
        isJoined: joinedCommunityIds.includes(c.id),
      }));
      
      return c.json({ communities: communitiesWithJoinStatus });
    }

    return c.json({ communities });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return c.json({ error: "Failed to fetch communities" }, 500);
  }
});


app.get("/make-server-7d67a39c/communities/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const community = await kv.get(`community:${id}`);
    
    if (!community) {
      return c.json({ error: "Community not found" }, 404);
    }

    return c.json({ community });
  } catch (error) {
    console.error("Error fetching community:", error);
    return c.json({ error: "Failed to fetch community" }, 500);
  }
});


app.post("/make-server-7d67a39c/communities", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const communityId = generateId();
    const userData = await kv.get(`user:${user.id}`);
    
    const community = {
      id: communityId,
      name: body.name,
      description: body.description,
      image: body.image || "",
      category: body.category,
      memberCount: 1,
      postCount: 0,
      createdBy: userData?.name || user.email,
      tags: body.tags || [],
      createdAt: new Date().toISOString(),
    };

    await kv.set(`community:${communityId}`, community);
    

    await kv.set(`community_member:${user.id}:${communityId}`, {
      userId: user.id,
      communityId,
      joinedAt: new Date().toISOString(),
    });

    return c.json({ community });
  } catch (error) {
    console.error("Error creating community:", error);
    return c.json({ error: "Failed to create community" }, 500);
  }
});


app.post("/make-server-7d67a39c/communities/:id/join", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const communityId = c.req.param("id");
    const community = await kv.get(`community:${communityId}`);
    
    if (!community) {
      return c.json({ error: "Community not found" }, 404);
    }

    const existing = await kv.get(`community_member:${user.id}:${communityId}`);
    if (existing) {
      return c.json({ message: "Already joined" });
    }

    await kv.set(`community_member:${user.id}:${communityId}`, {
      userId: user.id,
      communityId,
      joinedAt: new Date().toISOString(),
    });


    community.memberCount = (community.memberCount || 0) + 1;
    await kv.set(`community:${communityId}`, community);

    return c.json({ message: "Joined successfully" });
  } catch (error) {
    console.error("Error joining community:", error);
    return c.json({ error: "Failed to join community" }, 500);
  }
});

// Leave community (requires auth)
app.post("/make-server-7d67a39c/communities/:id/leave", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const communityId = c.req.param("id");
    const community = await kv.get(`community:${communityId}`);
    
    if (!community) {
      return c.json({ error: "Community not found" }, 404);
    }

    await kv.del(`community_member:${user.id}:${communityId}`);

    community.memberCount = Math.max(0, (community.memberCount || 0) - 1);
    await kv.set(`community:${communityId}`, community);

    return c.json({ message: "Left successfully" });
  } catch (error) {
    console.error("Error leaving community:", error);
    return c.json({ error: "Failed to leave community" }, 500);
  }
});


app.put("/make-server-7d67a39c/communities/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const communityId = c.req.param("id");
    const community = await kv.get(`community:${communityId}`);
    
    if (!community) {
      return c.json({ error: "Community not found" }, 404);
    }


    const userData = await kv.get(`user:${user.id}`);
    const creatorName = userData?.name || user.email;
    
    if (community.createdBy !== creatorName) {
      return c.json({ error: "Only the community creator can update it" }, 403);
    }

    const body = await c.req.json();
    

    const updatedCommunity = {
      ...community,
      name: body.name || community.name,
      description: body.description || community.description,
      image: body.image !== undefined ? body.image : community.image,
      category: body.category || community.category,
      tags: body.tags || community.tags,
    };

    await kv.set(`community:${communityId}`, updatedCommunity);

    return c.json({ community: updatedCommunity });
  } catch (error) {
    console.error("Error updating community:", error);
    return c.json({ error: "Failed to update community" }, 500);
  }
});


app.delete("/make-server-7d67a39c/communities/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const communityId = c.req.param("id");
    const community = await kv.get(`community:${communityId}`);
    
    if (!community) {
      return c.json({ error: "Community not found" }, 404);
    }


    const userData = await kv.get(`user:${user.id}`);
    const creatorName = userData?.name || user.email;
    
    if (community.createdBy !== creatorName) {
      return c.json({ error: "Only the community creator can delete it" }, 403);
    }


    await kv.del(`community:${communityId}`);


    const members = await kv.getByPrefix(`community_member:`);
    for (const member of members) {
      if (member.communityId === communityId) {
        await kv.del(`community_member:${member.userId}:${communityId}`);
      }
    }


    const posts = await kv.getByPrefix("community_post:");
    for (const post of posts) {
      if (post.communityId === communityId) {
        await kv.del(`community_post:${post.id}`);
        

        const votes = await kv.getByPrefix(`post_vote:`);
        for (const vote of votes) {
          if (vote.postId === post.id) {
            await kv.del(`post_vote:${vote.userId}:${vote.postId}`);
          }
        }

        const comments = await kv.getByPrefix(`post_comment:${post.id}:`);
        for (const comment of comments) {
          await kv.del(`post_comment:${post.id}:${comment.id}`);
        }
      }
    }

    return c.json({ message: "Community deleted successfully" });
  } catch (error) {
    console.error("Error deleting community:", error);
    return c.json({ error: "Failed to delete community" }, 500);
  }
});


app.get("/make-server-7d67a39c/posts", async (c) => {
  try {
    const communityId = c.req.query("communityId");
    const sortBy = c.req.query("sort") || "hot"; 
    
    let posts = await kv.getByPrefix("community_post:");
    
    if (communityId) {
      posts = posts.filter((p: any) => p.communityId === communityId);
    }


    const user = await getUserFromToken(c.req.raw);
    if (user) {
      const userVotes = await kv.getByPrefix(`post_vote:${user.id}:`);
      const voteMap = new Map(userVotes.map((v: any) => [v.postId, v.voteType]));
      
      posts = posts.map((p: any) => ({
        ...p,
        userVote: voteMap.get(p.id) || null,
      }));
    }


    if (sortBy === "hot") {
      posts.sort((a: any, b: any) => {
        const scoreA = a.upvotes - a.downvotes;
        const scoreB = b.upvotes - b.downvotes;
        return scoreB - scoreA;
      });
    } else if (sortBy === "new") {
      posts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === "top") {
      posts.sort((a: any, b: any) => b.upvotes - a.upvotes);
    }

    return c.json({ posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return c.json({ error: "Failed to fetch posts" }, 500);
  }
});

app.post("/make-server-7d67a39c/posts", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const postId = generateId();
    const userData = await kv.get(`user:${user.id}`);
    const community = await kv.get(`community:${body.communityId}`);
    
    const now = new Date().toISOString();
    const post = {
      id: postId,
      communityId: body.communityId,
      communityName: community?.name || "",
      userId: user.id,
      user: {
        name: userData?.name || "Anonymous",
        avatar: userData?.avatar || "",
        badge: body.user?.badge || "",
      },
      title: body.title,
      content: body.content,
      image: body.image || "",
      timestamp: "Just now",
      upvotes: 0,
      downvotes: 0,
      userVote: null,
      comments: 0,
      createdAt: now,
      updatedAt: now,
    };

    await kv.set(`community_post:${postId}`, post);

    if (community) {
      community.postCount = (community.postCount || 0) + 1;
      await kv.set(`community:${body.communityId}`, community);
    }

    return c.json({ post });
  } catch (error) {
    console.error("Error creating post:", error);
    return c.json({ error: "Failed to create post" }, 500);
  }
});


app.post("/make-server-7d67a39c/posts/:id/vote", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const voteType = body.voteType; 
    
    const post = await kv.get(`community_post:${postId}`);
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }

    const existingVote = await kv.get(`post_vote:${user.id}:${postId}`);
    
    if (existingVote) {

      if (existingVote.voteType === "up") {
        post.upvotes = Math.max(0, post.upvotes - 1);
      } else {
        post.downvotes = Math.max(0, post.downvotes - 1);
      }
      

      if (existingVote.voteType === voteType) {
        await kv.del(`post_vote:${user.id}:${postId}`);
        await kv.set(`community_post:${postId}`, post);
        return c.json({ post, userVote: null });
      }
    }


    if (voteType === "up") {
      post.upvotes = (post.upvotes || 0) + 1;
    } else {
      post.downvotes = (post.downvotes || 0) + 1;
    }

    await kv.set(`post_vote:${user.id}:${postId}`, {
      userId: user.id,
      postId,
      voteType,
      createdAt: new Date().toISOString(),
    });

    await kv.set(`community_post:${postId}`, post);

    return c.json({ post, userVote: voteType });
  } catch (error) {
    console.error("Error voting on post:", error);
    return c.json({ error: "Failed to vote on post" }, 500);
  }
});


app.post("/make-server-7d67a39c/posts/:id/comments", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const postId = c.req.param("id");
    const body = await c.req.json();
    const commentId = generateId();
    const userData = await kv.get(`user:${user.id}`);
    
    const comment = {
      id: commentId,
      postId,
      userId: user.id,
      user: {
        name: userData?.name || "Anonymous",
        avatar: userData?.avatar || "",
      },
      content: body.content,
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`post_comment:${commentId}`, comment);


    const post = await kv.get(`community_post:${postId}`);
    if (post) {
      post.comments = (post.comments || 0) + 1;
      await kv.set(`community_post:${postId}`, post);
    }

    return c.json({ comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    return c.json({ error: "Failed to add comment" }, 500);
  }
});


app.delete("/make-server-7d67a39c/posts/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const postId = c.req.param("id");
    const post = await kv.get(`community_post:${postId}`);
    
    if (!post) {
      return c.json({ error: "Post not found" }, 404);
    }


    if (post.userId !== user.id) {
      return c.json({ error: "You can only delete your own posts" }, 403);
    }

    await kv.del(`community_post:${postId}`);


    const allComments = await kv.getByPrefix("post_comment:");
    const postComments = allComments.filter((c: any) => c.postId === postId);
    for (const comment of postComments) {
      await kv.del(`post_comment:${comment.id}`);
    }


    const allVotes = await kv.getByPrefix("post_vote:");
    const postVotes = allVotes.filter((v: any) => v.postId === postId);
    for (const vote of postVotes) {
      await kv.del(`post_vote:${vote.userId}:${postId}`);
    }

    const community = await kv.get(`community:${post.communityId}`);
    if (community) {
      community.postCount = Math.max(0, (community.postCount || 0) - 1);
      await kv.set(`community:${post.communityId}`, community);
    }

    return c.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    return c.json({ error: "Failed to delete post" }, 500);
  }
});


app.post("/make-server-7d67a39c/comments/:id/vote", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const commentId = c.req.param("id");
    const body = await c.req.json();
    const voteType = body.voteType;
    
    const comment = await kv.get(`post_comment:${commentId}`);
    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }


    const existingVote = await kv.get(`comment_vote:${user.id}:${commentId}`);
    
    if (existingVote) {

      if (existingVote.voteType === "up") {
        comment.upvotes = Math.max(0, (comment.upvotes || 0) - 1);
      } else {
        comment.downvotes = Math.max(0, (comment.downvotes || 0) - 1);
      }
      

      if (existingVote.voteType === voteType) {
        await kv.del(`comment_vote:${user.id}:${commentId}`);
        await kv.set(`post_comment:${commentId}`, comment);
        return c.json({ comment, userVote: null });
      }
    }


    if (voteType === "up") {
      comment.upvotes = (comment.upvotes || 0) + 1;
    } else {
      comment.downvotes = (comment.downvotes || 0) + 1;
    }

    await kv.set(`comment_vote:${user.id}:${commentId}`, {
      userId: user.id,
      commentId,
      voteType,
      createdAt: new Date().toISOString(),
    });

    await kv.set(`post_comment:${commentId}`, comment);

    return c.json({ comment, userVote: voteType });
  } catch (error) {
    console.error("Error voting on comment:", error);
    return c.json({ error: "Failed to vote on comment" }, 500);
  }
});

app.delete("/make-server-7d67a39c/comments/:id", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const commentId = c.req.param("id");
    const comment = await kv.get(`post_comment:${commentId}`);
    
    if (!comment) {
      return c.json({ error: "Comment not found" }, 404);
    }


    if (comment.userId !== user.id) {
      return c.json({ error: "You can only delete your own comments" }, 403);
    }

    await kv.del(`post_comment:${commentId}`);


    const allVotes = await kv.getByPrefix("comment_vote:");
    const commentVotes = allVotes.filter((v: any) => v.commentId === commentId);
    for (const vote of commentVotes) {
      await kv.del(`comment_vote:${vote.userId}:${commentId}`);
    }

    const post = await kv.get(`community_post:${comment.postId}`);
    if (post) {
      post.comments = Math.max(0, (post.comments || 0) - 1);
      await kv.set(`community_post:${comment.postId}`, post);
    }

    return c.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return c.json({ error: "Failed to delete comment" }, 500);
  }
});


app.get("/make-server-7d67a39c/posts/:id/comments", async (c) => {
  try {
    const postId = c.req.param("id");
    const allComments = await kv.getByPrefix("post_comment:");
    let postComments = allComments.filter((comment: any) => comment.postId === postId);
    

    const user = await getUserFromToken(c.req.raw);
    if (user) {
      const userVotes = await kv.getByPrefix(`comment_vote:${user.id}:`);
      const voteMap = new Map(userVotes.map((v: any) => [v.commentId, v.voteType]));
      
      postComments = postComments.map((c: any) => ({
        ...c,
        userVote: voteMap.get(c.id) || null,
      }));
    }
    
    return c.json({ comments: postComments });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return c.json({ error: "Failed to fetch comments" }, 500);
  }
});

app.get("/make-server-7d67a39c/user-recipes", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
 
    const sharedRecipes = await kv.getByPrefix("user_recipe:");
    const userSharedRecipes = sharedRecipes.filter((r: any) => r.userId === user.id);
    
   
    const allMainRecipes = await kv.getByPrefix("recipe:");
    const userMainRecipes = allMainRecipes.filter((r: any) => r.createdBy === user.id);
    

    const allUserRecipes = [...userSharedRecipes, ...userMainRecipes];
    
   
    allUserRecipes.sort((a: any, b: any) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    return c.json({ recipes: allUserRecipes });
  } catch (error) {
    console.error("Error fetching user recipes:", error);
    return c.json({ error: "Failed to fetch user recipes" }, 500);
  }
});


app.post("/make-server-7d67a39c/user-recipes", async (c) => {
  const user = await getUserFromToken(c.req.raw);
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json();
    const recipeId = generateId();
    const userData = await kv.get(`user:${user.id}`);
    
    const recipe = {
      id: recipeId,
      userId: user.id,
      userName: userData?.name || "Anonymous",
      title: body.title,
      description: body.description,
      image: body.image || "",
      ingredients: body.ingredients || [],
      instructions: body.instructions || [],
      cookTime: body.cookTime || "",
      servings: body.servings || "",
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user_recipe:${recipeId}`, recipe);

    return c.json({ recipe });
  } catch (error) {
    console.error("Error sharing recipe:", error);
    return c.json({ error: "Failed to share recipe" }, 500);
  }
});



app.post("/make-server-7d67a39c/seed", async (c) => {
  try {
   
    const body = await c.req.json();
    const { recipes, communities, posts } = body;

    if (recipes) {
      for (const recipe of recipes) {
        await kv.set(`recipe:${recipe.id}`, recipe);
        
 
        if (recipe.comments) {
          for (const comment of recipe.comments) {
            await kv.set(`recipe_comment:${comment.id}`, {
              ...comment,
              recipeId: recipe.id,
            });
          }
        }
      }
    }

    if (communities) {
      for (const community of communities) {
        await kv.set(`community:${community.id}`, community);
      }
    }

    if (posts) {
      for (const post of posts) {
        await kv.set(`community_post:${post.id}`, post);
      }
    }

    return c.json({ message: "Data seeded successfully" });
  } catch (error) {
    console.error("Error seeding data:", error);
    return c.json({ error: "Failed to seed data" }, 500);
  }
});

Deno.serve(app.fetch);
