import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPhotoSchema, updatePhotoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all photos
  app.get("/api/photos", async (req, res) => {
    try {
      const photos = await storage.getPhotos();
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Get single photo
  app.get("/api/photos/:id", async (req, res) => {
    try {
      const photo = await storage.getPhoto(req.params.id);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photo" });
    }
  });

  // Create photo
  app.post("/api/photos", async (req, res) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create photo" });
    }
  });

  // Update photo
  app.patch("/api/photos/:id", async (req, res) => {
    try {
      const validatedData = updatePhotoSchema.parse(req.body);
      const photo = await storage.updatePhoto(req.params.id, validatedData);
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  // Delete photo
  app.delete("/api/photos/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePhoto(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Photo not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
