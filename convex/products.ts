import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createProduct = mutation({
  args: {
    userId:         v.string(),
    name:           v.string(),
    tagline:        v.string(),
    targetAudience: v.string(),
    keyFeatures:    v.string(),
    tone:           v.string(),
    platforms:      v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("products", {
      ...args,
      description:  "",
      originStory:  "",
      createdAt:    Date.now(),
      updatedAt:    Date.now(),
    });
  },
});

export const getUserProducts = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_user_id", q => q.eq("userId", args.userId))
      .collect();
  },
});

export const saveGeneration = mutation({
  args: {
    userId:     v.string(),
    productId:  v.id("products"),
    posts:      v.any(),
    windowDays: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.userId))
      .first();

    if (!user) throw new Error("User not found");
    if (user.credits < 1) throw new Error("Insufficient credits");

    await ctx.db.patch(user._id, {
      credits: user.credits - 1,
    });

    return await ctx.db.insert("generations", {
      userId:      args.userId,
      productId:   args.productId,
      posts:       args.posts,
      windowDays:  args.windowDays,
      creditsUsed: 1,
      createdAt:   Date.now(),
    });
  },
});

export const getGenerations = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("generations")
      .withIndex("by_user_id", q => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const updateProduct = mutation({
  args: {
    productId:      v.id("products"),
    name:           v.string(),
    tagline:        v.string(),
    targetAudience: v.string(),
    keyFeatures:    v.string(),
    tone:           v.string(),
    platforms:      v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { productId, ...fields } = args;
    return await ctx.db.patch(productId, {
      ...fields,
      updatedAt: Date.now(),
    });
  },
});