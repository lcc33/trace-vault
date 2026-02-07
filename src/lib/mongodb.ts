// src/lib/mongodb.ts - PRODUCTION OPTIMIZED
import { MongoClient, Db, ServerApiVersion, MongoClientOptions } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const uri = process.env.MONGODB_URI;

const options: MongoClientOptions = {
  maxPoolSize: 50,
  minPoolSize: 10,
  maxIdleTimeMS: 60000,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,

  // Now TypeScript knows 'zlib' is one of the allowed literals
  compressors: ["zlib"],
  zlibCompressionLevel: 6,

  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};

// Global type declaration for dev mode caching
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve the client across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClient = client;
    global._mongoClientPromise = client
      .connect()
      .then((connectedClient) => {
        console.log("✓ MongoDB connected (dev mode)");
        console.log(
          `  Pool: ${options.minPoolSize}-${options.maxPoolSize} connections`,
        );
        return connectedClient;
      })
      .catch((error) => {
        console.error("✗ MongoDB connection failed:", error.message);
        // Clean up global state on error
        global._mongoClientPromise = undefined;
        global._mongoClient = undefined;
        throw error;
      });
  } else {
    client = global._mongoClient!;
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production, create a new client for each deployment
  client = new MongoClient(uri, options);
  clientPromise = client
    .connect()
    .then((connectedClient) => {
      console.log("✓ MongoDB connected (production)");
      console.log(
        `  Pool: ${options.minPoolSize}-${options.maxPoolSize} connections`,
      );
      return connectedClient;
    })
    .catch((error) => {
      console.error("✗ MongoDB connection failed:", error.message);
      throw error;
    });
}

// Helper to get the database instance with caching
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) {
    return cachedDb;
  }

  const client = await clientPromise;
  const db = client.db("tracevault");
  cachedDb = db;
  return db;
}

// Export for backward compatibility
export const db = client.db("tracevault");

// Export the client promise
export default clientPromise;

// Health check function
export async function checkMongoConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
    await client.db("admin").command({ ping: 1 });
    return true;
  } catch (error) {
    console.error("MongoDB health check failed:", error);
    return false;
  }
}

// Get connection pool stats (for monitoring)
export async function getPoolStats() {
  try {
    const client = await clientPromise;
    // @ts-ignore - Internal API
    const topology = client.topology;

    return {
      available: topology?.s?.pool?.availableConnectionCount || 0,
      current: topology?.s?.pool?.currentConnectionCount || 0,
      max: options.maxPoolSize,
      min: options.minPoolSize,
    };
  } catch (error) {
    console.error("Failed to get pool stats:", error);
    return null;
  }
}

// Graceful shutdown
export async function closeMongoConnection(): Promise<void> {
  try {
    const client = await clientPromise;
    await client.close();
    console.log("✓ MongoDB connection closed gracefully");
  } catch (error) {
    console.error("✗ Error closing MongoDB connection:", error);
  }
}
