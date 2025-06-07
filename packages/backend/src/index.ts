import express, { Request, Response } from "express";
import dotenv from "dotenv";
import path from "path";
import { ValidRoutes } from "./shared/ValidRoutes";
import { fetchDataFromServer } from "./shared/ApiImageData";
import { MongoClient } from "mongodb";
import { ImageProvider } from "./ImageProvider";
import { registerImageRoutes } from "./routes/imageRoutes";
import { registerAuthRoutes } from "./routes/authRoutes";
import { verifyAuthToken } from "./verifyToken";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.
const PORT = process.env.PORT || 3000;
const STATIC_DIR = process.env.STATIC_DIR || "public";

const mongoClient = new MongoClient(process.env.MONGODB_URL || "");
const imageProvider = new ImageProvider(mongoClient);


const app = express();
app.use(express.json()) // for parsing application/json
app.use(express.static(STATIC_DIR));
app.locals.JWT_SECRET = process.env.JWT_SECRET;

app.get("/api/hello", (req: Request, res: Response) => {
    res.send("Hello, World");
});
app.use("/api/*", verifyAuthToken);

registerImageRoutes(app, imageProvider);
registerAuthRoutes(app);

app.get(Object.values(ValidRoutes), (req: Request, res: Response) => {
    res.sendFile(path.resolve(STATIC_DIR, "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

function waitDuration(numMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, numMs));
}