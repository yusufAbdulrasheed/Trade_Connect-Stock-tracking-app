import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB_NAME!;

if (!uri) {
  throw new Error("MONGODB_URI environment variable is not set");
}
if (!dbName) {
  throw new Error("MONGODB_DB_NAME environment variable is not set");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  maxPoolSize: 1,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  retryWrites: true,
  retryReads: true,
};

// eslint-disable-next-line prefer-const
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDB() {
  try {
    const client = await clientPromise;
    return client.db(dbName);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

export { clientPromise };