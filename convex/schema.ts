import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId:      v.string(),
    email:        v.string(),
    credits:      v.number(),
    examplePosts: v.optional(v.array(v.string())),
    createdAt:    v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"]),

  products: defineTable({
    userId:         v.string(),
    name:           v.string(),
    tagline:        v.string(),
    description:    v.string(),
    targetAudience: v.string(),
    originStory:    v.string(),
    keyFeatures:    v.string(),
    tone:           v.string(),
    platforms:      v.array(v.string()),
    createdAt:      v.number(),
    updatedAt:      v.number(),
  })
    .index("by_user_id", ["userId"]),

  generations: defineTable({
    userId:      v.string(),
    productId:   v.id("products"),
    posts:       v.any(),
    windowDays:  v.number(),
    creditsUsed: v.number(),
    createdAt:   v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_product_id", ["productId"]),

  orders: defineTable({
    userId:    v.string(),
    stripeId:  v.string(),
    pack:      v.string(),
    credits:   v.number(),
    amount:    v.number(),
    status:    v.string(),
    createdAt: v.number(),
  })
    .index("by_user_id", ["userId"])
    .index("by_stripe_id", ["stripeId"]),
});