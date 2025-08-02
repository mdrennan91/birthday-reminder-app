import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

const client = new MongoClient(uri, options);
let clientPromise: Promise<MongoClient>;

declare global {
  // Allows reuse of client in dev mode without type errors
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV !== "development") {
  if (!global._mongoClientPromise) {
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export default clientPromise;
