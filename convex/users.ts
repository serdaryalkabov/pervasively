import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertUser = mutation({
  args: {
    clerkId:      v.string(),
    email:        v.string(),
    examplePosts: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      if (args.examplePosts !== undefined) {
        await ctx.db.patch(existing._id, { examplePosts: args.examplePosts });
      }
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId:      args.clerkId,
      email:        args.email,
      credits:      10,
      examplePosts: args.examplePosts ?? [],
      createdAt:    Date.now(),
    });
  },
});

export const updateExamplePosts = mutation({
  args: {
    clerkId:      v.string(),
    examplePosts: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { examplePosts: args.examplePosts });
  },
});

export const getUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", q => q.eq("clerkId", args.clerkId))
      .first();
  },
});