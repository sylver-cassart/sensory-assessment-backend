import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  firebaseUid: text("firebase_uid").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  school: text("school").notNull(),
  class: text("class").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const assessments = pgTable("assessments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  teacherId: integer("teacher_id").references(() => users.id).notNull(),
  assessmentDate: timestamp("assessment_date").notNull(),
  responses: jsonb("responses").notNull(),
  scores: jsonb("scores").notNull(),
  status: text("status").notNull().default("draft"), // draft, completed
  additionalNotes: text("additional_notes"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// Assessment response schemas
export const assessmentQuestionSchema = z.object({
  id: z.string(),
  answer: z.enum(["yes", "no"]),
  frequency: z.enum(["rarely", "sometimes", "often"]).optional(),
  comments: z.string().optional(),
});

export const assessmentSectionSchema = z.object({
  sectionId: z.string(),
  questions: z.array(assessmentQuestionSchema),
});

export const assessmentResponsesSchema = z.object({
  sections: z.array(assessmentSectionSchema),
});

export const assessmentScoresSchema = z.object({
  // Individual domain scores
  auditorySeekingScore: z.number(),
  auditoryAvoidingScore: z.number(),
  visualSeekingScore: z.number(),
  visualAvoidingScore: z.number(),
  tactileSeekingScore: z.number(),
  tactileAvoidingScore: z.number(),
  vestibularSeekingScore: z.number(),
  vestibularAvoidingScore: z.number(),
  proprioceptionSeekingScore: z.number(),
  proprioceptionAvoidingScore: z.number(),
  oralSeekingScore: z.number(),
  oralAvoidingScore: z.number(),
  
  // Domain totals (seeking + avoiding)
  auditoryTotal: z.number(),
  visualTotal: z.number(),
  tactileTotal: z.number(),
  vestibularTotal: z.number(),
  proprioceptionTotal: z.number(),
  oralTotal: z.number(),
  
  // Domain percentages for color coding
  auditoryPercentage: z.number(),
  visualPercentage: z.number(),
  tactilePercentage: z.number(),
  vestibularPercentage: z.number(),
  proprioceptionPercentage: z.number(),
  oralPercentage: z.number(),
  
  // Overall totals
  totalSeekingScore: z.number(),
  totalAvoidingScore: z.number(),
  overallScore: z.number(),
  overallPercentage: z.number(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;
export type AssessmentSection = z.infer<typeof assessmentSectionSchema>;
export type AssessmentResponses = z.infer<typeof assessmentResponsesSchema>;
export type AssessmentScores = z.infer<typeof assessmentScoresSchema>;
