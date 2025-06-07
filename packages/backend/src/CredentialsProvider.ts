import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcrypt";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.CREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing CREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string): Promise<boolean> {
        // Check if username already exists
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
          return false; // Username already exists
        }
    
        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(plaintextPassword, salt);
        // const saltedAndHashedPassword = salt + hash;
    
        // Create the user record
        await this.collection.insertOne({
          username,
          password: hash,
        });
    
        return true;
      }

      async verifyPassword(username: string, plaintextPassword: string): Promise<boolean> {
        const userRecord = await this.collection.findOne({ username });
        console.log(userRecord);
        if (!userRecord) return false;
      
        const stored = userRecord.password; // salt+hash from register
        console.log(stored)
        console.log(plaintextPassword)
        console.log(await bcrypt.compare(plaintextPassword, stored));
        return await bcrypt.compare(plaintextPassword, stored);
      }
}
