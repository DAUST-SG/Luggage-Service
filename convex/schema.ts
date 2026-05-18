import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  shuttleSignups: defineTable({
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
      smallSuitcase: v.optional(v.number()),
      mediumSuitcase: v.optional(v.number()),
      bigSuitcase: v.optional(v.number()),
      monitors: v.number(),
      smallFridges: v.number(),
      mediumFridges: v.number(),
      other: v.number(),
      otherDescription: v.optional(v.string()),
    })),
    finalPrice: v.optional(v.number()),
    priceBreakdown: v.optional(v.object({
      subtotal: v.number(),
      discountPercent: v.number(),
      discountAmount: v.number(),
    })),
  })
    .index("by_event", ["eventLabel"])
    .index("by_phone", ["phone"]),
});
