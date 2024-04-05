import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

const app = express();
app.use(express.json({ limit: "10mb" }));
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

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
    res.json(user.pets);
  } catch (error) {
    console.error("Error fetching user's pets:", error);
    res.status(500).send("Error fetching user's pets");
  }
});

app.get("/api/matches", requireAuth, async (req, res) => {
  const matches = await prisma.match.findMany();
  res.json(matches);
});

app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  console.log("auth0Id", auth0Id);
  s;
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

app.post("/api/pets", requireAuth, async (req, res) => {
  const { name, age, breed, gender, ownerId, image } = req.body;
  const parsedAge = parseInt(age, 10);
  if (isNaN(parsedAge)) {
    return res.status(400).json({ error: "Invalid age value" });
  }
  const pet = await prisma.pet.create({
    data: { name, age: parsedAge, breed, gender, ownerId, image },
  });
  res.status(201).json(pet);
});

app.post("/api/matches", requireAuth, async (req, res) => {
  const { pet1Id, pet2Id } = req.body;
  const match = await prisma.match.create({
    data: { pet1Id, pet2Id },
  });
  res.status(201).json(match);
});

app.put("/api/pets/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, age, breed, gender, image } = req.body;

  try {
    const pet = await prisma.pet.update({
      where: { id: parseInt(id, 10) },
      data: { name, age, breed, gender, image },
    });
    res.json(pet);
  } catch (error) {
    console.error("Error updating pet:", error);
    res.status(500).json({ error: "Failed to update pet" });
  }
});

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
