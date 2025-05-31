import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { fetchDataFromServer } from "./shared/ApiImageData";
import { MongoClient } from "mongodb";
import { ImageProvider } from "./ImageProvider";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = new MongoClient(process.env.MONGODB_URL || "");
const imageProvider = new ImageProvider(mongoClient);

const app = express();
app.use(express.static(STATIC_DIR));

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});

app.get("/api/images", async (req: Request, res: Response) => {
    try {
        await mongoClient.connect(); // Ensure connected
        await waitDuration(1000);    // Simulate delay
        const images = await imageProvider.getAllImagesDenormalized();
        res.json(images);
    } catch (err) {
        console.error("Failed to fetch images:", err);
        res.status(500).json({ error: "Failed to fetch images" });
    }
});

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile(path.resolve(STATIC_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}