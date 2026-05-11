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
  })
    .index("by_event", ["eventLabel"])
    .index("by_phone", ["phone"]),
});
