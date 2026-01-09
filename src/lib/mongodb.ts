// lib/mongodb.ts - CORRECTED VERSION
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000, // 10s seconds - fail fast if no server available
  socketTimeoutMS: 30000, // 30 seconds - reasonable for API calls
  connectTimeoutMS: 10000, // 10 seconds - connection establishment timeout
};

// Define types for global mongo
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then((connectedClient) => {
        console.log("✓ MongoDB connection secured");
        return connectedClient;
      })
      .catch((error) => {
        console.error("✗ MongoDB connection failed:", error.message);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then((connectedClient) => {
      console.log("✓ MongoDB connection secured");
      return connectedClient;
    })
    .catch((error) => {
      console.error("✗ MongoDB connection failed:", error.message);
      throw error;
    });
}

client = new MongoClient(uri);
export const db = client.db("tracevault"); 

export default clientPromise;