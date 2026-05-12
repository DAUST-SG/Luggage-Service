import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    phone: v.string(),
    lat: v.number(),
    lng: v.number(),
    neighborhood: v.optional(v.string()),
    notes: v.optional(v.string()),
    pickupTime: v.optional(v.string()),
    eventLabel: v.optional(v.string()),
    luggage: v.optional(v.object({
      smallBags: v.number(),
      mediumBags: v.number(),
      largeBags: v.number(),
      monitors: v.number(),
      smallFridges: v.number(),
      mediumFridges: v.number(),
      other: v.number(),
      otherDescription: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("shuttleSignups")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, args);
      return { id: existing._id, updated: true };
    }

    const id = await ctx.db.insert("shuttleSignups", args);
    return { id, updated: false };
  },
});

export const list = query({
  args: { eventLabel: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.eventLabel) {
      return await ctx.db
        .query("shuttleSignups")
        .withIndex("by_event", (q) => q.eq("eventLabel", args.eventLabel))
        .collect();
    }
    return await ctx.db.query("shuttleSignups").collect();
  },
});

export const remove = mutation({
  args: { id: v.id("shuttleSignups") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const clearEvent = mutation({
  args: { eventLabel: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("shuttleSignups")
      .withIndex("by_event", (q) => q.eq("eventLabel", args.eventLabel))
      .collect();
    for (const r of rows) await ctx.db.delete(r._id);
    return { deleted: rows.length };
  },
});
