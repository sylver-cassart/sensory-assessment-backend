import { users, students, assessments, type User, type Student, type Assessment, type InsertUser, type InsertStudent, type InsertAssessment } from "../shared/schema.js";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudent(id: number): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // Assessment methods
  getAssessment(id: number): Promise<Assessment | undefined>;
  getAssessmentsByTeacher(teacherId: number): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: number, assessment: Partial<InsertAssessment>): Promise<Assessment>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private students: Map<number, Student>;
  private assessments: Map<number, Assessment>;
  private currentUserId: number;
  private currentStudentId: number;
  private currentAssessmentId: number;

  constructor() {
    this.users = new Map();
    this.students = new Map();
    this.assessments = new Map();
    this.currentUserId = 1;
    this.currentStudentId = 1;
    this.currentAssessmentId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Student methods
  async getStudent(id: number): Promise<Student | undefined> {
    return this.students.get(id);
  }

  async createStudent(insertStudent: InsertStudent): Promise<Student> {
    const id = this.currentStudentId++;
    const student: Student = { 
      ...insertStudent, 
      id,
      createdAt: new Date(),
    };
    this.students.set(id, student);
    return student;
  }

  // Assessment methods
  async getAssessment(id: number): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsByTeacher(teacherId: number): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(
      (assessment) => assessment.teacherId === teacherId,
    );
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = this.currentAssessmentId++;
    const assessment: Assessment = { 
      ...insertAssessment, 
      id,
      status: insertAssessment.status || "draft",
      createdAt: new Date(),
      completedAt: insertAssessment.status === "completed" ? new Date() : null,
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: number, updateData: Partial<InsertAssessment>): Promise<Assessment> {
    const existing = this.assessments.get(id);
    if (!existing) {
      throw new Error("Assessment not found");
    }

    const updated: Assessment = { 
      ...existing, 
      ...updateData,
      completedAt: updateData.status === "completed" ? new Date() : existing.completedAt,
    };
    this.assessments.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
