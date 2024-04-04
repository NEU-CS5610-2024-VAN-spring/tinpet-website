import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

const app = express();
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

app.get("/api/matches", requireAuth, async (req, res) => {
  const matches = await prisma.match.findMany();
  res.json(matches);
});

app.post("/api/users", async (req, res) => {
  console.log(req.body);
  const { name, email } = req.body;
  try {
    const user = await prisma.user.create({
      data: { name, email },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

app.post("/api/pets", requireAuth, async (req, res) => {
  const { name, age, breed, gender, ownerId, image } = req.body;
  const pet = await prisma.pet.create({
    data: { name, age, breed, gender, ownerId, image },
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

app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
