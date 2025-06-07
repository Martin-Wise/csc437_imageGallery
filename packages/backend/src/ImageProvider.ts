import { Collection, MongoClient, ObjectId, UpdateResult } from "mongodb";

interface IImageDocument {
  _id: ObjectId;          // Mongo _id field as string
  src: string;
  name: string;
  authorId: string;     // stored as string but refers to ObjectId in users
}

interface IUserDocument {
  _id: ObjectId;        // actual ObjectId type in DB
  username: string;
}

interface IApiImageData {
  id: string;
  src: string;
  name: string;
  author: {
    id: string;
    username: string;
  };
}

export class ImageProvider {
  private collection: Collection<IImageDocument>;
  private usersCollection: Collection<IUserDocument>;

  constructor(private readonly mongoClient: MongoClient) {
    const imagesCollName = process.env.IMAGES_COLLECTION_NAME;
    const usersCollName = process.env.USERS_COLLECTION_NAME;
    if (!imagesCollName || !usersCollName) {
      throw new Error("Missing collection names in env variables");
    }
    this.collection = this.mongoClient.db().collection(imagesCollName);
    this.usersCollection = this.mongoClient.db().collection(usersCollName);
  }

  async getAllImagesDenormalized(): Promise<IApiImageData[]> {
    const pipeline = [
      {
        $lookup: {
          from: process.env.USERS_COLLECTION_NAME!,
          localField: "authorId",      // authorId is a string user ID
          foreignField: "_id",         // users._id is also string user ID
          as: "authorInfo",
        },
      },
      { $unwind: "$authorInfo" },
      {
        $project: {
          id: { $toString: "$_id" },
          src: 1,
          name: 1,
          author: {
            id: "$authorInfo._id",          // string user ID
            username: "$authorInfo.username",
          },
        },
      },
    ];
  
    return this.collection.aggregate<IApiImageData>(pipeline).toArray();
  }
  
  async updateImageName(imageId: string, newName: string): Promise<UpdateResult> {

    return this.collection.updateOne(
        { _id: new ObjectId(imageId) },
        { $set: { name: newName } }
    );
  }

  async getImageById(imageId: string) {
    return await this.collection.findOne({ id: imageId });
}
}


