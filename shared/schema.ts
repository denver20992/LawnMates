import { 
  pgTable, 
  text, 
  serial, 
  integer, 
  boolean, 
  timestamp, 
  json, 
  doublePrecision, 
  real, 
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['property_owner', 'landscaper', 'admin']);
export const jobStatusEnum = pgEnum('job_status', ['posted', 'accepted', 'in_progress', 'verification_pending', 'completed', 'cancelled', 'disputed']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'escrow', 'released', 'refunded']);
export const messageStatusEnum = pgEnum('message_status', ['sent', 'delivered', 'read']);
export const verificationStatusEnum = pgEnum('verification_status', ['pending', 'approved', 'rejected']);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('property_owner'),
  fullName: text("full_name"),
  avatar: text("avatar"),
  bio: text("bio"),
  rating: real("rating").default(0),
  reviewCount: integer("review_count").default(0),
  isVerified: boolean("is_verified").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeConnectId: text("stripe_connect_id"),
  loyaltyPoints: integer("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Properties
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  propertyType: text("property_type").notNull(),
  size: integer("size"), // size in square feet
  notes: text("notes"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs
export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").references(() => users.id).notNull(),
  landscaperId: integer("landscaper_id").references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents
  status: jobStatusEnum("status").notNull().default('posted'),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceInterval: text("recurrence_interval"),
  requiresEquipment: boolean("requires_equipment").default(false),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  status: paymentStatusEnum("status").notNull().default('pending'),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeTransferId: text("stripe_transfer_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Verifications
export const verifications = pgTable("verifications", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  beforePhoto: text("before_photo").notNull(),
  afterPhoto: text("after_photo").notNull(),
  status: verificationStatusEnum("status").notNull().default('pending'),
  trustScore: real("trust_score"),
  adminId: integer("admin_id").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  status: messageStatusEnum("status").notNull().default('sent'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  jobId: integer("job_id").references(() => jobs.id).notNull(),
  reviewerId: integer("reviewer_id").references(() => users.id).notNull(),
  revieweeId: integer("reviewee_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites
export const favorites = pgTable("favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  favoriteId: integer("favorite_id").references(() => users.id),
  propertyId: integer("property_id").references(() => properties.id),
  isRecurring: boolean("is_recurring").default(false),
  recurrenceInterval: text("recurrence_interval"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Referrals
export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  inviterId: integer("inviter_id").references(() => users.id).notNull(),
  inviteeId: integer("invitee_id").references(() => users.id).notNull(),
  code: text("code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for insertion
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['property_owner', 'landscaper', 'admin']),
}).omit({ 
  id: true, 
  rating: true,
  reviewCount: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Customize the job insert schema to handle both string and Date types for dates
export const insertJobSchema = createInsertSchema(jobs, {
  // Allow startDate to be either a string or a Date
  startDate: z.union([
    z.string().transform(val => new Date(val)),
    z.date()
  ]),
  // Allow endDate to be optional, string, or Date
  endDate: z.union([
    z.string().transform(val => new Date(val)),
    z.date(),
    z.null()
  ]).optional(),
}).omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const insertVerificationSchema = createInsertSchema(verifications).omit({
  id: true,
  status: true,
  adminId: true,
  approvedAt: true,
  createdAt: true,
  updatedAt: true
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  status: true,
  createdAt: true
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true
});

export const insertFavoriteSchema = createInsertSchema(favorites).omit({
  id: true,
  createdAt: true
});

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = z.infer<typeof insertVerificationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = z.infer<typeof insertFavoriteSchema>;

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
