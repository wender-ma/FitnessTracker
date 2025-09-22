import { type Photo, type InsertPhoto, type UpdatePhoto } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: string, photo: UpdatePhoto): Promise<Photo | undefined>;
  deletePhoto(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private photos: Map<string, Photo>;

  constructor() {
    this.photos = new Map();
  }

  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = {
      ...insertPhoto,
      id,
      weight: insertPhoto.weight ?? null,
      notes: insertPhoto.notes ?? null,
      createdAt: new Date(),
    };
    this.photos.set(id, photo);
    return photo;
  }

  async updatePhoto(id: string, updatePhoto: UpdatePhoto): Promise<Photo | undefined> {
    const existingPhoto = this.photos.get(id);
    if (!existingPhoto) {
      return undefined;
    }

    const updatedPhoto: Photo = {
      ...existingPhoto,
      ...updatePhoto,
    };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }
}

export const storage = new MemStorage();
