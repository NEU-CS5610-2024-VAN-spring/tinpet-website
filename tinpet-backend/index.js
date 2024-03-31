import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import fetch from "node-fetch";

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

app.get("/api/pets/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const pet = await prisma.pet.findUnique({
    where: { id: parseInt(id) },
  });
  res.json(pet);
});

app.get("/api/pets", requireAuth, async (req, res) => {
  const pets = await prisma.pet.findMany();
  res.json(pets);
});

app.get("/api/users", requireAuth, async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.get("/api/matches", requireAuth, async (req, res) => {
  const matches = await prisma.match.findMany();
  res.json(matches);
});

app.post("/api/users", async (req, res) => {
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
  const { name, age, breed, gender, ownerId } = req.body;
  const pet = await prisma.pet.create({
    data: { name, age, breed, gender, ownerId },
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
  const { name, age, breed, gender } = req.body;
  try {
    const pet = await prisma.pet.update({
      where: { id: parseInt(id) },
      data: { name, age, breed, gender },
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

app.get("/generate-pet-name", async (req, res) => {
  const url = 'https://pet-name-generator.p.rapidapi.com/all-pet-names';
  const options = {
    method: "GET",
    headers: {
      "X-RapidAPI-Key": '5c4ee685c5msh15f5fb7e04144bfp154e2fjsn3fd6631e30ff',
      "X-RapidAPI-Host": 'pet-name-generator.p.rapidapi.com'
    },
  };

  // Fetch pet name from the pet name generator API, not working now, need to be fixed
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
        console.error('API response', await response.text());
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.json();
    console.log('Pet name:', result);
    res.json(result);
} catch (error) {
    console.error('Error fetching from pet name generator:', error);
    res.status(500).send('Error fetching pet name');
}
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
