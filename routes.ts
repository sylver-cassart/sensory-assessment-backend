import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertUserSchema, insertStudentSchema, insertAssessmentSchema, assessmentResponsesSchema, assessmentScoresSchema } from "../shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
    try {
      const { firebaseUid } = req.params;
      const user = await storage.getUserByFirebaseUid(firebaseUid);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Student routes
  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(studentData);
      res.json(student);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assessment routes
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      const assessment = await storage.createAssessment(assessmentData);
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessment(id);
      
      if (!assessment) {
        return res.status(404).json({ message: "Assessment not found" });
      }
      
      res.json(assessment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/assessments/teacher/:teacherId", async (req, res) => {
    try {
      const teacherId = parseInt(req.params.teacherId);
      const assessments = await storage.getAssessmentsByTeacher(teacherId);
      res.json(assessments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/assessments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = insertAssessmentSchema.partial().parse(req.body);
      const assessment = await storage.updateAssessment(id, updateData);
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Assessment scoring route
  app.post("/api/assessments/calculate-score", async (req, res) => {
    try {
      const responses = assessmentResponsesSchema.parse(req.body);
      
      // Calculate scores based on responses
      let auditorySeekingScore = 0;
      let auditoryAvoidingScore = 0;

      const auditorySection = responses.sections.find(s => s.sectionId === "auditoryProcessing");
      if (auditorySection) {
        auditorySection.questions.forEach(question => {
          if (question.answer === "yes") {
            let score = 1; // Base score for "yes"
            
            if (question.frequency === "sometimes") score = 2;
            else if (question.frequency === "often") score = 3;

            if (question.id.includes("seeking")) {
              auditorySeekingScore += score;
            } else if (question.id.includes("avoiding")) {
              auditoryAvoidingScore += score;
            }
          }
        });
      }

      const scores = {
        auditorySeekingScore,
        auditoryAvoidingScore,
        totalSeekingScore: auditorySeekingScore,
        totalAvoidingScore: auditoryAvoidingScore,
        overallScore: auditorySeekingScore + auditoryAvoidingScore,
      };

      res.json(scores);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
