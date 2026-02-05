const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticate = require("./middleware/auth.middleware");
const authorize = require("./middleware/role.middleware");


console.log("🔥 THIS INDEX.JS IS RUNNING");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const app = express();
const PORT = 4000;

// middleware to read JSON
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.post(
  "/jobs",
  authenticate,
  authorize(["OWNER"]),
  async (req, res) => {
    const { title, description, skill, budget } = req.body;

    if (!title || !description || !skill || !budget) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        skill,
        budget,
        ownerId: req.user.userId, // ✅ AUTH BASED
      },
    });

    res.status(201).json(job);
  }
);


  app.post("/users", async (req, res) => {
    const user = await prisma.user.create({
      data: {
        name: "Test User",
        email: "testuser@gmail.com"
      }
    });
    res.json(user);
  });

  app.post("/auth/signup", async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
  
      // basic validation
      if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }
  
      // check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
  
      if (existingUser) {
        return res.status(400).json({ error: "User already exists" });
      }
  
      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: role || "WORKER",
        },
      });
  
      // hide password in response
      const { password: _, ...safeUser } = user;
  
      res.status(201).json(safeUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Signup failed" });
    }
  });
  
  app.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
  
      const user = await prisma.user.findUnique({
        where: { email },
      });
  
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
  
      // generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          role: user.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
  
      res.json({
        message: "Login successful",
        token,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  

  app.get("/jobs", async (req, res) => {
    try {
      const jobs = await prisma.job.findMany({
        where: {
          status: "OPEN",
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.json(jobs);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch jobs" });
    }
  });
  
  app.post(
    "/jobs/:jobId/apply",
    authenticate,
    authorize(["WORKER"]),
    async (req, res) => {
      const jobId = parseInt(req.params.jobId);
      const { answers, portfolioLink } = req.body;
  
      const userId = req.user.userId; // ✅ auth se aaya
  
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });
  
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
  
      const existing = await prisma.application.findFirst({
        where: {
          jobId,
          userId,
        },
      });
  
      if (existing) {
        return res.status(400).json({ error: "Already applied" });
      }
  
      const application = await prisma.application.create({
        data: {
          jobId,
          userId,
          answers,
          portfolioLink,
        },
      });
  
      res.status(201).json(application);
    }
  );
  
  
  app.get("/jobs/:jobId/applications",
    authenticate,
    authorize(["OWNER"]),
    async (req, res) => {
    try {
      const jobId = parseInt(req.params.jobId);
  
      // Check job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId },
      });
  
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
  
      const applications = await prisma.application.findMany({
        where: { jobId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
  
      res.json(applications);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch applications" });
    }
  });
  
  
app.get("/test-db", async (req, res) => {
    try {
      const users = await prisma.user.findMany();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "DB connection failed" });
    }
  });

  app.patch(
    "/applications/:applicationId",
    authenticate,
    authorize(["OWNER"]),
    async (req, res) => {
      const applicationId = parseInt(req.params.applicationId);
      const { status } = req.body;
  
      const allowedStatuses = ["SELECTED", "REJECTED", "COMPLETED"];
  
      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
  
      const application = await prisma.application.findUnique({
        where: { id: applicationId },
      });
  
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
  
      const updated = await prisma.application.update({
        where: { id: applicationId },
        data: { status },
      });
  
      res.json(updated);
    }
  );
  
  
  
// server start
app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
