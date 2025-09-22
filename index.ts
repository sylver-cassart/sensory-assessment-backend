const express = require('express');
const { createServer } = require('http');

const app = express();

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// In-memory storage
const storage = {
  users: new Map(),
  students: new Map(),
  assessments: new Map(),
  currentUserId: 1,
  currentStudentId: 1,
  currentAssessmentId: 1
};

// API Routes
app.post("/api/users", async (req, res) => {
  try {
    const { email, firebaseUid, name } = req.body;
    const id = storage.currentUserId++;
    const user = { 
      id,
      email,
      firebaseUid,
      name,
      createdAt: new Date(),
    };
    storage.users.set(id, user);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/users/firebase/:firebaseUid", async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const user = Array.from(storage.users.values()).find(
      (user) => user.firebaseUid === firebaseUid,
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { name, school, class: studentClass } = req.body;
    const id = storage.currentStudentId++;
    const student = { 
      id,
      name,
      school,
      class: studentClass,
      createdAt: new Date(),
    };
    storage.students.set(id, student);
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const student = storage.students.get(id);
    
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/assessments", async (req, res) => {
  try {
    const { studentId, teacherId, assessmentDate, responses, scores, status, additionalNotes } = req.body;
    const id = storage.currentAssessmentId++;
    const assessment = { 
      id,
      studentId,
      teacherId,
      assessmentDate: new Date(assessmentDate),
      responses,
      scores,
      status: status || "draft",
      additionalNotes,
      createdAt: new Date(),
      completedAt: status === "completed" ? new Date() : null,
    };
    storage.assessments.set(id, assessment);
    res.json(assessment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/assessments/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const assessment = storage.assessments.get(id);
    
    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const port = parseInt(process.env.PORT || '3000', 10);
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on port ${port}`);
});
