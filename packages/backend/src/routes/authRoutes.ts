import express, { Request, Response } from "express";
import { CredentialsProvider } from "../CredentialsProvider";
import { MongoClient } from "mongodb";
import jwt from "jsonwebtoken";

interface IAuthTokenPayload {
    username: string;
}

function generateAuthToken(username: string, jwtSecret: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const payload: IAuthTokenPayload = { username };
        jwt.sign(
            payload,
            jwtSecret,
            { expiresIn: "1d" },
            (error, token) => {
                if (error) reject(error);
                else resolve(token as string);
            }
        );
    });
}

export function registerAuthRoutes(app: express.Application) {
    const mongoClient = new MongoClient(process.env.MONGODB_URL || "");
    const credsProvider = new CredentialsProvider(mongoClient);
    
    app.post("/auth/register", async (req: Request, res: Response) => {
        const { username, password } = req.body;

    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username or password"
      });
      return
    }

    try {
      const success = await credsProvider.registerUser(username, password);


      if (!success) {
        res.status(409).send({
          error: "Username already taken",
          message: `User '${username}' already exists`
        });
        return
      }

      const jwtSecret = req.app.locals.JWT_SECRET;
      const token = await generateAuthToken(username, jwtSecret);
      res.status(201).send({ token });
      return
    } catch (err) {
      console.error("Registration error:", err);
      res.status(500).send({
        error: "Internal server error",
        message: "Failed to register user"
      });
      return
    }
  });

  app.post("/auth/login", async (req: Request, res: Response) => {
    const { username, password } = req.body;
  
    if (typeof username !== "string" || typeof password !== "string") {
      res.status(400).send({
        error: "Bad request",
        message: "Missing username or password"
      });
      return
    }
  
    const isValid = await credsProvider.verifyPassword(username, password);
  
    if (!isValid) {
      res.status(401).send({
        error: "Unauthorized",
        message: "Incorrect username or password"
      });
      return
    }
  
    try {
      const jwtSecret = req.app.locals.JWT_SECRET;
      const token = await generateAuthToken(username, jwtSecret);
      res.status(200).send({ token });
    } catch (err) {
      console.error("Error generating token:", err);
      res.status(500).send({ error: "Failed to generate token" });
    }
  });
}