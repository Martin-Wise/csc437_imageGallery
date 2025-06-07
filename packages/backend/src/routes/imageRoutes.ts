import express, { Request, Response } from "express";
import { ImageProvider } from "../ImageProvider";
import { MongoClient, ObjectId } from "mongodb";

export function registerImageRoutes(app: express.Application, imageProvider: ImageProvider) {
    
    const mongoClient = new MongoClient(process.env.MONGODB_URL || "");
    
    app.get("/api/images", async (req: Request, res: Response) => {
        try {
            await mongoClient.connect(); // Ensure connected
            await waitDuration(1000);
            
            const contains = req.query.name as string | undefined;
            
            const images = await imageProvider.getAllImagesDenormalized();

            const filteredImages = contains
                ? images.filter(image =>
                    image.name.toLowerCase().includes(contains.toLowerCase())
                  )
                : images;

            res.json(filteredImages);

        } catch (err) {
            console.error("Failed to fetch images:", err);
            res.status(500).json({ error: "Failed to fetch images" });
        }
    });
    
    app.put("/api/images/:id/name", async (req: Request, res: Response) => {
        const imageId = req.params.id;
        const { newName } = req.body;
    
        if (!newName || typeof newName !== "string") {
            res.status(400).json({ error: "Invalid or missing 'newName' in request body." });
            return
        }
        if (newName.length > 100) {
            res.status(422).send({
                error: "Unprocessable Entity",
                message: `Image name exceeds 100 characters`
            });
            return;
        }
        if (ObjectId.isValid(imageId) === false) {
            res.status(404).send({
                error: "Not Found",
                message: "Image does not exist"
            });
            return;
        }
        try {
            await mongoClient.connect(); // Ensure DB connection
            const result = await imageProvider.updateImageName(imageId, newName);
    
            if (result.modifiedCount === 0) {
                res.status(404).send({
                    error: "Not Found",
                    message: "Image does not exist"
                });
                return
            }
    
            res.status(200).json({ message: `Image ${imageId} renamed to '${newName}'.` });
        } catch (err) {
            console.error("Failed to update image name:", err);
            res.status(500).json({ error: "Internal server error." });
        }
    });
}

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}