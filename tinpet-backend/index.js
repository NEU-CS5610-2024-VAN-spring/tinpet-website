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

app.get("/api/pets/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const pet = await prisma.pet.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(pet);
});

app.post("/api/pets", requireAuth, async (req, res) => {
  const { name, age, breed } = req.body;
  const pet = await prisma.pet.create({
    data: { name, age, breed },
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
  const { name, age, breed } = req.body;
  try {
    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: { name, age, breed },
    });
    res.json(pet);
  } catch (error) {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
