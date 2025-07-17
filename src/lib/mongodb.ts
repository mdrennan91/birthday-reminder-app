// src/lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // Prevent multiple instances of MongoClient in dev (due to hot reloading)
  // @ts-expect-error: global._mongoClientPromise is custom and not typed
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    // @ts-expect-error: global._mongoClientPromise is custom and not typed
    global._mongoClientPromise = client.connect();
  }
  // @ts-expect-error: global._mongoClientPromise is custom and not typed
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

