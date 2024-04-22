import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 8000;

const whitelist = [
  "http://localhost:3000",
  "tinpet-phi.vercel.app",
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

// test route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Auth middleware
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

// test route
app.get("/api/protected", requireAuth, (req, res) => {
  res.send("This is a protected route");
});

app.use(express.json());

app.get("/api/pets/latest", async (req, res) => {
  try {
    const latestPets = await prisma.pet.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 8,
    });
    res.json(latestPets);
  } catch (error) {
    console.error("Error fetching latest pets:", error);
    res.status(500).send("Error fetching latest pets");
  }
});

app.get("/api/pets/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const petId = parseInt(id, 10);
  if (isNaN(petId)) {
    return res.status(400).send("Pet ID must be a number");
  }

  try {
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    });
    res.json(pet);
  } catch (error) {
    console.error("Error fetching pet details:", error);
    res.status(500).send("Error fetching pet details");
  }
});

app.get("/api/pets", async (req, res) => {
  const pets = await prisma.pet.findMany();
  res.json(pets);
});

app.get("/api/users", requireAuth, async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).send("Error fetching users");
  }
});

app.get("/api/user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  try {
    const user = await prisma.user.findUnique({
      where: {
        auth0Id: auth0Id,
      },
      select: {
        id: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Failed to fetch user data" });
  }
});

app.get("/me", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
    include: { pets: true },
  });

  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

app.get("/api/my-pets", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  try {
    const user = await prisma.user.findUnique({
      where: { auth0Id },
      include: { pets: true },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.pets);
  } catch (error) {
    console.error("Error fetching user's pets:", error);
    res.status(500).json({ error: "Error fetching user's pets" });
  }
});

app.get("/api/matches", requireAuth, async (req, res) => {
  try {
    const matches = await prisma.match.findMany({
      include: {
        pet1: true,
        pet2: true,
      },
    });
    res.json(matches);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).send("Error fetching matches");
  }
});

app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  console.log("auth0Id", auth0Id);

  try {
    const user = await prisma.user.findUnique({ where: { auth0Id } });
    if (user) {
      res.json(user);
    } else {
      const newUser = await prisma.user.create({
        data: {
          auth0Id,
          email: req.auth.payload.email,
          name: req.auth.payload.name,
        },
        include: { pets: true },
      });
      res.status(201).json(newUser);
    }
  } catch (error) {
    console.error("Error verifying user:", error);
    res.status(500).send("Error verifying user");
  }
});

app.post("/api/users", async (req, res) => {
  const { auth0Id, email, name } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { auth0Id },
      update: { name, email },
      create: { name, email, auth0Id },
      include: { pets: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Failed to create or update user", error);
    res.status(500).json({ error: "Failed to create or update user" });
  }
});

app.post(
  "/api/pets",
  [requireAuth, upload.single("image")],
  async (req, res) => {
    const { name, age, breed, gender, ownerId, imageUrl } = req.body;
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge)) {
      return res.status(400).json({ error: "Invalid age value" });
    }

    // Use the uploaded file path if available; otherwise, use the imageUrl from the body
    const imagePath = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    try {
      const pet = await prisma.pet.create({
        data: {
          name,
          age: parsedAge,
          breed,
          gender,
          ownerId: parseInt(ownerId, 10),
          image: imagePath,
        },
      });
      res.status(201).json(pet);
    } catch (error) {
      console.error("Failed to create pet", error);
      res.status(500).json({ error: "Failed to create pet" });
    }
  }
);

app.post("/api/upload", upload.single("image"), (req, res) => {
  const imageUrl = "/uploads/" + req.file.filename;
  res.json({ imageUrl });
});

app.post("/api/matches", requireAuth, async (req, res) => {
  const { pet1Id, pet2Id } = req.body;

  const existingMatch = await prisma.match.findFirst({
    where: {
      OR: [
        { pet1Id, pet2Id },
        { pet1Id: pet2Id, pet2Id: pet1Id },
      ],
    },
  });

  if (existingMatch) {
    return res
      .status(409)
      .json({ message: "A match between these pets already exists." });
  }

  try {
    const match = await prisma.match.create({
      data: { pet1Id, pet2Id },
    });
    res.status(201).json(match);
  } catch (error) {
    console.error("Failed to create match", error);
    res.status(500).json({ error: "Failed to create match" });
  }
});

app.put(
  "/api/pets/:id",
  [requireAuth, upload.single("image")],
  async (req, res) => {
    const { id } = req.params;
    const { name, age, breed, gender, imageUrl } = req.body;
    const parsedAge = parseInt(age, 10);
    const imagePath = req.file ? `/uploads/${req.file.filename}` : imageUrl;

    try {
      const updateData = {
        name,
        age: parsedAge,
        breed,
        gender,
      };

      // Only update image path if new image is provided
      if (req.file || imageUrl) {
        updateData.image = imagePath;
      }

      const pet = await prisma.pet.update({
        where: { id: parseInt(id, 10) },
        data: updateData,
      });

      res.json(pet);
    } catch (error) {
      console.error(`Error updating pet with ID ${id}:`, error);
      res.status(500).json({ error: "Failed to update pet" });
    }
  }
);

app.delete("/api/pets/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.pet.delete({
    where: { id: parseInt(id) },
  });
  res.status(204).send();
});

app.delete("/api/matches/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.match.delete({
    where: { id: parseInt(id) },
  });
  res.status(204).send();
});

app.delete("/api/users/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  await prisma.user.delete({
    where: { id: parseInt(id) },
  });
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
