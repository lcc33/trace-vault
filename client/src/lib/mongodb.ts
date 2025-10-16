// lib/mongodb.ts - CORRECTED VERSION
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000, // 5 seconds - fail fast if no server available
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
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;